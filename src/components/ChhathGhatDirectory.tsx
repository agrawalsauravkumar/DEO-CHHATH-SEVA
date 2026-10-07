/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { DEO_LOCATIONS } from '../data/deoData';
import {
  Navigation,
  MapPin,
  Droplets,
  ShieldCheck,
  Compass,
  ArrowRight,
  Car,
  HeartPulse,
  Sparkles,
} from 'lucide-react';

export const ChhathGhatDirectory: React.FC = () => {
  const { navigate, setSelectedMapItem } = useApp();

  const ghats = [
    {
      id: 'surya-kund',
      name: 'सूर्य कुंड महातीर्थ घाट',
      nameEn: 'Surya Kund Mahatirth Ghat',
      tagline: 'मुख्य छठ महापर्व अर्घ्य सरोवर (Western & Southern Banks)',
      description: 'लाखों छठ व्रतियों का पावन अर्घ्य स्थल। भगवान भास्कर को प्रातः एवं सांध्य अर्घ्य अर्पण का मुख्य केंद्र।',
      landmark: 'सूर्य मंदिर सिंहद्वार के सम्मुख',
      distance: '200 मी',
      walkingTime: '3 मिनट',
      latitude: 24.6538,
      longitude: 84.4375,
      isVerified: true,
      nearbyFacilities: {
        parking: 'P1 डिग्री कॉलेज (450 मी), P2 हाई स्कूल (350 मी)',
        medical: 'सूर्य कुंड प्राथमिक चिकित्सा सहायता पोस्ट (108)',
        toilet: 'सूर्य कुंड दक्षिणी तट महिला/दिव्यांग शौचालय',
        water: 'NextGen अमृत शीतल पेय जल केंद्र (0 मी)',
        help: 'केंद्रीय मेला सहायता नियंत्रण कक्ष (100 मी)',
      },
      gradient: 'from-amber-600/20 via-orange-500/10 to-transparent',
      borderColor: 'border-amber-400',
    },
    {
      id: 'rudra-kund',
      name: 'रुद्र कुंड पावन सरोवर घाट',
      nameEn: 'Rudra Kund Sacred Ghat',
      tagline: 'द्वितीय अर्घ्य एवं स्नान सरोवर (Eastern Corridor)',
      description: 'सूर्य कुंड के निकट स्थित शांत व पावन सरोवर। परिक्रमा मार्ग एवं अतिरिक्त अर्घ्य वेदी उपलब्ध।',
      landmark: 'रुद्र कुंड लिंक मार्ग, देव',
      distance: '650 मी',
      walkingTime: '8 मिनट',
      latitude: 24.6525,
      longitude: 84.4358,
      isVerified: true,
      nearbyFacilities: {
        parking: 'P2 राजा जगन्नाथ हाई स्कूल (400 मी)',
        medical: 'रुद्र कुंड प्राथमिक स्वास्थ्य पोस्ट',
        toilet: 'थाना मोड़ सार्वजनिक सुलभ शौचालय (250 मी)',
        water: 'रुद्र कुंड मार्ग शुद्ध जल केंद्र',
        help: 'स्वयंसेवक सहायता पॉइंट 4',
      },
      gradient: 'from-sky-600/20 via-blue-500/10 to-transparent',
      borderColor: 'border-sky-400',
    },
  ];

  const handleNavigateToGhat = (ghatId: string) => {
    const loc = DEO_LOCATIONS.find((l) => l.id === ghatId) || DEO_LOCATIONS[1];
    setSelectedMapItem(loc);
    navigate('navigation-preview');
  };

  return (
    <section aria-label="छठ घाट निर्देशिका" className="space-y-3 font-['Mukta',sans-serif]">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">☀️</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
              छठ घाट (Sacred Ghat Directory)
            </h3>
            <p className="text-[11px] text-stone-500 font-bold">
              पवित्र अर्घ्य सरोवर, सुगम रास्ता एवं समीपवर्ती आवश्यक सुविधाएँ
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full shrink-0">
          अधिकृत घाट
        </span>
      </div>

      {/* Ghat Cards */}
      <div className="space-y-3">
        {ghats.map((ghat) => (
          <div
            key={ghat.id}
            className={`bg-white border-2 ${ghat.borderColor} rounded-3xl p-4 shadow-sm relative overflow-hidden space-y-3 transition-all hover:shadow-md`}
          >
            {/* Subtle River Wave Gradient Background */}
            <div className={`absolute top-0 right-0 w-48 h-32 bg-gradient-to-bl ${ghat.gradient} rounded-bl-full pointer-events-none`} />

            {/* Top Row: Name, Tagline & Verified Badge */}
            <div className="flex items-start justify-between gap-2 relative z-10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-base font-black text-[#0B5E8E] leading-tight">
                    {ghat.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.2 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>VERIFIED</span>
                  </span>
                </div>
                <p className="text-xs font-bold text-amber-900">
                  {ghat.tagline}
                </p>
              </div>

              {/* Walking ETA Badge */}
              <div className="text-right shrink-0 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-xl">
                <span className="block text-xs font-black text-stone-900 leading-none">
                  {ghat.walkingTime}
                </span>
                <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">
                  ({ghat.distance})
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-600 leading-relaxed relative z-10">
              {ghat.description}
            </p>

            {/* Nearby Verified Facilities Grid */}
            <div className="bg-stone-50/90 rounded-2xl p-3 border border-stone-200/80 space-y-2 text-xs relative z-10">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                घाट के समीप आवश्यक सुविधाएँ:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-stone-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>🅿️</span>
                  <span className="truncate"><strong>पार्किंग:</strong> {ghat.nearbyFacilities.parking}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🚑</span>
                  <span className="truncate"><strong>चिकित्सा:</strong> {ghat.nearbyFacilities.medical}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🚻</span>
                  <span className="truncate"><strong>शौचालय:</strong> {ghat.nearbyFacilities.toilet}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>💧</span>
                  <span className="truncate"><strong>पेयजल:</strong> {ghat.nearbyFacilities.water}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-rose-900 font-bold border-t border-stone-200/60">
                <span>🆘</span>
                <span><strong>सहायता केंद्र:</strong> {ghat.nearbyFacilities.help}</span>
              </div>
            </div>

            {/* Direct Action: रास्ता देखें */}
            <div className="flex items-center justify-between pt-1 relative z-10">
              <span className="text-xs text-stone-500 font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>{ghat.landmark}</span>
              </span>

              <button
                onClick={() => handleNavigateToGhat(ghat.id)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Compass className="w-4 h-4 text-stone-950" />
                <span>घाट का रास्ता दिखाएँ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
