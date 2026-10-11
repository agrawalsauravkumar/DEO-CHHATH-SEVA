import { MapFacilityService } from './MapFacilityService';
import { NetworkService } from './NetworkService';
import { OfflineDataService } from './OfflineDataService';
import { VerifiedAnnouncementService } from './VerifiedAnnouncementService';

export interface SyncStatusResult {
  success: boolean;
  itemCount: number;
  syncedAt: string;
  source: 'NETWORK' | 'CACHE' | 'NONE';
  message: string;
}

const RETRY_LIMIT = 3;
const BASE_RETRY_DELAY_MS = 1000;

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

class SyncServiceManager {
  private syncPromise: Promise<SyncStatusResult> | null = null;

  public isConfigured(): boolean {
    return MapFacilityService.isConfigured() || VerifiedAnnouncementService.isConfigured();
  }

  public async getLastSyncTime(): Promise<number | null> {
    try {
      return await OfflineDataService.getLastSuccessfulSync();
    } catch (error) {
      console.error('Last successful synchronization time could not be read:', error);
      return null;
    }
  }

  public performFullSync(): Promise<SyncStatusResult> {
    if (this.syncPromise) return this.syncPromise;
    this.syncPromise = this.performSyncWithRetry().finally(() => {
      this.syncPromise = null;
    });
    return this.syncPromise;
  }

  private async performSyncWithRetry(): Promise<SyncStatusResult> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      NetworkService.setStatus('OFFLINE');
      throw new Error('इंटरनेट उपलब्ध नहीं है। नेटवर्क मिलने पर फिर से सिंक करें।');
    }
    if (!this.isConfigured()) {
      NetworkService.setStatus('SYNC_ERROR');
      throw new Error('सत्यापित सुविधा फ़ीड कॉन्फ़िगर नहीं है।');
    }

    NetworkService.setStatus('SYNCING');
    let lastError: unknown;

    for (let attempt = 0; attempt < RETRY_LIMIT; attempt += 1) {
      try {
        if (!this.isConfigured()) {
          throw new Error('सत्यापित सुविधा या घोषणा फ़ीड कॉन्फ़िगर नहीं है।');
        }

        const [facilityResult, announcementResult] = await Promise.all([
          MapFacilityService.isConfigured()
            ? MapFacilityService.getVerifiedFacilities()
            : Promise.resolve(null),
          VerifiedAnnouncementService.isConfigured()
            ? VerifiedAnnouncementService.getAnnouncements()
            : Promise.resolve(null),
        ]);
        const hasFailedSource =
          (facilityResult !== null && facilityResult.source !== 'NETWORK') ||
          (announcementResult !== null && announcementResult.source !== 'NETWORK');
        if (hasFailedSource) {
          throw new Error('एक या अधिक अधिकृत डेटा स्रोत सिंक नहीं हुए। सहेजा डेटा सुरक्षित है।');
        }

        const itemCount =
          (facilityResult?.facilities.length || 0) +
          (announcementResult?.announcements.length || 0);
        const version = [
          facilityResult?.version,
          announcementResult?.version,
        ].filter(Boolean).join(':') || '1';
        const timestamp = await OfflineDataService.recordSuccessfulSync(version);
        const syncedAt = new Date(timestamp).toISOString();
        NetworkService.setStatus('SYNCED');
        return {
          success: true,
          itemCount,
          syncedAt,
          source: 'NETWORK',
          message: `${itemCount} सत्यापित रिकॉर्ड स्रोत से अपडेट हुए।`,
        };
      } catch (error) {
        lastError = error;
        if (typeof navigator !== 'undefined' && !navigator.onLine) break;
        if (attempt < RETRY_LIMIT - 1) {
          await wait(BASE_RETRY_DELAY_MS * 2 ** attempt);
        }
      }
    }

    NetworkService.setStatus(
      typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : 'SYNC_ERROR'
    );
    const message =
      lastError instanceof Error
        ? lastError.message
        : 'सिंक विफल हुआ। नेटवर्क जाँचकर पुनः प्रयास करें।';
    throw new Error(message);
  }
}

export const SyncService = new SyncServiceManager();
