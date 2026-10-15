import {
  CachedAnnouncement,
  OfflineDataService,
} from './OfflineDataService';
import { apiUrl } from './apiUrl';
import { normalizeVerifiedAnnouncement } from './VerifiedAnnouncementValidation';
const API_URL = import.meta.env.VITE_VERIFIED_ANNOUNCEMENTS_API_URL?.trim();

export interface VerifiedAnnouncementsResult {
  announcements: CachedAnnouncement[];
  source: 'NETWORK' | 'CACHE' | 'NONE';
  version?: string;
  syncedAt?: number;
  warning?: string;
}

const readFeedVersion = (payload: unknown): string =>
  payload && typeof payload === 'object' &&
  'version' in payload &&
  typeof (payload as { version?: unknown }).version === 'string'
    ? (payload as { version: string }).version
    : '1';

export const VerifiedAnnouncementService = {
  isConfigured: (): boolean => true,

  async getAnnouncements(signal?: AbortSignal): Promise<VerifiedAnnouncementsResult> {
    let networkError: unknown;
    if (typeof navigator === 'undefined' || navigator.onLine) {
      try {
        const response = await fetch(API_URL || apiUrl('/api/announcements'), {
          headers: { Accept: 'application/json' },
          signal,
        });
        if (!response.ok) {
          throw new Error(`घोषणा सेवा से जवाब नहीं मिला (${response.status})।`);
        }
        const payload: unknown = await response.json();
        const announcements = Array.isArray(payload)
          ? payload
          : payload && typeof payload === 'object' && 'announcements' in payload
            ? (payload as { announcements?: unknown }).announcements
            : undefined;
        if (!Array.isArray(announcements)) {
          throw new Error('घोषणा डेटा का प्रारूप मान्य नहीं है।');
        }

        const verified = announcements
          .map((value) => normalizeVerifiedAnnouncement(value))
          .filter((value): value is CachedAnnouncement => value !== undefined);
        const version = readFeedVersion(payload);
        let syncedAt: number | undefined;
        try {
          const snapshot = await OfflineDataService.saveVerifiedAnnouncements(verified, version);
          syncedAt = snapshot.syncedAt;
        } catch (error) {
          console.error('Verified announcements could not be cached locally:', error);
        }
        return { announcements: verified, source: 'NETWORK', version, syncedAt };
      } catch (error) {
        if (signal?.aborted) throw error;
        networkError = error;
      }
    }

    try {
      const snapshot = await OfflineDataService.getVerifiedAnnouncements();
      if (snapshot) {
        return {
          announcements: snapshot.announcements
            .map((value) => normalizeVerifiedAnnouncement(value))
            .filter((value): value is CachedAnnouncement => value !== undefined),
          source: 'CACHE',
          version: snapshot.version,
          syncedAt: snapshot.syncedAt,
          warning: networkError instanceof Error ? networkError.message : undefined,
        };
      }
    } catch (error) {
      if (!networkError) throw error;
      console.error('Cached verified announcements could not be read:', error);
    }

    if (networkError) throw networkError;
    return { announcements: [], source: 'NONE' };
  },
};
