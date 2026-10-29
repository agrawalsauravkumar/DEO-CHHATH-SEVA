/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Sun, Moon, Volume2, VolumeX, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  onOpenCompass?: () => void;
  onOpenChecklist?: () => void;
}

export const ChhathVratiFastingTracker: React.FC<Props> = ({ onOpenCompass, onOpenChecklist }) => {
  // Festival key milestone timestamps for Deo, Aurangabad, Bihar (Nov 2026)
  const kharnaStartTime = new Date('2026-11-15T18:00:00+05:30').getTime(); // Kharna prasad finish
  const sandhyaArghyaTime = new Date('2026-11-16T17:14:00+05:30').getTime(); // First Arghya Sunset
  const ushaArghyaTime = new Date('2026-11-17T06:08:00+05:30').getTime(); // Final Arghya Sunrise

  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [isPlayingChime, setIsPlayingChime] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine current active phase
  let activePhase: 'PRE_KHARNA' | 'NIRJALA_DAY1' | 'SANDHYA_OFFERED' | 'PARAN_COMPLETED' = 'PRE_KHARNA';
  let targetTime = kharnaStartTime;
  let phaseTitle = 'खरना सांध्य प्रसाद (36-घंटे निर्जला व्रत प्रारंभ)';
  let phaseDesc = 'गुड़ की खीर (रसियाव) और रोटी का नैवेद्य अर्पित कर अखंड निर्जला उपवास प्रारंभ होगा।';

  if (currentTime >= kharnaStartTime && currentTime < sandhyaArghyaTime) {
    activePhase = 'NIRJALA_DAY1';
    targetTime = sandhyaArghyaTime;
    phaseTitle = 'सांध्य अर्घ्य की प्रतीक्षा (पहला अर्घ्य)';
    phaseDesc = 'अस्ताचलगामी सूर्य देव को अर्घ्य देने हेतु सूर्य कुंड व रुद्र कुंड घाट की ओर प्रस्थान।';
  } else if (currentTime >= sandhyaArghyaTime && currentTime < ushaArghyaTime) {
    activePhase = 'SANDHYA_OFFERED';
    targetTime = ushaArghyaTime;
    phaseTitle = 'उषा अर्घ्य व पारण (द्वितीय अर्घ्य)';
    phaseDesc = 'उदीयमान भुवन भास्कर को कच्चा दूध व गंगाजल अर्पित कर 36 घंटे के महाव्रत का पारण।';
  } else if (currentTime >= ushaArghyaTime) {
    activePhase = 'PARAN_COMPLETED';
    phaseTitle = 'छठ महापर्व पारण संपन्न';
    phaseDesc = 'अदरक, गुड़ व ठेकुआ महाप्रसाद से व्रत का पावन पारण पूर्ण हुआ। छठी माई की कृपा आप पर बनी रहे।';
  }

  // Calculate remaining time
  const remainingDiff = Math.max(0, targetTime - currentTime);
  const hours = Math.floor(remainingDiff / (1000 * 60 * 60));
  const minutes = Math.floor((remainingDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingDiff % (1000 * 60)) / 1000);

  // Play peaceful temple conch & bell chime
  const playSacredChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Sound multi-tone sacred bell chord
      [528, 660, 792].forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 3.2);
        }, idx * 250);
      });

      setIsPlayingChime(true);
      setTimeout(() => setIsPlayingChime(false), 3500);
    } catch {
      setIsPlayingChime(false);
    }
  };

  return (
    <section aria-label="छठ व्रती 36-घंटे निर्जला व्रत ट्रैकर" className="rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-[#063B5C] via-[#075985] to-[#041E2F] p-4 text-white shadow-lg space-y-3 font-['Mukta',sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/25 border border-amber-400/60 text-amber-300 flex items-center justify-center text-xl shrink-0 font-bold">
            ⏳
          </div>
          <div>
            <h3 className="text-base font-black text-white leading-tight flex items-center gap-1.5">
              <span>36-घंटे अखंड निर्जला व्रत ट्रैकर</span>
              <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-2 py-0.2 rounded-full">
                पावन अनुष्ठान
              </span>
            </h3>
            <p className="text-xs text-amber-200/90 font-medium">
              खरना से पारण तक व्रतियों हेतु निरंतर समय सारिणी
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={playSacredChime}
          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
            isPlayingChime
              ? 'bg-amber-400 text-stone-950 border-white animate-pulse'
              : 'bg-white/10 hover:bg-white/20 text-amber-300 border-amber-400/40'
          }`}
          title="शंख व पावन घंटी बजाएं"
        >
          <Volume2 className="w-4 h-4" />
          <span className="hidden sm:inline">शुभ ध्वनि</span>
        </button>
      </div>

      {/* Main Countdown Cards */}
      <div className="bg-black/30 rounded-2xl p-3.5 border border-white/15 text-center space-y-2">
        <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
          <span>{phaseTitle}</span>
          <span>{activePhase === 'NIRJALA_DAY1' ? 'सांध्य अर्घ्य: 05:14 PM' : activePhase === 'SANDHYA_OFFERED' ? 'उषा अर्घ्य: 06:08 AM' : 'देव (बिहार)'}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="bg-[#031B2B] rounded-xl p-2.5 border border-amber-400/40">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 block">{String(hours).padStart(2, '0')}</span>
            <span className="text-[10px] text-stone-300 font-bold uppercase">घंटे (Hours)</span>
          </div>
          <div className="bg-[#031B2B] rounded-xl p-2.5 border border-amber-400/40">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 block">{String(minutes).padStart(2, '0')}</span>
            <span className="text-[10px] text-stone-300 font-bold uppercase">मिनट (Mins)</span>
          </div>
          <div className="bg-[#031B2B] rounded-xl p-2.5 border border-amber-400/40">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 block">{String(seconds).padStart(2, '0')}</span>
            <span className="text-[10px] text-stone-300 font-bold uppercase">सेकंड (Secs)</span>
          </div>
        </div>

        <p className="text-xs text-amber-100/90 italic leading-relaxed pt-1">
          {phaseDesc}
        </p>
      </div>

      {/* 4 Steps Interactive Pipeline */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] pt-1">
        <div className="p-2 rounded-xl bg-white/10 border border-white/15 space-y-0.5">
          <span className="block text-sm">🌾</span>
          <span className="font-black text-amber-300 block">नहाय-खाय</span>
          <span className="text-stone-300 block">14 नवंबर</span>
        </div>
        <div className="p-2 rounded-xl bg-white/10 border border-white/15 space-y-0.5">
          <span className="block text-sm">🥣</span>
          <span className="font-black text-amber-300 block">खरना</span>
          <span className="text-stone-300 block">15 नवंबर</span>
        </div>
        <div className="p-2 rounded-xl bg-amber-500/25 border border-amber-400/70 space-y-0.5">
          <span className="block text-sm">🌅</span>
          <span className="font-black text-amber-300 block">सांध्य अर्घ्य</span>
          <span className="text-amber-200 block">16 नवंबर</span>
        </div>
        <div className="p-2 rounded-xl bg-white/10 border border-white/15 space-y-0.5">
          <span className="block text-sm">🌄</span>
          <span className="font-black text-amber-300 block">उषा अर्घ्य</span>
          <span className="text-stone-300 block">17 नवंबर</span>
        </div>
      </div>

      {/* Quick Action Buttons for Compass and Checklist */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {onOpenCompass && (
          <button
            type="button"
            onClick={onOpenCompass}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Sun className="w-4 h-4 text-stone-950" />
            <span>सूर्य अर्घ्य कम्पास</span>
          </button>
        )}

        {onOpenChecklist && (
          <button
            type="button"
            onClick={onOpenChecklist}
            className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs flex items-center justify-center gap-1.5 border border-white/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>दउरा सामग्री चेकलिस्ट</span>
          </button>
        )}
      </div>
    </section>
  );
};
