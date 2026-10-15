import { AnnouncementCategory, AnnouncementPriority } from '../types';
import { CachedAnnouncement } from './OfflineDataService';

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
const ISO_TIMESTAMP_WITH_TIMEZONE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' &&
    ISO_TIMESTAMP_WITH_TIMEZONE.test(value) &&
    Number.isFinite(Date.parse(value));
}

function isVerifiedRouteAlert(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value !== 'object') return false;
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
}

export function normalizeVerifiedAnnouncement(
  value: unknown,
  now = Date.now()
): CachedAnnouncement | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== 'string' ||
    typeof item.title !== 'string' ||
    typeof item.shortDescription !== 'string' ||
    (item.details !== undefined && typeof item.details !== 'string') ||
    typeof item.category !== 'string' ||
    !CATEGORIES.has(item.category as AnnouncementCategory) ||
    typeof item.priority !== 'string' ||
    !PRIORITIES.has(item.priority as AnnouncementPriority) ||
    item.status !== 'PUBLISHED' ||
    item.isVerifiedOfficial !== true ||
    typeof item.source !== 'string' ||
    !item.source.trim() ||
    /demo|sample|test/i.test(item.source) ||
    !isTimestamp(item.publishedAt) ||
    !isTimestamp(item.expiresAt) ||
    !isVerifiedRouteAlert(item.routeAlert)
  ) {
    return undefined;
  }

  const publishedAt = Date.parse(item.publishedAt);
  const expiresAt = Date.parse(item.expiresAt);
  if (publishedAt > now || expiresAt <= now || expiresAt <= publishedAt) {
    return undefined;
  }

  const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat('hi-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(timestamp);

  return {
    ...item,
    publishedAt: item.publishedAt,
    expiresAt: item.expiresAt,
    status: 'PUBLISHED',
    publishedTime: formatDate(publishedAt),
    lastUpdatedTime: formatDate(publishedAt),
    isActive: true,
    routeAlert: item.routeAlert || undefined,
  } as CachedAnnouncement;
}
