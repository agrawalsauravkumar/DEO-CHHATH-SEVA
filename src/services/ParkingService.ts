import { ParkingLocation, ParkingStatus, SavedParking } from '../types';
import { LocationService } from './LocationService';
import { apiRequest } from './apiClient';

const STORAGE_SAVED_PARKING_KEY = 'deo_chhath_user_saved_parking';
let currentParkings: ParkingLocation[] = [];

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
