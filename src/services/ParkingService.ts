import { ParkingLocation, ParkingStatus, SavedParking } from '../types';
import { LocationService } from './LocationService';
import { apiRequest } from './apiClient';

const STORAGE_SAVED_PARKING_KEY = 'deo_chhath_user_saved_parking';

const DEFAULT_VERIFIED_PARKINGS: ParkingLocation[] = [
  {
    id: 'p1',
    name: 'पार्किंग 1 - राजा जगन्नाथ हाई स्कूल मैदान',
    nameEn: 'Parking 1 - Raja Jagannath High School Ground',
    latitude: 24.6508,
    longitude: 84.4325,
    landmark: 'हाई स्कूल रोड, देव (सूर्य मंदिर से 900 मी)',
    description: 'चार पहिया एवं दोपहिया वाहनों हेतु विशाल अधिकृत पार्किंग स्थल।',
    capacity: 'अनुमानित 800 वाहन',
    status: 'AVAILABLE',
    isDemo: false,
    updatedAt: 'आधिकारिक मेला व्यवस्था',
    isActive: true,
    vehicleTypes: ['fourWheeler', 'twoWheeler'],
  },
  {
    id: 'p2',
    name: 'पार्किंग 2 - देव डिग्री कॉलेज परिसर मैदान',
    nameEn: 'Parking 2 - Deo Degree College Ground',
    latitude: 24.6465,
    longitude: 84.4280,
    landmark: 'अंबा-देव बाईपास मार्ग (कॉलेज मुख्य गेट)',
    description: 'बड़ी बसें, मिनी बस व चार पहिया वाहनों हेतु। निःशुल्क ई-रिक्शा शटल उपलब्ध।',
    capacity: 'बड़ी बसें व 1200 गाड़ियाँ',
    status: 'AVAILABLE',
    isDemo: false,
    updatedAt: 'आधिकारिक मेला व्यवस्था',
    isActive: true,
    vehicleTypes: ['bus', 'fourWheeler'],
  },
  {
    id: 'p3',
    name: 'पार्किंग 3 - अंबा मोड़ स्वागत गेट पार्किंग',
    nameEn: 'Parking 3 - Amba Mod Welcome Gate Parking',
    latitude: 24.6410,
    longitude: 84.4215,
    landmark: 'औरंगाबाद-देव मुख्य प्रवेश द्वार चेक पोस्ट',
    description: 'बाहरी जिलों से आने वाले भारी वाहनों व बसों हेतु मुख्य पड़ाव।',
    capacity: '1500 चार पहिया वाहन',
    status: 'AVAILABLE',
    isDemo: false,
    updatedAt: 'आधिकारिक मेला व्यवस्था',
    isActive: true,
    vehicleTypes: ['bus', 'fourWheeler', 'twoWheeler'],
  },
  {
    id: 'p4',
    name: 'पार्किंग 4 - कंचन बाग मैदान (दोपहिया विशेष)',
    nameEn: 'Parking 4 - Kanchan Bagh Two-Wheeler Parking',
    latitude: 24.6545,
    longitude: 84.4380,
    landmark: 'रुद्र कुंड मार्ग के समीप, देव',
    description: 'केवल मोटरसाइकिल, स्कूटर व साइकिल हेतु समर्पित सुरक्षित स्टैंड।',
    capacity: '3000 दोपहिया वाहन',
    status: 'AVAILABLE',
    isDemo: false,
    updatedAt: 'आधिकारिक मेला व्यवस्था',
    isActive: true,
    vehicleTypes: ['twoWheeler'],
  },
  {
    id: 'p5',
    name: 'पार्किंग 5 - देव प्रखंड कार्यालय परिसर स्टैंड',
    nameEn: 'Parking 5 - Block Office Campus Parking',
    latitude: 24.6515,
    longitude: 84.4360,
    landmark: 'प्रशासनिक कैंप व ब्लॉक कार्यालय, देव',
    description: 'प्रशासनिक व आधिकारिक सेवा वाहनों हेतु अधिकृत पार्किंग स्थल।',
    capacity: '200 चार पहिया वाहन',
    status: 'AVAILABLE',
    isDemo: false,
    updatedAt: 'आधिकारिक मेला व्यवस्था',
    isActive: true,
    vehicleTypes: ['fourWheeler'],
  },
];

let currentParkings: ParkingLocation[] = [...DEFAULT_VERIFIED_PARKINGS];

interface ApiParking {
  id: string;
  name: string;
  totalCapacity?: number;
  availableCapacity?: number;
  capacityDisplay?: string;
  vehicleTypes: string[];
  status: ParkingStatus;
  latitude: number;
  longitude: number;
  address?: string;
  updatedAt?: string;
}

export const ParkingService = {
  getAllParkings: (): ParkingLocation[] => {
    return [...currentParkings];
  },

  getParkingById: (id: string): ParkingLocation | undefined => {
    return currentParkings.find((p) => p.id === id);
  },

  async syncParkings(): Promise<ParkingLocation[]> {
    const response = await apiRequest<{ parkings: ApiParking[] }>('/api/parking');
    if (!Array.isArray(response.parkings)) {
      throw new Error('पार्किंग डेटा का प्रारूप मान्य नहीं है।');
    }
    currentParkings = response.parkings.map((parking) => ({
      id: parking.id,
      name: parking.name,
      nameEn: '',
      latitude: Number(parking.latitude),
      longitude: Number(parking.longitude),
      description: parking.address || '',
      capacity: parking.capacityDisplay ||
        (parking.availableCapacity !== undefined && parking.totalCapacity !== undefined
          ? `${parking.availableCapacity} / ${parking.totalCapacity} स्थान रिक्त`
          : undefined),
      status: parking.status,
      isDemo: false,
      updatedAt: parking.updatedAt
        ? new Date(parking.updatedAt).toLocaleString('hi-IN')
        : 'स्थिति समय उपलब्ध नहीं',
      isActive: true,
      landmark: parking.address || 'पता उपलब्ध नहीं',
      vehicleTypes: parking.vehicleTypes.filter(
        (vehicle): vehicle is 'twoWheeler' | 'fourWheeler' | 'bus' =>
          vehicle === 'twoWheeler' || vehicle === 'fourWheeler' || vehicle === 'bus'
      ),
    }));
    return this.getAllParkings();
  },

  searchParkings: (query: string): ParkingLocation[] => {
    if (!query.trim()) return currentParkings;
    const q = query.trim().toLowerCase();

    return currentParkings.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.landmark.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  },

  // Calculate distance from live GPS and sort ascending
  getNearestParkings: (
    userLat: number,
    userLng: number
  ): (ParkingLocation & { distanceMeters: number; distanceDisplay: string })[] => {
    const list = currentParkings.map((p) => {
      const distKm = LocationService.calculateDistanceKm(
        { latitude: userLat, longitude: userLng },
        { latitude: p.latitude, longitude: p.longitude }
      );
      const meters = Math.round(distKm * 1000);
      const display =
        meters < 1000 ? `${meters} मीटर` : `${(meters / 1000).toFixed(1)} किमी`;

      return {
        ...p,
        distanceMeters: meters,
        distanceDisplay: display,
      };
    });

    return list.sort((a, b) => a.distanceMeters - b.distanceMeters);
  },

  // Saved parking local persistence
  getSavedParking: (): SavedParking | null => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_PARKING_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveParking: (data: SavedParking): void => {
    try {
      localStorage.setItem(STORAGE_SAVED_PARKING_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  },

  removeSavedParking: (): void => {
    try {
      localStorage.removeItem(STORAGE_SAVED_PARKING_KEY);
    } catch {
      // Ignore
    }
  },

  updateSavedParkingNote: (note: string): void => {
    const current = ParkingService.getSavedParking();
    if (current) {
      current.note = note;
      ParkingService.saveParking(current);
    }
  },

  // Safe status label helper (clearly distinguishing verified from DEMO)
  getStatusLabel: (
    status: ParkingStatus,
    isDemo: boolean
  ): { label: string; bgClass: string; textClass: string; isDemo: boolean } => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: isDemo ? 'स्थान उपलब्ध (DEMO)' : 'स्थान उपलब्ध',
          bgClass: 'bg-emerald-100',
          textClass: 'text-emerald-800',
          isDemo,
        };
      case 'LIMITED':
        return {
          label: isDemo ? 'स्थान सीमित (DEMO)' : 'स्थान सीमित',
          bgClass: 'bg-amber-100',
          textClass: 'text-amber-800',
          isDemo,
        };
      case 'FULL':
        return {
          label: isDemo ? 'पार्किंग फुल (DEMO)' : 'पार्किंग फुल',
          bgClass: 'bg-rose-100',
          textClass: 'text-rose-800',
          isDemo,
        };
      case 'CLOSED':
        return {
          label: 'मार्ग बंद',
          bgClass: 'bg-stone-200',
          textClass: 'text-stone-800',
          isDemo: false,
        };
      case 'UNKNOWN':
      default:
        return {
          label: 'स्थिति उपलब्ध नहीं है',
          bgClass: 'bg-stone-100',
          textClass: 'text-stone-600',
          isDemo: false,
        };
    }
  },
};
