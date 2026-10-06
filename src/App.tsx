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
  const { currentScreen } = useApp();

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
    <div className="min-h-screen bg-stone-100 flex justify-center font-['Mukta',sans-serif]">
      {/* Mobile-First Device Container */}
      <div className="w-full max-w-md bg-stone-50 min-h-screen shadow-2xl relative flex flex-col">
        {renderScreen()}
        <BottomNav />
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
