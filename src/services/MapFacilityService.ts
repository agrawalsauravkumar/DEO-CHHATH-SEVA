import { MapFacility } from '../types';
import { OfflineDataService } from './OfflineDataService';
import { isVerifiedMapFacility } from './MapFacilityValidation';

const FEED_VERSION = '1';
const API_URL = import.meta.env.VITE_MAP_FACILITIES_API_URL?.trim();
export { isVerifiedMapFacility } from './MapFacilityValidation';

export interface VerifiedFacilitiesResult {
  facilities: MapFacility[];
  source: 'NETWORK' | 'CACHE' | 'NONE';
  version?: string;
  syncedAt?: number;
  warning?: string;
}

export const MapFacilityService = {
  isConfigured: (): boolean => Boolean(API_URL),

  async getVerifiedFacilities(signal?: AbortSignal): Promise<VerifiedFacilitiesResult> {
    let networkError: unknown;
    if (API_URL && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const response = await fetch(API_URL, {
          headers: { Accept: 'application/json' },
          signal,
        });
        if (!response.ok) {
          throw new Error(`सुविधा डेटा सेवा से जवाब नहीं मिला (${response.status})।`);
        }

        const payload: unknown = await response.json();
        const facilities = Array.isArray(payload)
          ? payload
          : payload && typeof payload === 'object' && 'facilities' in payload
            ? (payload as { facilities?: unknown }).facilities
            : undefined;
        if (!Array.isArray(facilities)) {
          throw new Error('सुविधा डेटा का प्रारूप मान्य नहीं है।');
        }

        const verified = facilities.filter(isVerifiedMapFacility);
        if (facilities.length > 0 && verified.length === 0) {
          throw new Error('सुविधा फ़ीड में कोई सत्यापित रिकॉर्ड मान्य नहीं है।');
        }
        const version =
          payload && typeof payload === 'object' && 'version' in payload &&
          typeof (payload as { version?: unknown }).version === 'string'
            ? (payload as { version: string }).version
            : FEED_VERSION;

        let syncedAt: number | undefined;
        try {
          const snapshot = await OfflineDataService.saveVerifiedFacilities(verified, version);
          syncedAt = snapshot.syncedAt;
        } catch (error) {
          console.error('Verified facility data could not be cached locally:', error);
        }
        return { facilities: verified, source: 'NETWORK', version, syncedAt };
      } catch (error) {
        if (signal?.aborted) throw error;
        networkError = error;
      }
    }

    try {
      const snapshot = await OfflineDataService.getVerifiedFacilities();
      if (snapshot) {
        return {
          facilities: snapshot.facilities.filter(isVerifiedMapFacility),
          source: 'CACHE',
          version: snapshot.version,
          syncedAt: snapshot.syncedAt,
          warning: networkError instanceof Error ? networkError.message : undefined,
        };
      }
    } catch (error) {
      if (networkError) {
        console.error('Local verified facility cache could not be read:', error);
      } else {
        throw error;
      }
    }

    if (networkError) throw networkError;
    return { facilities: [], source: 'NONE' };
  },
};
