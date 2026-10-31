/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, PhoneCall, AlertTriangle, Users, HeartHandshake, ArrowRight } from 'lucide-react';

export const ChhathSafetySection: React.FC = () => {
  const { navigate } = useApp();

  return (
    <section aria-label="छठ सुरक्षा एवं सहायता" className="space-y-3 font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
              छठ सुरक्षा एवं सहायता (Chhath Safety & Care)
            </h3>
            <p className="text-[11px] text-stone-500 font-bold">
              24x7 आपातकालीन सहायता, महिला व वरिष्ठ नागरिक सुरक्षा एवं स्वयंसेवक
            </p>
          </div>
        </div>
      </div>

      {/* Safety Matrix Cards */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-4 shadow-xs space-y-3">
        {/* Emergency SOS Banner (Red preserved exclusively for SOS) */}
        <div className="p-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shrink-0">
              🚨
            </div>
            <div>
              <span className="block text-sm font-black text-white leading-tight">
                आपातकालीन सहायता (SOS)
              </span>
              <span className="block text-[11px] text-rose-100 font-medium">
                एम्बुलेंस (108) • पुलिस (112) • मेला कंट्रोल: 06186-224200
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('emergency')}
            className="px-3.5 py-1.5 bg-white text-red-700 hover:bg-rose-50 text-xs font-black rounded-xl shrink-0 shadow-xs active:scale-95 transition-all"
          >
            SOS कॉल
          </button>
        </div>

        {/* 6 Category Safety & Assistance Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {/* 1. Women Assistance */}
          <button
            onClick={() => navigate('help')}
            className="p-2.5 rounded-2xl bg-pink-50/80 border border-pink-200/90 text-left hover:bg-pink-100/80 active:scale-97 transition-all"
          >
            <div className="flex items-center gap-1.5 text-pink-900 font-black mb-0.5">
              <span>🌸</span>
              <span className="truncate">महिला सहायता</span>
            </div>
            <p className="text-[10px] text-pink-800 line-clamp-2">
              महिला चेंजिंग रूम, सुरक्षित स्नान घाट व महिला पुलिस डेस्क।
            </p>
          </button>

          {/* 2. Senior Citizen Assistance */}
          <button
            onClick={() => navigate('senior-mode')}
            className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-left hover:bg-amber-100/80 active:scale-97 transition-all"
          >
            <div className="flex items-center gap-1.5 text-amber-950 font-black mb-0.5">
              <span>👴</span>
              <span className="truncate">वरिष्ठ नागरिक</span>
            </div>
            <p className="text-[10px] text-amber-800 line-clamp-2">
              निःशुल्क ई-रिक्शा, व्हीलचेयर सहायता एवं बड़े अक्षर मोड।
            </p>
          </button>

          {/* 3. Divyangjan / Disability Assistance */}
          <button
            onClick={() => navigate('shuttle')}
            className="p-2.5 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-left hover:bg-blue-100/80 active:scale-97 transition-all"
          >
            <div className="flex items-center gap-1.5 text-blue-900 font-black mb-0.5">
              <span>♿</span>
              <span className="truncate">दिव्यांगजन सेवा</span>
            </div>
            <p className="text-[10px] text-blue-800 line-clamp-2">
              घाट रैंप, सुलभ शौचालय एवं सीधी ई-रिक्शा कनेक्टिविटी।
            </p>
          </button>

          {/* 4. Family Safety */}
          <button
            onClick={() => navigate('family')}
            className="p-2.5 rounded-2xl bg-purple-50/80 border border-purple-200/90 text-left hover:bg-purple-100/80 active:scale-97 transition-all"
          >
            <div className="flex items-center gap-1.5 text-purple-900 font-black mb-0.5">
              <span>👨‍👩‍👧</span>
              <span className="truncate">परिवार सुरक्षा</span>
            </div>
            <p className="text-[10px] text-purple-800 line-clamp-2">
              पारिवारिक ग्रुप ट्रैकिंग व तय मिलन स्थल (Meeting Point)।
            </p>
          </button>

          {/* 5. Lost & Found Support */}
          <button
            onClick={() => navigate('lost-found')}
            className="p-2.5 rounded-2xl bg-stone-100 border border-stone-300 text-left hover:bg-stone-200/80 active:scale-97 transition-all"
          >
            <div className="flex items-center gap-1.5 text-stone-900 font-black mb-0.5">
              <span>🔎</span>
              <span className="truncate">खोया-पाया डेस्क</span>
            </div>
            <p className="text-[10px] text-stone-600 line-clamp-2">
              लाउडस्पीकर घोषणा व बिछड़े बच्चों की त्वरित पहचान।
            </p>
          </button>

          {/* 6. Ground Volunteers */}
          <button
            onClick={() => navigate('volunteer')}
            className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-left hover:bg-emerald-100/80 active:scale-97 transition-all"
          >
            <div className="flex items-center gap-1.5 text-emerald-900 font-black mb-0.5">
              <span>🙋</span>
              <span className="truncate">स्वयंसेवक दल</span>
            </div>
            <p className="text-[10px] text-emerald-800 line-clamp-2">
              घाटों पर तैनात अधिकृत स्वयंसेवक सहायता।
            </p>
          </button>
        </div>
      </div>
    </section>
  );
};
