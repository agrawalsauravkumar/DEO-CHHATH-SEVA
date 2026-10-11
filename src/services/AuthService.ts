/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppUserProfile, AppUserRole, AccountStatus, OtpChallenge, LanguageCode } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'deo_auth_current_user_v1',
  ACTIVE_CHALLENGE: 'deo_auth_active_challenge_v1',
  SESSION_EXPIRY: 'deo_auth_session_expiry_v1',
};

const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 30; // 30 seconds
const MAX_OTP_ATTEMPTS = 5; // Brute force protection

interface StoredOtpData {
  mobileNumber: string;
  code: string;
  expiresAt: number;
  canResendAt: number;
  attemptsCount: number;
  maxAttempts: number;
}

class AuthServiceManager {
  private currentUser: AppUserProfile | null = null;
  private expiredSessionOnInit = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Check existing session
      const savedUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUserStr) {
        const parsed: AppUserProfile = JSON.parse(savedUserStr);
        // Verify session expiry (24 hours or timestamp check)
        const expiry = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
        if (expiry && Number(expiry) < Date.now()) {
          this.logout();
          this.expiredSessionOnInit = true;
        } else {
          this.currentUser = parsed;
        }
      }
    } catch {
      // Fallback
      this.currentUser = null;
    }
  }

  public getCurrentUser(): AppUserProfile | null {
    return this.currentUser;
  }

  public getOfflineAccessStatus():
    | { available: true; user: AppUserProfile }
    | { available: false; reason: 'NO_SESSION' | 'EXPIRED' | 'PRIVILEGED' | 'INVALID_SESSION' } {
    const user = this.currentUser;
    if (!user) {
      return {
        available: false,
        reason: this.expiredSessionOnInit ? 'EXPIRED' : 'NO_SESSION',
      };
    }

    const expiry = Number(localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY));
    if (!Number.isFinite(expiry) || expiry <= Date.now()) {
      return { available: false, reason: 'EXPIRED' };
    }
    if (user.status !== 'ACTIVE' || !user.token) {
      return { available: false, reason: 'INVALID_SESSION' };
    }
    if (user.role !== 'USER') {
      return { available: false, reason: 'PRIVILEGED' };
    }

    return { available: true, user };
  }

  public isAuthenticated(): boolean {
    return !!this.currentUser && this.currentUser.status === 'ACTIVE';
  }

  public getUserRole(): AppUserRole {
    return this.currentUser?.role || 'USER';
  }

  /**
   * Request OTP for Mobile Number
   * Step 18 Requirement 1 & 2
   */
  public async requestOtp(mobileNumber: string): Promise<{ success: boolean; challenge?: OtpChallenge; error?: string }> {
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      return { success: false, error: 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।' };
    }

    if (typeof navigator === 'undefined' || !navigator.onLine) {
      return {
        success: false,
        error: 'OTP प्राप्त करने के लिए इंटरनेट से जुड़ें। पहले से लॉगिन सत्र ऑफलाइन इस्तेमाल किया जा सकता है।',
      };
    }

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: cleanNumber }),
      });
      const data = await response.json() as {
        success?: boolean;
        error?: string;
        maskedMobile?: string;
        expiresInSeconds?: number;
        isDevelopmentMode?: boolean;
        devOtpHint?: string;
        cooldownSeconds?: number;
      };
      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'OTP भेजने में समस्या हुई। कृपया बाद में पुनः प्रयास करें।',
        };
      }

      const now = Date.now();
      const challenge: OtpChallenge = {
        mobileNumber: cleanNumber,
        maskedMobile: data.maskedMobile || `XXXXX-${cleanNumber.slice(5)}`,
        canResendAt: now + Math.max(data.cooldownSeconds || RESEND_COOLDOWN_SECONDS, 0) * 1000,
        expiresAt: now + (data.expiresInSeconds || OTP_EXPIRY_SECONDS) * 1000,
        remainingAttempts: MAX_OTP_ATTEMPTS,
        isDevelopmentMode: data.isDevelopmentMode === true,
        devOtpHint: data.isDevelopmentMode === true ? data.devOtpHint : undefined,
      };
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CHALLENGE, JSON.stringify({
        mobileNumber: cleanNumber,
        expiresAt: challenge.expiresAt,
        canResendAt: challenge.canResendAt,
      }));
      return { success: true, challenge };
    } catch {
      return {
        success: false,
        error: 'सर्वर से संपर्क नहीं हो सका। इंटरनेट कनेक्शन जाँचकर पुनः प्रयास करें।',
      };
    }
  }

  /**
   * Verify OTP
   * Step 18 Requirement 1 & 2
   */
  public async verifyOtp(
    mobileNumber: string,
    enteredOtp: string
  ): Promise<{ success: boolean; user?: AppUserProfile; error?: string }> {
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    const cleanOtp = enteredOtp.trim();

    if (cleanOtp.length !== 6) {
      return { success: false, error: 'कृपया 6 अंकों का OTP दर्ज करें।' };
    }

    if (typeof navigator === 'undefined' || !navigator.onLine) {
      return {
        success: false,
        error: 'OTP सत्यापित करने के लिए इंटरनेट से जुड़ें।',
      };
    }

    const rawChallenge = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHALLENGE);
    if (!rawChallenge) {
      return { success: false, error: 'कोई सक्रिय OTP सत्र नहीं मिला। कृपया दोबारा OTP भेजें।' };
    }

    let stored: Pick<StoredOtpData, 'mobileNumber' | 'expiresAt'>;
    try {
      stored = JSON.parse(rawChallenge);
    } catch {
      return { success: false, error: 'अमान्य सत्र। कृपया दोबारा OTP भेजें।' };
    }

    if (stored.mobileNumber !== cleanNumber) {
      return { success: false, error: 'मोबाइल नंबर मेल नहीं खाता।' };
    }

    const now = Date.now();
    if (now > stored.expiresAt) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHALLENGE);
      return { success: false, error: 'OTP की समय सीमा समाप्त (Expired) हो चुकी है। कृपया दोबारा OTP भेजें।' };
    }

    let response: Response;
    let data: {
      success?: boolean;
      error?: string;
      remainingAttempts?: number;
      user?: {
        id: string;
        phone?: string;
        mobileNumber?: string;
        fullName: string;
        email?: string;
        role: AppUserRole;
        status: AccountStatus;
        createdAt?: string;
        updatedAt?: string;
        lastLoginAt?: string;
        token?: string;
      };
    };
    try {
      response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: cleanNumber, otp: cleanOtp }),
      });
      data = await response.json();
    } catch {
      return { success: false, error: 'सर्वर से संपर्क नहीं हो सका। इंटरनेट कनेक्शन जाँचकर पुनः प्रयास करें।' };
    }

    if (!response.ok || !data.success || !data.user) {
      return {
        success: false,
        error: data.error || 'OTP सत्यापन असफल। कृपया पुनः प्रयास करें।',
      };
    }

    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHALLENGE);
    const nowIso = new Date().toISOString();
    const user: AppUserProfile = {
      id: data.user.id,
      mobileNumber: data.user.mobileNumber || data.user.phone || cleanNumber,
      email: data.user.email,
      fullName: data.user.fullName,
      preferredLanguage: 'hi',
      role: data.user.role,
      status: data.user.status,
      createdAt: data.user.createdAt || nowIso,
      updatedAt: data.user.updatedAt || nowIso,
      lastLoginAt: data.user.lastLoginAt || nowIso,
      token: data.user.token,
    };
    this.currentUser = user;
    this.expiredSessionOnInit = false;

    // Set 24 hour session
    const sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, sessionExpiry.toString());

    return { success: true, user };
  }

  public updateUserProfile(updated: Partial<AppUserProfile>): AppUserProfile | null {
    if (!this.currentUser) return null;

    const newProfile: AppUserProfile = {
      ...this.currentUser,
      ...updated,
      updatedAt: new Date().toISOString(),
    };

    this.currentUser = newProfile;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newProfile));

    return newProfile;
  }

  public logout(): void {
    this.currentUser = null;
    this.expiredSessionOnInit = false;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHALLENGE);
  }
}

export const AuthService = new AuthServiceManager();
