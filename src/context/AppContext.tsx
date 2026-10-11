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
import { OfflineMapService } from '../services/OfflineMapService';
import { AuthService } from '../services/AuthService';
import { NetworkService, NetworkStatus } from '../services/NetworkService';
import { SyncService } from '../services/SyncService';
import { OfflineDataService } from '../services/OfflineDataService';

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
  saveParking: (data: SavedParking & Partial<SavedParkingData>) => Promise<void>;
  clearSavedParking: () => Promise<void>;
  updateSavedParkingNote: (note: string) => Promise<void>;
  offlineMapDownloaded: boolean;
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
  isOnline: boolean;
  networkStatus: NetworkStatus;
  lastSyncTime: number | null;
  syncError: string | null;
  networkRecovered: boolean;
  retrySync: () => Promise<void>;

  // Step 18: User Authentication, Profile & Role System
  currentUser: AppUserProfile | null;
  setCurrentUser: (user: AppUserProfile | null) => void;
  userRole: AppUserRole;
  isAuthenticated: boolean;
  logoutUser: () => void;
  refreshCurrentUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PARKING = 'deo_chhath_saved_parking';
const STORAGE_KEY_SENIOR = 'deo_chhath_senior_mode';
const STORAGE_KEY_LANG = 'deo_chhath_lang';
const STORAGE_KEY_FONT = 'deo_chhath_font_size';
const STORAGE_KEY_SCREEN = 'deo_chhath_current_screen';

const SCREEN_IDS: readonly ScreenId[] = [
  'splash',
  'language',
  'location-permission',
  'offline-map',
  'home',
  'search',
  'map',
  'navigation-preview',
  'navigation',
  'parking',
  'save-parking',
  'my-parking',
  'shuttle',
  'medical',
  'toilet',
  'water',
  'help',
  'emergency',
  'family',
  'lost-found',
  'volunteer',
  'volunteer-register',
  'volunteer-mode',
  'volunteer-request',
  'senior-mode',
  'announcements',
  'about',
  'settings',
  'more',
  'login',
  'profile',
  'session-expired',
  'offline',
  'error',
  'admin-login',
  'admin-dashboard',
];

const isScreenId = (screen: string | null): screen is ScreenId =>
  SCREEN_IDS.some((screenId) => screenId === screen);

const getInitialScreen = (): ScreenId => {
  const savedScreen = sessionStorage.getItem(STORAGE_KEY_SCREEN);
  return isScreenId(savedScreen) ? savedScreen : 'splash';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<ScreenId[]>(() => [getInitialScreen()]);
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
  const [userLocationGranted, setUserLocationGrantedState] = useState<boolean>(false);

  const [deviceLocation, setDeviceLocation] = useState<DeviceCoordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<GeolocationStatus>('idle');
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);
  const [showPrePermissionModal, setShowPrePermissionModal] = useState<boolean>(false);
  const [networkOnline, setNetworkOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const isOnline = networkOnline;
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(NetworkService.getStatus());
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [networkRecovered, setNetworkRecovered] = useState(false);

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

  const watchIdRef = useRef<number | null>(null);

  const setUserLocationGranted = (granted: boolean) => {
    setUserLocationGrantedState(granted);
  };

  // Keep one shared network/synchronization state for every screen.
  useEffect(() => {
    let restoredTimer: number | undefined;
    NetworkService.start();
    const unsubscribe = NetworkService.subscribe(setNetworkStatus);

    const refreshLastSync = async () => {
      const timestamp = await SyncService.getLastSyncTime();
      setLastSyncTime(timestamp);
    };

    const handleOnline = () => {
      setNetworkOnline(true);
      NetworkService.setStatus('ONLINE');
      setNetworkRecovered(true);
      if (restoredTimer !== undefined) window.clearTimeout(restoredTimer);
      restoredTimer = window.setTimeout(() => setNetworkRecovered(false), 5000);
      if (!SyncService.isConfigured()) {
        setNetworkStatus('ONLINE');
        setSyncError(null);
        return;
      }
      void SyncService.performFullSync()
        .then(() => {
          setSyncError(null);
          return refreshLastSync();
        })
        .catch((error: unknown) => {
          setNetworkStatus('SYNC_ERROR');
          setSyncError(
            error instanceof Error ? error.message : 'सिंक विफल हुआ। पुनः प्रयास करें।'
          );
        });
    };
    const handleOffline = () => {
      setNetworkOnline(false);
      NetworkService.setStatus('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    void refreshLastSync();
    if (navigator.onLine && SyncService.isConfigured()) {
      void SyncService.performFullSync()
        .then(() => {
          setSyncError(null);
          return refreshLastSync();
        })
        .catch((error: unknown) => {
          setNetworkStatus('SYNC_ERROR');
          setSyncError(
            error instanceof Error ? error.message : 'सिंक विफल हुआ। पुनः प्रयास करें।'
          );
        });
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (restoredTimer !== undefined) window.clearTimeout(restoredTimer);
      unsubscribe();
      NetworkService.stop();
    };
  }, []);

  const retrySync = async (): Promise<void> => {
    try {
      const result = await SyncService.performFullSync();
      setSyncError(null);
      setLastSyncTime(result.syncedAt ? Date.parse(result.syncedAt) : Date.now());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'सिंक विफल हुआ। पुनः प्रयास करें।';
      setSyncError(message);
      throw error;
    }
  };

  // Request Real Device GPS Location using navigator.geolocation
  const requestDeviceLocation = async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setLocationStatus('unavailable');
      setLocationErrorMessage('आपके ब्राउज़र/डिवाइस में जीपीएस उपलब्ध नहीं है।');
      return false;
    }

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setLocationStatus('unavailable');
      setLocationErrorMessage('सुरक्षा कारणों से GPS के लिए HTTPS या localhost कनेक्शन आवश्यक है।');
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
          };

          setDeviceLocation(coords);
          setLocationStatus(coords.accuracy > 400 ? 'low-accuracy' : 'success');
          setLocationErrorMessage(coords.accuracy > 400 ? 'GPS की सटीकता कम है।' : null);
          setUserLocationGranted(true);

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
    if (!('geolocation' in navigator)) return;
    try {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords: DeviceCoordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            timestamp: pos.timestamp || Date.now(),
          };
          setDeviceLocation(coords);
          setLocationStatus(coords.accuracy > 400 ? 'low-accuracy' : 'success');
          setLocationErrorMessage(
            coords.accuracy > 400 ? 'GPS की सटीकता कम है।' : null
          );
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationStatus('permission-denied');
            setLocationErrorMessage('GPS की अनुमति हटा दी गई है। ब्राउज़र सेटिंग्स में अनुमति दें।');
            setUserLocationGranted(false);
          } else if (error.code === error.TIMEOUT) {
            setLocationStatus('timeout');
            setLocationErrorMessage('GPS अपडेट में समय लग रहा है। वर्तमान स्थान का समय देखें।');
          } else {
            setLocationStatus('unavailable');
            setLocationErrorMessage('GPS अपडेट अभी उपलब्ध नहीं है। पुराने स्थान को वर्तमान न मानें।');
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
        }
      );
    } catch (error) {
      console.error('Device GPS watch could not be started:', error);
      setLocationStatus('unavailable');
      setLocationErrorMessage('डिवाइस GPS निगरानी शुरू नहीं हो सकी। अनुमति जाँचें और फिर प्रयास करें।');
    }
  };

  useEffect(() => {
    const needsLiveLocation = ['map', 'navigation', 'navigation-preview'].includes(currentScreen);
    if (userLocationGranted && needsLiveLocation) {
      startWatchPosition();
    } else if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [userLocationGranted, currentScreen]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_SCREEN, currentScreen);
  }, [currentScreen]);

  const [savedParking, setSavedParking] = useState<(SavedParking & Partial<SavedParkingData>) | null>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PARKING);
      if (!data) return null;
      const parsed: unknown = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object') return null;
      const parking = parsed as Partial<SavedParking>;
      if (
        typeof parking.parkingId !== 'string' ||
        typeof parking.parkingName !== 'string' ||
        typeof parking.latitude !== 'number' ||
        !Number.isFinite(parking.latitude) ||
        typeof parking.longitude !== 'number' ||
        !Number.isFinite(parking.longitude)
      ) {
        console.error('Saved parking data is malformed; ignoring invalid local record.');
        return null;
      }
      return parking as SavedParking;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let cancelled = false;
    const migrateSavedParking = async () => {
      try {
        const saved = await OfflineDataService.getPrivateValue<SavedParking & Partial<SavedParkingData>>(
          'saved-parking'
        );
        if (saved) {
          if (!cancelled) setSavedParking(saved);
          return;
        }
        const legacy = localStorage.getItem(STORAGE_KEY_PARKING);
        if (!legacy) return;
        const parsed = JSON.parse(legacy) as SavedParking & Partial<SavedParkingData>;
        if (
          typeof parsed.parkingId !== 'string' ||
          typeof parsed.parkingName !== 'string' ||
          !Number.isFinite(parsed.latitude) ||
          !Number.isFinite(parsed.longitude)
        ) {
          console.error('Malformed legacy saved-parking data was not migrated.');
          return;
        }
        await OfflineDataService.savePrivateValue('saved-parking', parsed);
        localStorage.removeItem(STORAGE_KEY_PARKING);
        if (!cancelled) setSavedParking(parsed);
      } catch (error) {
        console.error('Saved parking could not be migrated to private IndexedDB storage:', error);
      }
    };
    void migrateSavedParking();
    return () => {
      cancelled = true;
    };
  }, []);

  const offlineMapDownloaded = false;

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
  const [selectedMapItem, setSelectedMapItem] = useState<LocationItem | null>(null);
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

  const saveParking = async (data: SavedParking & Partial<SavedParkingData>) => {
    try {
      await OfflineDataService.savePrivateValue('saved-parking', data);
      localStorage.removeItem(STORAGE_KEY_PARKING);
      setSavedParking(data);
    } catch (error) {
      console.error('Saved parking could not be persisted locally:', error);
      throw new Error('पार्किंग स्थान सुरक्षित नहीं हुआ। कृपया डिवाइस का संग्रहण जाँचें।');
    }
  };

  const clearSavedParking = async () => {
    try {
      await OfflineDataService.deletePrivateValue('saved-parking');
      localStorage.removeItem(STORAGE_KEY_PARKING);
      setSavedParking(null);
    } catch (error) {
      console.error('Saved parking could not be removed from local storage:', error);
      throw new Error('सहेजी गई पार्किंग हटाई नहीं जा सकी।');
    }
  };

  const updateSavedParkingNote = async (note: string) => {
    if (!savedParking) return;
    const updated = { ...savedParking, note, notes: note };
    try {
      await OfflineDataService.savePrivateValue('saved-parking', updated);
      localStorage.removeItem(STORAGE_KEY_PARKING);
      setSavedParking(updated);
    } catch (error) {
      console.error('Saved parking note could not be persisted locally:', error);
      throw new Error('पार्किंग नोट सुरक्षित नहीं हुआ।');
    }
  };

  const deleteOfflineMap = () => {
    OfflineMapService.deleteOfflineData();
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
        isOnline,
        networkStatus,
        lastSyncTime,
        syncError,
        networkRecovered,
        retrySync,
        currentUser,
        setCurrentUser,
        userRole,
        isAuthenticated,
        logoutUser,
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
