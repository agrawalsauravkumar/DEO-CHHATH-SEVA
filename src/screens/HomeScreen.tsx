import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { LocationPermissionModal } from '../components/LocationPermissionModal';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { BrandFooter, OnlineOfflineBadge } from '../components/ChhathThemeComponents';
import { HOME_EMERGENCY_SCREEN, HOME_PRIMARY_ACTIONS } from './homeActions';
import { FacilityService } from '../services/FacilityService';
import { AnnouncementService } from '../services/AnnouncementService';
import { ChhathArghyaMuhurat } from '../components/ChhathArghyaMuhurat';
import { ChhathVratiModeSection } from '../components/ChhathVratiModeSection';
import { ChhathGhatDirectory } from '../components/ChhathGhatDirectory';
import { DeoChhathDarshan } from '../components/DeoChhathDarshan';
import { ChhathPujaChecklist } from '../components/ChhathPujaChecklist';
import { ChhathDevotionalPlayer } from '../components/ChhathDevotionalPlayer';
import { ChhathSafetyBadgeModal } from '../components/ChhathSafetyBadgeModal';
import { ChhathSolarCompassModal } from '../components/ChhathSolarCompassModal';
import { ChhathSafetySection } from '../components/ChhathSafetySection';
import { ChhathVratiFastingTracker } from '../components/ChhathVratiFastingTracker';
import {
  ArrowRight,
  Bell,
  HeartHandshake,
  MapPin,
  Shield,
  Siren,
  UsersRound,
  ShoppingBag,
  Music,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    language,
    navigate,
    deviceLocation,
    locationStatus,
    userLocationGranted,
    isOnline,
    showPrePermissionModal,
    setShowPrePermissionModal,
    currentUser,
    isAuthenticated,
  } = useApp();
  const isEnglish = language === 'en';
  const [operationalDataStatus, setOperationalDataStatus] = useState<'LOADING' | 'READY' | 'EMPTY' | 'ERROR'>('LOADING');
  const [showChecklistModal, setShowChecklistModal] = useState<boolean>(false);
  const [showDevotionalModal, setShowDevotionalModal] = useState<boolean>(false);
  const [showSafetyBadgeModal, setShowSafetyBadgeModal] = useState<boolean>(false);
  const [showSolarCompassModal, setShowSolarCompassModal] = useState<boolean>(false);

  useEffect(() => {
    if (!isOnline) {
      setOperationalDataStatus('ERROR');
      return;
    }
    let isMounted = true;
    Promise.all([
      FacilityService.syncFacilities(),
      AnnouncementService.syncAnnouncements(),
    ])
      .then(() => {
        if (!isMounted) return;
        const hasVerifiedData =
          FacilityService.getVerifiedFacilities().some((facility) => facility.active) ||
          AnnouncementService.getActiveAnnouncements().length > 0;
        setOperationalDataStatus(hasVerifiedData ? 'READY' : 'EMPTY');
      })
      .catch((error: unknown) => {
        console.error('Operational data could not be synchronized:', error);
        if (isMounted) setOperationalDataStatus('ERROR');
      });
    return () => {
      isMounted = false;
    };
  }, [isOnline]);

  const openMyLocation = () => {
    if (!deviceLocation && !userLocationGranted) {
      setShowPrePermissionModal(true);
      return;
    }
    navigate('map');
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--chhath-cream)] pb-24 flex flex-col font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <header className="home-brand-header">
        <div className="home-brand-header__top">
          <button
            type="button"
            onClick={() => navigate('about')}
            aria-label={isEnglish ? 'About DEO CHHATH SEVA' : 'DEO CHHATH SEVA के बारे में'}
            className="home-brand-header__logo-button"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 p-1 border border-[#FFD54F]/50 shadow-xs flex items-center justify-center backdrop-blur-xs">
              <DeoChhathSevaLogo size={40} className="home-brand-header__logo rounded-xl" />
            </div>
          </button>
          <div className="home-brand-header__identity">
            <h1>DEO CHHATH SEVA</h1>
            <p>{isEnglish ? 'Navigation • Assistance • Service' : 'रास्ता भी • सहायता भी • सेवा भी'}</p>
            <span>NEXTGEN DEVBHOOMI FOUNDATION</span>
          </div>
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? 'profile' : 'login')}
            className="home-account-button"
            aria-label={
              isAuthenticated
                ? isEnglish ? 'Open my profile' : 'मेरी प्रोफ़ाइल खोलें'
                : isEnglish ? 'Log in' : 'लॉगिन करें'
            }
          >
            {isAuthenticated
              ? currentUser?.fullName?.split(' ')[0] || (isEnglish ? 'Profile' : 'प्रोफ़ाइल')
              : isEnglish ? 'Login' : 'लॉगिन'}
          </button>
          <LanguageSwitcher compact />
        </div>
        <div className="home-brand-header__status">
          <OnlineOfflineBadge isOnline={isOnline} />
          <button
            type="button"
            onClick={() => {
              if (!deviceLocation) {
                setShowPrePermissionModal(true);
              } else {
                navigate('map');
              }
            }}
            className="home-brand-header__location cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            aria-live="polite"
            title={!deviceLocation ? (isEnglish ? 'Click to enable GPS' : 'GPS चालू करने हेतु टैप करें') : (isEnglish ? 'View map' : 'नक्शा देखें')}
          >
            <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" />
            {deviceLocation
              ? locationStatus === 'low-accuracy'
                ? `अनुमानित GPS • सटीकता ±${Math.round(deviceLocation.accuracy)} मीटर`
                : locationStatus === 'success'
                  ? `GPS • सटीकता ±${Math.round(deviceLocation.accuracy)} मीटर`
                  : `अंतिम GPS स्थान • सटीकता ±${Math.round(deviceLocation.accuracy)} मीटर`
              : isEnglish ? 'GPS location off • Tap to enable' : 'GPS स्थान बंद • चालू करें'}
          </button>
        </div>
      </header>

      <main className="home-content">
        {/* GRAND CHHATH DEVOTIONAL HERO BANNER (दिल को छू लेने वाला मुख्य दर्शन) */}
        <section aria-label="देव छठ सेवा मुख्य दर्शन" className="relative overflow-hidden rounded-3xl border-2 border-amber-400 shadow-xl bg-gradient-to-b from-[#0B2545] to-[#07172B]">
          {/* Official High-Resolution Chhath Puja Heritage Photo Banner */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
            <img
              src="/branding/chhath-hero-banner.jpg"
              alt="देव छठ महापर्व — भगवान भास्कर अर्घ्य एवं सूर्य मंदिर"
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
            {/* Subtle Gradient Veil for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07172B] via-[#07172B]/40 to-transparent" />

            {/* Top Floating Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-[#073B78]/90 text-[#FFD54F] border border-[#FFD54F]/70 text-xs font-black shadow-md backdrop-blur-xs flex items-center gap-1.5">
                <span>🚩</span>
                <span>{isEnglish ? 'Deoark Dham • Aurangabad (Bihar)' : 'देवार्क धाम • औरंगाबाद (बिहार)'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-black/60 text-[#FFD54F] text-[11px] font-black border border-[#FFD54F]/40 backdrop-blur-xs">
                ॥ जय छठी मईया ॥
              </span>
            </div>

            {/* Bottom Hero Overlay Content */}
            <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
              <h2 className="text-lg sm:text-2xl font-black text-[#FFF8E1] drop-shadow-md leading-tight">
                {isEnglish ? 'Deo Chhath Mahaparv Seva 2026' : 'देव छठ महापर्व सेवा २०२६'}
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-200 font-bold drop-shadow-sm mt-0.5">
                {isEnglish
                  ? 'Sacred Sun Temple & Surya Kund Mahatirth • Navigation • Help • Service'
                  : 'विश्व प्रसिद्ध सूर्य मंदिर एवं सूर्य कुंड महातीर्थ • रास्ता भी • सहायता भी • सेवा भी'}
              </p>
            </div>
          </div>

          {/* Devotional Welcome & Quick Action Bar */}
          <div className="p-3.5 bg-gradient-to-b from-[#07172B] to-[#0B2545] border-t border-amber-400/40 space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-amber-300 font-extrabold flex items-center gap-1.5">
                <span>☀️</span>
                <span>{isEnglish ? '॥ Om Suryaya Namah ॥' : '॥ ॐ सूर्याय नमः ॥'}</span>
              </span>
              <span className="text-stone-300 font-bold text-[11px]">
                NEXTGEN DEVBHOOMI FOUNDATION
              </span>
            </div>

            <p className="text-xs text-amber-100/90 leading-relaxed font-semibold">
              {isEnglish
                ? 'Welcome to the sacred land of Deo. Dedicated public service for all Chhath Vratis and pilgrims. May your pilgrimage be peaceful and blessed.'
                : 'देव की पावन धरती पर आपका हार्दिक स्वागत है। छठ व्रतियों एवं श्रद्धालुओं की सेवा में समर्पित। आपकी यात्रा सुरक्षित और मंगलमय हो।'}
            </p>

            {/* 3 Pilgrimage Quick Navigation Chips */}
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  const el = document.querySelector('[aria-label="देव छठ दर्शन एवं प्रामाणिक इतिहास"]');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else navigate('map');
                }}
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 border border-amber-400/60 text-amber-200 text-center transition-all flex flex-col items-center gap-0.5"
              >
                <span className="text-base">🚩</span>
                <span className="text-[11px] font-black leading-tight">सूर्य मंदिर</span>
                <span className="text-[9px] text-amber-300/80 font-bold">100 फ़ीट शिखर</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('map')}
                className="p-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 active:scale-95 border border-sky-400/60 text-sky-200 text-center transition-all flex flex-col items-center gap-0.5"
              >
                <span className="text-base">🌊</span>
                <span className="text-[11px] font-black leading-tight">सूर्य कुंड</span>
                <span className="text-[9px] text-sky-300/80 font-bold">अर्घ्य सरोवर</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('prasad-camps')}
                className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 border border-emerald-400/60 text-emerald-200 text-center transition-all flex flex-col items-center gap-0.5"
              >
                <span className="text-base">🎋</span>
                <span className="text-[11px] font-black leading-tight">सेवा शिविर</span>
                <span className="text-[9px] text-emerald-300/80 font-bold">सूप, दूध व दउरा</span>
              </button>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => navigate(HOME_EMERGENCY_SCREEN)}
          className="home-emergency-action"
          aria-label={isEnglish ? 'Emergency Assistance 24x7 SOS helpline' : 'आपातकालीन सहायता 24x7 हेल्पलाइन'}
        >
          <span className="home-emergency-action__icon" aria-hidden="true">
            <Siren className="h-6 w-6 text-white animate-pulse" />
          </span>
          <span className="home-emergency-action__text">
            <strong>{isEnglish ? 'Emergency Assistance (24×7 SOS)' : 'आपातकालीन सहायता (24×7 हेल्पलाइन)'}</strong>
            <small>
              {isEnglish
                ? 'Immediate help • Police, Ambulance, Control Room & Medical Camp'
                : 'त्वरित सहायता • पुलिस, एम्बुलेंस, कंट्रोल रूम व मेडिकल कैम्प'}
            </small>
          </span>
          <span className="home-emergency-action__arrow" aria-hidden="true">›</span>
        </button>

        {/* Divine Live Darshan & Aarti Direct Access Banner */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('live-darshan')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('live-darshan');
            }
          }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#041E2F] via-[#07476F] to-[#0B5E8E] p-4 text-white shadow-lg border-2 border-amber-400 cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 border border-amber-300 text-2xl shadow-inner">
                🏛️
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    LIVE HD
                  </span>
                  <span className="text-[11px] font-bold text-amber-300">
                    {isEnglish ? 'Deo Sanctum & Surya Kund' : 'मुख्य गर्भगृह व सूर्य कुंड'}
                  </span>
                </div>
                <h3 className="text-base font-black text-white leading-tight">
                  {isEnglish ? 'Deo Sun Temple Live Darshan' : 'देव सूर्य मंदिर व सूर्य कुंड लाइव दर्शन'}
                </h3>
                <p className="text-[11px] text-amber-100/90 font-medium">
                  {isEnglish ? 'Daily 4-Prahar Maha-Aarti, Bell chime & Virtual Puja' : 'दैनिक चार पहर महाआरती, घंटी-शंख वादन व ई-पूजा'}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-stone-950 shadow-md">
              {isEnglish ? 'Watch Live ›' : 'दर्शन करें ›'}
            </span>
          </div>
        </div>

        {/* Chhath Arghya Timings & Live Sun Countdown */}
        <ChhathArghyaMuhurat language={language} />

        {/* 36-Hour Nirjala Fasting Tracker with Live Arghya Pipeline */}
        <ChhathVratiFastingTracker
          onOpenCompass={() => setShowSolarCompassModal(true)}
          onOpenChecklist={() => setShowChecklistModal(true)}
        />

        {/* Unique Spiritual & Pilgrim Companion Action Cards */}
        <section aria-label="छठ महापर्व विशेष सेवाएँ" className="home-special-tools">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => navigate('chhath-katha')}
              className="p-3 bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-transparent border-2 border-amber-400/70 rounded-2xl flex flex-col items-center text-center shadow-xs hover:border-amber-500 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/25 text-amber-950 flex items-center justify-center text-lg mb-1 shrink-0 font-bold">
                📖
              </div>
              <span className="text-xs font-black text-stone-900 leading-tight">
                {isEnglish ? 'Katha & Songs' : 'व्रत कथा व गीत'}
              </span>
              <span className="text-[10px] text-stone-600 font-semibold mt-0.5">
                {isEnglish ? 'Offline Audio' : 'शारदा सिन्हा व आरती'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('surya-stotra')}
              className="p-3 bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-transparent border-2 border-amber-400/70 rounded-2xl flex flex-col items-center text-center shadow-xs hover:border-amber-500 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/25 text-amber-950 flex items-center justify-center text-lg mb-1 shrink-0 font-bold">
                📜
              </div>
              <span className="text-xs font-black text-stone-900 leading-tight">
                {isEnglish ? 'Aditya Hridaya' : 'आदित्य हृदय'}
              </span>
              <span className="text-[10px] text-stone-600 font-semibold mt-0.5">
                {isEnglish ? 'Stotra & Mantras' : 'स्तोत्र, चालीसा व 12 मंत्र'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('sankalp')}
              className="p-3 bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-transparent border-2 border-orange-400/70 rounded-2xl flex flex-col items-center text-center shadow-xs hover:border-orange-500 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-500/25 text-orange-950 flex items-center justify-center text-lg mb-1 shrink-0 font-bold">
                🙏
              </div>
              <span className="text-xs font-black text-stone-900 leading-tight">
                {isEnglish ? 'Virtual Sankalp' : 'दूरस्थ ई-संकल्प'}
              </span>
              <span className="text-[10px] text-stone-600 font-semibold mt-0.5">
                {isEnglish ? 'Digital Blessing' : 'डिजिटल आशीर्वाद पत्र'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('accommodation')}
              className="p-3 bg-gradient-to-br from-sky-500/20 via-blue-500/15 to-transparent border-2 border-sky-400/70 rounded-2xl flex flex-col items-center text-center shadow-xs hover:border-sky-500 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500/25 text-sky-950 flex items-center justify-center text-lg mb-1 shrink-0 font-bold">
                ⛺
              </div>
              <span className="text-xs font-black text-stone-900 leading-tight">
                {isEnglish ? 'Tent City & Shelter' : 'रैन बसेरा व टेंट सिटी'}
              </span>
              <span className="text-[10px] text-stone-600 font-semibold mt-0.5">
                {isEnglish ? 'Free Stay Finder' : 'धर्मशाला व आश्रय स्थल'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('puja-samagri')}
              className="p-3 bg-gradient-to-br from-indigo-500/20 via-sky-500/15 to-transparent border-2 border-indigo-400/70 rounded-2xl flex flex-col items-center text-center shadow-xs hover:border-indigo-500 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/25 text-indigo-950 flex items-center justify-center text-lg mb-1 shrink-0 font-bold">
                🛒
              </div>
              <span className="text-xs font-black text-stone-900 leading-tight">
                {isEnglish ? 'Fair Rates & Camps' : 'सामग्री दर व शिविर'}
              </span>
              <span className="text-[10px] text-stone-600 font-semibold mt-0.5">
                {isEnglish ? 'Official Price List' : 'प्रशासनिक मूल्य सूची'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('prasad-camps')}
              className="p-3 bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent border-2 border-emerald-400/70 rounded-2xl flex flex-col items-center text-center shadow-xs hover:border-emerald-500 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/25 text-emerald-950 flex items-center justify-center text-lg mb-1 shrink-0 font-bold">
                🎋
              </div>
              <span className="text-xs font-black text-stone-900 leading-tight">
                {isEnglish ? 'Free Camps' : 'निःशुल्क शिविर'}
              </span>
              <span className="text-[10px] text-stone-600 font-semibold mt-0.5">
                {isEnglish ? 'Soop, Milk, Daura' : 'सूप, दूध व ठेकुआ'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowChecklistModal(true)}
              className="p-3 bg-gradient-to-br from-teal-500/20 via-emerald-500/15 to-transparent border-2 border-teal-400/70 rounded-2xl flex flex-col items-center text-center shadow-xs hover:border-teal-500 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500/25 text-teal-950 flex items-center justify-center text-lg mb-1 shrink-0 font-bold">
                🧺
              </div>
              <span className="text-xs font-black text-stone-900 leading-tight">
                {isEnglish ? 'Puja Checklist' : 'सामग्री चेकलिस्ट'}
              </span>
              <span className="text-[10px] text-stone-600 font-semibold mt-0.5">
                {isEnglish ? 'Daura & Soop' : 'दउरा व सूप'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowSafetyBadgeModal(true)}
              className="p-3 bg-gradient-to-br from-rose-500/20 via-red-500/15 to-transparent border-2 border-rose-400/70 rounded-2xl flex flex-col items-center text-center shadow-xs hover:border-rose-500 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/25 text-rose-950 flex items-center justify-center text-lg mb-1 shrink-0 font-bold">
                🛡️
              </div>
              <span className="text-xs font-black text-stone-900 leading-tight">
                {isEnglish ? 'Safety ID Badge' : 'सुरक्षा QR कार्ड'}
              </span>
              <span className="text-[10px] text-stone-600 font-semibold mt-0.5">
                {isEnglish ? 'Child & Senior' : 'बच्चे व बुजुर्ग'}
              </span>
            </button>
          </div>
        </section>

        {/* Chhath Vrati Tactile Mode */}
        <ChhathVratiModeSection />

        {/* Sacred Ghat Directory (Surya Kund & Rudra Kund) */}
        <ChhathGhatDirectory />

        {/* Authentic Deo Chhath Darshan, Real Photos & Heritage */}
        <DeoChhathDarshan />

        <section aria-labelledby="services-heading" className="home-services">
          <div className="home-section-heading">
            <div>
              <p>{isEnglish ? 'For pilgrims' : 'श्रद्धालुओं के लिए'}</p>
              <h2 id="services-heading">{isEnglish ? 'Explore services' : 'सेवाएँ खोजें'}</h2>
            </div>
            <span className="home-section-heading__sun" aria-hidden="true">☼</span>
          </div>
          <div className="home-service-grid">
            {HOME_PRIMARY_ACTIONS.map((action) => {
              const englishAction: Partial<Record<string, [string, string]>> = {
                map: ['Ghats and routes', 'View map and routes'],
                help: ['Help center', 'Available help options'],
                parking: ['Parking', 'Verified parking information'],
                'lost-found': ['Lost and found', 'Safe reporting and assistance'],
                family: ['Family safety', 'Family safety feature status'],
                announcements: ['Announcements', 'Official public notices'],
                shuttle: ['Shuttle service', 'Verified shuttle information'],
                medical: ['Medical care', 'Medical and first aid'],
                toilet: ['Toilets', 'Verified facility information'],
                water: ['Drinking water', 'Verified drinking water points'],
              };
              const [title, description] = isEnglish
                ? englishAction[action.id] || [action.title, action.description]
                : [action.title, action.description];
              return (
              <button
                key={action.id}
                type="button"
                onClick={() => navigate(action.id)}
                className={`home-service-card ${action.style}`}
                aria-label={`${title} — ${description}`}
              >
                <span className="home-service-card__icon" aria-hidden="true">
                  <action.icon className="h-6 w-6" aria-hidden />
                </span>
                <span className="home-service-card__title">{title}</span>
                <span className="home-service-card__description">{description}</span>
              </button>
            );})}
          </div>
          <p className="home-data-note" role="note">
            {operationalDataStatus === 'LOADING'
              ? isEnglish ? 'Loading verified pilgrimage facilities…' : 'सत्यापित मेला सुविधाओं की जानकारी लोड हो रही है…'
              : operationalDataStatus === 'READY'
                ? isEnglish ? 'All verified pilgrimage facilities and safety points are active.' : 'देव मेला की सभी सत्यापित सुविधाएं एवं सेवा केंद्र सक्रिय हैं।'
                : operationalDataStatus === 'EMPTY'
                  ? isEnglish ? 'Verified local assistance points are available on site.' : 'स्थानीय सहायता केंद्र व स्वयंसेवक स्थल पर उपस्थित हैं।'
                  : isEnglish ? 'Offline mode active: All saved local map facilities and emergency helpline numbers are fully functional.' : 'ऑफलाइन मोड सक्रिय: सभी सहेजी गई सुविधाएं व आपातकालीन हेल्पलाइन नंबर पूरी तरह चालू हैं।'}
          </p>
        </section>

        <ChhathSafetySection />

        <section className="home-secondary-actions" aria-label={isEnglish ? 'More options' : 'अन्य विकल्प'}>
          <button type="button" onClick={openMyLocation}>
            <MapPin className="h-5 w-5" aria-hidden />
            <span>{isEnglish ? 'My location' : 'मेरा स्थान'}</span>
          </button>
          <button type="button" onClick={() => navigate('volunteer')}>
            <HeartHandshake className="h-5 w-5" aria-hidden />
            <span>{isEnglish ? 'Volunteer' : 'सेवा करें'}</span>
          </button>
          <button type="button" onClick={() => navigate('about')}>
            <Shield className="h-5 w-5" aria-hidden />
            <span>{isEnglish ? 'About us' : 'हमारे बारे में'}</span>
          </button>
          <button type="button" onClick={() => navigate('team')}>
            <UsersRound className="h-5 w-5" aria-hidden />
            <span>{isEnglish ? 'Our team' : 'हमारी टीम'}</span>
          </button>
        </section>

        <button
          type="button"
          onClick={() => navigate('announcements')}
          className="home-announcements-link"
        >
          <Bell className="h-5 w-5 shrink-0 text-[var(--chhath-river-blue)]" aria-hidden />
          <span>
            <strong>{isEnglish ? 'Announcements' : 'सूचनाएँ'}</strong>
            <small>
              {isEnglish
                ? 'Official announcements appear here when available'
                : 'अधिकृत घोषणा उपलब्ध होने पर यहाँ देखें'}
            </small>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
        </button>

        <BrandFooter className="pt-5 pb-2" language={language} />
      </main>

      <LocationPermissionModal
        isOpen={showPrePermissionModal}
        onClose={() => setShowPrePermissionModal(false)}
        onGranted={() => {
          setShowPrePermissionModal(false);
          navigate('map');
        }}
      />

      <ChhathPujaChecklist
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
      />

      <ChhathDevotionalPlayer
        isOpen={showDevotionalModal}
        onClose={() => setShowDevotionalModal(false)}
      />

      <ChhathSafetyBadgeModal
        isOpen={showSafetyBadgeModal}
        onClose={() => setShowSafetyBadgeModal(false)}
      />

      <ChhathSolarCompassModal
        isOpen={showSolarCompassModal}
        onClose={() => setShowSolarCompassModal(false)}
      />
    </div>
  );
};
