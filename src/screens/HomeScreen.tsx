import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { LocationPermissionModal } from '../components/LocationPermissionModal';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { BrandFooter, OnlineOfflineBadge } from '../components/ChhathThemeComponents';
import { HOME_EMERGENCY_SCREEN, HOME_PRIMARY_ACTIONS } from './homeActions';
import { FacilityService } from '../services/FacilityService';
import { AnnouncementService } from '../services/AnnouncementService';
import {
  ArrowRight,
  Bell,
  HeartHandshake,
  MapPin,
  Shield,
  Siren,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
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
  const [operationalDataStatus, setOperationalDataStatus] = useState<'LOADING' | 'READY' | 'EMPTY' | 'ERROR'>('LOADING');

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
    <div className="min-h-[100dvh] bg-[var(--chhath-cream)] pb-24 flex flex-col font-['Mukta',sans-serif]">
      <header className="home-brand-header">
        <div className="home-brand-header__top">
          <button
            type="button"
            onClick={() => navigate('about')}
            aria-label="DEO CHHATH SEVA के बारे में"
            className="home-brand-header__logo-button"
          >
            <DeoChhathSevaLogo size={56} className="home-brand-header__logo" />
          </button>
          <div className="home-brand-header__identity">
            <h1>DEO CHHATH SEVA</h1>
            <p>रास्ता भी • सहायता भी • सेवा भी</p>
            <span>NEXTGEN DEVBHOOMI FOUNDATION</span>
          </div>
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? 'profile' : 'login')}
            className="home-account-button"
            aria-label={isAuthenticated ? 'मेरी प्रोफ़ाइल खोलें' : 'लॉगिन करें'}
          >
            {isAuthenticated ? currentUser?.fullName?.split(' ')[0] || 'प्रोफ़ाइल' : 'लॉगिन'}
          </button>
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
              : 'GPS स्थान उपलब्ध नहीं'}
          </span>
        </div>
      </header>

      <main className="home-content">
        <section className="welcome-panel" aria-labelledby="welcome-heading">
          <div className="welcome-panel__sun" aria-hidden="true" />
          <div className="welcome-panel__devotional-scene" aria-hidden="true">
            <svg viewBox="0 0 260 190" role="presentation">
              <defs>
                <linearGradient id="ghat-water" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f7b65d" stopOpacity=".72" />
                  <stop offset="1" stopColor="#f7b65d" stopOpacity=".08" />
                </linearGradient>
              </defs>
              <circle cx="185" cy="51" r="29" fill="#ffd36a" opacity=".88" />
              <path d="M116 104h144v86H116z" fill="url(#ghat-water)" />
              <path d="M0 115c36-14 72-14 110 0s78 13 150-2" fill="none" stroke="#ffd36a" strokeOpacity=".55" strokeWidth="2" />
              <path d="M0 139c42-12 74-12 110 0s88 12 150-2M0 165c42-12 74-12 110 0s88 12 150-2" fill="none" stroke="#fff1ca" strokeOpacity=".42" strokeWidth="2" />
              <path d="M133 110V88h22V73l16 15h34v22M128 88h83M166 73V59h12v14M171 59V48h3v11" fill="none" stroke="#fff1ca" strokeOpacity=".72" strokeWidth="3" strokeLinejoin="round" />
              <path d="M34 126h25l-4 8H39z" fill="#ffd36a" />
              <path d="M45 126c0-7 7-7 7 0M43 119c2-5 8-6 11-2" fill="none" stroke="#fff1ca" strokeWidth="2" strokeLinecap="round" />
              <circle cx="46" cy="112" r="5" fill="#e7a65c" />
              <path d="M39 126c0-8 3-12 7-12s8 4 8 12M45 116l-7 6m10-6 7 6" fill="none" stroke="#fff1ca" strokeWidth="3" strokeLinecap="round" />
              <path d="M79 133h18l-3 6H82z" fill="#f5c36b" />
              <circle cx="88" cy="116" r="4" fill="#e7a65c" />
              <path d="M82 132c0-9 2-13 6-13s7 4 7 13m-7-12-7 6m9-6 7 5" fill="none" stroke="#fff1ca" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <p className="welcome-panel__eyebrow">देव • औरंगाबाद • बिहार</p>
          <h2 id="welcome-heading">देव में आपका स्वागत है</h2>
          <p>आस्था, अर्घ्य और सेवा के इस पावन पर्व में आपकी हर कदम पर सहायता।</p>
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
          aria-label="आपातकालीन सहायता विकल्प खोलें"
        >
          <span className="home-emergency-action__icon" aria-hidden="true">
            <Siren className="h-6 w-6" />
          </span>
          <span className="home-emergency-action__text">
            <strong>आपातकालीन सहायता</strong>
            <small>आपात स्थिति में उपलब्ध सहायता विकल्प देखें</small>
          </span>
          <span className="home-emergency-action__arrow" aria-hidden="true">›</span>
        </button>

        <section aria-labelledby="services-heading" className="home-services">
          <div className="home-section-heading">
            <div>
              <p>श्रद्धालुओं के लिए</p>
              <h2 id="services-heading">सेवाएँ खोजें</h2>
            </div>
            <span className="home-section-heading__sun" aria-hidden="true">☼</span>
          </div>
          <div className="home-service-grid">
            {HOME_PRIMARY_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => navigate(action.id)}
                className={`home-service-card ${action.style}`}
                aria-label={`${action.title} — ${action.description}`}
              >
                <span className="home-service-card__icon" aria-hidden="true">
                  <action.icon className="h-6 w-6" aria-hidden />
                </span>
                <span className="home-service-card__title">{action.title}</span>
                <span className="home-service-card__description">{action.description}</span>
              </button>
            ))}
          </div>
          <p className="home-data-note" role="note">
            {operationalDataStatus === 'LOADING'
              ? 'अधिकृत सुविधा और सूचना डेटा सर्वर से प्राप्त किया जा रहा है…'
              : operationalDataStatus === 'READY'
                ? 'सुविधा और सूचना विवरण सर्वर से सिंक किए गए हैं; स्थल पर पहुँचकर उपलब्धता की पुष्टि करें।'
                : operationalDataStatus === 'EMPTY'
                  ? 'अभी सर्वर पर कोई सत्यापित सुविधा या सक्रिय सूचना उपलब्ध नहीं है।'
                  : 'सर्वर से परिचालन डेटा उपलब्ध नहीं हो सका। कृपया कनेक्शन मिलने पर पुनः प्रयास करें।'}
          </p>
        </section>

        <section className="home-secondary-actions" aria-label="अन्य विकल्प">
          <button type="button" onClick={openMyLocation}>
            <MapPin className="h-5 w-5" aria-hidden />
            <span>मेरा स्थान</span>
          </button>
          <button type="button" onClick={() => navigate('volunteer')}>
            <HeartHandshake className="h-5 w-5" aria-hidden />
            <span>सेवा करें</span>
          </button>
          <button type="button" onClick={() => navigate('about')}>
            <Shield className="h-5 w-5" aria-hidden />
            <span>हमारे बारे में</span>
          </button>
        </section>

        <button
          type="button"
          onClick={() => navigate('announcements')}
          className="home-announcements-link"
        >
          <Bell className="h-5 w-5 shrink-0 text-[var(--chhath-river-blue)]" aria-hidden />
          <span>
            <strong>सूचनाएँ</strong>
            <small>अधिकृत घोषणा उपलब्ध होने पर यहाँ देखें</small>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
        </button>

        <BrandFooter className="pt-5 pb-2" />
      </main>

      <LocationPermissionModal
        isOpen={showPrePermissionModal}
        onClose={() => setShowPrePermissionModal(false)}
        onGranted={() => {
          setShowPrePermissionModal(false);
          navigate('map');
        }}
      />
    </div>
  );
};
