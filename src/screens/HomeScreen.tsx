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
          {/* Sacred Surya Bhagwan & Arghya Vector Scene */}
          <div className="welcome-panel__devotional-scene" aria-hidden="true">
            <svg viewBox="0 0 220 200" fill="none" role="presentation" className="w-full h-auto drop-shadow-md">
              <defs>
                <radialGradient id="suryaDiscGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFDE7" />
                  <stop offset="35%" stopColor="#FFF176" />
                  <stop offset="70%" stopColor="#FFB300" />
                  <stop offset="90%" stopColor="#FB8C00" />
                  <stop offset="100%" stopColor="#E65100" />
                </radialGradient>
                <radialGradient id="suryaAuraGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#FF9800" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#FF6F00" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="waterRipplesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0B5E8E" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#29B6F6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0288D1" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="soopGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE082" />
                  <stop offset="50%" stopColor="#FFB300" />
                  <stop offset="100%" stopColor="#FF8F00" />
                </linearGradient>
              </defs>

              {/* Radiant Solar Aura */}
              <circle cx="155" cy="68" r="58" fill="url(#suryaAuraGlow)" />

              {/* 12 Sacred Solar Rays (Aditya Mandalam) */}
              <g stroke="#FFD54F" strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
                <line x1="155" y1="20" x2="155" y2="6" />
                <line x1="179" y1="26" x2="189" y2="16" />
                <line x1="197" y1="44" x2="210" y2="38" />
                <line x1="203" y1="68" x2="217" y2="68" />
                <line x1="197" y1="92" x2="210" y2="98" />
                <line x1="179" y1="110" x2="189" y2="120" />
                <line x1="155" y1="116" x2="155" y2="130" />
                <line x1="131" y1="110" x2="121" y2="120" />
                <line x1="113" y1="92" x2="100" y2="98" />
                <line x1="107" y1="68" x2="93" y2="68" />
                <line x1="113" y1="44" x2="100" y2="38" />
                <line x1="131" y1="26" x2="121" y2="16" />
              </g>

              {/* Secondary Intermediate Rays */}
              <g stroke="#FFA000" strokeWidth="1.8" strokeLinecap="round" opacity="0.75">
                <line x1="168" y1="22" x2="174" y2="12" />
                <line x1="190" y1="34" x2="200" y2="26" />
                <line x1="202" y1="56" x2="214" y2="52" />
                <line x1="202" y1="80" x2="214" y2="84" />
                <line x1="190" y1="102" x2="200" y2="110" />
                <line x1="168" y1="114" x2="174" y2="124" />
                <line x1="142" y1="114" x2="136" y2="124" />
                <line x1="120" y1="102" x2="110" y2="110" />
                <line x1="108" y1="80" x2="96" y2="84" />
                <line x1="108" y1="56" x2="96" y2="52" />
                <line x1="120" y1="34" x2="110" y2="26" />
                <line x1="142" y1="22" x2="136" y2="12" />
              </g>

              {/* Sacred Surya Central Disc */}
              <circle cx="155" cy="68" r="30" fill="url(#suryaDiscGrad)" stroke="#FFE082" strokeWidth="2.5" />
              <circle cx="155" cy="68" r="26" fill="none" stroke="#FF8F00" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

              {/* Sacred Tilak / Aditya Symbol */}
              <g transform="translate(155, 68)" fill="#D84315">
                <circle cx="0" cy="0" r="2.8" />
                <path d="M -6, -2 Q 0, -5 6, -2 Q 0, -3.5 -6, -2 Z" />
                <path d="M 0, -6 L 1.2, -2.5 L -1.2, -2.5 Z" />
              </g>

              {/* Sacred Holy Waters of Surya Kund */}
              <path d="M 25,142 C 65,134 115,148 160,138 C 188,132 208,140 220,136 L 220,200 L 25,200 Z" fill="url(#waterRipplesGrad)" opacity="0.5" />
              <path d="M 15,158 C 60,150 108,162 155,154 C 182,150 204,156 220,153 L 220,200 L 15,200 Z" fill="url(#waterRipplesGrad)" opacity="0.85" />
              <path d="M 35,150 C 75,144 125,156 165,148" stroke="#E1F5FE" strokeWidth="2" fill="none" opacity="0.75" />
              <path d="M 55,168 C 100,162 145,172 190,166" stroke="#FFF9C4" strokeWidth="1.8" fill="none" opacity="0.6" />

              {/* Traditional Arghya Soop & Floating Diya */}
              <g transform="translate(108, 132)">
                <path d="M 6,24 C 14,14 48,14 56,24 C 58,30 50,38 31,38 C 12,38 4,30 6,24 Z" fill="url(#soopGoldGrad)" stroke="#FFA000" strokeWidth="1.5" />
                <circle cx="31" cy="22" r="6" fill="#6D4C41" stroke="#4E342E" strokeWidth="1" />
                <path d="M 24,28 C 27,24 35,24 38,28 C 39,31 35,33 31,33 C 27,33 23,31 24,28 Z" fill="#FFB300" stroke="#E65100" strokeWidth="1" />
                <path d="M 31,17 C 33,20 34,23 32,25 C 31,26 30,25 30,23 C 30,21 30.5,18 31,17 Z" fill="#FFF9C4" stroke="#FF6F00" strokeWidth="1" />
              </g>
            </svg>
          </div>

          {/* Devotional Welcome Content */}
          <div className="welcome-panel__content">
            <div className="welcome-panel__badge-row">
              <span className="welcome-panel__badge">
                🚩 {isEnglish ? 'Deoark Dham • Aurangabad (Bihar)' : 'देवार्क धाम • औरंगाबाद (बिहार)'}
              </span>
              <span className="welcome-panel__chant">॥ ॐ सूर्याय नमः ॥</span>
            </div>

            <h2 id="welcome-heading" className="welcome-panel__title">
              {isEnglish ? 'Welcome to Sacred Deoark Dham' : 'देव की पावन धरती पर आपका हार्दिक स्वागत है'}
            </h2>

            <p className="welcome-panel__description">
              {isEnglish
                ? 'Devotional support at every step during this sacred festival of faith, arghya, and seva.'
                : 'छठ व्रतियों एवं श्रद्धालुओं की सेवा में आपका स्वागत है। आपकी यात्रा सुरक्षित और मंगलमय हो।'}
            </p>

            <div className="welcome-panel__pills">
              <span className="welcome-panel__pill">☀️ {isEnglish ? 'Sun Temple (1437 AD)' : '100 फ़ीट सूर्य मंदिर (1437 ई.)'}</span>
              <span className="welcome-panel__pill">🌊 {isEnglish ? 'Surya Kund Holy Ghat' : 'सूर्य कुंड महातीर्थ'}</span>
              <span className="welcome-panel__pill">🎋 {isEnglish ? 'Jai Chhathi Maiya' : '॥ जय छठी मईया ॥'}</span>
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
