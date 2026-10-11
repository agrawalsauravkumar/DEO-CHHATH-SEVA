import React from 'react';
import { useApp } from '../context/AppContext';
import { LocationPermissionModal } from '../components/LocationPermissionModal';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { BrandFooter, OnlineOfflineBadge } from '../components/ChhathThemeComponents';
import { ScreenId } from '../types';

const primaryActions: {
  id: ScreenId;
  icon: string;
  title: string;
  description: string;
  style: string;
}[] = [
  { id: 'search', icon: '🧭', title: 'मुझे रास्ता दिखाएँ', description: 'जगह खोजें', style: 'home-service-card--blue' },
  { id: 'parking', icon: '🅿️', title: 'पार्किंग', description: 'पार्किंग की जानकारी', style: 'home-service-card--gold' },
  { id: 'shuttle', icon: '🛺', title: 'निःशुल्क शटल', description: 'ई-रिक्शा व शटल', style: 'home-service-card--green' },
  { id: 'medical', icon: '🚑', title: 'चिकित्सा', description: 'चिकित्सा व प्राथमिक उपचार', style: 'home-service-card--orange' },
  { id: 'help', icon: '🆘', title: 'सहायता', description: 'मदद के विकल्प', style: 'home-service-card--red' },
  { id: 'toilet', icon: '🚻', title: 'शौचालय', description: 'शौचालय की जानकारी', style: 'home-service-card--blue' },
  { id: 'water', icon: '💧', title: 'पेयजल', description: 'पेयजल केंद्र', style: 'home-service-card--blue' },
  { id: 'family', icon: '👨‍👩‍👧', title: 'मेरा परिवार', description: 'परिवार सुरक्षा', style: 'home-service-card--gold' },
];

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
          <span aria-live="polite">
            {deviceLocation
              ? locationStatus === 'low-accuracy'
                ? `📍 अनुमानित GPS • सटीकता ±${Math.round(deviceLocation.accuracy)} मीटर`
                : locationStatus === 'success'
                  ? `📍 GPS • सटीकता ±${Math.round(deviceLocation.accuracy)} मीटर`
                  : `📍 अंतिम GPS स्थान • सटीकता ±${Math.round(deviceLocation.accuracy)} मीटर`
              : '📍 GPS स्थान उपलब्ध नहीं'}
          </span>
        </div>
      </header>

      <main className="home-content">
        <section className="welcome-panel" aria-labelledby="welcome-heading">
          <div className="welcome-panel__sun" aria-hidden="true" />
          <p className="welcome-panel__eyebrow">देव • औरंगाबाद • बिहार</p>
          <h2 id="welcome-heading">देव में आपका स्वागत है</h2>
          <p>छठ पूजा के दौरान रास्ता, जरूरी सुविधाएँ और सहायता आसानी से खोजें।</p>
          <div className="welcome-panel__waves" aria-hidden="true">
            <svg viewBox="0 0 600 70" preserveAspectRatio="none">
              <path d="M0 25 C90 3 150 49 250 25 S410 4 600 28 V70 H0Z" />
              <path d="M0 42 C100 20 180 62 290 39 S480 22 600 44" />
            </svg>
          </div>
        </section>

        <section aria-labelledby="services-heading" className="home-services">
          <div className="home-section-heading">
            <div>
              <p>श्रद्धालुओं के लिए</p>
              <h2 id="services-heading">सेवाएँ खोजें</h2>
            </div>
            <span aria-hidden="true">☀️</span>
          </div>
          <div className="home-service-grid">
            {primaryActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => navigate(action.id)}
                className={`home-service-card ${action.style}`}
                aria-label={`${action.title} — ${action.description}`}
              >
                <span className="home-service-card__icon" aria-hidden="true">{action.icon}</span>
                <span className="home-service-card__title">{action.title}</span>
                <span className="home-service-card__description">{action.description}</span>
              </button>
            ))}
          </div>
          <p className="home-data-note" role="note">
            सेवाओं की उपलब्धता की जानकारी तभी दिखेगी जब अधिकृत स्रोत से डेटा उपलब्ध होगा।
          </p>
        </section>

        <section className="home-secondary-actions" aria-label="अन्य विकल्प">
          <button type="button" onClick={openMyLocation}>
            <span aria-hidden="true">📍</span>
            <span>मेरा स्थान</span>
          </button>
          <button type="button" onClick={() => navigate('volunteer')}>
            <span aria-hidden="true">❤️</span>
            <span>सेवा करें</span>
          </button>
          <button type="button" onClick={() => navigate('about')}>
            <span aria-hidden="true">ℹ️</span>
            <span>हमारे बारे में</span>
          </button>
        </section>

        <button
          type="button"
          onClick={() => navigate('announcements')}
          className="home-announcements-link"
        >
          <span aria-hidden="true">📢</span>
          <span>
            <strong>सूचनाएँ</strong>
            <small>अधिकृत घोषणा उपलब्ध होने पर यहाँ देखें</small>
          </span>
          <span aria-hidden="true">→</span>
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
