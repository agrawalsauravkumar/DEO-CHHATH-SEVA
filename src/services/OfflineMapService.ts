import { POIItem } from './POIService';

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

const legacyKeys = [
  'deo_chhath_offline_package_meta',
  'deo_chhath_offline_pois',
  'deo_chhath_offline_routes',
  'deo_chhath_offline_downloaded',
  'deo_chhath_dev_offline_sim',
];

export const OfflineMapService = {
  TARGET_AREA: 'देव, औरंगाबाद, बिहार',
  isOfflineMapAvailable: (): boolean => false,
  getStatusMessage: (): string => 'ऑफलाइन मानचित्र डेटा उपलब्ध नहीं है',

  getOfflineDataStatus: (): OfflinePackageMetadata => ({
    id: 'deo-offline-map-unavailable',
    name: 'देव क्षेत्र का ऑफलाइन मैप',
    area: OfflineMapService.TARGET_AREA,
    version: 'अभी उपलब्ध नहीं',
    dataSizeBytes: 0,
    dataSizeDisplay: 'उपलब्ध नहीं',
    downloadedAt: null,
    updatedAt: null,
    status: 'not_downloaded',
    poiCount: 0,
    routeCount: 0,
    tilePackageFormat: 'कॉन्फ़िगर नहीं',
  }),

  isOfflineDataAvailable: (): boolean => false,

  downloadOfflineData: async (
    _onProgress: (percent: number) => void
  ): Promise<{ success: boolean; error?: string }> => ({
    success: false,
    error: 'वास्तविक ऑफलाइन मैप टाइल पैकेज कॉन्फ़िगर नहीं है। GPS के लिए इंटरनेट आवश्यक नहीं है।',
  }),

  updateOfflineData: async (
    _onProgress: (percent: number) => void
  ): Promise<{ success: boolean; error?: string }> => ({
    success: false,
    error: 'वास्तविक ऑफलाइन मैप टाइल पैकेज कॉन्फ़िगर नहीं है।',
  }),

  deleteOfflineData: (): void => {
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  },

  getOfflinePOIs: (): POIItem[] => [],
  getOfflineRoutes: (): OfflineRouteItem[] => [],
  findOfflineRouteForDestination: (_destinationPOIId: string): OfflineRouteItem | undefined => undefined,
};
