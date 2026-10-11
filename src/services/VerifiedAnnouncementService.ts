import {
  AnnouncementCategory,
  AnnouncementPriority,
} from '../types';
import {
  CachedAnnouncement,
  OfflineDataService,
} from './OfflineDataService';

const API_URL = import.meta.env.VITE_VERIFIED_ANNOUNCEMENTS_API_URL?.trim();
const CATEGORIES = new Set<AnnouncementCategory>([
  'EMERGENCY',
  'ROUTE',
  'PARKING',
  'SHUTTLE',
  'MEDICAL',
  'HELP',
  'GENERAL',
  'CHHATH_INFO',
  'SAFETY',
]);
const PRIORITIES = new Set<AnnouncementPriority>([
  'NORMAL',
  'IMPORTANT',
  'URGENT',
  'EMERGENCY',
]);

const isVerifiedRouteAlert = (value: unknown): boolean => {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object') return false;
  const alert = value as Record<string, unknown>;
  return (
    typeof alert.id === 'string' &&
    typeof alert.title === 'string' &&
    typeof alert.roadName === 'string' &&
    typeof alert.reason === 'string' &&
    typeof alert.affectedArea === 'string' &&
    typeof alert.latitude === 'number' &&
    Number.isFinite(alert.latitude) &&
    alert.latitude >= -90 &&
    alert.latitude <= 90 &&
    typeof alert.longitude === 'number' &&
    Number.isFinite(alert.longitude) &&
    alert.longitude >= -180 &&
    alert.longitude <= 180 &&
    alert.isVerified === true &&
    alert.isActive === true
  );
};

export interface VerifiedAnnouncementsResult {
  announcements: CachedAnnouncement[];
  source: 'NETWORK' | 'CACHE' | 'NONE';
  version?: string;
  syncedAt?: number;
  warning?: string;
}

const isCachedAnnouncement = (value: unknown): value is CachedAnnouncement => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CachedAnnouncement>;
  const expiry = typeof item.expiresAt === 'string' ? Date.parse(item.expiresAt) : NaN;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.shortDescription === 'string' &&
    (item.details === undefined || typeof item.details === 'string') &&
    typeof item.category === 'string' &&
    CATEGORIES.has(item.category as AnnouncementCategory) &&
    typeof item.priority === 'string' &&
    PRIORITIES.has(item.priority as AnnouncementPriority) &&
    item.isVerifiedOfficial === true &&
    item.isActive === true &&
    typeof item.source === 'string' &&
    item.source.trim().length > 0 &&
    !/demo|sample|test/i.test(item.source) &&
    typeof item.publishedTime === 'string' &&
    typeof item.lastUpdatedTime === 'string' &&
    isVerifiedRouteAlert(item.routeAlert) &&
    Number.isFinite(expiry) &&
    expiry > Date.now()
  );
};

const readFeedVersion = (payload: unknown): string =>
  payload && typeof payload === 'object' &&
  'version' in payload &&
  typeof (payload as { version?: unknown }).version === 'string'
    ? (payload as { version: string }).version
    : '1';

export const VerifiedAnnouncementService = {
  isConfigured: (): boolean => Boolean(API_URL),

  async getAnnouncements(signal?: AbortSignal): Promise<VerifiedAnnouncementsResult> {
    let networkError: unknown;
    if (API_URL && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const response = await fetch(API_URL, {
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

        const verified = announcements.filter(isCachedAnnouncement);
        if (announcements.length > 0 && verified.length === 0) {
          throw new Error('घोषणा फ़ीड में कोई सत्यापित, सक्रिय और समाप्ति-तिथि वाली घोषणा मान्य नहीं है।');
        }
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
          announcements: snapshot.announcements.filter(isCachedAnnouncement),
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
