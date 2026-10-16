/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScreenId } from '../types';
import { Sun, Heart, Volume2, ArrowRight } from 'lucide-react';
import { VoiceService } from '../services/VoiceService';

export const ChhathVratiModeSection: React.FC = () => {
  const { navigate } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const vratiOptions: { id: ScreenId; label: string; desc: string; bg: string }[] = [
    { id: 'search', label: '🧭 रास्ता', desc: 'सूर्य मंदिर व घाट का मार्ग', bg: 'bg-amber-500 text-stone-950' },
    { id: 'medical', label: '🚑 चिकित्सा', desc: 'प्राथमिक उपचार व डॉक्टर', bg: 'bg-rose-100 text-rose-950 border border-rose-300' },
    { id: 'toilet', label: '🚻 शौचालय', desc: 'महिला व सचल शौचालय', bg: 'bg-emerald-100 text-emerald-950 border border-emerald-300' },
    { id: 'water', label: '💧 पानी', desc: 'निःशुल्क शीतल पेय जल', bg: 'bg-sky-100 text-sky-950 border border-sky-300' },
    { id: 'help', label: '🆘 सहायता', desc: 'हेल्प डेस्क व सुरक्षा', bg: 'bg-red-600 text-white' },
    { id: 'parking', label: '🅿️ पार्किंग', desc: 'वाहन खड़ा करने का स्थल', bg: 'bg-indigo-100 text-indigo-950 border border-indigo-300' },
  ];

  const handleSpeakGuidance = () => {
    VoiceService.speak(
      'छठ व्रती एवं श्रद्धालु सहायता में आपका स्वागत है। रास्ता, चिकित्सा, शौचालय, पानी, सहायता या पार्किंग में से अपनी आवश्यकता चुनें।',
      false
    );
  };

  return (
    <section aria-label="श्रद्धालु सहायता" className="space-y-2.5 font-['Mukta',sans-serif]">
      {/* Devotee Banner Strip */}
      <div className="bg-gradient-to-r from-[#075985] via-[#073B5A] to-[#041E2F] text-white rounded-3xl p-4 border-2 border-[#FFB52E]/70 shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center text-2xl shrink-0">
              🙏
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight flex items-center gap-1.5">
                <span>श्रद्धालु एवं व्रती सहायता</span>
                <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.2 rounded-full">
                  सरल सेवा
                </span>
              </h3>
              <p className="text-xs text-amber-200/90 font-medium">
                छठ व्रतियों हेतु विशेष बड़े बटन एवं सुगम नेविगेशन
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSpeakGuidance}
              title="आवाज़ में सुनें"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 active:scale-95 transition-all"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 text-xs font-black shrink-0 active:scale-95 transition-all"
            >
              {isOpen ? 'समेटें' : 'खोलें'}
            </button>
          </div>
        </div>

        {/* Large Tactile Buttons (Always active or expandable) */}
        {isOpen && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3.5 mt-3 border-t border-white/15 animate-fade-in">
            {vratiOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => navigate(opt.id)}
                className={`min-h-[64px] p-3 rounded-2xl font-black text-sm text-left flex flex-col justify-between shadow-xs active:scale-96 transition-all ${opt.bg}`}
              >
                <span className="text-base font-black">{opt.label}</span>
                <span className="text-[10px] opacity-85 font-semibold line-clamp-1">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
