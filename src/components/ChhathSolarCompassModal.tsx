/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Compass, Sun, Moon, X, RotateCcw, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ChhathSolarCompassModal: React.FC<Props> = ({ isOpen, onClose }) => {
  // Arghya Mode: 'SANDHYA' (Sunset, 245° WSW) or 'USHA' (Sunrise, 115° ESE)
  const [arghyaMode, setArghyaMode] = useState<'SANDHYA' | 'USHA'>('SANDHYA');
  const [heading, setHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  // Exact solar azimuth for Deo, Aurangabad, Bihar (Lat 24.654°, Lng 84.437°)
  const targetAzimuth = arghyaMode === 'SANDHYA' ? 245 : 115;
  const currentHeading = hasSensor ? heading : manualHeading;

  // Calculate difference from target
  const angleDiff = Math.abs(((currentHeading - targetAzimuth + 180) % 360) - 180);
  const isAligned = angleDiff <= 12;

  // Request & listen to DeviceOrientation events
  useEffect(() => {
    if (!isOpen) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let degree = 0;
      if (typeof (e as any).webkitCompassHeading === 'number') {
        // iOS
        degree = (e as any).webkitCompassHeading;
        setHasSensor(true);
      } else if (e.alpha !== null && typeof e.alpha === 'number') {
        // Android Chrome
        degree = (360 - e.alpha) % 360;
        setHasSensor(true);
      }
      setHeading(Math.round(degree));
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS 13+ requires explicit permission request
        (DeviceOrientationEvent as any)
          .requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              setPermissionState('granted');
              window.addEventListener('deviceorientation', handleOrientation, true);
            } else {
              setPermissionState('denied');
            }
          })
          .catch(() => setPermissionState('denied'));
      } else {
        setPermissionState('granted');
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const cardinalDirection = (deg: number) => {
    const directions = ['उत्तर (N)', 'उत्तर-पूर्व (NE)', 'पूर्व (E)', 'दक्षिण-पूर्व (SE)', 'दक्षिण (S)', 'दक्षिण-पश्चिम (SW)', 'पश्चिम (W)', 'उत्तर-पश्चिम (NW)'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs font-['Noto_Sans_Devanagari','Inter',sans-serif] animate-fade-in">
      <div className="w-full max-w-lg max-h-[92vh] bg-gradient-to-b from-[#063B5C] via-[#075985] to-[#041E2F] text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-amber-400">
        {/* Header */}
        <div className="bg-[#031B2B] p-4 flex items-center justify-between border-b border-amber-400/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center text-xl shrink-0 font-bold shadow-md">
              🧭
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight flex items-center gap-2">
                <span>सूर्य अर्घ्य सोलर कम्पास</span>
                <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-2 py-0.2 rounded-full">
                  देव (बिहार)
                </span>
              </h3>
              <p className="text-xs text-amber-200/90 font-medium">
                अस्ताचलगामी व उदीयमान भगवान भास्कर की सटीक अर्घ्य दिशा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-center">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-black/30 p-1.5 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => setArghyaMode('SANDHYA')}
              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                arghyaMode === 'SANDHYA'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md scale-100'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>सांध्य अर्घ्य (पहला अर्घ्य - 245° WSW)</span>
            </button>

            <button
              type="button"
              onClick={() => setArghyaMode('USHA')}
              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                arghyaMode === 'USHA'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 shadow-md scale-100'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>उषा अर्घ्य (दूसरा अर्घ्य - 115° ESE)</span>
            </button>
          </div>

          {/* Compass Dial Display */}
          <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
            {/* Outer Ring with Glow */}
            <div
              className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
                isAligned
                  ? 'border-amber-400 shadow-[0_0_40px_rgba(255,213,79,0.7)] animate-pulse'
                  : 'border-white/20 shadow-inner'
              }`}
            />

            {/* Rotating Compass Card */}
            <div
              className="absolute inset-2 rounded-full border border-white/15 flex items-center justify-center transition-transform duration-200"
              style={{ transform: `rotate(${-currentHeading}deg)` }}
            >
              {/* Cardinal Labels */}
              <span className="absolute top-2 text-xs font-black text-red-400">उत्तर (N)</span>
              <span className="absolute right-2 text-xs font-black text-amber-300">पूर्व (E)</span>
              <span className="absolute bottom-2 text-xs font-black text-stone-300">दक्षिण (S)</span>
              <span className="absolute left-2 text-xs font-black text-orange-400">पश्चिम (W)</span>

              {/* Sun Azimuth Marker Beam */}
              <div
                className="absolute w-1 h-28 origin-bottom flex flex-col items-center justify-start pointer-events-none"
                style={{
                  transform: `rotate(${targetAzimuth}deg)`,
                  bottom: '50%',
                }}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-lg flex items-center justify-center text-xs text-stone-950 font-black animate-bounce border-2 border-white">
                  ☀️
                </div>
                <div className="w-0.5 h-full bg-amber-400/80 shadow-[0_0_8px_#ffd54f]" />
              </div>

              {/* Degree ticks */}
              <div className="absolute inset-8 rounded-full border border-dashed border-white/20" />
            </div>

            {/* Center Device Crosshair & Current Heading Display */}
            <div className="relative z-10 w-24 h-24 rounded-full bg-[#031B2B]/90 border-2 border-amber-400 flex flex-col items-center justify-center shadow-lg">
              <span className="text-xl font-black text-amber-300">{currentHeading}°</span>
              <span className="text-[10px] text-stone-300 font-bold">{cardinalDirection(currentHeading)}</span>
            </div>

            {/* Fixed Phone Heading Arrow at Top */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-x-8 border-x-transparent border-b-12 border-b-amber-400" />
          </div>

          {/* Alignment Status Banner */}
          <div
            className={`p-3 rounded-2xl border text-sm font-black transition-all ${
              isAligned
                ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-lg scale-102 animate-bounce'
                : 'bg-white/10 text-stone-200 border-white/15'
            }`}
          >
            {isAligned ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-stone-950" />
                <span>☀️ भगवान भास्कर की पावन दिशा संरेखित! अर्घ्य अर्पित करें</span>
              </div>
            ) : (
              <span>
                {arghyaMode === 'SANDHYA'
                  ? `सांध्य अर्घ्य हेतु फोन को ${targetAzimuth}° (पश्चिम दिशा) की ओर घुमाएँ`
                  : `उषा अर्घ्य हेतु फोन को ${targetAzimuth}° (पूर्व दिशा) की ओर घुमाएँ`}
              </span>
            )}
          </div>

          {/* Manual Slider if Compass Sensor not present */}
          {!hasSensor && (
            <div className="bg-black/30 p-3 rounded-2xl border border-white/10 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs text-stone-300 font-bold">
                <span>मैन्युअल कम्पास स्लाइडर (सेंसर उपलब्ध नहीं होने पर)</span>
                <span className="text-amber-300 font-black">{manualHeading}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={manualHeading}
                onChange={(e) => setManualHeading(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          )}

          {/* Sacred Arghya Mantra */}
          <div className="bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-400/40 rounded-2xl p-3.5 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
              पावन अर्घ्य दान मंत्र
            </span>
            <p className="text-sm font-black text-amber-100 italic leading-relaxed">
              “एहि सूर्य सहस्त्रांशो तेजोराशे जगत्पते।<br />
              अनुकम्पय मां भक्त्या गृहाणार्घ्यं दिवाकर॥”
            </p>
            <p className="text-[11px] text-stone-300 pt-1">
              अर्थ: हे सहस्र किरणों वाले तेज के पुंज जगतपति सूर्य देव! मुझ पर कृपा करके मेरी भक्ति सहित इस अर्घ्य को स्वीकार करें।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

