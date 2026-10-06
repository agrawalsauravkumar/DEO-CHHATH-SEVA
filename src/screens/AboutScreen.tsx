/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { BrandFooter } from '../components/ChhathThemeComponents';
import {
  Sun,
  Heart,
  ShieldCheck,
  Mail,
  MapPin,
  Globe,
  Phone,
  ArrowRight,
  Compass,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const AboutScreen: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col justify-between font-['Mukta',sans-serif]">
      <TopBar title="हमारे बारे में" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-5">
        {/* Brand Hero Card with Official Logo (Step 20 Requirement 26) */}
        <div className="bg-gradient-to-br from-[#0A1A2E] via-[#0F2642] to-[#16365C] text-white rounded-3xl p-6 text-center shadow-xl space-y-4 border-2 border-amber-500/40 relative overflow-hidden">
          <div className="relative mx-auto w-fit">
            <div className="w-36 h-36 rounded-full bg-amber-500/25 blur-xl absolute -inset-2 animate-pulse" />
            <div className="relative p-1 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 shadow-xl inline-block">
              <DeoChhathSevaLogo size={112} className="drop-shadow-lg" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              DEO CHHATH SEVA
            </h1>
            <p className="text-xs uppercase tracking-widest text-amber-300 font-black">
              NEXTGEN DEV BHOOMI FOUNDATION
            </p>
            <p className="text-sm font-bold text-amber-100/90 pt-0.5">
              “एक सार्वजनिक सेवा पहल” • Service Initiative
            </p>
          </div>

          <div className="py-2.5 px-4 rounded-2xl bg-white/10 border border-amber-400/30 shadow-inner">
            <p className="text-base font-black text-amber-100">
              “रास्ता भी • सहायता भी • सेवा भी”
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-white border-2 border-amber-400/60 rounded-3xl p-5 shadow-xs space-y-2.5">
          <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>हमारा सेवा संकल्प</span>
          </span>
          <blockquote className="text-sm sm:text-base font-bold text-stone-900 leading-relaxed italic border-l-4 border-amber-600 pl-3">
            “देव आने वाले श्रद्धालुओं को सरल Navigation, आवश्यक सुविधाओं की जानकारी और सहायता उपलब्ध कराने के उद्देश्य से यह निःशुल्क सेवा पहल विकसित की गई है।”
          </blockquote>
          <p className="text-xs text-stone-600 font-black text-right">
            — NEXTGEN DEV BHOOMI FOUNDATION
          </p>
        </div>

        {/* Implemented Services List (Requirement 26) */}
        <div className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">
            श्रद्धालुओं हेतु उपलब्ध सेवाएँ (Implemented Public Services)
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 font-bold flex items-center gap-2">
              <span>🧭</span> <span>Navigation (मार्ग)</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 font-bold flex items-center gap-2">
              <span>🅿️</span> <span>Parking (पार्किंग)</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 font-bold flex items-center gap-2">
              <span>🛺</span> <span>Shuttle (शटल)</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 font-bold flex items-center gap-2">
              <span>🚑</span> <span>Medical (चिकित्सा)</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 font-bold flex items-center gap-2">
              <span>🚻</span> <span>Toilet (शौचालय)</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 font-bold flex items-center gap-2">
              <span>💧</span> <span>Water (पेयजल)</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 font-bold flex items-center gap-2">
              <span>🆘</span> <span>Help (सहायता)</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 font-bold flex items-center gap-2">
              <span>👨‍👩‍👧</span> <span>Family (परिवार सुरक्षा)</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 font-bold flex items-center gap-2">
              <span>🔎</span> <span>Lost & Found (खोया-पाया)</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 font-bold flex items-center gap-2">
              <span>🙋</span> <span>Volunteers (सेवा दल)</span>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 px-1">
            सेवा के 3 मुख्य स्तंभ
          </h3>

          <div className="bg-white border border-stone-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 text-xl">
              🧭
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900">रास्ता भी (Navigation)</h4>
              <p className="text-xs text-stone-600">
                सूर्य मंदिर, पवित्र सूर्य कुंड घाट, अधिकृत 5 पार्किंग स्थल और प्राथमिक सुविधाओं तक वास्तविक जीपीएस मार्ग।
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center shrink-0 mt-0.5 text-xl">
              🆘
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900">सहायता भी (Assistance)</h4>
              <p className="text-xs text-stone-600">
                वरिष्ठ नागरिकों हेतु ई-रिक्शा, खोया-पाया उद्घोषणा, प्राथमिक चिकित्सा और 24x7 इमरजेंसी सहायता।
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 text-xl">
              💧
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900">सेवा भी (Public Service)</h4>
              <p className="text-xs text-stone-600">
                अमृत जल वितरण, स्वच्छता सहयोग, और निष्ठावान स्वयंसेवकों की अनवरत उपस्थिति।
              </p>
            </div>
          </div>
        </div>

        {/* Contact and Foundation Info */}
        <div className="bg-stone-100 rounded-3xl p-4 border border-stone-200 space-y-2 text-xs text-stone-700">
          <h4 className="font-black text-stone-900">NEXTGEN DEV BHOOMI FOUNDATION संपर्क:</h4>
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-800 shrink-0" />
            <span>NextGen सेवा शिविर, सूर्य मंदिर पूर्वी तोरण द्वार, देव (औरंगाबाद), बिहार</span>
          </p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-800 shrink-0" />
            <span>contact@nextgendevbhoomi.org</span>
          </p>
          <p className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-800 shrink-0" />
            <span>www.nextgendevbhoomi.org</span>
          </p>
        </div>

        {/* Standard Brand Footer */}
        <BrandFooter />
      </main>

      <footer className="p-4 bg-white border-t border-stone-200 sticky bottom-0 z-20">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate('home')}
            className="w-full min-h-[48px] bg-[#0F2642] hover:bg-[#16365C] active:scale-98 text-white font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <span>होम स्क्रीन पर वापस जाएं</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
