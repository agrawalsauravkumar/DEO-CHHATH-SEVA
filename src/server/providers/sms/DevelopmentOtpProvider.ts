/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OtpProvider, SendOtpResult } from './OtpProvider';
import { ProviderDiagnostic } from '../types';

export class DevelopmentOtpProvider implements OtpProvider {
  name = 'Development Simulated OTP Provider (Local Sandbox)';
  providerId = 'DEV_SIMULATED';

  isConfigured(): boolean {
    return true;
  }

  getDiagnostic(): ProviderDiagnostic {
    return {
      providerId: this.providerId,
      name: this.name,
      category: 'SMS_OTP',
      status: 'STANDBY',
      isLive: false,
      activeDriver: 'In-Memory Development Mode',
      details: 'SMS_API_KEY कॉन्फ़िगर नहीं है। विकास मोड में OTP हिंट के साथ स्थानीय रूप से जनरेट हो रहा है।',
      lastCheckedAt: new Date().toISOString(),
    };
  }

  async sendOtp(mobileNumber: string, code: string): Promise<SendOtpResult> {
    const masked = `XXXXX-${mobileNumber.slice(5)}`;
    return {
      success: true,
      maskedMobile: masked,
      expiresInSeconds: 300,
      isDevelopmentMode: true,
      devOtpHint: code, // Safely provided in sandbox environment
    };
  }
}
