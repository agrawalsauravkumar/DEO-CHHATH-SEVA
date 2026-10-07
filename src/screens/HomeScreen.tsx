import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LocationPermissionModal } from '../components/LocationPermissionModal';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { ChhathSunriseBackdrop } from '../components/ChhathSunriseBackdrop';
import { BrandFooter, OnlineOfflineBadge } from '../components/ChhathThemeComponents';
import { DeoSuryaMandirHero } from '../components/DeoSuryaMandirHero';
import { ChhathGhatDirectory } from '../components/ChhathGhatDirectory';
import { ChhathSafetySection } from '../components/ChhathSafetySection';
import { ChhathVratiModeSection } from '../components/ChhathVratiModeSection';
import { InstallAppBanner } from '../components/InstallAppBanner';
import { AnnouncementService } from '../services/AnnouncementService';
import { VoiceService } from '../services/VoiceService';
import { OfficialAnnouncement } from '../types';
import {
  Compass,
  MapPin,
  Heart,
  Info,
  Megaphone,
  DownloadCloud,
  CheckCircle2,
  ArrowRight,
  Shield,
  WifiOff,
  Crosshair,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Volume2,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    navigate,
    userLocationGranted,
    deviceLocation,
    locationStatus,
    savedParking,
    offlineMapDownloaded,
    isOnline,
    seniorMode,
    showPrePermissionModal,
    setShowPrePermissionModal,
    isDeveloperSimulatedLocation,
    setDeveloperSimulatedLocation,
    currentUser,
    isAuthenticated,
  } = useApp();

  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(false);
  const [urgentAlert, setUrgentAlert] = useState<OfficialAnnouncement | null>(null);

  useEffect(() => {
    const alert = AnnouncementService.getTopUrgentAlert();
    setUrgentAlert(alert);
    if (alert && (seniorMode || alert.priority === 'EMERGENCY')) {
      // Voice notify on urgent alert if senior mode is active
      VoiceService.speak(`आपातकालीन सूचना: ${alert.title}`, false);
    }
  }, [seniorMode]);

  const handleDismissAlert = (id: string) => {
    AnnouncementService.dismissUrgentAlert(id);
    setUrgentAlert(null);
  };

  const handleMyLocationClick = () => {
    if (!deviceLocation && !userLocationGranted) {
      setShowPrePermissionModal(true);
    } else {
      navigate('map');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/60 pb-20 flex flex-col font-['Mukta',sans-serif]">
      {/* ============================================================ */}
      {/* TOP SECTION - CHHATH PUJA VISUAL IDENTITY                    */}
      {/* ============================================================ */}
      <header className="relative bg-gradient-to-b from-[#0B5E8E] via-[#073B5A] to-[#041E2F] text-white border-b-2 border-[#FFD54F]/70 px-4 pt-4 pb-3 shadow-md overflow-hidden">
        {/* Subtle Sunrise Backdrop in Header */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <ChhathSunriseBackdrop height={140} />
        </div>

        <div className="relative z-10 max-w-lg mx-auto space-y-2.5">
          {/* Main Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('about')}
                title="DEO CHHATH SEVA - NEXTGEN DEVBHOOMI FOUNDATION"
                className="shrink-0 active:scale-95 transition-transform"
              >
                <DeoChhathSevaLogo size={48} className="drop-shadow-md" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                  DEO CHHATH SEVA
                </h1>
                <span className="text-[10.5px] sm:text-[11px] font-black text-[#FFD54F] tracking-wide block mt-0.5">
                  NEXTGEN DEVBHOOMI FOUNDATION
                </span>
                <span className="text-[9.5px] font-semibold text-[#FFF8E1]/80 block">
                  रास्ता भी • सहायता भी • सेवा भी
                </span>
              </div>
            </div>

            {/* Right Side Header Action: Offline status & Auth Profile */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate('offline-map')}
                className={`min-h-[36px] px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 border ${
                  offlineMapDownloaded
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                    : 'bg-white/10 text-[#FFF8E1] border-white/20 hover:bg-white/20'
                }`}
                title="ऑफलाइन मैप स्थिति"
              >
                <span className="text-xs">
                  {offlineMapDownloaded ? '🟢' : '⚪'}
                </span>
                <span className="text-[10px] font-bold hidden sm:inline">
                  {offlineMapDownloaded ? 'Offline Map' : 'Offline'}
                </span>
              </button>

              <button
                onClick={() => navigate(isAuthenticated ? 'profile' : 'login')}
                className={`min-h-[36px] px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border shadow-xs ${
                  isAuthenticated
                    ? 'bg-[#FFD54F] text-stone-950 border-amber-300 hover:bg-amber-300'
                    : 'bg-[#FF8C42] text-white border-orange-400 hover:bg-[#F97316]'
                }`}
                title={isAuthenticated ? 'मेरी प्रोफ़ाइल' : 'लॉगिन करें'}
              >
                <span>{isAuthenticated ? '👤' : '🔑'}</span>
                <span className="text-[11px] font-black whitespace-nowrap">
                  {isAuthenticated ? (currentUser?.fullName?.split(' ')[0] || 'प्रोफ़ाइल') : 'लॉगिन'}
                </span>
              </button>
            </div>
          </div>

          {/* Network Connectivity & Offline Status Bar */}
          <div className="flex items-center justify-between text-xs px-1">
            <OnlineOfflineBadge isOnline={isOnline} />

            {deviceLocation && (
              <span className="text-[#FFD54F] font-bold flex items-center gap-1">
                <span>📍</span>
                <span>GPS उपलब्ध</span>
              </span>
            )}
          </div>

          {/* Optional Install PWA Banner (Step 21 Requirement 16) */}
          <InstallAppBanner />

          {/* Offline Mode Banner (when internet is unavailable) */}
          {!isOnline && (
            <div
              onClick={() => navigate('offline')}
              className="bg-amber-50 border-2 border-amber-300 rounded-2xl px-3 py-2 text-xs text-amber-950 space-y-0.5 animate-fade-in shadow-xs cursor-pointer hover:bg-amber-100/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black">
                  <span>🟠 आप Offline हैं</span>
                  <span className="font-semibold text-amber-900">• कुछ सुविधाएँ सीमित हो सकती हैं।</span>
                </div>
                <span className="text-[10px] font-black underline text-amber-800">विवरण देखें →</span>
              </div>
              <p className="text-[11px] text-amber-900">
                “इंटरनेट उपलब्ध नहीं है। ऑफलाइन जानकारी का उपयोग किया जा रहा है।”
              </p>
            </div>
          )}

          {/* Urgent / Emergency Alert Banner per Requirement 12 */}
          {urgentAlert && (
            <div className="bg-gradient-to-r from-rose-50 to-orange-50 border-2 border-rose-400 rounded-2xl p-3 shadow-sm text-xs text-stone-900 space-y-2 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-black text-rose-800">
                  <span className="text-base animate-bounce">🚨</span>
                  <span>महत्वपूर्ण अलर्ट: {urgentAlert.title}</span>
                </div>
                <button
                  onClick={() => handleDismissAlert(urgentAlert.id)}
                  className="text-stone-400 hover:text-stone-700 p-0.5 rounded-lg text-sm"
                  title="हटाएं"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-stone-700 leading-relaxed font-medium bg-white/70 p-2 rounded-xl border border-rose-100">
                {urgentAlert.shortDescription}
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                  {urgentAlert.source}
                </span>
                <button
                  onClick={() => navigate('announcements')}
                  className="font-bold text-stone-900 bg-amber-400 hover:bg-amber-500 px-2.5 py-1 rounded-lg shadow-2xs flex items-center gap-1 active:scale-95 transition-all"
                >
                  <span>विस्तार से देखें</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Location Bar Row: REAL GPS LOCATION STATUS (No fake fixed location) */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">📍</span>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  आपका स्थान
                </span>
                {deviceLocation ? (
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-emerald-800 truncate">
                      📍 Location उपलब्ध
                    </p>
                    <button
                      onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                      className="text-[10px] text-stone-500 hover:text-stone-800 underline flex items-center"
                    >
                      <span>विवरण</span>
                      {showDetailsPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-stone-600 truncate">
                    📍 Location उपलब्ध नहीं है
                  </p>
                )}
              </div>
            </div>

            {/* Location Action Button */}
            {deviceLocation ? (
              <button
                onClick={() => navigate('map')}
                className="shrink-0 px-2.5 py-1 bg-amber-100/80 hover:bg-amber-200/90 text-amber-900 text-xs font-bold rounded-lg transition-colors"
              >
                नक्शे पर देखें
              </button>
            ) : (
              <button
                onClick={() => setShowPrePermissionModal(true)}
                className="shrink-0 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs active:scale-95 transition-all"
              >
                स्थान की अनुमति दें
              </button>
            )}
          </div>

          {/* Secondary Details Panel (Shows Lat/Long/Accuracy cleanly) */}
          {showDetailsPanel && deviceLocation && (
            <div className="bg-stone-100/90 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-700 space-y-1 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">आपका वर्तमान स्थान:</span>
                <span className="text-[10px] text-stone-500">
                  सटीकता: ±{deviceLocation.accuracy} मीटर
                </span>
              </div>
              <div className="font-mono text-[11px] text-stone-600 bg-white p-1.5 rounded border border-stone-200 flex justify-between">
                <span>Lat: {deviceLocation.latitude.toFixed(5)}°</span>
                <span>Long: {deviceLocation.longitude.toFixed(5)}°</span>
              </div>
              {deviceLocation.isSimulated && (
                <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded inline-block font-semibold">
                  (डेवलपर टेस्ट सिमुलेशन मोड)
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA                                            */}
      {/* ============================================================ */}
      <main className="flex-1 max-w-lg mx-auto w-full px-3.5 sm:px-4 py-4 space-y-4">
        {/* ============================================================ */}
        {/* DEO SURYA MANDIR HERO CARD (Highlighting the sacred temple)  */}
        {/* ============================================================ */}
        <DeoSuryaMandirHero />

        {/* ============================================================ */}
        {/* 1. CHHATH VRATI / DEVOTEE FRIENDLY MODE (Requirement 20)      */}
        {/* ============================================================ */}
        <ChhathVratiModeSection />

        {/* ============================================================ */}
        {/* MAIN ACTIONS (Most prominent elements on the screen)        */}
        {/* ============================================================ */}
        <section aria-label="मुख्य सेवाएं" className="space-y-2.5">
          {/* 1. 🧭 मुझे रास्ता दिखाएँ (Primary Highlight Action) */}
          <button
            onClick={() => navigate('search')}
            className="w-full min-h-[76px] p-4 bg-gradient-to-r from-[#0B5E8E] via-[#073B5A] to-[#041E2F] hover:from-[#073B5A] hover:to-[#0B5E8E] text-white rounded-3xl shadow-lg flex items-center justify-between active:scale-98 transition-all group border-2 border-[#FFD54F]/70"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 backdrop-blur-xs flex items-center justify-center shrink-0 text-3xl shadow-sm group-hover:scale-105 transition-transform">
                🧭
              </div>
              <div className="text-left">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white block leading-tight">
                  मुझे रास्ता दिखाएँ
                </span>
                <span className="text-xs sm:text-sm text-amber-200/90 font-medium block mt-0.5">
                  देव सूर्य मंदिर, सूर्य कुंड, घाट व सुगम मार्ग
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </button>

          {/* ============================================================ */}
          {/* 2. CHHATH GHAT DIRECTORY (Requirement 16)                    */}
          {/* ============================================================ */}
          <ChhathGhatDirectory />

          {/* Optional Home shortcut: 🚗 मेरी गाड़ी (Only shown if user has saved a parking location) */}
          {savedParking && (
            <button
              onClick={() => navigate('my-parking')}
              className="w-full p-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-300 rounded-2xl shadow-xs text-left flex items-center justify-between active:scale-98 transition-all group animate-fade-in"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-2xl shadow-xs group-hover:scale-105 transition-transform">
                  🚗
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider block">
                    🚗 मेरी गाड़ी (Saved Vehicle)
                  </span>
                  <span className="text-sm font-black text-stone-900 block truncate">
                    {savedParking.parkingName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-black text-indigo-700 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shrink-0">
                <span>गाड़ी देखें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          )}

        {/* ============================================================ */}
        {/* CHHATH SEVA SECTION (Part 18: 🙏 छठ सेवा)                   */}
        {/* ============================================================ */}
        <section aria-label="छठ सेवा" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🙏</span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                  छठ सेवा (Essential Services)
                </h3>
                <p className="text-[11px] text-stone-500 font-bold">
                  श्रद्धालुओं हेतु 8 प्रमुख नि:शुल्क सेवा केंद्र
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-full shrink-0">
              निःशुल्क सेवा
            </span>
          </div>

          {/* 2-Column Grid for Key Actions */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {/* 🅿️ Parking */}
            <button
              onClick={() => navigate('parking')}
              className="min-h-[76px] p-3.5 bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl shadow-xs text-left flex items-center gap-3 active:scale-98 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                🅿️
              </div>
              <div className="min-w-0">
                <span className="text-lg font-black text-stone-900 block leading-tight">
                  Parking
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  वाहन पड़ाव स्थल
                </span>
              </div>
            </button>

            {/* 🛺 Shuttle */}
            <button
              onClick={() => navigate('shuttle')}
              className="min-h-[76px] p-3.5 bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl shadow-xs text-left flex items-center gap-3 active:scale-98 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                🛺
              </div>
              <div className="min-w-0">
                <span className="text-lg font-black text-stone-900 block leading-tight">
                  Shuttle
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  मुफ्त ई-रिक्शा सेवा
                </span>
              </div>
            </button>

            {/* 🚑 Medical */}
            <button
              onClick={() => navigate('medical')}
              className="min-h-[76px] p-3.5 bg-white border-2 border-rose-200 hover:border-rose-400 rounded-2xl shadow-xs text-left flex items-center gap-3 active:scale-98 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                🚑
              </div>
              <div className="min-w-0">
                <span className="text-lg font-black text-stone-900 block leading-tight">
                  Medical
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  प्राथमिक चिकित्सा
                </span>
              </div>
            </button>

            {/* 🆘 सहायता */}
            <button
              onClick={() => navigate('help')}
              className="min-h-[76px] p-3.5 bg-white border-2 border-amber-300 hover:border-amber-500 rounded-2xl shadow-xs text-left flex items-center gap-3 active:scale-98 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                🆘
              </div>
              <div className="min-w-0">
                <span className="text-lg font-black text-stone-900 block leading-tight">
                  सहायता
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  हेल्प डेस्क व सुरक्षा
                </span>
              </div>
            </button>

            {/* 🚻 Toilet */}
            <button
              onClick={() => navigate('toilet')}
              className="min-h-[76px] p-3.5 bg-white border-2 border-sky-200 hover:border-sky-400 rounded-2xl shadow-xs text-left flex items-center gap-3 active:scale-98 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                🚻
              </div>
              <div className="min-w-0">
                <span className="text-lg font-black text-stone-900 block leading-tight">
                  Toilet
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  बायो-शौचालय
                </span>
              </div>
            </button>

            {/* 💧 Water */}
            <button
              onClick={() => navigate('water')}
              className="min-h-[76px] p-3.5 bg-white border-2 border-cyan-200 hover:border-cyan-400 rounded-2xl shadow-xs text-left flex items-center gap-3 active:scale-98 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                💧
              </div>
              <div className="min-w-0">
                <span className="text-lg font-black text-stone-900 block leading-tight">
                  Water
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  शीतल शुद्ध पेयजल
                </span>
              </div>
            </button>
          </div>

          {/* 👨‍👩‍👧 मेरा परिवार & 🔎 खोया-पाया (Two Columns) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => navigate('family')}
              className="min-h-[76px] p-3.5 bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl shadow-xs text-left flex items-center gap-3 active:scale-98 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                👨‍👩‍👧
              </div>
              <div className="min-w-0">
                <span className="text-base font-black text-stone-900 block leading-tight">
                  मेरा परिवार
                </span>
                <span className="text-[11px] text-stone-500 font-medium truncate block">
                  सुरक्षा व मिलन स्थल
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate('lost-found')}
              className="min-h-[76px] p-3.5 bg-white border-2 border-amber-200 hover:border-amber-400 rounded-2xl shadow-xs text-left flex items-center gap-3 active:scale-98 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                🔎
              </div>
              <div className="min-w-0">
                <span className="text-base font-black text-stone-900 block leading-tight">
                  खोया-पाया
                </span>
                <span className="text-[11px] text-stone-500 font-medium truncate block">
                  व्यक्ति व सामान खोज
                </span>
              </div>
            </button>
          </div>
        </section>

          {/* 👴 वरिष्ठ नागरिक मोड (Subtle Shortcut per Requirement 27 in Step 15) */}
          <button
            onClick={() => navigate('senior-mode')}
            className="w-full min-h-[46px] px-3.5 py-2 bg-gradient-to-r from-amber-100/90 to-amber-50 hover:from-amber-200 hover:to-amber-100 border border-amber-300/80 rounded-2xl shadow-2xs flex items-center justify-between active:scale-98 transition-all group text-stone-900"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">👴</span>
              <span className="text-xs font-black text-amber-950">
                वरिष्ठ नागरिक मोड • बड़े अक्षर एवं आवाज़ सहायता
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-800 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </section>

        {/* ============================================================ */}
        {/* QUICK ACTIONS                                                */}
        {/* ============================================================ */}
        <section aria-label="त्वरित कार्य" className="pt-1">
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {/* 📍 मेरा स्थान */}
            <button
              onClick={handleMyLocationClick}
              className="min-h-[64px] p-3 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col items-center justify-center text-center active:scale-95 transition-all hover:bg-stone-50"
            >
              <span className="text-lg mb-0.5">📍</span>
              <span className="text-xs font-black text-stone-900 leading-tight">
                मेरा स्थान
              </span>
              <span className="text-[10px] text-stone-500">
                {deviceLocation ? 'GPS उपलब्ध' : 'नक्शा देखें'}
              </span>
            </button>

            {/* ❤️ सेवा करें */}
            <button
              onClick={() => navigate('volunteer')}
              className="min-h-[64px] p-3 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col items-center justify-center text-center active:scale-95 transition-all hover:bg-stone-50"
            >
              <span className="text-lg mb-0.5">❤️</span>
              <span className="text-xs font-black text-stone-900 leading-tight">
                सेवा करें
              </span>
              <span className="text-[10px] text-stone-500">स्वयंसेवक बनें</span>
            </button>

            {/* ℹ️ हमारे बारे में */}
            <button
              onClick={() => navigate('about')}
              className="min-h-[64px] p-3 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col items-center justify-center text-center active:scale-95 transition-all hover:bg-stone-50"
            >
              <span className="text-lg mb-0.5">ℹ️</span>
              <span className="text-xs font-black text-stone-900 leading-tight">
                हमारे बारे में
              </span>
              <span className="text-[10px] text-stone-500">फाउंडेशन</span>
            </button>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CHHATH SAFETY & CARE SECTION (Requirement 19)                */}
        {/* ============================================================ */}
        <ChhathSafetySection />

        {/* ============================================================ */}
        {/* OFFICIAL INFORMATION (📢 महत्वपूर्ण सूचना - Step 16)         */}
        {/* ============================================================ */}
        <section aria-label="महत्वपूर्ण सूचना" className="pt-1">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 border-2 border-amber-300 rounded-3xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📢</span>
                <div>
                  <h3 className="text-sm font-black text-amber-950 leading-tight">
                    महत्वपूर्ण सूचनाएँ (Official Bulletins)
                  </h3>
                  <span className="text-[11px] text-amber-800 font-medium">
                    मेला नियंत्रण कक्ष एवं जिला प्रशासन द्वारा सत्यापित
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>VERIFIED</span>
              </span>
            </div>

            <div className="bg-white/90 p-3 rounded-2xl border border-amber-200/80 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold">
                <span className="text-amber-900 font-bold">ताज़ा बुलेटिन:</span>
                <span>{AnnouncementService.getLastUpdatedTime()}</span>
              </div>
              <p className="text-xs font-black text-stone-900 leading-snug">
                {AnnouncementService.getActiveAnnouncements()[0]?.title ||
                  'छठ महापर्व हेतु यातायात व घाट संबंधी आधिकारिक दिशा-निर्देश जारी।'}
              </p>
              <p className="text-[11px] text-stone-600 line-clamp-2">
                {AnnouncementService.getActiveAnnouncements()[0]?.shortDescription ||
                  'सभी श्रद्धालु केवल चिन्हित मार्गों व अधिकृत पार्किंग स्थलों का ही प्रयोग करें।'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-amber-200/80 text-xs">
              <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-amber-700" /> जिला प्रशासन एवं मेला समिति
              </span>
              <button
                onClick={() => navigate('announcements')}
                className="font-black text-stone-950 bg-amber-400 hover:bg-amber-500 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 active:scale-95 transition-all text-xs"
              >
                <span>सभी सूचनाएँ देखें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* FOOTER ATTRIBUTION (BrandFooter component with exact naming)  */}
        {/* ============================================================ */}
        <BrandFooter className="pt-2 pb-2" />
      </main>

      {/* Pre-Permission Modal Dialog */}
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
