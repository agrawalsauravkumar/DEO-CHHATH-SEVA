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
            <DeoChhathSevaLogo size={56} className="home-brand-header__logo" />
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
          <span className="home-brand-header__location" aria-live="polite">
            <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" />
            {deviceLocation
              ? locationStatus === 'low-accuracy'
                ? `अनुमानित GPS • सटीकता ±${Math.round(deviceLocation.accuracy)} मीटर`
                : locationStatus === 'success'
                  ? `GPS • सटीकता ±${Math.round(deviceLocation.accuracy)} मीटर`
                  : `अंतिम GPS स्थान • सटीकता ±${Math.round(deviceLocation.accuracy)} मीटर`
              : isEnglish ? 'GPS location unavailable' : 'GPS स्थान उपलब्ध नहीं'}
          </span>
        </div>
      </header>

      <main className="home-content">
        <section className="welcome-panel" aria-labelledby="welcome-heading">
          <div className="welcome-panel__sun" aria-hidden="true" />
          <div className="welcome-panel__devotional-scene" aria-hidden="true">
            <svg viewBox="0 0 280 200" fill="none" role="presentation" className="w-full h-auto drop-shadow-md">
              <defs>
                <radialGradient id="heroSunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF8E1" />
                  <stop offset="35%" stopColor="#FFD54F" />
                  <stop offset="70%" stopColor="#FF8C42" />
                  <stop offset="100%" stopColor="#E65100" />
                </radialGradient>
                <linearGradient id="heroWaterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0B5E8E" />
                  <stop offset="50%" stopColor="#29B6F6" />
                  <stop offset="100%" stopColor="#0288D1" />
                </linearGradient>
              </defs>
              <g stroke="#FFD54F" strokeWidth="2" opacity="0.85">
                <line x1="205" y1="58" x2="205" y2="12" />
                <line x1="205" y1="58" x2="245" y2="18" />
                <line x1="205" y1="58" x2="165" y2="18" />
                <line x1="205" y1="58" x2="270" y2="38" />
                <line x1="205" y1="58" x2="140" y2="38" />
                <line x1="205" y1="58" x2="278" y2="68" />
                <line x1="205" y1="58" x2="132" y2="68" />
              </g>
              <circle cx="205" cy="58" r="32" fill="url(#heroSunGlow)" stroke="#FFD54F" strokeWidth="2" />
              <circle cx="205" cy="58" r="26" fill="#FFF8E1" opacity="0.3" />
              <g transform="translate(142, 45)">
                <path d="M 28,0 C 24,18 16,38 8,62 L 48,62 C 40,38 32,18 28,0 Z" fill="#8D6E63" stroke="#5D4037" strokeWidth="1.5" />
                <ellipse cx="28" cy="0" rx="6" ry="2.5" fill="#FFD54F" />
                <circle cx="28" cy="-3.5" r="2" fill="#FFA000" />
                <line x1="28" y1="-8" x2="28" y2="-3" stroke="#8D6E63" strokeWidth="1.5" />
                <polygon points="28,-8 38,-6 28,-4" fill="#FF8C42" />
              </g>
              <path d="M 60,118 C 110,108 170,126 220,116 C 250,110 270,116 280,114 L 280,200 L 60,200 Z" fill="url(#heroWaterGrad)" opacity="0.9" />
              <path d="M 60,138 C 120,128 175,142 230,134 C 255,130 275,134 280,132" stroke="#E1F5FE" strokeWidth="2.5" fill="none" opacity="0.85" />
              <path d="M 80,160 C 140,152 190,164 250,156" stroke="#B3E5FC" strokeWidth="2" fill="none" opacity="0.6" />
              <g stroke="#2E7D32" strokeWidth="3" fill="none">
                <path d="M 100,185 Q 115,115 128,75" />
                <path d="M 265,185 Q 250,115 238,75" />
              </g>
              <path d="M 128,75 Q 138,58 132,44 Q 124,62 128,75" fill="#4CAF50" />
              <path d="M 238,75 Q 228,58 234,44 Q 242,62 238,75" fill="#4CAF50" />
              <g transform="translate(172, 138)">
                <path d="M 8,24 C 15,14 55,14 62,24 C 65,31 56,40 35,40 C 14,40 5,31 8,24 Z" fill="#FFD54F" stroke="#FFA000" strokeWidth="2" />
                <circle cx="35" cy="20" r="8" fill="#8D6E63" />
                <path d="M 35,6 C 39,11 40,14 37,17 C 35,18 33,16 33,14 C 33,12 34,8 35,6 Z" fill="#FFF9C4" stroke="#FF8C42" strokeWidth="1.5" />
              </g>
            </svg>
          </div>
          <p className="welcome-panel__eyebrow">
            {isEnglish ? 'Deo • Aurangabad • Bihar' : 'देव • औरंगाबाद • बिहार'}
          </p>
          <h2 id="welcome-heading">{isEnglish ? 'Welcome to Deo' : 'देव में आपका स्वागत है'}</h2>
          <p>
            {isEnglish
              ? 'Support at every step during this sacred festival of faith, arghya, and service.'
              : 'आस्था, अर्घ्य और सेवा के इस पावन पर्व में आपकी हर कदम पर सहायता।'}
          </p>
          <div className="welcome-panel__waves" aria-hidden="true">
            <svg viewBox="0 0 600 70" preserveAspectRatio="none">
              <path d="M0 25 C90 3 150 49 250 25 S410 4 600 28 V70 H0Z" />
              <path d="M0 42 C100 20 180 62 290 39 S480 22 600 44" />
            </svg>
          </div>
        </section>

        <button
          type="button"
          onClick={() => navigate(HOME_EMERGENCY_SCREEN)}
          className="home-emergency-action"
          aria-label={isEnglish ? 'Open emergency assistance options' : 'आपातकालीन सहायता विकल्प खोलें'}
        >
          <span className="home-emergency-action__icon" aria-hidden="true">
            <Siren className="h-6 w-6" />
          </span>
          <span className="home-emergency-action__text">
            <strong>{isEnglish ? 'Emergency assistance' : 'आपातकालीन सहायता'}</strong>
            <small>
              {isEnglish
                ? 'View assistance options available in an emergency'
                : 'आपात स्थिति में उपलब्ध सहायता विकल्प देखें'}
            </small>
          </span>
          <span className="home-emergency-action__arrow" aria-hidden="true">›</span>
        </button>

        {/* Chhath Arghya Timings & Live Sun Countdown */}
        <ChhathArghyaMuhurat language={language} />

        {/* 36-Hour Nirjala Fasting Tracker with Live Arghya Pipeline */}
        <ChhathVratiFastingTracker
          onOpenCompass={() => setShowSolarCompassModal(true)}
          onOpenChecklist={() => setShowChecklistModal(true)}
        />

        {/* 4 Unique Spiritual & Pilgrim Companion Action Cards */}
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
              onClick={() => navigate('prasad-camps')}
              className="p-3 bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent border-2 border-emerald-400/70 rounded-2xl flex flex-col items-center text-center shadow-xs hover:border-emerald-500 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/25 text-emerald-950 flex items-center justify-center text-lg mb-1 shrink-0 font-bold">
                🎋
              </div>
              <span className="text-xs font-black text-stone-900 leading-tight">
                {isEnglish ? 'Prasad Camps' : 'निःशुल्क शिविर'}
              </span>
              <span className="text-[10px] text-stone-600 font-semibold mt-0.5">
                {isEnglish ? 'Soop, Milk, Daura' : 'सूप, दूध व ठेकुआ'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowChecklistModal(true)}
              className="p-3 bg-gradient-to-br from-sky-500/20 via-blue-500/15 to-transparent border-2 border-sky-400/70 rounded-2xl flex flex-col items-center text-center shadow-xs hover:border-sky-500 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500/25 text-sky-950 flex items-center justify-center text-lg mb-1 shrink-0 font-bold">
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
