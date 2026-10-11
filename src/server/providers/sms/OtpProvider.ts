/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProviderDiagnostic } from '../types';

export interface SendOtpResult {
  success: boolean;
  maskedMobile: string;
  expiresInSeconds: number;
  isDevelopmentMode: boolean;
  devOtpHint?: string; // ONLY populated if isDevelopmentMode === true
  code?: 'INVALID' | 'RATE_LIMITED' | 'UNAVAILABLE';
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  mobileNumber?: string;
  remainingAttempts?: number;
  error?: string;
  code?: 'EXPIRED' | 'INVALID' | 'RATE_LIMITED' | 'BRUTE_FORCE' | 'NOT_FOUND';
}

export interface OtpProvider {
  name: string;
  providerId: string;
  isConfigured(): boolean;
  getDiagnostic(): ProviderDiagnostic;
  sendOtp(mobileNumber: string, code: string): Promise<SendOtpResult>;
}
