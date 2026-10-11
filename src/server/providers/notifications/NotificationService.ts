/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  NotificationProvider,
  PushNotificationPayload,
  SendPushResult,
} from './NotificationProvider';
import { WebPushProvider } from './WebPushProvider';
import { FirebaseNotificationProvider } from './FirebaseNotificationProvider';
import { ProviderDiagnostic } from '../types';

class NotificationServiceManager {
  private activeProvider: NotificationProvider;
  private subscribers = new Set<string>();

  constructor() {
    const pushType = (process.env.PUSH_PROVIDER || '').toUpperCase();
    const fcm = new FirebaseNotificationProvider();
    const webpush = new WebPushProvider();

    if (pushType === 'FIREBASE' && fcm.isConfigured()) {
      this.activeProvider = fcm;
    } else if (webpush.isConfigured()) {
      this.activeProvider = webpush;
    } else {
      // Default to standby webpush
      this.activeProvider = webpush;
    }
  }

  public getDiagnostic(): ProviderDiagnostic {
    return this.activeProvider.getDiagnostic();
  }

  public getProviderName(): string {
    return this.activeProvider.name;
  }

  public isConfigured(): boolean {
    return this.activeProvider.isConfigured();
  }

  public addSubscriber(tokenOrSubscription: string): void {
    this.subscribers.add(tokenOrSubscription);
  }

  public removeSubscriber(tokenOrSubscription: string): void {
    this.subscribers.delete(tokenOrSubscription);
  }

  public getSubscriberCount(): number {
    return this.subscribers.size;
  }

  public async broadcast(payload: PushNotificationPayload): Promise<SendPushResult> {
    if (!this.activeProvider.isConfigured()) {
      return {
        success: false,
        deliveredCount: 0,
        provider: this.activeProvider.name,
        isSimulated: true,
        error: 'Push notification credentials are not configured on the server.',
      };
    }

    return this.activeProvider.sendNotification(payload, Array.from(this.subscribers));
  }
}

export const notificationService = new NotificationServiceManager();
