/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import {
  Compass,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Sun,
  LogIn,
  Shield,
  Sparkles,
  MapPin,
} from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { navigate, language } = useApp();
  const isEnglish = language === 'en';

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#031525] via-[#072846] via-[#0A3D66] to-[#041D33] text-white flex flex-col justify-between select-none font-['Noto_Sans_Devanagari','Inter',sans-serif] relative overflow-hidden">
      {/* ======================================================== */}
      {/* 1. ATMOSPHERIC CHHATH PUJA SUNRISE & GLOWING AURA        */}
      {/* ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radiating Heavenly Sun Flare behind emblem */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] bg-gradient-to-b from-[#FFA726]/35 via-[#FF7043]/20 to-transparent rounded-full blur-3xl animate-pulse" />

        {/* Outer Golden Halo Ring */}
        <div className="absolute top-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full border border-amber-300/10 pointer-events-none" />
        <div className="absolute top-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full border border-amber-400/5 pointer-events-none" />

        {/* Sacred Sunrise Ray Beams SVG */}
        <svg
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-[420px] opacity-35"
          viewBox="0 0 680 420"
          fill="none"
        >
          <circle cx="340" cy="110" r="85" fill="url(#holySuryaGlow)" />
          {/* Radial Sunrise Beams */}
          <line x1="340" y1="110" x2="40" y2="400" stroke="#FFE082" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <line x1="340" y1="110" x2="140" y2="415" stroke="#FFB74D" strokeWidth="2" opacity="0.7" />
          <line x1="340" y1="110" x2="240" y2="420" stroke="#FFA726" strokeWidth="1.5" strokeDasharray="5 2" opacity="0.8" />
          <line x1="340" y1="110" x2="340" y2="420" stroke="#FFD54F" strokeWidth="2.5" opacity="0.85" />
          <line x1="340" y1="110" x2="440" y2="420" stroke="#FFA726" strokeWidth="1.5" strokeDasharray="5 2" opacity="0.8" />
          <line x1="340" y1="110" x2="540" y2="415" stroke="#FFB74D" strokeWidth="2" opacity="0.7" />
          <line x1="340" y1="110" x2="640" y2="400" stroke="#FFE082" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <defs>
            <radialGradient id="holySuryaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFDF0" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#FFE082" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#FF7043" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Sacred River Water Ripples & Floating Diyas at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020B14] via-[#041628]/90 to-transparent">
          <svg className="absolute bottom-0 w-full h-24 opacity-45 text-[#38BDF8]" preserveAspectRatio="none" viewBox="0 0 1200 120">
            <path d="M0,50 C180,85 320,20 500,55 C680,90 920,30 1200,60 L1200,120 L0,120 Z" fill="#0C4A6E" />
            <path d="M0,70 C220,30 420,95 620,60 C820,20 1020,75 1200,48 L1200,120 L0,120 Z" fill="#0369A1" opacity="0.5" />
            <path d="M0,85 C240,55 450,105 650,75 C850,45 1050,90 1200,65 L1200,120 L0,120 Z" fill="#38BDF8" opacity="0.25" />
          </svg>

          {/* Floating Sacred Golden Diyas (प्रज्वलित दीप) on river surface */}
          <div className="absolute bottom-4 left-[15%] flex items-center gap-1 opacity-80 animate-bounce" style={{ animationDuration: '3.5s' }}>
            <span className="text-sm">🪔</span>
            <div className="w-4 h-1 bg-amber-400/40 rounded-full blur-xs" />
          </div>
          <div className="absolute bottom-8 right-[18%] flex items-center gap-1 opacity-85 animate-bounce" style={{ animationDuration: '4.2s' }}>
            <span className="text-base">🪔</span>
            <div className="w-5 h-1 bg-amber-400/50 rounded-full blur-xs" />
          </div>
          <div className="absolute bottom-5 left-[60%] flex items-center gap-1 opacity-70 animate-bounce" style={{ animationDuration: '4.8s' }}>
            <span className="text-xs">🪔</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOP AUSPICIOUS BENEDICTION & ORGANIZATION HEADER      */}
      {/* ======================================================== */}
      <header className="pt-4 sm:pt-6 px-4 text-center space-y-1.5 relative z-10">
        {/* Sacred Chhath Invocation */}
        <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-black tracking-widest text-[#FFD54F]">
          <Sparkles className="w-3.5 h-3.5 text-[#FFA726]" />
          <span>ॐ सूर्याय नमः • जय छठी मइया</span>
          <Sparkles className="w-3.5 h-3.5 text-[#FFA726]" />
        </div>

        {/* Foundation Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-[#FFD54F]/50 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
          <Sun className="w-3.5 h-3.5 text-[#FFB74D] animate-spin" style={{ animationDuration: '16s' }} />
          <span className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-200 font-black">
            NEXTGEN DEVBHOOMI FOUNDATION
          </span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-[#FFE082]/85 tracking-wider font-bold">
          {isEnglish ? 'PUBLIC DEVOTIONAL SERVICE INITIATIVE' : 'निःशुल्क जनसेवा व तीर्थ सुविधा पहल'}
        </p>
      </header>

      {/* ======================================================== */}
      {/* 3. DIVINE SACRED EMBLEM MEDALLION & SLOGAN               */}
      {/* ======================================================== */}
      <main className="my-auto flex flex-col items-center text-center space-y-3.5 py-2 px-4 sm:px-6 relative z-10 w-full max-w-sm mx-auto">
        {/* Sacred Medallion with Golden Halo */}
        <div className="relative flex items-center justify-center group">
          {/* Pulsing Sacred Amber Glow */}
          <div className="w-56 h-56 rounded-full bg-gradient-to-r from-[#FFA726]/40 via-[#FF7043]/30 to-[#FFD54F]/40 blur-2xl absolute animate-pulse" />

          {/* Golden Medallion Frame */}
          <div className="relative p-1.5 rounded-[2.8rem] bg-gradient-to-tr from-[#FFE082] via-[#FFA000] via-[#FFD54F] to-[#E65100] shadow-[0_12px_45px_rgba(245,158,11,0.45)] ring-4 ring-[#FFD54F]/30">
            <div className="overflow-hidden rounded-[2.4rem] bg-gradient-to-b from-white via-[#FFFDF7] to-[#FFF8E7] p-3 shadow-inner flex items-center justify-center border border-amber-100">
              <DeoChhathSevaLogo size={210} className="drop-shadow-none transition-transform group-hover:scale-102" />
            </div>
          </div>
        </div>

        {/* Location Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-[#FFD54F]/40 text-xs font-black text-[#FFE082] shadow-sm">
          <MapPin className="h-3.5 w-3.5 text-[#FF7043]" aria-hidden />
          <span>{isEnglish ? 'Deo Surya Mandir • Aurangabad • Bihar' : 'देव सूर्य मंदिर • औरंगाबाद • बिहार'}</span>
        </div>

        {/* Slogan Glass Card */}
        <div className="w-full py-3 px-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-amber-300/35 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-1">
          <p className="text-base sm:text-lg font-black bg-gradient-to-r from-[#FFE082] via-[#FFF9C4] to-[#FFD54F] bg-clip-text text-transparent tracking-tight">
            {isEnglish ? 'Navigation • Assistance • Service' : '“रास्ता भी • सहायता भी • सेवा भी”'}
          </p>
          <p className="text-[11px] sm:text-xs font-bold text-amber-100/90 leading-tight">
            {isEnglish ? 'Safety • Devotion • Seamless Pilgrim Assistance' : 'श्रद्धालुओं की सुरक्षा, सुगम अर्घ्य एवं निस्वार्थ सेवा'}
          </p>
        </div>

        {/* 3 Sacred Pillars */}
        <div className="grid grid-cols-3 gap-2 w-full text-center text-xs text-amber-100 pt-0.5">
          <div className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-amber-300/50 shadow-sm transition-all">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#FFD54F] flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-black text-[11px] text-white leading-tight">{isEnglish ? 'Easy routes' : 'सरल रास्ता'}</span>
            <span className="text-[9px] text-[#FFE082]/85 font-semibold">{isEnglish ? 'Ghat corridors' : 'घाटाभिमुख मार्ग'}</span>
          </div>

          <div className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-amber-300/50 shadow-sm transition-all">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#FFD54F] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-black text-[11px] text-white leading-tight">{isEnglish ? 'Quick help' : 'त्वरित सहायता'}</span>
            <span className="text-[9px] text-[#FFE082]/85 font-semibold">{isEnglish ? '112 / 108 SOS' : 'आपात 112 / 108'}</span>
          </div>

          <div className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-amber-300/50 shadow-sm transition-all">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#FFD54F] flex items-center justify-center font-bold">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span className="font-black text-[11px] text-white leading-tight">{isEnglish ? 'Selfless service' : 'निःस्वार्थ सेवा'}</span>
            <span className="text-[9px] text-[#FFE082]/85 font-semibold">{isEnglish ? 'Prasad camps' : 'प्रसाद शिविर'}</span>
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 4. RADIANT SUNRISE CALL-TO-ACTION & ENTRY                */}
      {/* ======================================================== */}
      <footer className="pb-4 sm:pb-6 px-4 sm:px-6 space-y-2.5 max-w-sm mx-auto w-full relative z-10">
        {/* Main Radiant Saffron Login Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('login')}
            className="min-h-[52px] min-w-0 flex-1 bg-gradient-to-r from-[#FF7A00] via-[#F57C00] to-[#E65100] hover:from-[#F57C00] hover:to-[#EF6C00] active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-[0_10px_28px_rgba(230,81,0,0.5)] flex items-center justify-center gap-2 transition-all border border-[#FFE082]/50"
          >
            <LogIn className="h-5 w-5 shrink-0" />
            <span>{isEnglish ? 'Login with mobile OTP' : 'मोबाइल OTP से लॉगिन करें'}</span>
            <ArrowRight className="h-5 w-5 shrink-0 text-white" />
          </button>

          {/* Integrated Language Pill */}
          <div className="shrink-0 bg-white/15 backdrop-blur-md rounded-2xl p-0.5 border border-white/25">
            <LanguageSwitcher compact />
          </div>
        </div>

        {/* Guest Pilgrim Direct Entry */}
        <button
          onClick={() => navigate('home')}
          className="w-full min-h-[46px] rounded-2xl border border-white/35 bg-white/12 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-black text-white transition-all hover:bg-white/20 active:scale-98 shadow-md flex items-center justify-center gap-2"
        >
          <span>{isEnglish ? 'Continue as Pilgrim without Login' : 'बिना लॉगिन सीधे दर्शन व सेवा में प्रवेश करें'}</span>
          <ArrowRight className="w-4 h-4 text-amber-300" />
        </button>

        {/* Staff / Admin Login */}
        <button
          onClick={() => navigate('admin-login')}
          className="mx-auto flex min-h-[36px] items-center justify-center gap-1.5 px-3 text-xs font-bold text-[#FFE082] underline decoration-amber-300/40 underline-offset-4 hover:text-white transition-colors"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>{isEnglish ? 'Authorized staff / admin login' : 'व्यवस्थापक एवं अधिकृत कर्मचारी लॉगिन'}</span>
        </button>

        {/* Footer Organization Seal */}
        <p className="text-center text-[10px] sm:text-[11px] text-amber-200/90 font-bold tracking-wide pt-0.5">
          {isEnglish ? 'A selfless initiative by ' : 'की पावन जनसेवा पहल — '}
          <span className="text-white font-black underline decoration-amber-400/50">NEXTGEN DEVBHOOMI FOUNDATION</span>
        </p>
      </footer>
    </div>
  );
};
