/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Siren, PhoneCall, ShieldAlert, X, HeartPulse, Building } from 'lucide-react';

export const ChhathFloatingSOS: React.FC = () => {
  const { currentScreen, navigate } = useApp();
  const [showQuickModal, setShowQuickModal] = useState<boolean>(false);

  // Hidden on emergency screen itself, splash, and turn-by-turn navigation HUD
  if (
    currentScreen === 'emergency' ||
    currentScreen === 'splash' ||
    currentScreen === 'navigation' ||
    currentScreen === 'language' ||
    currentScreen === 'location-permission'
  ) {
    return null;
  }

  return (
    <>
      {/* Floating SOS Trigger Button */}
      <div className="fixed bottom-20 right-3.5 z-40 select-none font-['Noto_Sans_Devanagari','Inter',sans-serif]">
        <button
          onClick={() => setShowQuickModal(true)}
          aria-label="24x7 आपातकालीन सहायता (Emergency SOS)"
          className="group relative flex items-center gap-1.5 pl-3 pr-3.5 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-xs shadow-[0_8px_25px_rgba(220,38,38,0.5)] border-2 border-[#FFD54F] active:scale-95 transition-all hover:brightness-110"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-80" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
          </span>
          <Siren className="w-4 h-4 text-white animate-bounce" />
          <span className="tracking-wide text-white drop-shadow-xs">आपातकाल SOS</span>
        </button>
      </div>

      {/* Quick SOS Emergency Sheet / Modal */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 bg-[#041E2F]/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in font-['Noto_Sans_Devanagari','Inter',sans-serif]">
          <div className="bg-[#FFFDF7] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border-2 border-[#FFD54F] animate-slide-up">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center text-lg font-bold">
                  🚨
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900 leading-tight">
                    24x7 आपातकालीन सहायता
                  </h3>
                  <span className="text-[11px] font-bold text-stone-500">
                    देव मेला प्रशासन • तुरंत कॉल करें
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowQuickModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
                aria-label="बंद करें"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Deo Mela Control Room */}
              <a
                href="tel:06186224200"
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 hover:bg-amber-100/60 active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm">
                    🏛️
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900">मेला नियंत्रण कक्ष (देव)</h4>
                    <span className="text-[11px] font-mono font-bold text-amber-900">06186-224200</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-amber-500 text-stone-950 text-xs font-black flex items-center gap-1 shadow-xs">
                  <PhoneCall className="w-3.5 h-3.5" />
                  कॉल
                </span>
              </a>

              {/* Ambulance 108 */}
              <a
                href="tel:108"
                className="flex items-center justify-between p-3 rounded-2xl bg-red-50/80 border border-red-200 hover:bg-red-100/70 active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                    🚑
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900">एम्बुलेंस (सूर्य कुंड / मेला)</h4>
                    <span className="text-[11px] font-mono font-bold text-red-700">108</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-black flex items-center gap-1 shadow-xs">
                  <PhoneCall className="w-3.5 h-3.5" />
                  कॉल
                </span>
              </a>

              {/* Police 112 */}
              <a
                href="tel:112"
                className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/80 border border-blue-200 hover:bg-blue-100/70 active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0B5E8E] text-white flex items-center justify-center font-bold text-sm">
                    👮
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900">पुलिस आपातकालीन सेवा</h4>
                    <span className="text-[11px] font-mono font-bold text-blue-800">112</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-[#0B5E8E] text-white text-xs font-black flex items-center gap-1 shadow-xs">
                  <PhoneCall className="w-3.5 h-3.5" />
                  कॉल
                </span>
              </a>
            </div>

            {/* View Full Emergency Screen */}
            <button
              onClick={() => {
                setShowQuickModal(false);
                navigate('emergency');
              }}
              className="w-full min-h-[44px] rounded-2xl bg-[#041E2F] hover:bg-[#073B5A] text-[#FFD54F] font-black text-xs flex items-center justify-center gap-2 border border-[#FFD54F]/50 shadow-md active:scale-98 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-[#FFD54F]" />
              <span>सभी आपातकालीन व मेडिकल सेंटर देखें ›</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

