/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { ChhathSunriseBackdrop } from '../components/ChhathSunriseBackdrop';
import { Compass, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A2E] via-[#0F2642] to-[#16365C] text-white flex flex-col justify-between select-none font-['Mukta',sans-serif] relative overflow-hidden">
      {/* Background Sunrise Atmosphere */}
      <div className="absolute top-0 left-0 right-0 opacity-40 pointer-events-none">
        <ChhathSunriseBackdrop height={180} />
      </div>

      {/* Top Header / Exact Organization Branding (Step 20 Requirement 6) */}
      <div className="pt-6 px-6 text-center space-y-1 relative z-10">
        <span className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-300 font-black inline-block border-b border-amber-400/40 pb-0.5">
          NEXTGEN DEV BHOOMI FOUNDATION
        </span>
        <p className="text-[10px] sm:text-[11px] text-amber-200/90 tracking-wider uppercase font-semibold">
          PUBLIC SERVICE INITIATIVE • सार्वजनिक सेवा पहल
        </p>
      </div>

      {/* Main Brand Lockup with the Official Circular Emblem Seal */}
      <div className="my-auto flex flex-col items-center text-center space-y-4 py-4 px-6 relative z-10">
        {/* Foundation Seal Logo with Warm Sunrise Glow Effect */}
        <div className="relative flex items-center justify-center">
          <div className="w-44 h-44 rounded-full bg-amber-500/25 blur-2xl absolute animate-pulse" />
          <div className="relative p-1 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 shadow-2xl">
            <DeoChhathSevaLogo size={148} className="drop-shadow-2xl" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
            DEO CHHATH SEVA
          </h1>
          <p className="text-xl font-bold text-amber-300 tracking-wide">
            देव छठ सेवा
          </p>
          <div className="inline-block px-3.5 py-1 bg-white/10 backdrop-blur-xs rounded-full border border-amber-400/40 text-xs font-bold text-amber-200 mt-1">
            देव सूर्य मंदिर व सूर्य कुंड महातीर्थ • छठ महापर्व 2026
          </div>
        </div>

        {/* Tagline */}
        <div className="py-2.5 px-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-amber-400/30 shadow-inner">
          <p className="text-base sm:text-lg font-black text-amber-100">
            “रास्ता भी • सहायता भी • सेवा भी”
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs text-center text-xs text-amber-100 pt-1">
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-black text-[11px]">सरल रास्ता</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-black text-[11px]">त्वरित सहायता</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10">
            <HeartHandshake className="w-4 h-4 text-amber-400" />
            <span className="font-black text-[11px]">निःस्वार्थ सेवा</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pb-6 px-6 space-y-3 max-w-sm mx-auto w-full relative z-10">
        <button
          onClick={() => navigate('home')}
          className="w-full min-h-[52px] bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-98 text-white font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all border border-amber-300/40"
        >
          <span>सेवा प्रारंभ करें (आगे बढ़ें)</span>
          <ArrowRight className="w-5 h-5 text-white" />
        </button>

        <p className="text-center text-[11px] text-amber-200/90 font-bold">
          A service initiative by <span className="text-white font-black">NEXTGEN DEV BHOOMI FOUNDATION</span>
        </p>
      </div>
    </div>
  );
};
