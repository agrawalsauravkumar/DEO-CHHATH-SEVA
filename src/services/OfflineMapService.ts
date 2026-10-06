import { POIItem, DEMO_POIS } from './POIService';

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

// Essential Offline Routes in Deo (Between main parkings and Surya Mandir / Ghats)
export const ESSENTIAL_OFFLINE_ROUTES: OfflineRouteItem[] = [
  {
    id: 'route-p1-to-mandir',
    name: 'P1 पड़ाव (हाई स्कूल) से सूर्य मंदिर मुख्य द्वार',
    fromName: 'पार्किंग 1 - राजा जगन्नाथ स्कूल मैदान',
    toName: 'देव सूर्य मंदिर (मुख्य गर्भगृह)',
    fromCoords: [24.6508, 84.4325],
    toCoords: [24.6542, 84.4371],
    distanceMeters: 950,
    walkingMinutes: 12,
    waypoints: [
      [24.6508, 84.4325],
      [24.6520, 84.4345],
      [24.6535, 84.4362],
      [24.6542, 84.4371],
    ],
    isAccessible: true,
    notes: 'मुख्य प्रशासनिक मार्ग, समतल एवं प्रकाशयुक्त।',
  },
  {
    id: 'route-mandir-to-kund',
    name: 'सूर्य मंदिर से सूर्य कुंड मुख्य अर्घ्य घाट',
    fromName: 'देव सूर्य मंदिर',
    toName: 'सूर्य कुंड अर्घ्य घाट',
    fromCoords: [24.6542, 84.4371],
    toCoords: [24.6538, 84.4378],
    distanceMeters: 180,
    walkingMinutes: 3,
    waypoints: [
      [24.6542, 84.4371],
      [24.6540, 84.4375],
      [24.6538, 84.4378],
    ],
    isAccessible: true,
    notes: 'पैदल परिक्रमा पथ, बैरिकेडिंग युक्त सुरक्षित मार्ग।',
  },
  {
    id: 'route-p2-to-kund',
    name: 'P2 कॉलेज पार्किंग से सूर्य कुंड घाट 3',
    fromName: 'पार्किंग 2 - देव डिग्री कॉलेज',
    toName: 'सूर्य कुंड घाट (उत्तरी द्वार)',
    fromCoords: [24.6568, 84.4285],
    toCoords: [24.6545, 84.4375],
    distanceMeters: 1400,
    walkingMinutes: 18,
    waypoints: [
      [24.6568, 84.4285],
      [24.6558, 84.4320],
      [24.6550, 84.4355],
      [24.6545, 84.4375],
    ],
    isAccessible: true,
    notes: 'शटल ई-रिक्शा सेवा इस मार्ग पर अनवरत संचालित है।',
  },
];

const STORAGE_KEY_OFFLINE_PKG = 'deo_chhath_offline_package_meta';
const STORAGE_KEY_OFFLINE_POIS = 'deo_chhath_offline_pois';
const STORAGE_KEY_OFFLINE_ROUTES = 'deo_chhath_offline_routes';
const STORAGE_KEY_DEV_OFFLINE_SIM = 'deo_chhath_dev_offline_sim';

export const OfflineMapService = {
  // Current available package metadata definition
  CURRENT_PACKAGE_VERSION: '1.0',
  LATEST_SERVER_VERSION: '1.0', // Can be bumped for testing updates
  ESTIMATED_SIZE_BYTES: 25375539, // ~24.2 MB
  ESTIMATED_SIZE_DISPLAY: '24.2 MB',
  TARGET_AREA: 'देव, औरंगाबाद, बिहार',

  // 1. Get current offline data status
  getOfflineDataStatus: (): OfflinePackageMetadata => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OFFLINE_PKG);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }

    return {
      id: 'deo-mela-offline-pack',
      name: 'देव तीर्थ क्षेत्र ऑफलाइन डेटा पैकेज',
      area: OfflineMapService.TARGET_AREA,
      version: OfflineMapService.CURRENT_PACKAGE_VERSION,
      dataSizeBytes: OfflineMapService.ESTIMATED_SIZE_BYTES,
      dataSizeDisplay: OfflineMapService.ESTIMATED_SIZE_DISPLAY,
      downloadedAt: null,
      updatedAt: null,
      status: 'not_downloaded',
      poiCount: DEMO_POIS.length,
      routeCount: ESSENTIAL_OFFLINE_ROUTES.length,
      tilePackageFormat: 'IndexedDB/Vector-PMTiles',
    };
  },

  // 2. Check if offline data is downloaded and ready
  isOfflineDataAvailable: (): boolean => {
    const status = OfflineMapService.getOfflineDataStatus();
    return status.status === 'ready' || status.status === 'update_available';
  },

  // 3. Download offline data with progress callback
  downloadOfflineData: async (
    onProgress: (percent: number) => void
  ): Promise<{ success: boolean; error?: string }> => {
    // Check storage availability
    if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const available = (estimate.quota || 0) - (estimate.usage || 0);
        if (available > 0 && available < OfflineMapService.ESTIMATED_SIZE_BYTES) {
          return { success: false, error: 'फोन में पर्याप्त जगह उपलब्ध नहीं है।' };
        }
      } catch {
        // Continue if estimate is restricted
      }
    }

    // Step-by-step download progression: 0%, 25%, 50%, 75%, 100%
    const steps = [0, 25, 50, 75, 100];
    for (const step of steps) {
      onProgress(step);
      await new Promise((r) => setTimeout(r, 350));
    }

    try {
      // Store essential POIs locally
      localStorage.setItem(STORAGE_KEY_OFFLINE_POIS, JSON.stringify(DEMO_POIS));

      // Store essential Routes locally
      localStorage.setItem(STORAGE_KEY_OFFLINE_ROUTES, JSON.stringify(ESSENTIAL_OFFLINE_ROUTES));

      // Mark offline downloaded flag
      localStorage.setItem('deo_chhath_offline_downloaded', 'true');

      // Update package metadata
      const now = new Date().toLocaleString('hi-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const updatedMeta: OfflinePackageMetadata = {
        id: 'deo-mela-offline-pack',
        name: 'देव तीर्थ क्षेत्र ऑफलाइन डेटा पैकेज',
        area: OfflineMapService.TARGET_AREA,
        version: OfflineMapService.CURRENT_PACKAGE_VERSION,
        dataSizeBytes: OfflineMapService.ESTIMATED_SIZE_BYTES,
        dataSizeDisplay: OfflineMapService.ESTIMATED_SIZE_DISPLAY,
        downloadedAt: now,
        updatedAt: now,
        status: 'ready',
        poiCount: DEMO_POIS.length,
        routeCount: ESSENTIAL_OFFLINE_ROUTES.length,
        tilePackageFormat: 'IndexedDB/Vector-PMTiles',
      };

      localStorage.setItem(STORAGE_KEY_OFFLINE_PKG, JSON.stringify(updatedMeta));

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'डाउनलोड पूरा नहीं हो पाया। कृपया पुनः प्रयास करें।',
      };
    }
  },

  // 4. Update offline data
  updateOfflineData: async (
    onProgress: (percent: number) => void
  ): Promise<{ success: boolean; error?: string }> => {
    return OfflineMapService.downloadOfflineData(onProgress);
  },

  // 5. Delete offline data
  deleteOfflineData: (): void => {
    localStorage.removeItem(STORAGE_KEY_OFFLINE_PKG);
    localStorage.removeItem(STORAGE_KEY_OFFLINE_POIS);
    localStorage.removeItem(STORAGE_KEY_OFFLINE_ROUTES);
    localStorage.removeItem('deo_chhath_offline_downloaded');
  },

  // 6. Get locally stored POIs
  getOfflinePOIs: (): POIItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OFFLINE_POIS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return DEMO_POIS;
  },

  // 7. Get locally stored routes
  getOfflineRoutes: (): OfflineRouteItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OFFLINE_ROUTES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return ESSENTIAL_OFFLINE_ROUTES;
  },

  // 8. Find offline route between coordinates or destination
  findOfflineRouteForDestination: (
    destinationPOIId: string
  ): OfflineRouteItem | undefined => {
    const routes = OfflineMapService.getOfflineRoutes();
    return routes.find(
      (r) =>
        r.id.includes(destinationPOIId) ||
        r.toName.toLowerCase().includes(destinationPOIId.toLowerCase()) ||
        destinationPOIId.includes('mandir') ||
        destinationPOIId.includes('kund')
    );
  },

  // 9. Developer offline simulation toggle
  isSimulatedOffline: (): boolean => {
    return localStorage.getItem(STORAGE_KEY_DEV_OFFLINE_SIM) === 'true';
  },

  setSimulatedOffline: (simulated: boolean): void => {
    if (simulated) {
      localStorage.setItem(STORAGE_KEY_DEV_OFFLINE_SIM, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY_DEV_OFFLINE_SIM);
    }
  },
};
