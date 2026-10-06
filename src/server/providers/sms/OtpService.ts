/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { OtpProvider, SendOtpResult, VerifyOtpResult } from './OtpProvider';
import { DevelopmentOtpProvider } from './DevelopmentOtpProvider';
import { SmsOtpProvider } from './SmsOtpProvider';
import { ProviderDiagnostic } from '../types';

interface ServerChallenge {
  mobileNumber: string;
  hashedCode: string;
  plainCodeForDev?: string;
  expiresAt: number;
  canResendAt: number;
  attemptsCount: number;
  maxAttempts: number;
}

const MAX_ATTEMPTS = 5;
const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds

class OtpServiceManager {
  private provider: OtpProvider;
  private challenges = new Map<string, ServerChallenge>();
  private requestHistory = new Map<string, number[]>(); // for rate limiting

  constructor() {
    const isDevExplicit = process.env.OTP_DEV_MODE === 'true';
    const sms = new SmsOtpProvider();

    if (!isDevExplicit && sms.isConfigured()) {
      this.provider = sms;
    } else {
      this.provider = new DevelopmentOtpProvider();
    }
  }

  public getDiagnostic(): ProviderDiagnostic {
    return this.provider.getDiagnostic();
  }

  public getActiveProviderName(): string {
    return this.provider.name;
  }

  public isDevelopmentMode(): boolean {
    return this.provider.providerId === 'DEV_SIMULATED';
  }

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  // Rate Limiting: Max 4 requests in 10 minutes per mobile
  private isRateLimited(mobile: string): boolean {
    const now = Date.now();
    const history = (this.requestHistory.get(mobile) || []).filter(
      (t) => now - t < 10 * 60 * 1000
    );
    if (history.length >= 4) {
      return true;
    }
    history.push(now);
    this.requestHistory.set(mobile, history);
    return false;
  }

  public async requestOtp(mobileNumber: string): Promise<SendOtpResult> {
    const clean = mobileNumber.replace(/\D/g, '');
    if (clean.length !== 10) {
      return {
        success: false,
        maskedMobile: '',
        expiresInSeconds: 0,
        isDevelopmentMode: this.isDevelopmentMode(),
        error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।',
      };
    }

    // Rate Limiting
    if (this.isRateLimited(clean)) {
      return {
        success: false,
        maskedMobile: `XXXXX-${clean.slice(5)}`,
        expiresInSeconds: 0,
        isDevelopmentMode: this.isDevelopmentMode(),
        error: 'दर सीमा पार (Rate limit exceeded)। कृपया 10 मिनट बाद पुनः प्रयास करें।',
      };
    }

    // Resend Cooldown
    const existing = this.challenges.get(clean);
    const now = Date.now();
    if (existing && now < existing.canResendAt) {
      const waitSec = Math.ceil((existing.canResendAt - now) / 1000);
      return {
        success: false,
        maskedMobile: `XXXXX-${clean.slice(5)}`,
        expiresInSeconds: 0,
        isDevelopmentMode: this.isDevelopmentMode(),
        error: `कृपया ${waitSec} सेकंड बाद नया OTP मंगवाएं।`,
      };
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = this.hashOtp(code);
    const expiresAt = now + EXPIRY_MS;
    const canResendAt = now + RESEND_COOLDOWN_MS;

    const challenge: ServerChallenge = {
      mobileNumber: clean,
      hashedCode: hashed,
      plainCodeForDev: this.isDevelopmentMode() ? code : undefined,
      expiresAt,
      canResendAt,
      attemptsCount: 0,
      maxAttempts: MAX_ATTEMPTS,
    };
    this.challenges.set(clean, challenge);

    try {
      const result = await this.provider.sendOtp(clean, code);
      return result;
    } catch (err: any) {
      this.challenges.delete(clean);
      return {
        success: false,
        maskedMobile: `XXXXX-${clean.slice(5)}`,
        expiresInSeconds: 0,
        isDevelopmentMode: this.isDevelopmentMode(),
        error: err.message || 'SMS भेजने में त्रुटि हुई।',
      };
    }
  }

  public verifyOtp(mobileNumber: string, enteredOtp: string): VerifyOtpResult {
    const clean = mobileNumber.replace(/\D/g, '');
    const cleanOtp = enteredOtp.trim();

    if (cleanOtp.length !== 6) {
      return { success: false, error: 'कृपया 6 अंकों का OTP दर्ज करें।' };
    }

    const challenge = this.challenges.get(clean);
    if (!challenge) {
      return {
        success: false,
        code: 'NOT_FOUND',
        error: 'सक्रिय OTP सत्र नहीं मिला। कृपया दोबारा OTP भेजें।',
      };
    }

    const now = Date.now();
    if (now > challenge.expiresAt) {
      this.challenges.delete(clean);
      return {
        success: false,
        code: 'EXPIRED',
        error: 'OTP की वैधता समाप्त हो चुकी है (Expired)। नया OTP प्राप्त करें।',
      };
    }

    if (challenge.attemptsCount >= challenge.maxAttempts) {
      this.challenges.delete(clean);
      return {
        success: false,
        code: 'BRUTE_FORCE',
        error: 'अधिकतम गलत प्रयास। सुरक्षा कारणों से OTP रद्द कर दिया गया।',
      };
    }

    const hashedInput = this.hashOtp(cleanOtp);
    if (hashedInput !== challenge.hashedCode) {
      challenge.attemptsCount += 1;
      const remaining = challenge.maxAttempts - challenge.attemptsCount;
      return {
        success: false,
        code: 'INVALID',
        remainingAttempts: remaining,
        error: `गलत OTP। शेष प्रयास: ${remaining}`,
      };
    }

    // Success: Remove challenge so it cannot be re-used
    this.challenges.delete(clean);
    return {
      success: true,
      mobileNumber: clean,
    };
  }
}

export const otpService = new OtpServiceManager();
