/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DeoChhathSevaLogo } from './DeoChhathSevaLogo';

interface Props {
  text?: string;
  subText?: string;
}

export const ChhathLoadingScreen: React.FC<Props> = ({
  text = 'DEO CHHATH SEVA तैयार हो रही है...',
  subText = 'भगवान भास्कर के पावन धाम में आपका स्वागत है',
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#041E2F] via-[#073B5A] to-[#0B5E8E] text-white flex flex-col justify-between items-center select-none font-['Mukta',sans-serif] relative overflow-hidden p-6 text-center">
      {/* 1. Radiating Surya Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/25 rounded-full blur-3xl animate-pulse pointer-events-none" />

      {/* Top Organization Header */}
      <header className="pt-8 relative z-10 space-y-1">
        <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 block">
          NEXTGEN DEVBHOOMI FOUNDATION
        </span>
        <p className="text-[10px] text-amber-200/80 font-bold uppercase tracking-wider">
          “रास्ता भी • सहायता भी • सेवा भी”
        </p>
      </header>

      {/* Center Motif: Logo with Diya & Wave Glow */}
      <main className="my-auto relative z-10 flex flex-col items-center space-y-5">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-orange-600 p-1 shadow-2xl animate-pulse">
            <DeoChhathSevaLogo size={104} className="drop-shadow-xl" />
          </div>

          {/* Golden Diya Glow below logo */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow">
            🪔
          </div>
        </div>

        <div className="space-y-1.5 pt-2 max-w-xs">
          <h2 className="text-xl font-black text-amber-300 tracking-tight leading-tight">
            {text}
          </h2>
          <p className="text-xs text-amber-100/90 font-medium">
            {subText}
          </p>
        </div>

        {/* Animated River Wave Bar */}
        <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden relative">
          <div className="w-20 h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 rounded-full animate-[shimmer_1.5s_infinite]" />
        </div>
      </main>

      {/* River Ghat Bottom SVG */}
      <footer className="w-full relative z-10 pb-4">
        <p className="text-[11px] text-amber-200/70 font-semibold">
          देव सूर्य मंदिर व सूर्य कुंड महातीर्थ • कार्तिक महापर्व 2026
        </p>
      </footer>
    </div>
  );
};
