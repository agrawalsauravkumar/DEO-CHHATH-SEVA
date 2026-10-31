import React from 'react';
import { ArrowLeft, PhoneCall, Accessibility, Bell, DownloadCloud } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScreenId } from '../types';
import { DeoChhathSevaLogo } from './DeoChhathSevaLogo';
import { LanguageSwitcher } from './LanguageSwitcher';

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const SCREEN_TITLES: Partial<Record<ScreenId, string>> = {
  home: 'DEO CHHATH SEVA',
  search: 'स्थान खोजें',
  map: 'देव सेवा नक्शा',
  navigation: 'दिशा निर्देश',
  parking: 'पार्किंग स्थल',
  'save-parking': 'मेरी गाड़ी कहाँ है',
  'my-parking': 'मेरी गाड़ी',
  shuttle: 'निःशुल्क शटल व ई-रिक्शा',
  medical: 'चिकित्सा व प्राथमिक उपचार',
  toilet: 'शौचालय सुविधाएं',
  water: 'पेयजल केंद्र',
  help: 'सहायता केंद्र',
  emergency: 'आपातकालीन सहायता (SOS)',
  family: 'मेरा परिवार सुरक्षा समूह',
  'lost-found': 'खोया-पाया केंद्र',
  volunteer: 'NextGen सेवा दल (स्वयंसेवक)',
  'volunteer-register': 'स्वयंसेवक पंजीकरण',
  'volunteer-mode': 'Volunteer Mode Dashboard',
  'volunteer-request': 'सहायता का अनुरोध',
  'senior-mode': 'वरिष्ठ नागरिक एवं दिव्यांग मोड',
  announcements: 'आधिकारिक सूचनाएं व अर्घ्य समय',
  about: 'NextGen Devbhoomi Foundation',
  team: 'हमारी टीम',
  settings: 'ऐप सेटिंग्स',
  more: 'सभी सेवाएँ',
  language: 'भाषा चुनें',
  'location-permission': 'लोकेशन अनुमति',
  'offline-map': 'ऑफलाइन नक्शा डाउनलोड',
  'chhath-katha': 'छठ व्रत कथा व गीत',
  'prasad-camps': 'निःशुल्क प्रसाद शिविर',
};

const ENGLISH_SCREEN_TITLES: Partial<Record<ScreenId, string>> = {
  home: 'DEO CHHATH SEVA',
  search: 'Find a place',
  map: 'Deo service map',
  navigation: 'Directions',
  parking: 'Parking',
  'save-parking': 'Save my parking',
  'my-parking': 'My parking',
  shuttle: 'Shuttle service',
  medical: 'Medical and first aid',
  toilet: 'Nearby toilets',
  water: 'Drinking water',
  help: 'Help center',
  emergency: 'Emergency assistance (SOS)',
  family: 'Family safety group',
  'lost-found': 'Lost and found',
  volunteer: 'NextGen volunteers',
  'volunteer-register': 'Volunteer registration',
  'volunteer-mode': 'Volunteer dashboard',
  'volunteer-request': 'Request help',
  'senior-mode': 'Senior and accessibility mode',
  announcements: 'Official announcements',
  about: 'About Us',
  team: 'Our team',
  settings: 'App settings',
  more: 'All services',
  language: 'Choose language',
  login: 'Login',
  'location-permission': 'Location permission',
  'offline-map': 'Offline map status',
  profile: 'User profile',
  'session-expired': 'Session expired',
  offline: 'Offline status',
  error: 'Error',
  'chhath-katha': 'Chhath Katha & Songs',
  'prasad-camps': 'Free Prasad Camps',
};

export const TopBar: React.FC<Props> = ({ title, subtitle, showBack, onBack }) => {
  const {
    currentScreen,
    goBack,
    canGoBack,
    navigate,
    seniorMode,
    toggleSeniorMode,
    isOnline,
    language,
  } = useApp();

  const isHome = currentScreen === 'home';
  const isEmergency = currentScreen === 'emergency';
  const isEnglish = language === 'en';
  const displayTitle = isEnglish
    ? (currentScreen === 'login' ? title : undefined) ||
      ENGLISH_SCREEN_TITLES[currentScreen] ||
      title ||
      SCREEN_TITLES[currentScreen] ||
      'DEO CHHATH SEVA'
    : title || SCREEN_TITLES[currentScreen] || 'देव छठ सेवा';

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#073B78] via-[#0B5E8E] to-[#073B78] text-white border-b-2 border-[#FFD54F] shadow-md px-3 sm:px-4 py-2 select-none font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <div className="max-w-4xl mx-auto flex items-center justify-between min-h-[46px] gap-2">
        {/* Left Slot: Back or Official NGO Seal Logo */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {showBack || canGoBack ? (
            <button
              onClick={onBack ? onBack : goBack}
              aria-label={isEnglish ? 'Go back' : 'पीछे जाएं'}
              className="min-h-[44px] min-w-[44px] -ml-1 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95 border border-white/10 shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button
              onClick={() => navigate('about')}
              className="flex items-center gap-1.5 text-left active:scale-95 transition-transform shrink-0"
              title="DEO CHHATH SEVA - NEXTGEN DEVBHOOMI FOUNDATION"
            >
              <DeoChhathSevaLogo size={38} className="drop-shadow-md" />
            </button>
          )}

          <div className="flex flex-col min-w-0 flex-1">
            <h1
              className={`font-black tracking-tight text-white leading-tight truncate ${
                seniorMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              }`}
            >
              {displayTitle}
            </h1>
            {isHome ? (
              <>
                <span className="text-[10px] font-semibold text-[#FFD54F]/90 tracking-wide truncate">
                  {isEnglish ? 'Navigation • Assistance • Service' : 'रास्ता भी • सहायता भी • सेवा भी'}
                </span>
                <span className="text-[9px] font-black text-[#FFD54F] tracking-wider truncate uppercase">
                  NEXTGEN DEVBHOOMI FOUNDATION
                </span>
              </>
            ) : subtitle ? (
              <span className="text-[11px] text-[#FFD54F]/90 truncate leading-tight">{subtitle}</span>
            ) : null}
          </div>
        </div>

        {/* Right Slot: Balanced, Responsive Action Controls */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {!isOnline && (
            <button
              onClick={() => navigate('offline')}
              title={isEnglish ? 'Offline status' : 'ऑफ़लाइन स्थिति'}
              aria-label={isEnglish ? 'Offline status' : 'ऑफ़लाइन स्थिति'}
              className="min-h-[38px] rounded-xl bg-amber-400 px-2 text-stone-950 flex items-center gap-1 font-black text-[10px] shadow-xs active:scale-95"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Offline</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="shrink-0">
            <LanguageSwitcher compact />
          </div>

          {/* Announcements Bell on Tablet / Desktop */}
          <button
            onClick={() => navigate('announcements')}
            title={isEnglish ? 'Announcements' : 'सूचनाएं'}
            aria-label={isEnglish ? 'Announcements' : 'सूचनाएं'}
            className="hidden sm:flex min-h-[40px] min-w-[40px] items-center justify-center text-[#FFD54F] hover:text-amber-100 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Senior Mode Toggle on Tablet / Desktop */}
          <button
            onClick={toggleSeniorMode}
            title={
              seniorMode
                ? isEnglish
                  ? 'Switch to standard mode'
                  : 'सामान्य मोड में जाएं'
                : isEnglish
                  ? 'Senior mode'
                  : 'वरिष्ठ नागरिक मोड'
            }
            aria-label={isEnglish ? 'Senior mode' : 'वरिष्ठ नागरिक मोड'}
            className={`hidden sm:flex min-h-[40px] px-2.5 items-center gap-1 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
              seniorMode
                ? 'bg-[#FFD54F] text-stone-950 border-amber-300 shadow-sm'
                : 'bg-white/10 text-[#FFD54F] hover:bg-white/20 border-white/10'
            }`}
          >
            <Accessibility className="w-4 h-4" />
            <span>{isEnglish ? 'Senior' : 'वरिष्ठ'}</span>
          </button>

          {/* Emergency SOS Button (Hidden when on Emergency screen itself) */}
          {!isEmergency && (
            <button
              onClick={() => navigate('emergency')}
              aria-label={isEnglish ? 'Emergency SOS assistance' : 'आपातकालीन SOS सहायता'}
              className="min-h-[38px] px-2.5 sm:px-3 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-1 shadow-md transition-all border border-[#EF4444]"
            >
              <PhoneCall className="w-3.5 h-3.5 fill-white" />
              <span>SOS</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
