/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppUserProfile, AppUserRole, AccountStatus, OtpChallenge, LanguageCode } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'deo_auth_current_user_v1',
  ACTIVE_CHALLENGE: 'deo_auth_active_challenge_v1',
  USER_DIRECTORY: 'deo_auth_user_directory_v1',
  SESSION_EXPIRY: 'deo_auth_session_expiry_v1',
  ATTEMPTS_STORE: 'deo_auth_failed_attempts_v1',
  RATE_LIMIT_STORE: 'deo_auth_rate_limits_v1',
};

// Configuration
const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 30; // 30 seconds
const MAX_OTP_ATTEMPTS = 5; // Brute force protection
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

// Default demo seed users for easy role testing
const DEFAULT_USERS: AppUserProfile[] = [
  {
    id: 'usr-dev-101',
    mobileNumber: '9835123456',
    fullName: 'रंजन कुमार',
    email: 'ranjan@example.com',
    preferredLanguage: 'hi',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-06T09:00:00Z',
    lastLoginAt: '2026-10-06T09:00:00Z',
  },
  {
    id: 'usr-dev-202',
    mobileNumber: '9876543210',
    fullName: 'राहुल कुमार (सेवा दल प्रमुख)',
    email: 'rahul.volunteer@nextgendevbhoomi.org',
    preferredLanguage: 'hi',
    role: 'VOLUNTEER',
    status: 'ACTIVE',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-06T09:00:00Z',
    lastLoginAt: '2026-10-06T09:00:00Z',
  },
  {
    id: 'usr-dev-303',
    mobileNumber: '9988776655',
    fullName: 'सुमन मिश्रा (समन्वयक)',
    email: 'admin@nextgendevbhoomi.org',
    preferredLanguage: 'hi',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-10-01T07:00:00Z',
    updatedAt: '2026-10-06T09:00:00Z',
    lastLoginAt: '2026-10-06T09:00:00Z',
  },
];

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
  private isDevelopmentMode: boolean = true; // True since no production SMS gateway credentials configured

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Initialize seed users if needed
      const rawDir = localStorage.getItem(STORAGE_KEYS.USER_DIRECTORY);
      if (!rawDir) {
        localStorage.setItem(STORAGE_KEYS.USER_DIRECTORY, JSON.stringify(DEFAULT_USERS));
      }

      // Check existing session
      const savedUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUserStr) {
        const parsed: AppUserProfile = JSON.parse(savedUserStr);
        // Verify session expiry (24 hours or timestamp check)
        const expiry = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
        if (expiry && Number(expiry) < Date.now()) {
          // Session expired
          this.logout(false);
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

  public isAuthenticated(): boolean {
    return !!this.currentUser && this.currentUser.status === 'ACTIVE';
  }

  public getUserRole(): AppUserRole {
    return this.currentUser?.role || 'USER';
  }

  public getIsDevelopmentMode(): boolean {
    return this.isDevelopmentMode;
  }

  // Rate Limiting check
  private checkRateLimit(mobileNumber: string): { allowed: boolean; waitSeconds?: number } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RATE_LIMIT_STORE);
      const limits: Record<string, number[]> = raw ? JSON.parse(raw) : {};
      const now = Date.now();
      const history = (limits[mobileNumber] || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

      if (history.length >= MAX_REQUESTS_PER_WINDOW) {
        const oldest = history[0];
        const waitMs = RATE_LIMIT_WINDOW_MS - (now - oldest);
        return { allowed: false, waitSeconds: Math.ceil(waitMs / 1000) };
      }

      history.push(now);
      limits[mobileNumber] = history;
      localStorage.setItem(STORAGE_KEYS.RATE_LIMIT_STORE, JSON.stringify(limits));
      return { allowed: true };
    } catch {
      return { allowed: true };
    }
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

    // Rate Limit Check
    const rateCheck = this.checkRateLimit(cleanNumber);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `बहुत अधिक अनुरोध। कृपया ${rateCheck.waitSeconds} सेकंड बाद पुनः प्रयास करें।`,
      };
    }

    // Check account status if user exists
    const allUsers = this.getAllUsers();
    const existing = allUsers.find((u) => u.mobileNumber === cleanNumber);
    if (existing && existing.status !== 'ACTIVE') {
      return {
        success: false,
        error: `यह खाता वर्तमान में ${existing.status === 'BLOCKED' ? 'अवरुद्ध (Blocked)' : 'निलंबित (Suspended)'} है। कृपया मेला नियंत्रण कक्ष से संपर्क करें।`,
      };
    }

    // Attempt real backend API OTP send if online
    if (typeof window !== 'undefined' && navigator.onLine) {
      try {
        const resp = await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobileNumber: cleanNumber }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.success) {
            const now = Date.now();
            const expiresAt = now + (data.expiresInSeconds || OTP_EXPIRY_SECONDS) * 1000;
            const canResendAt = now + RESEND_COOLDOWN_SECONDS * 1000;
            const generatedOtp = data.devOtpHint || Math.floor(100000 + Math.random() * 900000).toString();

            const storedOtp: StoredOtpData = {
              mobileNumber: cleanNumber,
              code: generatedOtp,
              expiresAt,
              canResendAt,
              attemptsCount: 0,
              maxAttempts: MAX_OTP_ATTEMPTS,
            };
            localStorage.setItem(STORAGE_KEYS.ACTIVE_CHALLENGE, JSON.stringify(storedOtp));

            return {
              success: true,
              challenge: {
                mobileNumber: cleanNumber,
                maskedMobile: data.maskedMobile || `XXXXX-${cleanNumber.slice(5)}`,
                canResendAt,
                expiresAt,
                remainingAttempts: MAX_OTP_ATTEMPTS,
                isDevelopmentMode: this.isDevelopmentMode,
                devOtpHint: data.devOtpHint || (this.isDevelopmentMode ? generatedOtp : undefined),
              },
            };
          }
        }
      } catch {
        // Fall through to local generation
      }
    }

    // Backend generated OTP simulation (In production, generated securely on server & sent via SMS gateway)
    // Never hard-coded; generated deterministically for testing in DEV mode
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + OTP_EXPIRY_SECONDS * 1000;
    const canResendAt = now + RESEND_COOLDOWN_SECONDS * 1000;

    const storedOtp: StoredOtpData = {
      mobileNumber: cleanNumber,
      code: generatedOtp,
      expiresAt,
      canResendAt,
      attemptsCount: 0,
      maxAttempts: MAX_OTP_ATTEMPTS,
    };

    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHALLENGE, JSON.stringify(storedOtp));

    const maskedMobile = `XXXXX-${cleanNumber.slice(5)}`;
    const challenge: OtpChallenge = {
      mobileNumber: cleanNumber,
      maskedMobile,
      canResendAt,
      expiresAt,
      remainingAttempts: MAX_OTP_ATTEMPTS,
      isDevelopmentMode: this.isDevelopmentMode,
      devOtpHint: this.isDevelopmentMode ? generatedOtp : undefined,
    };

    return { success: true, challenge };
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

    const rawChallenge = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHALLENGE);
    if (!rawChallenge) {
      return { success: false, error: 'कोई सक्रिय OTP सत्र नहीं मिला। कृपया दोबारा OTP भेजें।' };
    }

    let stored: StoredOtpData;
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

    if (stored.attemptsCount >= stored.maxAttempts) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHALLENGE);
      return {
        success: false,
        error: 'अधिकतम प्रयास सीमा पार हो गई है (Brute-force protection)। कृपया नया OTP मंगवाएं।',
      };
    }

    // Check code
    if (stored.code !== cleanOtp) {
      stored.attemptsCount += 1;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CHALLENGE, JSON.stringify(stored));
      const remaining = stored.maxAttempts - stored.attemptsCount;
      return {
        success: false,
        error: `गलत OTP। शेष प्रयास: ${remaining}`,
      };
    }

    // Success! Consume OTP challenge
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHALLENGE);

    // Fetch or create user profile
    const user = this.findOrCreateUser(cleanNumber);
    this.currentUser = user;

    // Set 24 hour session
    const sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, sessionExpiry.toString());

    return { success: true, user };
  }

  /**
   * Find existing user or create a new one with default role USER
   * Step 18 Requirement 3
   */
  private findOrCreateUser(mobileNumber: string): AppUserProfile {
    const allUsers = this.getAllUsers();
    let user = allUsers.find((u) => u.mobileNumber === mobileNumber);

    const nowStr = new Date().toISOString();

    if (!user) {
      // Create new USER
      user = {
        id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        mobileNumber,
        fullName: 'देव दर्शनार्थी (Devotee)',
        preferredLanguage: 'hi',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: nowStr,
        updatedAt: nowStr,
        lastLoginAt: nowStr,
        token: `token_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      };
      allUsers.push(user);
    } else {
      user.lastLoginAt = nowStr;
      user.updatedAt = nowStr;
      user.token = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }

    this.saveAllUsers(allUsers);
    return user;
  }

  public updateUserProfile(updated: Partial<AppUserProfile>): AppUserProfile | null {
    if (!this.currentUser) return null;

    const allUsers = this.getAllUsers();
    const idx = allUsers.findIndex((u) => u.id === this.currentUser!.id);
    if (idx === -1) return null;

    const newProfile: AppUserProfile = {
      ...allUsers[idx],
      ...updated,
      updatedAt: new Date().toISOString(),
    };

    allUsers[idx] = newProfile;
    this.saveAllUsers(allUsers);
    this.currentUser = newProfile;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newProfile));

    return newProfile;
  }

  /**
   * Switch Active User Role (for easy testing across USER, VOLUNTEER, ADMIN)
   * Step 18 Requirement 4
   */
  public switchRole(newRole: AppUserRole): AppUserProfile | null {
    if (!this.currentUser) return null;
    return this.updateUserProfile({ role: newRole });
  }

  public logout(cleanLocalStorage = true): void {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHALLENGE);
    if (cleanLocalStorage) {
      // Keep user directory intact
    }
  }

  // Helpers
  public getAllUsers(): AppUserProfile[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_DIRECTORY);
      return raw ? JSON.parse(raw) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  }

  private saveAllUsers(users: AppUserProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DIRECTORY, JSON.stringify(users));
    } catch {
      // Ignore
    }
  }

  /**
   * Admin actions on users
   */
  public setAccountStatus(userId: string, status: AccountStatus): boolean {
    const allUsers = this.getAllUsers();
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return false;
    user.status = status;
    user.updatedAt = new Date().toISOString();
    this.saveAllUsers(allUsers);

    if (this.currentUser?.id === userId) {
      this.currentUser.status = status;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    }
    return true;
  }
}

export const AuthService = new AuthServiceManager();
