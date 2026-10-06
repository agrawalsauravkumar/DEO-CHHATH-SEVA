/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OtpProvider, SendOtpResult } from './OtpProvider';
import { ProviderDiagnostic } from '../types';

export class SmsOtpProvider implements OtpProvider {
  name: string;
  providerId: string;
  private apiUrl?: string;
  private apiKey?: string;
  private senderId?: string;
  private templateId?: string;

  constructor() {
    this.providerId = process.env.SMS_PROVIDER || 'FAST2SMS';
    this.name = `Production SMS Provider (${this.providerId})`;
    this.apiUrl = process.env.SMS_API_URL;
    this.apiKey = process.env.SMS_API_KEY;
    this.senderId = process.env.SMS_SENDER_ID || 'DEOSEV';
    this.templateId = process.env.SMS_TEMPLATE_ID;
  }

  isConfigured(): boolean {
    return !!(
      this.apiKey &&
      !this.apiKey.includes('placeholder') &&
      this.apiUrl &&
      !this.apiUrl.includes('placeholder')
    );
  }

  getDiagnostic(): ProviderDiagnostic {
    const configured = this.isConfigured();
    return {
      providerId: this.providerId,
      name: this.name,
      category: 'SMS_OTP',
      status: configured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      isLive: configured,
      activeDriver: configured ? `Production Gateway (${this.providerId})` : 'Unconfigured SMS Gateway',
      details: configured
        ? `Sender ID: ${this.senderId}, API Endpoint: ${this.apiUrl}`
        : 'SMS_API_KEY और SMS_API_URL पर्यावरण चर (Environment Variables) सेट नहीं हैं।',
      lastCheckedAt: new Date().toISOString(),
    };
  }

  async sendOtp(mobileNumber: string, code: string): Promise<SendOtpResult> {
    if (!this.isConfigured()) {
      throw new Error('SMS Gateway कॉन्फ़िगर नहीं है (SMS Gateway is not configured)');
    }

    const masked = `XXXXX-${mobileNumber.slice(5)}`;

    try {
      // Standard SMS Gateway dispatch
      const payload = {
        sender: this.senderId,
        template_id: this.templateId,
        numbers: mobileNumber,
        otp: code,
        message: `DEO CHHATH SEVA: आपका सत्यापन कोड ${code} है। 5 मिनट में समाप्त होगा। NEXTGEN DEV BHOOMI FOUNDATION`,
      };

      const response = await fetch(this.apiUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: this.apiKey!,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`SMS Provider HTTP Error: ${response.status}`);
      }

      // Production mode: NEVER return OTP in API response
      return {
        success: true,
        maskedMobile: masked,
        expiresInSeconds: 300,
        isDevelopmentMode: false,
      };
    } catch (err: any) {
      throw new Error(`SMS प्रेषण में विफलता: ${err.message}`);
    }
  }
}
