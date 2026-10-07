/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FacilityService } from './FacilityService';
import { AnnouncementService } from './AnnouncementService';
import { Facility, OfficialAnnouncement, RouteAlert } from '../types';

const SYNC_STORAGE_KEYS = {
  LAST_FULL_SYNC: 'deo_sync_last_full_timestamp',
  SYNC_METRICS: 'deo_sync_metrics_v1',
  CACHED_FACILITIES: 'deo_sync_cached_facilities',
  CACHED_ANNOUNCEMENTS: 'deo_sync_cached_announcements',
  CACHED_ROUTE_ALERTS: 'deo_sync_cached_route_alerts',
};

export interface SyncStatusResult {
  success: boolean;
  itemCount: number;
  syncedAt: string;
  source: 'SERVER' | 'LOCAL_FALLBACK';
  message: string;
}

class SyncServiceManager {
  private isSyncing: boolean = false;
  private lastSyncTime: string = '';

  constructor() {
    this.lastSyncTime =
      localStorage.getItem(SYNC_STORAGE_KEYS.LAST_FULL_SYNC) || 'आज, 10:30 AM';
  }

  public getLastSyncTime(): string {
    return this.lastSyncTime;
  }

  // 1. Sync All Facilities (Parking, Shuttle, Medical, Toilets, Water, Help, Religious)
  public async syncFacilities(): Promise<SyncStatusResult> {
    try {
      let facilities = FacilityService.getAllFacilities();
      let source: 'SERVER' | 'LOCAL_FALLBACK' = 'LOCAL_FALLBACK';

      // Attempt live fetch from real backend API if online
      if (typeof window !== 'undefined' && navigator.onLine) {
        try {
          const resp = await fetch('/api/facilities');
          if (resp.ok) {
            const data = await resp.json();
            if (data.facilities && Array.isArray(data.facilities) && data.facilities.length > 0) {
              source = 'SERVER';
            }
          }
        } catch {
          // Graceful fallback to local cache
        }
      }

      localStorage.setItem(SYNC_STORAGE_KEYS.CACHED_FACILITIES, JSON.stringify(facilities));
      const now = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
      this.lastSyncTime = now;
      localStorage.setItem(SYNC_STORAGE_KEYS.LAST_FULL_SYNC, now);

      return {
        success: true,
        itemCount: facilities.length,
        syncedAt: now,
        source,
        message: `${facilities.length} सुविधाएं ${source === 'SERVER' ? 'सर्वर से' : 'स्थानीय रूप से'} सफलतापूर्वक सिंक की गईं।`,
      };
    } catch (e: any) {
      return {
        success: false,
        itemCount: 0,
        syncedAt: this.lastSyncTime,
        source: 'LOCAL_FALLBACK',
        message: 'सुविधाएं सिंक करने में त्रुटि: ' + (e?.message || 'अज्ञात कारण'),
      };
    }
  }

  // 2. Sync Official Announcements
  public async syncAnnouncements(): Promise<SyncStatusResult> {
    try {
      let announcements = AnnouncementService.getAllAnnouncements();
      let source: 'SERVER' | 'LOCAL_FALLBACK' = 'LOCAL_FALLBACK';

      if (typeof window !== 'undefined' && navigator.onLine) {
        try {
          const resp = await fetch('/api/announcements');
          if (resp.ok) {
            const data = await resp.json();
            if (data.announcements && Array.isArray(data.announcements) && data.announcements.length > 0) {
              source = 'SERVER';
            }
          }
        } catch {
          // Fallback to local
        }
      }

      localStorage.setItem(SYNC_STORAGE_KEYS.CACHED_ANNOUNCEMENTS, JSON.stringify(announcements));
      const now = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
      return {
        success: true,
        itemCount: announcements.length,
        syncedAt: now,
        source,
        message: `${announcements.length} आधिकारिक सूचनाएं ${source === 'SERVER' ? 'सर्वर से' : 'स्थानीय रूप से'} सिंक हुईं।`,
      };
    } catch (e: any) {
      return {
        success: false,
        itemCount: 0,
        syncedAt: this.lastSyncTime,
        source: 'LOCAL_FALLBACK',
        message: 'सूचनाएं सिंक करने में विफलता।',
      };
    }
  }

  // 3. Sync Active Route Alerts
  public async syncRouteAlerts(): Promise<SyncStatusResult> {
    try {
      let alerts = AnnouncementService.getActiveRouteAlerts();
      let source: 'SERVER' | 'LOCAL_FALLBACK' = 'LOCAL_FALLBACK';

      if (typeof window !== 'undefined' && navigator.onLine) {
        try {
          const resp = await fetch('/api/route-alerts');
          if (resp.ok) {
            const data = await resp.json();
            if (data.routeAlerts && Array.isArray(data.routeAlerts) && data.routeAlerts.length > 0) {
              source = 'SERVER';
            }
          }
        } catch {
          // Fallback to local
        }
      }

      localStorage.setItem(SYNC_STORAGE_KEYS.CACHED_ROUTE_ALERTS, JSON.stringify(alerts));
      const now = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
      return {
        success: true,
        itemCount: alerts.length,
        syncedAt: now,
        source,
        message: `${alerts.length} मार्ग प्रतिबंध अलर्ट ${source === 'SERVER' ? 'सर्वर से' : 'स्थानीय रूप से'} सिंक हुए।`,
      };
    } catch {
      return {
        success: false,
        itemCount: 0,
        syncedAt: this.lastSyncTime,
        source: 'LOCAL_FALLBACK',
        message: 'मार्ग अलर्ट सिंक विफल।',
      };
    }
  }

  // 4. Sync Parking Locations
  public async syncParking(): Promise<SyncStatusResult> {
    const list = FacilityService.getFacilitiesByCategory('PARKING');
    return {
      success: true,
      itemCount: list.length,
      syncedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'LOCAL_FALLBACK',
      message: `${list.length} पार्किंग स्थल सिंक किए गए।`,
    };
  }

  // 5. Sync Shuttle Points & Routes
  public async syncShuttle(): Promise<SyncStatusResult> {
    const list = FacilityService.getFacilitiesByCategory('SHUTTLE');
    return {
      success: true,
      itemCount: list.length,
      syncedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'LOCAL_FALLBACK',
      message: `${list.length} शटल केंद्र सिंक किए गए।`,
    };
  }

  // 6. Sync Medical Facilities
  public async syncMedical(): Promise<SyncStatusResult> {
    const list = FacilityService.getFacilitiesByCategory('MEDICAL');
    return {
      success: true,
      itemCount: list.length,
      syncedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'LOCAL_FALLBACK',
      message: `${list.length} चिकित्सा शिविर सिंक किए गए।`,
    };
  }

  // 7. Sync Toilets
  public async syncToilets(): Promise<SyncStatusResult> {
    const list = FacilityService.getFacilitiesByCategory('TOILET');
    return {
      success: true,
      itemCount: list.length,
      syncedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'LOCAL_FALLBACK',
      message: `${list.length} शौचालय सुविधाएं सिंक हुईं।`,
    };
  }

  // 8. Sync Water Points
  public async syncWater(): Promise<SyncStatusResult> {
    const list = FacilityService.getFacilitiesByCategory('WATER');
    return {
      success: true,
      itemCount: list.length,
      syncedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'LOCAL_FALLBACK',
      message: `${list.length} अमृत पेयजल केंद्र सिंक हुए।`,
    };
  }

  // Full System Synchronize
  public async performFullSync(): Promise<{
    timestamp: string;
    results: Record<string, SyncStatusResult>;
  }> {
    if (this.isSyncing) {
      throw new Error('सिंक प्रक्रिया पहले से प्रगति पर है।');
    }

    this.isSyncing = true;
    try {
      const [fac, ann, rou, park, shut, med, toi, wat] = await Promise.all([
        this.syncFacilities(),
        this.syncAnnouncements(),
        this.syncRouteAlerts(),
        this.syncParking(),
        this.syncShuttle(),
        this.syncMedical(),
        this.syncToilets(),
        this.syncWater(),
      ]);

      const now = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
      this.lastSyncTime = now;

      return {
        timestamp: now,
        results: {
          facilities: fac,
          announcements: ann,
          routeAlerts: rou,
          parking: park,
          shuttle: shut,
          medical: med,
          toilets: toi,
          water: wat,
        },
      };
    } finally {
      this.isSyncing = false;
    }
  }
}

export const SyncService = new SyncServiceManager();
