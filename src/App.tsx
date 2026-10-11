/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/BottomNav';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { LanguageScreen } from './screens/LanguageScreen';
import { LocationScreen } from './screens/LocationScreen';
import { OfflineMapScreen } from './screens/OfflineMapScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SearchScreen } from './screens/SearchScreen';
import { MapScreen } from './screens/MapScreen';
import { NavigationPreviewScreen } from './screens/NavigationPreviewScreen';
import { NavigationScreen } from './screens/NavigationScreen';
import { ParkingScreen } from './screens/ParkingScreen';
import { MyParkingScreen } from './screens/MyParkingScreen';
import { ShuttleScreen } from './screens/ShuttleScreen';
import { MedicalScreen } from './screens/MedicalScreen';
import { ToiletScreen } from './screens/ToiletScreen';
import { WaterScreen } from './screens/WaterScreen';
import { HelpScreen } from './screens/HelpScreen';
import { EmergencyScreen } from './screens/EmergencyScreen';
import { FamilyScreen } from './screens/FamilyScreen';
import { LostFoundScreen } from './screens/LostFoundScreen';
import { VolunteerScreen } from './screens/VolunteerScreen';
import { VolunteerRegistrationScreen } from './screens/VolunteerRegistrationScreen';
import { VolunteerModeScreen } from './screens/VolunteerModeScreen';
import { VolunteerRequestScreen } from './screens/VolunteerRequestScreen';
import { SeniorModeScreen } from './screens/SeniorModeScreen';
import { AnnouncementsScreen } from './screens/AnnouncementsScreen';
import { AboutScreen } from './screens/AboutScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { MoreScreen } from './screens/MoreScreen';
import { AdminLoginScreen } from './screens/AdminLoginScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SessionExpiredScreen } from './screens/SessionExpiredScreen';
import { OfflineScreen } from './screens/OfflineScreen';
import { ErrorScreen } from './screens/ErrorScreen';

const MainRouter: React.FC = () => {
  const {
    currentScreen,
    isOnline,
    networkStatus,
    lastSyncTime,
    syncError,
    networkRecovered,
    retrySync,
  } = useApp();

  // Desktop-First / Full-Width Admin Dashboard (Step 17 Requirement 31)
  if (currentScreen === 'admin-login') {
    return <AdminLoginScreen />;
  }

  if (currentScreen === 'admin-dashboard') {
    return <AdminDashboardScreen />;
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
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-[100dvh] flex justify-center px-0 py-0 font-['Mukta',sans-serif]">
      <div className="app-shell w-full max-w-7xl min-h-[100dvh] relative flex flex-col border-x border-[#FFD54F]/40">
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
                  ? '🟠 आप ऑफलाइन हैं — कुछ सुविधाएँ इंटरनेट के बिना उपलब्ध नहीं हो सकतीं।'
                  : networkStatus === 'SYNCING'
                    ? 'सत्यापित डेटा सिंक हो रहा है…'
                    : networkStatus === 'SYNC_ERROR'
                      ? `सिंक नहीं हुआ${syncError ? `: ${syncError}` : ''}`
                      : networkStatus === 'SYNCED'
                        ? '🟢 सिंक किया गया'
                        : '🟢 Internet वापस आ गया है'}
                {networkStatus === 'SYNCED' && lastSyncTime
                  ? ` • अंतिम सिंक: ${new Date(lastSyncTime).toLocaleString('hi-IN')}`
                  : ''}
              </span>
              {isOnline && networkStatus === 'SYNC_ERROR' && (
                <button
                  onClick={() => void retrySync().catch(() => undefined)}
                  className="min-h-8 rounded-lg border border-current px-2.5 underline"
                >
                  फिर से प्रयास करें
                </button>
              )}
            </div>
          )}
          {renderScreen()}
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
