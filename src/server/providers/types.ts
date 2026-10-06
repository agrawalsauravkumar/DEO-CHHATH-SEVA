/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Common Provider Status & Diagnostic Interfaces

export type ProviderStatusState = 'CONFIGURED' | 'NOT_CONFIGURED' | 'ERROR' | 'STANDBY';

export interface ProviderDiagnostic {
  providerId: string;
  name: string;
  category: 'MAP' | 'ROUTING' | 'SMS_OTP' | 'PUSH_NOTIFICATION' | 'FILE_STORAGE' | 'EMAIL' | 'REALTIME';
  status: ProviderStatusState;
  isLive: boolean;
  activeDriver: string;
  details: string;
  lastCheckedAt: string;
  error?: string;
}

export interface SystemHealthReport {
  apiStatus: 'HEALTHY' | 'DEGRADED';
  version: string;
  timestamp: string;
  organization: string;
  tagline: string;
  database: {
    engine: string;
    connectionState: string;
    hasPostGIS: boolean;
  };
  providers: Record<string, ProviderDiagnostic>;
}
