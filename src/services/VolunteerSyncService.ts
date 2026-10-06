import { VolunteerAvailability } from '../types';
import { VolunteerService } from './VolunteerService';

interface QueuedSyncAction {
  id: string;
  type: 'AVAILABILITY' | 'REQUEST_STATUS' | 'LOCATION_PERMISSION' | 'PROFILE';
  payload: any;
  timestamp: number;
}

const STORAGE_SYNC_QUEUE_KEY = 'deo_chhath_offline_sync_queue_v1';

class VolunteerSyncServiceManager {
  private queue: QueuedSyncAction[] = [];
  private isSyncing = false;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncOfflineChanges();
      });
    }
  }

  private loadQueue() {
    try {
      const raw = localStorage.getItem(STORAGE_SYNC_QUEUE_KEY);
      this.queue = raw ? JSON.parse(raw) : [];
    } catch {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_SYNC_QUEUE_KEY, JSON.stringify(this.queue));
    } catch {
      // Ignore
    }
  }

  private enqueue(type: QueuedSyncAction['type'], payload: any) {
    this.queue.push({
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      payload,
      timestamp: Date.now(),
    });
    this.saveQueue();
  }

  public async syncVolunteerProfile(volunteerId: string): Promise<void> {
    if (!navigator.onLine) {
      this.enqueue('PROFILE', { volunteerId });
      return;
    }
    // Network call simulation / ready for future API
  }

  public async syncAvailability(volunteerId: string, status: VolunteerAvailability): Promise<void> {
    if (!navigator.onLine) {
      this.enqueue('AVAILABILITY', { volunteerId, status });
      return;
    }
    // Network call simulation
  }

  public async syncHelpRequests(): Promise<void> {
    if (!navigator.onLine) return;
    // Sync with remote server when configured
  }

  public async syncRequestStatus(requestId: string, status: string): Promise<void> {
    if (!navigator.onLine) {
      this.enqueue('REQUEST_STATUS', { requestId, status });
      return;
    }
  }

  public async syncLocationPermission(volunteerId: string, enabled: boolean): Promise<void> {
    if (!navigator.onLine) {
      this.enqueue('LOCATION_PERMISSION', { volunteerId, enabled });
      return;
    }
  }

  public async syncOfflineChanges(): Promise<void> {
    if (!navigator.onLine || this.isSyncing || this.queue.length === 0) return;
    this.isSyncing = true;

    try {
      const itemsToProcess = [...this.queue];
      for (const item of itemsToProcess) {
        // Execute sync per item type
        if (item.type === 'AVAILABILITY') {
          VolunteerService.setAvailability(item.payload.volunteerId, item.payload.status);
        }
      }
      this.queue = [];
      this.saveQueue();
    } catch {
      // Keep in queue for next retry
    } finally {
      this.isSyncing = false;
    }
  }

  public getPendingQueueCount(): number {
    return this.queue.length;
  }
}

export const VolunteerSyncService = new VolunteerSyncServiceManager();
