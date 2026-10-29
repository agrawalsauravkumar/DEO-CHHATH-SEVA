/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Compass, Clock, Sun, Moon, Sparkles, ChevronRight, Info, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ChhathDayInfo {
  dayNumber: number;
  nameHi: string;
  nameEn: string;
  tagline: string;
  dateStr: string;
  arghyaTime?: string;
  arghyaType?: 'SANDHYA' | 'USHA';
  targetTimestamp: number;
  direction: 'WEST' | 'EAST' | 'NONE';
  description: string;
}

export const ChhathArghyaMuhurat: React.FC<{ language?: string }> = ({ language = 'hi' }) => {
  const { navigate } = useApp();
  const [showMantra, setShowMantra] = useState<boolean>(false);
  const isEnglish = language === 'en';

  // Chhath Mahaparv 2026 Official Festival Schedule (Deo, Aurangabad, Bihar)
  const festivalDays: ChhathDayInfo[] = [
    {
      dayNumber: 1,
      nameHi: 'नहाय-खाय (Nahay-Khay)',
      nameEn: 'Nahay-Khay (Sacred Cleansing)',
      tagline: 'पवित्र स्नान एवं कद्दू-भात का सात्विक प्रसाद',
      dateStr: 'कार्तिक शुक्ल चतुर्थी',
      targetTimestamp: new Date('2026-11-14T12:00:00+05:30').getTime(),
      direction: 'NONE',
      description: 'सरोवरों में पवित्र स्नान के उपरांत शुद्ध अरवा चावल, चना दाल एवं कद्दू (लौकी) का प्रसाद ग्रहण किया जाता है।',
    },
    {
      dayNumber: 2,
      nameHi: 'खरना / लोहंडा (Kharna)',
      nameEn: 'Kharna (36-Hour Nirjala Vrata Begins)',
      tagline: 'सायंकाल रसियाव-रोटी का पावन प्रसाद ग्रहण',
      dateStr: 'कार्तिक शुक्ल पंचमी',
      arghyaTime: '05:45 PM',
      targetTimestamp: new Date('2026-11-15T17:45:00+05:30').getTime(),
      direction: 'WEST',
      description: 'दिनभर निर्जला उपवास के बाद सांध्यकाल गुड़ की खीर (रसियाव) और रोटी का नैवेद्य अर्पित कर प्रसाद ग्रहण किया जाता है।',
    },
    {
      dayNumber: 3,
      nameHi: 'सांध्य अर्घ्य (पहला अर्घ्य)',
      nameEn: 'Sandhya Arghya (Sunset Offering)',
      tagline: 'अस्ताचलगामी भगवान भास्कर को पहला अर्घ्य',
      dateStr: 'कार्तिक शुक्ल षष्ठी',
      arghyaTime: '05:14 PM',
      arghyaType: 'SANDHYA',
      targetTimestamp: new Date('2026-11-16T17:14:00+05:30').getTime(),
      direction: 'WEST',
      description: 'सूर्य कुंड व रुद्र कुंड के पवित्र जल में खड़े होकर डूबते हुए सूर्य देव को सूप-दउरा से अर्घ्य अर्पण।',
    },
    {
      dayNumber: 4,
      nameHi: 'उषा अर्घ्य व पारण (दूसरा अर्घ्य)',
      nameEn: 'Usha Arghya & Paran (Sunrise Offering)',
      tagline: 'उदीयमान भुवन भास्कर को प्रातःकालीन अर्घ्य',
      dateStr: 'कार्तिक शुक्ल सप्तमी',
      arghyaTime: '06:08 AM',
      arghyaType: 'USHA',
      targetTimestamp: new Date('2026-11-17T06:08:00+05:30').getTime(),
      direction: 'EAST',
      description: 'प्रातःकाल लालिमा बिखरते सूर्य देव को कच्चा दूध और गंगाजल से अर्घ्य देकर 36 घंटे के महाव्रत का पारण।',
    },
  ];

  const [activeDayIndex, setActiveDayIndex] = useState<number>(2); // Default to Sandhya Arghya
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const currentDay = festivalDays[activeDayIndex];

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      let diff = currentDay.targetTimestamp - now;
      if (diff <= 0) {
        // If passed, simulate relative daytime countdown for display
        diff = Math.abs(diff) % (24 * 3600 * 1000);
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeDayIndex, currentDay.targetTimestamp]);

  return (
    <section aria-label="छठ अर्घ्य मुहूर्त व समय" className="font-['Mukta',sans-serif]">
      <div className="bg-gradient-to-br from-[#0B5E8E] via-[#084265] to-[#041E2F] text-white rounded-3xl p-4 sm:p-5 border-2 border-[#FFD54F]/60 shadow-xl relative overflow-hidden">
        {/* Divine Sunrise Aura Backdrop */}
        <div className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[#FF8C42]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-[#FFD54F]/20 blur-2xl" />

        {/* Header & Tagline */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF8C42] to-[#FFD54F] text-stone-950 flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase bg-[#FF8C42]/30 text-[#FFD54F] border border-[#FFD54F]/40 px-2 py-0.5 rounded-full">
                  देव पंचांग • खगोलीय मुहूर्त
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                {isEnglish ? 'Deo Surya Arghya Timings' : 'भगवान भास्कर अर्घ्य मुहूर्त — देव'}
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-black text-amber-200 block">देव सूर्य मंदिर</span>
            <span className="text-[10px] text-stone-300">24.65°N • 84.43°E</span>
          </div>
        </div>

        {/* 4-Day Selector Tabs */}
        <div className="relative z-10 grid grid-cols-4 gap-1.5 mt-3.5 pt-3 border-t border-white/15">
          {festivalDays.map((d, idx) => {
            const isSelected = activeDayIndex === idx;
            return (
              <button
                key={d.dayNumber}
                type="button"
                onClick={() => setActiveDayIndex(idx)}
                className={`py-2 px-1 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF8C42] to-[#FFB52E] text-stone-950 font-black shadow-md scale-102 ring-2 ring-white/50'
                    : 'bg-white/10 hover:bg-white/15 text-stone-200 font-bold'
                }`}
              >
                <span className="text-[10px] block opacity-85">दिन {d.dayNumber}</span>
                <span className="text-xs truncate block font-black leading-tight">
                  {idx === 0 ? 'नहाय-खाय' : idx === 1 ? 'खरना' : idx === 2 ? 'सांध्य अर्घ्य' : 'उषा अर्घ्य'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Info Card */}
        <div className="relative z-10 mt-3.5 bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-black text-[#FFD54F]">{currentDay.dateStr}</span>
              <h4 className="text-base font-black text-white">{currentDay.nameHi}</h4>
              <p className="text-xs text-amber-100/90 font-medium">{currentDay.tagline}</p>
            </div>

            {currentDay.arghyaTime && (
              <div className="text-right bg-[#FF8C42]/20 border border-[#FF8C42]/50 px-3 py-1.5 rounded-xl shrink-0">
                <span className="text-[10px] font-bold text-amber-200 block">अर्घ्य का सही समय</span>
                <span className="text-lg font-black text-[#FFD54F]">{currentDay.arghyaTime}</span>
              </div>
            )}
          </div>

          {/* Countdown & Direction Tip */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/10">
            {/* Countdown */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2 border border-white/10">
              <Clock className="w-4 h-4 text-[#FFD54F] shrink-0" />
              <div>
                <span className="text-[10px] text-stone-300 block font-semibold">अर्घ्य समय शेष</span>
                <span className="text-xs font-black text-white font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}घं : {String(timeLeft.minutes).padStart(2, '0')}मि : {String(timeLeft.seconds).padStart(2, '0')}से
                </span>
              </div>
            </div>

            {/* Direction Indicator */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2 border border-white/10">
              <Compass className="w-4 h-4 text-[#FF8C42] shrink-0" />
              <div>
                <span className="text-[10px] text-stone-300 block font-semibold">अर्घ्य अर्पण दिशा</span>
                <span className="text-xs font-black text-[#FFD54F]">
                  {currentDay.direction === 'WEST'
                    ? 'पश्चिम (West) — अस्ताचल'
                    : currentDay.direction === 'EAST'
                    ? 'पूर्व (East) — उदीयमान'
                    : 'सूर्य कुंड परिक्रमा'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-stone-300 leading-snug mt-2.5">
            {currentDay.description}
          </p>

          {/* Arghya Vedic Mantra Quick Expander */}
          <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={() => setShowMantra(!showMantra)}
              className="w-full flex items-center justify-between text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black text-[#FFD54F] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF8C42]" />
                <span>अर्घ्य अर्पण मन्त्र (Vedic Arghya Mantra)</span>
              </span>
              <span className="text-[10px] text-stone-300 underline">
                {showMantra ? 'छुपाएं ▲' : 'देखें ▼'}
              </span>
            </button>

            {showMantra && (
              <div className="p-3 bg-amber-500/15 border border-[#FFD54F]/40 rounded-xl space-y-1.5 animate-fade-in">
                <p className="text-xs sm:text-sm font-black text-[#FFD54F] font-serif leading-relaxed text-center">
                  ॐ एहि सूर्य सहस्त्रांशो तेजोराशे जगत्पते।<br />
                  अनुकम्पय मां भक्त्या गृहाणार्घ्यं दिवाकर॥
                </p>
                <p className="text-[10px] text-stone-200 text-center">
                  (दोनों हाथों में सूप-पात्र लेकर सूर्य देव की ओर मुख करके धारा प्रवाहित करें)
                </p>
              </div>
            )}

            {/* Quick Action to Full Katha & Bhakti Screen */}
            <button
              type="button"
              onClick={() => navigate('chhath-katha')}
              className="w-full mt-1 py-2 px-3 bg-gradient-to-r from-[#FF8C42]/20 to-[#FFB52E]/20 hover:from-[#FF8C42]/30 hover:to-[#FFB52E]/30 border border-[#FFD54F]/50 rounded-xl flex items-center justify-between text-xs font-black text-white transition-all active:scale-98"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#FFD54F]" />
                <span>संपूर्ण छठ व्रत कथा, गीत व सूर्य चालीसा</span>
              </span>
              <ChevronRight className="w-4 h-4 text-[#FFD54F]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

