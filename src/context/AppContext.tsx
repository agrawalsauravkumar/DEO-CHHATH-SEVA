import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  ScreenId,
  LanguageCode,
  LocationItem,
  SavedParkingData,
  SavedParking,
  FamilyMember,
  VolunteerRequest,
  DeviceCoordinates,
  GeolocationStatus,
  RouteResult,
  NavigationState,
  TravelMode,
  AppUserProfile,
  AppUserRole,
} from '../types';
import { DEO_LOCATIONS } from '../data/deoData';
import { OfflineMapService, OfflinePackageMetadata } from '../services/OfflineMapService';
import { AuthService } from '../services/AuthService';

interface AppContextType {
  currentScreen: ScreenId;
  navigate: (screen: ScreenId) => void;
  goBack: () => void;
  canGoBack: boolean;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  seniorMode: boolean;
  toggleSeniorMode: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  savedParking: (SavedParking & Partial<SavedParkingData>) | null;
  saveParking: (data: SavedParking & Partial<SavedParkingData>) => void;
  clearSavedParking: () => void;
  updateSavedParkingNote: (note: string) => void;
  offlineMapDownloaded: boolean;
  offlineDownloadProgress: number;
  isDownloadingOfflineMap: boolean;
  startOfflineDownload: () => void;
  deleteOfflineMap: () => void;
  familyMembers: FamilyMember[];
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  removeFamilyMember: (id: string) => void;
  meetingPoint: string;
  updateMeetingPoint: (point: string) => void;
  activeNavigationTarget: LocationItem | null;
  startNavigation: (item: LocationItem) => void;
  stopNavigation: () => void;
  activeRoute: RouteResult | null;
  setActiveRoute: (route: RouteResult | null) => void;
  travelMode: TravelMode;
  setTravelMode: (mode: TravelMode) => void;
  navigationState: NavigationState;
  setNavigationState: React.Dispatch<React.SetStateAction<NavigationState>>;
  volunteerRequests: VolunteerRequest[];
  submitVolunteerRequest: (req: Omit<VolunteerRequest, 'id' | 'timestamp' | 'status'>) => void;
  registeredVolunteer: { name: string; phone: string; role: string; zone: string } | null;
  registerVolunteer: (data: { name: string; phone: string; role: string }) => void;
  selectedMapItem: LocationItem | null;
  setSelectedMapItem: (item: LocationItem | null) => void;

  // Real GPS & Geolocation
  userLocationGranted: boolean;
  setUserLocationGranted: (granted: boolean) => void;
  deviceLocation: DeviceCoordinates | null;
  locationStatus: GeolocationStatus;
  locationErrorMessage: string | null;
  requestDeviceLocation: () => Promise<boolean>;
  showPrePermissionModal: boolean;
  setShowPrePermissionModal: (show: boolean) => void;
  isDeveloperSimulatedLocation: boolean;
  setDeveloperSimulatedLocation: (simulated: boolean) => void;
  isOnline: boolean;
  offlinePackage: import('../services/OfflineMapService').OfflinePackageMetadata;
  refreshOfflinePackage: () => void;
  isSimulatedOffline: boolean;
  setSimulatedOffline: (sim: boolean) => void;

  // Step 18: User Authentication, Profile & Role System
  currentUser: AppUserProfile | null;
  setCurrentUser: (user: AppUserProfile | null) => void;
  userRole: AppUserRole;
  isAuthenticated: boolean;
  logoutUser: () => void;
  switchUserRole: (role: AppUserRole) => void;
  refreshCurrentUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PARKING = 'deo_chhath_saved_parking';
const STORAGE_KEY_SENIOR = 'deo_chhath_senior_mode';
const STORAGE_KEY_LANG = 'deo_chhath_lang';
const STORAGE_KEY_FONT = 'deo_chhath_font_size';
const STORAGE_KEY_OFFLINE = 'deo_chhath_offline_downloaded';
const STORAGE_KEY_LOC_GRANTED = 'deo_chhath_loc_granted';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<ScreenId[]>(['splash']);
  const currentScreen = history[history.length - 1] || 'home';

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem(STORAGE_KEY_LANG) as LanguageCode) || 'hi';
  });

  const [seniorMode, setSeniorModeState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_SENIOR) === 'true';
  });

  const [fontSize, setFontSizeState] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem(STORAGE_KEY_FONT) as 'normal' | 'large' | 'xlarge') || 'normal';
  });

  // Real Device Geolocation State
  const [userLocationGranted, setUserLocationGrantedState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_LOC_GRANTED) === 'true';
  });

  const [deviceLocation, setDeviceLocation] = useState<DeviceCoordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<GeolocationStatus>('idle');
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);
  const [showPrePermissionModal, setShowPrePermissionModal] = useState<boolean>(false);
  const [isDeveloperSimulatedLocation, setIsDeveloperSimulatedLocation] = useState<boolean>(false);
  const [networkOnline, setNetworkOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    return OfflineMapService.isSimulatedOffline();
  });

  const isOnline = networkOnline && !isSimulatedOffline;

  const setSimulatedOffline = (sim: boolean) => {
    OfflineMapService.setSimulatedOffline(sim);
    setIsSimulatedOffline(sim);
  };

  const [offlinePackage, setOfflinePackage] = useState<OfflinePackageMetadata>(() => {
    return OfflineMapService.getOfflineDataStatus();
  });

  const refreshOfflinePackage = () => {
    setOfflinePackage(OfflineMapService.getOfflineDataStatus());
  };

  // Step 18: Authentication & Profile State
  const [currentUser, setCurrentUserState] = useState<AppUserProfile | null>(() => {
    return AuthService.getCurrentUser();
  });

  const refreshCurrentUser = () => {
    setCurrentUserState(AuthService.getCurrentUser());
  };

  const setCurrentUser = (user: AppUserProfile | null) => {
    setCurrentUserState(user);
  };

  const userRole: AppUserRole = currentUser?.role || 'USER';
  const isAuthenticated = !!currentUser && currentUser.status === 'ACTIVE';

  const logoutUser = () => {
    AuthService.logout();
    setCurrentUserState(null);
  };

  const switchUserRole = (newRole: AppUserRole) => {
    if (currentUser) {
      const updated = AuthService.switchRole(newRole);
      if (updated) setCurrentUserState(updated);
    }
  };

  const watchIdRef = useRef<number | null>(null);

  const setUserLocationGranted = (granted: boolean) => {
    setUserLocationGrantedState(granted);
    localStorage.setItem(STORAGE_KEY_LOC_GRANTED, String(granted));
  };

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => setNetworkOnline(true);
    const handleOffline = () => setNetworkOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Request Real Device GPS Location using navigator.geolocation
  const requestDeviceLocation = async (): Promise<boolean> => {
    if (isDeveloperSimulatedLocation) {
      // Separated developer/test mode only
      const simulated: DeviceCoordinates = {
        latitude: 24.6508, // Parking 1 (Raja Jagannath High School ground, Deo)
        longitude: 84.4325,
        accuracy: 12,
        timestamp: Date.now(),
        isSimulated: true,
      };
      setDeviceLocation(simulated);
      setLocationStatus('success');
      setLocationErrorMessage(null);
      setUserLocationGranted(true);
      return true;
    }

    if (!('geolocation' in navigator)) {
      setLocationStatus('unavailable');
      setLocationErrorMessage('आपके ब्राउज़र/डिवाइस में जीपीएस उपलब्ध नहीं है।');
      return false;
    }

    setLocationStatus('loading');
    setLocationErrorMessage(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: DeviceCoordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            timestamp: pos.timestamp || Date.now(),
            isSimulated: false,
          };

          setDeviceLocation(coords);
          setUserLocationGranted(true);

          if (coords.accuracy > 400) {
            setLocationStatus('low-accuracy');
            setLocationErrorMessage('Location की सटीकता कम है।');
          } else {
            setLocationStatus('success');
            setLocationErrorMessage(null);
          }

          // Start watching position for real-time movement updates
          startWatchPosition();
          resolve(true);
        },
        (error) => {
          let errStatus: GeolocationStatus = 'unavailable';
          let message = 'आपका स्थान अभी उपलब्ध नहीं है।';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errStatus = 'permission-denied';
              message = 'Location की अनुमति नहीं मिली। सेटिंग्स में जाकर Location की अनुमति दें।';
              setUserLocationGranted(false);
              break;
            case error.POSITION_UNAVAILABLE:
              errStatus = 'unavailable';
              message = 'आपका स्थान अभी उपलब्ध नहीं है।';
              break;
            case error.TIMEOUT:
              errStatus = 'timeout';
              message = 'Location मिलने में समय लग रहा है। कृपया खुले स्थान पर प्रयास करें।';
              break;
            default:
              errStatus = 'unavailable';
              message = 'स्थान प्राप्त करने में त्रुटि हुई।';
          }

          setLocationStatus(errStatus);
          setLocationErrorMessage(message);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 10000,
        }
      );
    });
  };

  const startWatchPosition = () => {
    if (!('geolocation' in navigator) || isDeveloperSimulatedLocation) return;
    try {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setDeviceLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            timestamp: pos.timestamp || Date.now(),
            isSimulated: false,
          });
        },
        () => {
          // ignore transient watch errors
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
        }
      );
    } catch {
      // ignore
    }
  };

  // If permission was already granted previously, automatically attempt to fetch current coordinates
  useEffect(() => {
    if (userLocationGranted && locationStatus === 'idle') {
      requestDeviceLocation();
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [userLocationGranted]);

  const setDeveloperSimulatedLocation = (simulated: boolean) => {
    setIsDeveloperSimulatedLocation(simulated);
    if (simulated) {
      setDeviceLocation({
        latitude: 24.6508,
        longitude: 84.4325,
        accuracy: 12,
        timestamp: Date.now(),
        isSimulated: true,
      });
      setLocationStatus('success');
      setLocationErrorMessage(null);
      setUserLocationGranted(true);
    } else {
      setDeviceLocation(null);
      setLocationStatus('idle');
      requestDeviceLocation();
    }
  };

  const [savedParking, setSavedParking] = useState<(SavedParking & Partial<SavedParkingData>) | null>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PARKING);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  const [offlineMapDownloaded, setOfflineMapDownloaded] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_OFFLINE) === 'true';
  });
  const [offlineDownloadProgress, setOfflineDownloadProgress] = useState<number>(
    offlineMapDownloaded ? 100 : 0
  );
  const [isDownloadingOfflineMap, setIsDownloadingOfflineMap] = useState<boolean>(false);

  const [meetingPoint, setMeetingPoint] = useState<string>(
    'मेला केंद्रीय नियंत्रण कक्ष (थाना मोड़, देव)'
  );

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: 'fam-1',
      name: 'रामेश्वर प्रसाद (पिताजी)',
      relationship: 'पिता',
      phone: '9835123456',
      age: '68 वर्ष',
      lastKnownLocation: 'सूर्य कुंड घाट 2',
      notes: 'वरिष्ठ नागरिक - चश्मा पहनते हैं',
    },
    {
      id: 'fam-2',
      name: 'सुमित्रा देवी (माताजी)',
      relationship: 'माता (छठ व्रती)',
      phone: '9470987654',
      age: '64 वर्ष',
      lastKnownLocation: 'सूर्य मंदिर परिसर',
      notes: 'छठ व्रत उपवास में हैं',
    },
    {
      id: 'fam-3',
      name: 'रोहित कुमार (छोटा भाई)',
      relationship: 'भाई',
      phone: '9122345678',
      age: '22 वर्ष',
      lastKnownLocation: 'पार्किंग 1 (गाड़ी के पास)',
    },
  ]);

  const [volunteerRequests, setVolunteerRequests] = useState<VolunteerRequest[]>([
    {
      id: 'req-demo-1',
      requesterName: 'कमलाकांत पाठक',
      phone: '9934112233',
      serviceNeeded: 'wheelchair',
      location: 'सूर्य कुंड तोरण द्वार (गेट 1)',
      status: 'सहायक रवाना',
      timestamp: '15 मिनट पहले',
    },
  ]);

  const [registeredVolunteer, setRegisteredVolunteer] = useState<{
    name: string;
    phone: string;
    role: string;
    zone: string;
  } | null>(null);

  const [activeNavigationTarget, setActiveNavigationTarget] = useState<LocationItem | null>(null);
  const [selectedMapItem, setSelectedMapItem] = useState<LocationItem | null>(DEO_LOCATIONS[0]);
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('WALKING');
  const [navigationState, setNavigationState] = useState<NavigationState>({
    active: false,
    route: null,
    currentStepIndex: 0,
    remainingDistanceMeters: 0,
    remainingDurationSeconds: 0,
    isOffRoute: false,
    isDestinationReached: false,
    isMuted: false,
    isPaused: false,
  });

  const navigate = (screen: ScreenId) => {
    setHistory((prev) => {
      if (prev[prev.length - 1] === screen) return prev;
      return [...prev, screen];
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length <= 1) return ['home'];
      const next = [...prev];
      next.pop();
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  };

  const toggleSeniorMode = () => {
    setSeniorModeState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_SENIOR, String(next));
      if (next) {
        setFontSizeState('xlarge');
        localStorage.setItem(STORAGE_KEY_FONT, 'xlarge');
      } else {
        setFontSizeState('normal');
        localStorage.setItem(STORAGE_KEY_FONT, 'normal');
      }
      return next;
    });
  };

  const setFontSize = (size: 'normal' | 'large' | 'xlarge') => {
    setFontSizeState(size);
    localStorage.setItem(STORAGE_KEY_FONT, size);
  };

  const saveParking = (data: SavedParking & Partial<SavedParkingData>) => {
    setSavedParking(data);
    localStorage.setItem(STORAGE_KEY_PARKING, JSON.stringify(data));
  };

  const clearSavedParking = () => {
    setSavedParking(null);
    localStorage.removeItem(STORAGE_KEY_PARKING);
  };

  const updateSavedParkingNote = (note: string) => {
    setSavedParking((prev) => {
      if (!prev) return null;
      const updated = { ...prev, note, notes: note };
      localStorage.setItem(STORAGE_KEY_PARKING, JSON.stringify(updated));
      return updated;
    });
  };

  const startOfflineDownload = async () => {
    if (isDownloadingOfflineMap || offlineMapDownloaded) return;
    setIsDownloadingOfflineMap(true);
    setOfflineDownloadProgress(0);

    const result = await OfflineMapService.downloadOfflineData((percent) => {
      setOfflineDownloadProgress(percent);
    });

    setIsDownloadingOfflineMap(false);
    if (result.success) {
      setOfflineMapDownloaded(true);
      localStorage.setItem(STORAGE_KEY_OFFLINE, 'true');
      refreshOfflinePackage();
    } else {
      setOfflineDownloadProgress(0);
      alert(result.error || 'डाउनलोड पूरा नहीं हो पाया।');
    }
  };

  const deleteOfflineMap = () => {
    OfflineMapService.deleteOfflineData();
    setOfflineMapDownloaded(false);
    setOfflineDownloadProgress(0);
    setIsDownloadingOfflineMap(false);
    localStorage.removeItem(STORAGE_KEY_OFFLINE);
    refreshOfflinePackage();
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: 'fam-' + Date.now(),
    };
    setFamilyMembers((prev) => [...prev, newMember]);
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMeetingPoint = (point: string) => {
    setMeetingPoint(point);
  };

  const startNavigation = (item: LocationItem) => {
    setActiveNavigationTarget(item);
  };

  const stopNavigation = () => {
    setActiveNavigationTarget(null);
  };

  const submitVolunteerRequest = (req: Omit<VolunteerRequest, 'id' | 'timestamp' | 'status'>) => {
    const newReq: VolunteerRequest = {
      ...req,
      id: 'req-' + Date.now(),
      status: 'स्वीकृत',
      timestamp: 'अभी-अभी',
    };
    setVolunteerRequests((prev) => [newReq, ...prev]);
  };

  const registerVolunteer = (data: { name: string; phone: string; role: string }) => {
    setRegisteredVolunteer({
      ...data,
      zone: 'सूर्य कुंड घाट क्षेत्र (जोन 2)',
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-senior', seniorMode ? 'true' : 'false');
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [seniorMode, fontSize]);

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigate,
        goBack,
        canGoBack: history.length > 1 && currentScreen !== 'home',
        language,
        setLanguage,
        seniorMode,
        toggleSeniorMode,
        fontSize,
        setFontSize,
        savedParking,
        saveParking,
        clearSavedParking,
        updateSavedParkingNote,
        offlineMapDownloaded,
        offlineDownloadProgress,
        isDownloadingOfflineMap,
        startOfflineDownload,
        deleteOfflineMap,
        familyMembers,
        addFamilyMember,
        removeFamilyMember,
        meetingPoint,
        updateMeetingPoint,
        activeNavigationTarget,
        startNavigation,
        stopNavigation,
        activeRoute,
        setActiveRoute,
        travelMode,
        setTravelMode,
        navigationState,
        setNavigationState,
        volunteerRequests,
        submitVolunteerRequest,
        registeredVolunteer,
        registerVolunteer,
        selectedMapItem,
        setSelectedMapItem,
        userLocationGranted,
        setUserLocationGranted,
        deviceLocation,
        locationStatus,
        locationErrorMessage,
        requestDeviceLocation,
        showPrePermissionModal,
        setShowPrePermissionModal,
        isDeveloperSimulatedLocation,
        setDeveloperSimulatedLocation,
        isOnline,
        offlinePackage,
        refreshOfflinePackage,
        isSimulatedOffline,
        setSimulatedOffline,
        currentUser,
        setCurrentUser,
        userRole,
        isAuthenticated,
        logoutUser,
        switchUserRole,
        refreshCurrentUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
