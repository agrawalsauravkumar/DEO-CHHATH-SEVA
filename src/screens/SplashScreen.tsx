/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Compass, ShieldCheck, HeartHandshake, ArrowRight, Sun, LogIn, Shield } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { navigate, language } = useApp();
  const isEnglish = language === 'en';

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#042E46] via-[#075078] to-[#075985] text-white flex flex-col justify-between select-none font-['Mukta',sans-serif] relative overflow-hidden">
      {/* 1. Atmospheric Chhath Puja Sunrise & River Ghat Visuals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radiating Surya Dev Rays */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-gradient-to-b from-amber-300/30 via-orange-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        
        {/* Soft Radial Sunburst Lines */}
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[360px] opacity-25" viewBox="0 0 600 360" fill="none">
          <circle cx="300" cy="80" r="70" fill="url(#splashSunGlow)" />
          {/* Beams */}
          <line x1="300" y1="80" x2="60" y2="350" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="300" y1="80" x2="160" y2="360" stroke="#FBBF24" strokeWidth="2" />
          <line x1="300" y1="80" x2="260" y2="360" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="300" y1="80" x2="340" y2="360" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="300" y1="80" x2="440" y2="360" stroke="#FBBF24" strokeWidth="2" />
          <line x1="300" y1="80" x2="540" y2="350" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 3" />
          <defs>
            <radialGradient id="splashSunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="40%" stopColor="#FDE047" />
              <stop offset="80%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>

        {/* River Ghat Water Waves at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#051122] via-[#0A1F36]/80 to-transparent">
          <svg className="absolute bottom-0 w-full h-20 opacity-30 text-sky-400" preserveAspectRatio="none" viewBox="0 0 1200 120">
            <path d="M0,40 C150,80 350,10 500,45 C650,80 900,20 1200,50 L1200,120 L0,120 Z" fill="currentColor" />
            <path d="M0,60 C200,20 400,90 600,50 C800,10 1000,70 1200,40 L1200,120 L0,120 Z" fill="#38BDF8" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* 2. Top Header / Exact Official Organization Branding */}
      <header className="pt-6 px-6 text-center space-y-1 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/40">
          <Sun className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-300 font-black">
            NEXTGEN DEVBHOOMI FOUNDATION
          </span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-amber-200/90 tracking-wider uppercase font-semibold">
          {isEnglish ? 'PUBLIC SERVICE INITIATIVE' : 'निःशुल्क जनसेवा पहल'}
        </p>
      </header>

      {/* 3. Main Brand Emblem with Surya Glow Effect */}
      <main className="my-auto flex flex-col items-center text-center space-y-4 py-3 px-6 relative z-10">
        <div className="relative flex items-center justify-center">
          {/* Radial Sunrise Glow */}
          <div className="w-48 h-48 rounded-full bg-amber-500/25 blur-2xl absolute" />
          <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-white shadow-2xl">
            <DeoChhathSevaLogo size={236} className="drop-shadow-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="sr-only">DEO CHHATH SEVA — देव छठ सेवा</h1>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-amber-400/40 text-xs font-bold text-amber-200 mt-1">
            <Sun className="h-4 w-4 text-amber-300" aria-hidden />
            <span>{isEnglish ? 'Deo • Aurangabad • Bihar' : 'देव • औरंगाबाद • बिहार'}</span>
          </div>
        </div>

        {/* Official Tagline */}
        <div className="py-2.5 px-6 rounded-2xl bg-white/10 backdrop-blur-md border border-amber-400/30 shadow-inner max-w-xs">
          <p className="text-base sm:text-lg font-black text-amber-100">
            {isEnglish ? 'Navigation • Assistance • Service' : '“रास्ता भी • सहायता भी • सेवा भी”'}
          </p>
          <p className="mt-1 text-xs font-bold text-amber-200">
            {isEnglish ? 'Service • Safety • Support' : 'सेवा भी • सुरक्षा भी • सहयोग भी'}
          </p>
        </div>

        {/* 3 Sacred Pillars */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs text-center text-xs text-amber-100 pt-1">
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/8 backdrop-blur-xs border border-white/15">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-black text-[11px]">{isEnglish ? 'Easy routes' : 'सरल रास्ता'}</span>
            <span className="text-[9px] text-amber-200/80">{isEnglish ? 'Ghat directions' : 'घाटाभिमुख मार्ग'}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/8 backdrop-blur-xs border border-white/15">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-black text-[11px]">{isEnglish ? 'Quick help' : 'त्वरित सहायता'}</span>
            <span className="text-[9px] text-amber-200/80">{isEnglish ? 'Help options' : 'सहायता विकल्प'}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/8 backdrop-blur-xs border border-white/15">
            <HeartHandshake className="w-4 h-4 text-amber-400" />
            <span className="font-black text-[11px]">{isEnglish ? 'Dedicated service' : 'निःस्वार्थ सेवा'}</span>
            <span className="text-[9px] text-amber-200/80">{isEnglish ? 'Pilgrim assistance' : 'श्रद्धालु सहायता'}</span>
          </div>
        </div>
      </main>

      {/* 4. Sign-in and guest entry */}
      <footer className="pb-4 sm:pb-6 px-6 space-y-2.5 max-w-sm mx-auto w-full relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('login')}
            className="min-h-[52px] min-w-0 flex-1 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all border border-amber-300/40"
          >
            <LogIn className="h-5 w-5 shrink-0" />
            <span>{isEnglish ? 'Login with mobile OTP' : 'मोबाइल OTP से लॉगिन करें'}</span>
            <ArrowRight className="h-5 w-5 shrink-0 text-white" />
          </button>
          <LanguageSwitcher compact />
        </div>

        <button
          onClick={() => navigate('home')}
          className="w-full min-h-11 rounded-xl border border-white/35 bg-white/10 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
        >
          {isEnglish ? 'Continue without login' : 'बिना लॉगिन सेवा शुरू करें'}
        </button>

        <button
          onClick={() => navigate('admin-login')}
          className="mx-auto flex min-h-10 items-center justify-center gap-2 px-3 text-xs font-bold text-amber-200 underline decoration-amber-200/50 underline-offset-4 hover:text-white"
        >
          <Shield className="h-4 w-4" />
          <span>{isEnglish ? 'Authorized staff login' : 'अधिकृत कर्मचारी लॉगिन'}</span>
        </button>

        <p className="text-center text-[11px] text-amber-200/90 font-bold">
          {isEnglish ? 'A service initiative by ' : 'की सेवा पहल — '}
          <span className="text-white font-black">NEXTGEN DEVBHOOMI FOUNDATION</span>
        </p>
      </footer>
    </div>
  );
};
