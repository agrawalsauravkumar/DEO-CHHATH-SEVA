import { ParkingLocation, ParkingStatus, SavedParking } from '../types';
import { LocationService } from './LocationService';

export const DEO_PARKING_LOCATIONS: ParkingLocation[] = [
  {
    id: 'parking-1-highschool',
    name: 'पार्किंग 1 - राजा जगन्नाथ उच्च विद्यालय मैदान',
    nameEn: 'Parking 1 - Raja Jagannath High School',
    latitude: 24.6508,
    longitude: 84.4325,
    description: 'चार पहिया एवं दो पहिया वाहनों का विशाल अधिकृत मैदान। सूर्य मंदिर से मात्र 800 मीटर।',
    capacity: '~800 वाहन',
    status: 'LIMITED',
    isDemo: true,
    updatedAt: '10 मिनट पहले',
    isActive: true,
    landmark: 'हाई स्कूल रोड, देव',
    vehicleTypes: ['twoWheeler', 'fourWheeler'],
  },
  {
    id: 'parking-2-college',
    name: 'पार्किंग 2 - देव डिग्री कॉलेज मैदान',
    nameEn: 'Parking 2 - Deo Degree College Grounds',
    latitude: 24.6568,
    longitude: 84.4285,
    description: 'बसों एवं भारी वाहनों का प्राथमिक पड़ाव। यहाँ से सूर्य कुंड हेतु निःशुल्क ई-रिक्शा शटल उपलब्ध है।',
    capacity: '~1200 वाहन',
    status: 'AVAILABLE',
    isDemo: true,
    updatedAt: '15 मिनट पहले',
    isActive: true,
    landmark: 'अंबा-देव बाईपास मार्ग, देव',
    vehicleTypes: ['twoWheeler', 'fourWheeler', 'bus'],
  },
  {
    id: 'parking-3-amba-mor',
    name: 'पार्किंग 3 - अंबा मोड़ स्वागत द्वार पड़ाव',
    nameEn: 'Parking 3 - Amba Mor Entry Gate',
    latitude: 24.6618,
    longitude: 84.4242,
    description: 'औरंगाबाद-देव मुख्य राजमार्ग प्रवेश द्वार पर विशालतम वाहन पड़ाव। निरंतर शटल कनेक्टिविटी।',
    capacity: '~2000 वाहन',
    status: 'AVAILABLE',
    isDemo: true,
    updatedAt: '5 मिनट पहले',
    isActive: true,
    landmark: 'अंबा चेक पोस्ट तिराहा',
    vehicleTypes: ['fourWheeler', 'bus'],
  },
  {
    id: 'parking-4-west-ring',
    name: 'पार्किंग 4 - पश्चिमी रिंग रोड पड़ाव',
    nameEn: 'Parking 4 - West Ring Road Parking',
    latitude: 24.6515,
    longitude: 84.4395,
    description: 'रुद्र कुंड घाट के निकट दो पहिया व छोटे वाहनों हेतु सुरक्षित पार्किंग परिसर।',
    capacity: '~400 वाहन',
    status: 'FULL',
    isDemo: true,
    updatedAt: '8 मिनट पहले',
    isActive: true,
    landmark: 'रुद्र कुंड पश्चिमी मार्ग',
    vehicleTypes: ['twoWheeler'],
  },
  {
    id: 'parking-5-kasturba',
    name: 'पार्किंग 5 - कस्तूरबा विद्यालय खुला परिसर',
    nameEn: 'Parking 5 - Kasturba Vidyalaya Ground',
    latitude: 24.6582,
    longitude: 84.4365,
    description: 'अस्पताल व प्रशासनिक नियंत्रण कक्ष के निकट वीआईपी व आकस्मिक सेवा वाहन पार्किंग।',
    capacity: '~350 वाहन',
    status: 'LIMITED',
    isDemo: true,
    updatedAt: '20 मिनट पहले',
    isActive: true,
    landmark: 'सीएचसी अस्पताल के पीछे',
    vehicleTypes: ['twoWheeler', 'fourWheeler'],
  },
];

const STORAGE_SAVED_PARKING_KEY = 'deo_chhath_user_saved_parking';

export const ParkingService = {
  getAllParkings: (): ParkingLocation[] => {
    return DEO_PARKING_LOCATIONS;
  },

  getParkingById: (id: string): ParkingLocation | undefined => {
    return DEO_PARKING_LOCATIONS.find((p) => p.id === id);
  },

  searchParkings: (query: string): ParkingLocation[] => {
    if (!query.trim()) return DEO_PARKING_LOCATIONS;
    const q = query.trim().toLowerCase();

    return DEO_PARKING_LOCATIONS.filter(
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
    const list = DEO_PARKING_LOCATIONS.map((p) => {
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
