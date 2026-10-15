import type { FacilityCategory, MapFacility } from '../types';

const CATEGORIES = new Set<FacilityCategory>([
  'PARKING',
  'SHUTTLE',
  'MEDICAL',
  'TOILET',
  'WATER',
  'HELP',
  'RELIGIOUS',
]);

const hasValidOptionalText = (value: unknown): boolean =>
  value === undefined || typeof value === 'string';

export const isVerifiedMapFacility = (value: unknown): value is MapFacility => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<MapFacility>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.category === 'string' &&
    CATEGORIES.has(item.category as FacilityCategory) &&
    typeof item.latitude === 'number' &&
    Number.isFinite(item.latitude) &&
    item.latitude >= -90 &&
    item.latitude <= 90 &&
    typeof item.longitude === 'number' &&
    Number.isFinite(item.longitude) &&
    item.longitude >= -180 &&
    item.longitude <= 180 &&
    typeof item.description === 'string' &&
    hasValidOptionalText(item.nameEn) &&
    hasValidOptionalText(item.landmark) &&
    hasValidOptionalText(item.accessibilityInfo) &&
    item.verificationStatus === 'VERIFIED' &&
    typeof item.lastUpdated === 'string' &&
    item.lastUpdated.length > 0 &&
    typeof item.source === 'string' &&
    item.source.trim().length > 0 &&
    !/demo|sample|test/i.test(item.source)
  );
};
