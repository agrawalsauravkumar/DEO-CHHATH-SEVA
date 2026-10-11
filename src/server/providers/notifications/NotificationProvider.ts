/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProviderDiagnostic } from '../types';

export type NotificationCategory =
  | 'ANNOUNCEMENT'
  | 'EMERGENCY'
  | 'ROUTE_ALERT'
  | 'PARKING'
  | 'SHUTTLE'
  | 'MEDICAL'
  | 'HELP_REQUEST'
  | 'VOLUNTEER'
  | 'FAMILY_EMERGENCY';

export interface PushNotificationPayload {
  title: string;
  body: string;
  category: NotificationCategory;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  data?: Record<string, any>;
  icon?: string;
  badge?: string;
}

export interface SendPushResult {
  success: boolean;
  deliveredCount: number;
  provider: string;
  isSimulated?: boolean;
  error?: string;
}

export interface NotificationProvider {
  name: string;
  providerId: string;
  isConfigured(): boolean;
  getDiagnostic(): ProviderDiagnostic;
  sendNotification(payload: PushNotificationPayload, targets?: string[]): Promise<SendPushResult>;
}
