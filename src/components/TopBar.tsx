import React from 'react';
import { ArrowLeft, PhoneCall, Accessibility, Bell, DownloadCloud } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScreenId } from '../types';
import { DeoChhathSevaLogo } from './DeoChhathSevaLogo';

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
  settings: 'ऐप सेटिंग्स',
  more: 'सभी सेवाएँ',
  language: 'भाषा चुनें',
  'location-permission': 'लोकेशन अनुमति',
  'offline-map': 'ऑफलाइन नक्शा डाउनलोड',
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
  } = useApp();

  const isHome = currentScreen === 'home';
  const displayTitle = title || SCREEN_TITLES[currentScreen] || 'देव छठ सेवा';

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#063B5C] via-[#0B5E8E] to-[#063B5C] text-white border-b-[3px] border-[#FFD54F] shadow-md px-3 sm:px-4 py-2 font-['Mukta',sans-serif]">
      <div className="max-w-lg mx-auto flex items-center justify-between min-h-[46px]">
        {/* Left Slot: Back or Official NGO Seal Logo */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {showBack || canGoBack ? (
            <button
              onClick={onBack ? onBack : goBack}
              aria-label="पीछे जाएं"
              className="min-h-[44px] min-w-[44px] -ml-1 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95 border border-white/10"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button
              onClick={() => navigate('about')}
              className="flex items-center gap-1.5 text-left active:scale-95 transition-transform"
              title="DEO CHHATH SEVA - NEXTGEN DEVBHOOMI FOUNDATION"
            >
              <DeoChhathSevaLogo size={38} className="drop-shadow-md" />
            </button>
          )}

          <div className="flex flex-col min-w-0">
            <h1
              className={`font-black tracking-tight text-white truncate max-w-[clamp(5rem,30vw,12rem)] sm:max-w-xs ${
                seniorMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              }`}
            >
              {displayTitle}
            </h1>
            {isHome ? (
              <>
                <span className="text-[10px] font-semibold text-[#FFF8E1]/90 tracking-wide truncate">
                  रास्ता भी • सहायता भी • सेवा भी
                </span>
                <span className="text-[9px] font-black text-[#FFD54F] tracking-wider truncate uppercase">
                  NEXTGEN DEVBHOOMI FOUNDATION
                </span>
              </>
            ) : subtitle ? (
              <span className="text-[11px] text-[#FFF8E1]/90 truncate">{subtitle}</span>
            ) : null}
          </div>
        </div>

        {/* Right Slot: Senior Mode, Emergency SOS, or Offline Status */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {!isOnline && (
            <button
              onClick={() => navigate('offline')}
              title="ऑफ़लाइन स्थिति"
              aria-label="ऑफ़लाइन स्थिति"
              className="min-h-[44px] rounded-xl bg-amber-400 px-2 text-stone-950 flex items-center gap-1 font-black text-[10px]"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Offline</span>
            </button>
          )}

          <button
            onClick={() => navigate('announcements')}
            title="सूचनाएं"
            aria-label="सूचनाएं"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#FFD54F] hover:text-amber-100 active:scale-95 relative"
          >
            <Bell className="w-5 h-5" />
          </button>

          <button
            onClick={toggleSeniorMode}
            title={seniorMode ? 'सामान्य मोड में जाएं' : 'वरिष्ठ नागरिक मोड'}
            aria-label="वरिष्ठ नागरिक मोड"
            className={`min-h-[44px] min-w-[44px] px-2.5 flex items-center gap-1 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
              seniorMode
                ? 'bg-[#FFD54F] text-stone-950 border-amber-300 shadow-sm'
                : 'bg-white/10 text-[#FFD54F] hover:bg-white/20 border-white/10'
            }`}
          >
            <Accessibility className="w-4 h-4" />
            <span className="hidden xs:inline">वरिष्ठ</span>
          </button>

          <button
            onClick={() => navigate('emergency')}
            aria-label="आपातकालीन SOS सहायता"
            className="min-h-[44px] px-3 bg-[#E53935] hover:bg-[#C62828] active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-1 shadow-md transition-colors border border-[#E53935]"
          >
            <PhoneCall className="w-3.5 h-3.5 fill-white" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
