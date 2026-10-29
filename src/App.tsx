/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/BottomNav';

const SplashScreen = React.lazy(() =>
  import('./screens/SplashScreen').then(({ SplashScreen }) => ({ default: SplashScreen }))
);
const LanguageScreen = React.lazy(() =>
  import('./screens/LanguageScreen').then(({ LanguageScreen }) => ({ default: LanguageScreen }))
);
const LocationScreen = React.lazy(() =>
  import('./screens/LocationScreen').then(({ LocationScreen }) => ({ default: LocationScreen }))
);
const OfflineMapScreen = React.lazy(() =>
  import('./screens/OfflineMapScreen').then(({ OfflineMapScreen }) => ({ default: OfflineMapScreen }))
);
const HomeScreen = React.lazy(() =>
  import('./screens/HomeScreen').then(({ HomeScreen }) => ({ default: HomeScreen }))
);
const SearchScreen = React.lazy(() =>
  import('./screens/SearchScreen').then(({ SearchScreen }) => ({ default: SearchScreen }))
);
const MapScreen = React.lazy(() =>
  import('./screens/MapScreen').then(({ MapScreen }) => ({ default: MapScreen }))
);
const NavigationPreviewScreen = React.lazy(() =>
  import('./screens/NavigationPreviewScreen').then(({ NavigationPreviewScreen }) => ({ default: NavigationPreviewScreen }))
);
const NavigationScreen = React.lazy(() =>
  import('./screens/NavigationScreen').then(({ NavigationScreen }) => ({ default: NavigationScreen }))
);
const ParkingScreen = React.lazy(() =>
  import('./screens/ParkingScreen').then(({ ParkingScreen }) => ({ default: ParkingScreen }))
);
const SaveParkingScreen = React.lazy(() =>
  import('./screens/SaveParkingScreen').then(({ SaveParkingScreen }) => ({ default: SaveParkingScreen }))
);
const MyParkingScreen = React.lazy(() =>
  import('./screens/MyParkingScreen').then(({ MyParkingScreen }) => ({ default: MyParkingScreen }))
);
const ShuttleScreen = React.lazy(() =>
  import('./screens/ShuttleScreen').then(({ ShuttleScreen }) => ({ default: ShuttleScreen }))
);
const MedicalScreen = React.lazy(() =>
  import('./screens/MedicalScreen').then(({ MedicalScreen }) => ({ default: MedicalScreen }))
);
const ToiletScreen = React.lazy(() =>
  import('./screens/ToiletScreen').then(({ ToiletScreen }) => ({ default: ToiletScreen }))
);
const WaterScreen = React.lazy(() =>
  import('./screens/WaterScreen').then(({ WaterScreen }) => ({ default: WaterScreen }))
);
const HelpScreen = React.lazy(() =>
  import('./screens/HelpScreen').then(({ HelpScreen }) => ({ default: HelpScreen }))
);
const EmergencyScreen = React.lazy(() =>
  import('./screens/EmergencyScreen').then(({ EmergencyScreen }) => ({ default: EmergencyScreen }))
);
const FamilyScreen = React.lazy(() =>
  import('./screens/FamilyScreen').then(({ FamilyScreen }) => ({ default: FamilyScreen }))
);
const LostFoundScreen = React.lazy(() =>
  import('./screens/LostFoundScreen').then(({ LostFoundScreen }) => ({ default: LostFoundScreen }))
);
const VolunteerScreen = React.lazy(() =>
  import('./screens/VolunteerScreen').then(({ VolunteerScreen }) => ({ default: VolunteerScreen }))
);
const VolunteerRegistrationScreen = React.lazy(() =>
  import('./screens/VolunteerRegistrationScreen').then(({ VolunteerRegistrationScreen }) => ({ default: VolunteerRegistrationScreen }))
);
const VolunteerModeScreen = React.lazy(() =>
  import('./screens/VolunteerModeScreen').then(({ VolunteerModeScreen }) => ({ default: VolunteerModeScreen }))
);
const VolunteerRequestScreen = React.lazy(() =>
  import('./screens/VolunteerRequestScreen').then(({ VolunteerRequestScreen }) => ({ default: VolunteerRequestScreen }))
);
const SeniorModeScreen = React.lazy(() =>
  import('./screens/SeniorModeScreen').then(({ SeniorModeScreen }) => ({ default: SeniorModeScreen }))
);
const AnnouncementsScreen = React.lazy(() =>
  import('./screens/AnnouncementsScreen').then(({ AnnouncementsScreen }) => ({ default: AnnouncementsScreen }))
);
const AboutScreen = React.lazy(() =>
  import('./screens/AboutScreen').then(({ AboutScreen }) => ({ default: AboutScreen }))
);
const TeamScreen = React.lazy(() =>
  import('./screens/TeamScreen').then(({ TeamScreen }) => ({ default: TeamScreen }))
);
const SettingsScreen = React.lazy(() =>
  import('./screens/SettingsScreen').then(({ SettingsScreen }) => ({ default: SettingsScreen }))
);
const MoreScreen = React.lazy(() =>
  import('./screens/MoreScreen').then(({ MoreScreen }) => ({ default: MoreScreen }))
);
const AdminLoginScreen = React.lazy(() =>
  import('./screens/AdminLoginScreen').then(({ AdminLoginScreen }) => ({ default: AdminLoginScreen }))
);
const AdminDashboardScreen = React.lazy(() =>
  import('./screens/AdminDashboardScreen').then(({ AdminDashboardScreen }) => ({ default: AdminDashboardScreen }))
);
const LoginScreen = React.lazy(() =>
  import('./screens/LoginScreen').then(({ LoginScreen }) => ({ default: LoginScreen }))
);
const ProfileScreen = React.lazy(() =>
  import('./screens/ProfileScreen').then(({ ProfileScreen }) => ({ default: ProfileScreen }))
);
const SessionExpiredScreen = React.lazy(() =>
  import('./screens/SessionExpiredScreen').then(({ SessionExpiredScreen }) => ({ default: SessionExpiredScreen }))
);
const OfflineScreen = React.lazy(() =>
  import('./screens/OfflineScreen').then(({ OfflineScreen }) => ({ default: OfflineScreen }))
);
const ErrorScreen = React.lazy(() =>
  import('./screens/ErrorScreen').then(({ ErrorScreen }) => ({ default: ErrorScreen }))
);
const ChhathKathaScreen = React.lazy(() =>
  import('./screens/ChhathKathaScreen').then(({ ChhathKathaScreen }) => ({ default: ChhathKathaScreen }))
);
const PrasadCampsScreen = React.lazy(() =>
  import('./screens/PrasadCampsScreen').then(({ PrasadCampsScreen }) => ({ default: PrasadCampsScreen }))
);

const ScreenLoadingFallback = () => (
  <div
    className="flex min-h-[50vh] items-center justify-center px-4 text-center font-bold text-[#063B5C]"
    role="status"
    aria-live="polite"
  >
    सेवा लोड हो रही है…
  </div>
);

const MainRouter: React.FC = () => {
  const {
    currentScreen,
    language,
    isOnline,
    networkStatus,
    lastSyncTime,
    syncError,
    networkRecovered,
    retrySync,
  } = useApp();
  const isEnglish = language === 'en';

  // Desktop-First / Full-Width Admin Dashboard (Step 17 Requirement 31)
  if (currentScreen === 'admin-login') {
    return (
      <React.Suspense fallback={<ScreenLoadingFallback />}>
        <AdminLoginScreen />
      </React.Suspense>
    );
  }

  if (currentScreen === 'admin-dashboard') {
    return (
      <React.Suspense fallback={<ScreenLoadingFallback />}>
        <AdminDashboardScreen />
      </React.Suspense>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'language':
        return <LanguageScreen />;
      case 'location-permission':
        return <LocationScreen />;
      case 'offline-map':
        return <OfflineMapScreen />;
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'map':
        return <MapScreen />;
      case 'navigation-preview':
        return <NavigationPreviewScreen />;
      case 'navigation':
        return <NavigationScreen />;
      case 'parking':
        return <ParkingScreen />;
      case 'save-parking':
        return <SaveParkingScreen />;
      case 'my-parking':
        return <MyParkingScreen />;
      case 'shuttle':
        return <ShuttleScreen />;
      case 'medical':
        return <MedicalScreen />;
      case 'toilet':
        return <ToiletScreen />;
      case 'water':
        return <WaterScreen />;
      case 'help':
        return <HelpScreen />;
      case 'emergency':
        return <EmergencyScreen />;
      case 'family':
        return <FamilyScreen />;
      case 'lost-found':
        return <LostFoundScreen />;
      case 'volunteer':
        return <VolunteerScreen />;
      case 'volunteer-register':
        return <VolunteerRegistrationScreen />;
      case 'volunteer-mode':
        return <VolunteerModeScreen />;
      case 'volunteer-request':
        return <VolunteerRequestScreen />;
      case 'senior-mode':
        return <SeniorModeScreen />;
      case 'announcements':
        return <AnnouncementsScreen />;
      case 'about':
        return <AboutScreen />;
      case 'team':
        return <TeamScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'more':
        return <MoreScreen />;
      case 'login':
        return <LoginScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'session-expired':
        return <SessionExpiredScreen />;
      case 'offline':
        return <OfflineScreen />;
      case 'error':
        return <ErrorScreen />;
      case 'chhath-katha':
        return <ChhathKathaScreen />;
      case 'prasad-camps':
        return <PrasadCampsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--chhath-cream)] flex justify-center px-0 py-0 font-['Mukta',sans-serif]">
      <div className="app-shell w-full max-w-6xl min-h-[100dvh] relative flex flex-col bg-[var(--chhath-cream)] border-x border-[#FFB52E]/30 shadow-md">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,213,79,0.18),transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="relative z-10 flex min-h-[100dvh] flex-col">
          {(!isOnline || networkStatus === 'SYNCING' || networkStatus === 'SYNC_ERROR' || networkStatus === 'SYNCED' || networkRecovered) && (
            <div
              className={`flex min-h-10 items-center justify-center gap-2 px-3 py-1.5 text-center text-xs font-bold ${
                !isOnline
                  ? 'bg-amber-100 text-amber-950'
                  : networkStatus === 'SYNC_ERROR'
                    ? 'bg-rose-100 text-rose-900'
                    : networkStatus === 'SYNCING'
                      ? 'bg-sky-100 text-sky-950'
                      : 'bg-emerald-100 text-emerald-950'
              }`}
              role="status"
              aria-live="polite"
            >
              <span>
                {!isOnline
                  ? isEnglish
                    ? '🟠 You are offline — some features may not be available without an internet connection.'
                    : '🟠 आप ऑफलाइन हैं — कुछ सुविधाएँ इंटरनेट के बिना उपलब्ध नहीं हो सकतीं।'
                  : networkStatus === 'SYNCING'
                    ? isEnglish
                      ? 'Checking authorized announcement and facility sources…'
                      : 'अधिकृत सूचना और सुविधा स्रोत जाँचे जा रहे हैं…'
                    : networkStatus === 'SYNC_ERROR'
                      ? `${isEnglish ? 'Sync failed' : 'सिंक नहीं हुआ'}${syncError ? `: ${syncError}` : ''}`
                      : networkStatus === 'SYNCED'
                        ? isEnglish ? '🟢 Authorized data sources checked' : '🟢 अधिकृत डेटा स्रोत जाँचे गए'
                        : isEnglish ? '🟢 Internet connection restored' : '🟢 Internet वापस आ गया है'}
                {networkStatus === 'SYNCED' && lastSyncTime
                  ? ` • ${isEnglish ? 'Last source check' : 'अंतिम स्रोत जाँच'}: ${new Date(lastSyncTime).toLocaleString(isEnglish ? 'en-IN' : 'hi-IN')}`
                  : ''}
              </span>
              {isOnline && networkStatus === 'SYNC_ERROR' && (
                <button
                  onClick={() => void retrySync().catch(() => undefined)}
                  className="min-h-8 rounded-lg border border-current px-2.5 underline"
                >
                  {isEnglish ? 'Retry' : 'फिर से प्रयास करें'}
                </button>
              )}
            </div>
          )}
          <React.Suspense fallback={<ScreenLoadingFallback />}>
            {renderScreen()}
          </React.Suspense>
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
