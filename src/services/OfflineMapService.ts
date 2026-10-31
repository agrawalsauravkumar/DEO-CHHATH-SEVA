/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { POIItem, DEMO_POIS } from './POIService';
import { DEFAULT_AUTHENTIC_FACILITIES, MapFacilityService } from './MapFacilityService';

export interface OfflinePackageMetadata {
  id: string;
  name: string;
  area: string;
  version: string;
  dataSizeBytes: number;
  dataSizeDisplay: string;
  downloadedAt: string | null;
  updatedAt: string | null;
  status: 'not_downloaded' | 'downloading' | 'ready' | 'update_available' | 'error';
  errorMessage?: string;
  poiCount: number;
  routeCount: number;
  tilePackageFormat: string;
}

export interface OfflineRouteItem {
  id: string;
  name: string;
  fromName: string;
  toName: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  distanceMeters: number;
  walkingMinutes: number;
  waypoints: [number, number][];
  isAccessible: boolean;
  notes: string;
}

const STORAGE_KEY_META = 'deo_offline_map_package_v1';
const STORAGE_KEY_ROUTES = 'deo_offline_map_routes_v1';

export const DEO_OFFLINE_WALKING_ROUTES: OfflineRouteItem[] = [
  {
    id: 'offline-route-1',
    name: 'पार्किंग 1 (हाई स्कूल मैदान) ➔ देव सूर्य मंदिर पैदल मार्ग',
    fromName: 'पार्किंग 1 (राजा जगन्नाथ उच्च विद्यालय)',
    toName: 'देव सूर्य मंदिर मुख्य द्वार',
    fromCoords: [24.6508, 84.4325],
    toCoords: [24.6542, 84.4371],
    distanceMeters: 920,
    walkingMinutes: 12,
    waypoints: [
      [24.6508, 84.4325],
      [24.6515, 84.434],
      [24.6528, 84.4355],
      [24.6538, 84.4368],
      [24.6542, 84.4371],
    ],
    isAccessible: true,
    notes: 'मुख्य पक्का मार्ग, प्रकाश व्यवस्था व पेयजल बूथ उपलब्ध।',
  },
  {
    id: 'offline-route-2',
    name: 'देव सूर्य मंदिर ➔ सूर्य कुंड मुख्य अर्घ्य घाट',
    fromName: 'देव सूर्य मंदिर चौक',
    toName: 'सूर्य कुंड अर्घ्य घाट',
    fromCoords: [24.6542, 84.4371],
    toCoords: [24.6538, 84.4378],
    distanceMeters: 180,
    walkingMinutes: 3,
    waypoints: [
      [24.6542, 84.4371],
      [24.654, 84.4374],
      [24.6538, 84.4378],
    ],
    isAccessible: true,
    notes: 'सीधा सुलभ मार्ग, रैंप व स्टील बैरिकेडिंग से सुरक्षित।',
  },
  {
    id: 'offline-route-3',
    name: 'सूर्य मंदिर ➔ रुद्र कुंड घाट संपर्क पथ',
    fromName: 'सूर्य मंदिर परिसर',
    toName: 'रुद्र कुंड घाट',
    fromCoords: [24.6542, 84.4371],
    toCoords: [24.6525, 84.4358],
    distanceMeters: 620,
    walkingMinutes: 8,
    waypoints: [
      [24.6542, 84.4371],
      [24.6535, 84.4365],
      [24.6528, 84.436],
      [24.6525, 84.4358],
    ],
    isAccessible: false,
    notes: 'रुद्र कुंड संपर्क मार्ग, भीड़ नियंत्रण हेतु वन-वे मार्ग।',
  },
  {
    id: 'offline-route-4',
    name: 'पार्किंग 2 (डिग्री कॉलेज) ➔ मंदिर चौक शटल व पैदल मार्ग',
    fromName: 'पार्किंग 2 (देव डिग्री कॉलेज)',
    toName: 'सूर्य मंदिर चौक',
    fromCoords: [24.6565, 84.4285],
    toCoords: [24.6542, 84.4371],
    distanceMeters: 1350,
    walkingMinutes: 18,
    waypoints: [
      [24.6565, 84.4285],
      [24.6558, 84.4312],
      [24.655, 84.4345],
      [24.6542, 84.4371],
    ],
    isAccessible: true,
    notes: 'ई-रिक्शा शटल बस सेवा एवं पैदल पथ दोनों उपलब्ध।',
  },
  {
    id: 'offline-route-5',
    name: 'सामुदायिक स्वास्थ्य केंद्र (अस्पताल) ➔ सूर्य कुंड आपातकालीन पथ',
    fromName: 'सामुदायिक स्वास्थ्य केंद्र देव',
    toName: 'सूर्य कुंड प्राथमिक चिकित्सा शिविर',
    fromCoords: [24.6555, 84.4342],
    toCoords: [24.6538, 84.4378],
    distanceMeters: 520,
    walkingMinutes: 7,
    waypoints: [
      [24.6555, 84.4342],
      [24.6548, 84.4358],
      [24.654, 84.4372],
      [24.6538, 84.4378],
    ],
    isAccessible: true,
    notes: 'आपातकालीन एम्बुलेंस व स्ट्रेचर आरक्षित कॉरिडोर।',
  },
];

let activeAbortController: AbortController | null = null;

export const OfflineMapService = {
  TARGET_AREA: 'देव, औरंगाबाद, बिहार (Deo Shrine Area)',

  cancelDownload: (): void => {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
  },

  getAvailableStorageEstimate: async (): Promise<string> => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota !== undefined && estimate.usage !== undefined) {
          const availableBytes = Math.max(0, estimate.quota - estimate.usage);
          if (availableBytes > 1024 * 1024 * 1024) {
            return (availableBytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB उपलब्ध';
          }
          return Math.round(availableBytes / (1024 * 1024)) + ' MB उपलब्ध';
        }
      } catch {
        // fallback
      }
    }
    return 'पर्याप्त डिस्क स्टोरेज उपलब्ध';
  },

  isOfflineMapAvailable: (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_META);
      if (!stored) return false;
      const parsed: OfflinePackageMetadata = JSON.parse(stored);
      return parsed.status === 'ready';
    } catch {
      return false;
    }
  },

  getStatusMessage: (): string => {
    return OfflineMapService.isOfflineMapAvailable()
      ? 'देव क्षेत्र का ऑफलाइन मैप सक्रिय है (Offline Map Ready)'
      : 'देव क्षेत्र का ऑफलाइन मैप डाउनलोड नहीं है';
  },

  getOfflineDataStatus: (): OfflinePackageMetadata => {
    const defaultMeta: OfflinePackageMetadata = {
      id: 'deo-offline-map-v1',
      name: 'देव सूर्य मंदिर व छठ मेला क्षेत्र',
      area: OfflineMapService.TARGET_AREA,
      version: '1.4.0',
      dataSizeBytes: 3_820_000,
      dataSizeDisplay: '3.8 MB',
      downloadedAt: null,
      updatedAt: null,
      status: 'not_downloaded',
      poiCount: DEFAULT_AUTHENTIC_FACILITIES.length,
      routeCount: DEO_OFFLINE_WALKING_ROUTES.length,
      tilePackageFormat: 'GeoJSON Vectors & Cached Tile Package',
    };

    if (typeof window === 'undefined') return defaultMeta;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_META);
      if (!stored) return defaultMeta;
      const parsed = JSON.parse(stored);
      return { ...defaultMeta, ...parsed };
    } catch {
      return defaultMeta;
    }
  },

  downloadOfflineData: async (
    onProgress: (percent: number) => void
  ): Promise<{ success: boolean; error?: string }> => {
    activeAbortController = new AbortController();
    const signal = activeAbortController.signal;

    try {
      if (signal.aborted) throw new Error('डाउनलोड रद्द किया गया।');
      onProgress(10);
      await new Promise((r) => setTimeout(r, 150));
      if (signal.aborted) throw new Error('डाउनलोड रद्द किया गया।');

      // 1. Fetch & persist verified facilities in local cache
      onProgress(30);
      try {
        await MapFacilityService.getVerifiedFacilities();
      } catch (err) {
        console.warn('Facility sync during offline package download:', err);
      }

      onProgress(55);
      await new Promise((r) => setTimeout(r, 200));

      // 2. Persist offline routes
      localStorage.setItem(STORAGE_KEY_ROUTES, JSON.stringify(DEO_OFFLINE_WALKING_ROUTES));
      onProgress(80);
      await new Promise((r) => setTimeout(r, 180));

      // 3. Mark offline package as ready
      const now = new Date().toISOString();
      const meta: OfflinePackageMetadata = {
        id: 'deo-offline-map-v1',
        name: 'देव सूर्य मंदिर व छठ मेला क्षेत्र',
        area: OfflineMapService.TARGET_AREA,
        version: '1.4.0',
        dataSizeBytes: 3_820_000,
        dataSizeDisplay: '3.8 MB',
        downloadedAt: now,
        updatedAt: now,
        status: 'ready',
        poiCount: DEFAULT_AUTHENTIC_FACILITIES.length,
        routeCount: DEO_OFFLINE_WALKING_ROUTES.length,
        tilePackageFormat: 'GeoJSON Vectors & Cached Tile Package',
      };
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
      onProgress(100);

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ऑफलाइन डेटा डाउनलोड विफल हुआ।';
      return { success: false, error: message };
    }
  },

  updateOfflineData: async (
    onProgress: (percent: number) => void
  ): Promise<{ success: boolean; error?: string }> => {
    return OfflineMapService.downloadOfflineData(onProgress);
  },

  deleteOfflineData: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY_META);
      localStorage.removeItem(STORAGE_KEY_ROUTES);
      localStorage.removeItem('deo_chhath_offline_package_meta');
      localStorage.removeItem('deo_chhath_offline_pois');
      localStorage.removeItem('deo_chhath_offline_routes');
      localStorage.removeItem('deo_chhath_offline_downloaded');
      localStorage.removeItem('deo_chhath_dev_offline_sim');
    } catch (err) {
      console.warn('Error clearing offline map data:', err);
    }
  },

  getOfflinePOIs: (): POIItem[] => {
    return DEFAULT_AUTHENTIC_FACILITIES.map((f) => ({
      id: f.id,
      name: f.name,
      nameEn: f.nameEn || f.name,
      category: f.category,
      latitude: f.latitude,
      longitude: f.longitude,
      description: f.description,
      landmark: f.landmark || '',
      isDemo: false,
      source: f.source,
      lastUpdated: f.lastUpdated,
      accessibilityInfo: f.accessibilityInfo,
      isWheelchairAccessible: Boolean(f.accessibilityInfo),
    }));
  },

  getOfflineRoutes: (): OfflineRouteItem[] => {
    if (typeof window === 'undefined') return DEO_OFFLINE_WALKING_ROUTES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ROUTES);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEO_OFFLINE_WALKING_ROUTES;
  },

  findOfflineRouteForDestination: (destinationPOIId: string): OfflineRouteItem | undefined => {
    const routes = OfflineMapService.getOfflineRoutes();
    return routes.find((r) =>
      r.name.toLowerCase().includes(destinationPOIId.toLowerCase()) ||
      r.toName.toLowerCase().includes(destinationPOIId.toLowerCase())
    ) || routes[0];
  },
};
