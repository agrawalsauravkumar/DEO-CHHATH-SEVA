/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OfflineDataService, QueuedOfflineAction } from './OfflineDataService';
import { apiRequest } from './apiClient';
import { LostFoundService } from './LostFoundService';

export interface QueueProcessingStatus {
  pendingCount: number;
  isProcessing: boolean;
  lastProcessedAt: number | null;
  lastError: string | null;
}

type QueueListener = (status: QueueProcessingStatus) => void;

class OfflineQueueProcessorManager {
  private isProcessing = false;
  private listeners: Set<QueueListener> = new Set();
  private lastProcessedAt: number | null = null;
  private lastError: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        void this.processQueue();
      });

      // Periodic check every 30 seconds if online
      window.setInterval(() => {
        if (navigator.onLine && !this.isProcessing) {
          void this.processQueue();
        }
      }, 30000);
    }
  }

  public subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener);
    void this.notifyListeners();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async notifyListeners(): Promise<void> {
    try {
      const pending = await OfflineDataService.getPendingActions();
      const status: QueueProcessingStatus = {
        pendingCount: pending.length,
        isProcessing: this.isProcessing,
        lastProcessedAt: this.lastProcessedAt,
        lastError: this.lastError,
      };
      this.listeners.forEach((listener) => {
        try {
          listener(status);
        } catch {
          // Ignore listener errors
        }
      });
    } catch {
      // Ignore errors when indexedDB is not available
    }
  }

  public async getPendingCount(): Promise<number> {
    try {
      const actions = await OfflineDataService.getPendingActions();
      return actions.length;
    } catch {
      return 0;
    }
  }

  public async processQueue(): Promise<{ processed: number; failed: number }> {
    if (this.isProcessing) return { processed: 0, failed: 0 };
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { processed: 0, failed: 0 };
    }

    this.isProcessing = true;
    void this.notifyListeners();

    let processedCount = 0;
    let failedCount = 0;

    try {
      const pendingActions = await OfflineDataService.getPendingActions();
      const now = Date.now();

      for (const action of pendingActions) {
        if (action.nextAttemptAt > now) {
          continue; // Backoff period not elapsed
        }

        try {
          await this.dispatchAction(action);
          await OfflineDataService.removePendingAction(action.id);
          processedCount += 1;
          this.lastError = null;
        } catch (err: unknown) {
          failedCount += 1;
          const errorMessage = err instanceof Error ? err.message : 'सिंक्रोनाइज़ेशन में त्रुटि';
          this.lastError = errorMessage;

          const nextAttempts = (action.attempts || 0) + 1;
          // Exponential backoff: 2s, 4s, 8s, 16s, up to 60s
          const delayMs = Math.min(60000, Math.pow(2, nextAttempts) * 1000);
          await OfflineDataService.updateActionRetry(action.id, nextAttempts, Date.now() + delayMs);
        }
      }

      this.lastProcessedAt = Date.now();
    } catch (globalErr: unknown) {
      this.lastError = globalErr instanceof Error ? globalErr.message : 'कतार प्रक्रिया विफल';
    } finally {
      this.isProcessing = false;
      void this.notifyListeners();
    }

    return { processed: processedCount, failed: failedCount };
  }

  private async dispatchAction(action: QueuedOfflineAction): Promise<void> {
    switch (action.type) {
      case 'SUBMIT_LOST_FOUND': {
        const payload = action.payload as Record<string, unknown>;
        const response = await apiRequest<{ success: boolean; report?: { reportId: string } }>(
          '/api/lost-found',
          {
            method: 'POST',
            body: JSON.stringify(payload),
          }
        );
        if (response.success && response.report?.reportId) {
          LostFoundService.updateReportStatus(action.id, 'SUBMITTED');
        }
        break;
      }

      case 'SUBMIT_VOLUNTEER_REGISTER': {
        await apiRequest('/api/volunteers/register', {
          method: 'POST',
          body: JSON.stringify(action.payload),
        });
        break;
      }

      case 'SUBMIT_VOLUNTEER_REQUEST': {
        await apiRequest('/api/volunteers/request', {
          method: 'POST',
          body: JSON.stringify(action.payload),
        });
        break;
      }

      default:
        console.warn('Unknown offline action type:', action.type);
        break;
    }
  }
}

export const OfflineQueueProcessor = new OfflineQueueProcessorManager();
