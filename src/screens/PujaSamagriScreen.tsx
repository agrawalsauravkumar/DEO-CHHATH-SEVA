/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import {
  ShoppingBag,
  Sparkles,
  ShieldAlert,
  PhoneCall,
  Navigation,
  MapPin,
  CheckCircle,
  Clock,
  Heart,
  AlertTriangle,
} from 'lucide-react';
import { DEO_LOCATIONS } from '../data/deoData';

interface SamagriPrice {
  name: string;
  unit: string;
  adminRate: string;
  notes: string;
}

const SAMAGRI_PRICE_LIST: SamagriPrice[] = [
  {
    name: 'पारंपरिक बांस का सूप (Bamboo Sup)',
    unit: 'प्रति पीस (1 Pc)',
    adminRate: '₹50 - ₹70',
    notes: 'अच्छी बुनाई, बिना दरार वाला ताजा बांस',
  },
  {
    name: 'बड़ा बांस का दउरा (Bamboo Daura)',
    unit: 'प्रति पीस (1 Pc)',
    adminRate: '₹120 - ₹150',
    notes: 'प्रसाद व ऋतुफल रखने हेतु पारंपरिक दउरा',
  },
  {
    name: 'पानी वाला नारियल (Jal Nariyal)',
    unit: 'प्रति पीस (1 Pc)',
    adminRate: '₹35 - ₹45',
    notes: 'जटा युक्त एवं जल से पूर्ण पूजा नारियल',
  },
  {
    name: 'साबुत हरी ईख / गन्ना (Fresh Sugarcane)',
    unit: 'जोड़ा (2 Pcs)',
    adminRate: '₹40 - ₹60',
    notes: 'हरी पत्तियों सहित ताजा गन्ना',
  },
  {
    name: 'शुद्ध गाय का कच्चा दूध (Raw Cow Milk)',
    unit: 'प्रति लीटर (1 Litre)',
    adminRate: '₹60',
    notes: 'सुधा एवं जिला दुग्ध संघ द्वारा नियंत्रित दर',
  },
  {
    name: 'शुद्ध देशी घी (Pure Desi Ghee)',
    unit: 'प्रति 500 ग्राम',
    adminRate: '₹320 - ₹350',
    notes: 'ठेकुआ महाप्रसाद निर्माण हेतु पैक्ड घी',
  },
  {
    name: 'मिट्टी का चूल्हा (Clay Chulha)',
    unit: 'प्रति पीस',
    adminRate: '₹40 - ₹60',
    notes: 'खरना व अर्घ्य प्रसाद बनाने हेतु',
  },
  {
    name: 'मिट्टी के दीपक (Earthen Diyas)',
    unit: '50 पीस का पैकेट',
    adminRate: '₹50 - ₹60',
    notes: 'शुद्ध पक्की मिट्टी से निर्मित दीये',
  },
];

interface FreeCamp {
  id: string;
  name: string;
  organizer: string;
  itemsOffered: string[];
  locationDesc: string;
  timings: string;
  lat: number;
  lng: number;
}

const FREE_CAMPS: FreeCamp[] = [
  {
    id: 'camp-milk',
    name: 'निःशुल्क कच्चा गाय दूध व गंगाजल वितरण शिविर',
    organizer: 'NEXTGEN DEVBHOOMI FOUNDATION',
    itemsOffered: ['शुद्ध गाय का कच्चा दूध', 'पवित्र गंगाजल', 'पूजा दातुन'],
    locationDesc: 'सूर्य कुंड पूर्वी द्वार (अर्घ्य सरोवर के ठीक सामने)',
    timings: 'संध्या अर्घ्य दोपहर 01:00 PM से एवं उषा अर्घ्य भोर 03:00 AM से',
    lat: 24.6585,
    lng: 84.4345,
  },
  {
    id: 'camp-sup',
    name: 'निःशुल्क बांस का सूप एवं दउरा सहायता केंद्र',
    organizer: 'जिला प्रशासन एवं देव सेवा संघ',
    itemsOffered: ['निःशुल्क बांस का सूप', 'प्रसाद थैला', 'माचिस व अगरबत्ती'],
    locationDesc: 'गांधी मैदान नियंत्रण कक्ष के पास',
    timings: 'प्रातः 08:00 AM से सायं 06:00 PM तक',
    lat: 24.6565,
    lng: 84.4362,
  },
  {
    id: 'camp-water',
    name: '24 घंटे शीतल पेयजल व नीम्बू-पानी महासेवा',
    organizer: 'NEXTGEN DEVBHOOMI FOUNDATION',
    itemsOffered: ['RO शीतल शुद्ध जल', 'नींबू-पानी शिकंजी', 'ओआरएस घोल'],
    locationDesc: 'देव सूर्य मंदिर मुख्य प्रवेश चौराहा',
    timings: '24×7 निरंतर मेला अवधि में',
    lat: 24.6595,
    lng: 84.4335,
  },
];

export const PujaSamagriScreen: React.FC = () => {
  const { startNavigation, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'RATES' | 'FREE_CAMPS'>('RATES');

  const handleNavigate = (title: string, lat: number, lng: number) => {
    const matched = DEO_LOCATIONS.find((l) => l.latitude && Math.abs(l.latitude - lat) < 0.005) || {
      id: `camp-${Date.now()}`,
      name: title,
      nameEn: title,
      category: 'help' as const,
      distance: '300 मी',
      walkingTime: '4 मिनट',
      description: title,
      landmark: 'सूर्य कुंड परिसर',
      latitude: lat,
      longitude: lng,
      x: 50,
      y: 50,
    };
    startNavigation(matched);
    navigate('map');
  };

  return (
    <div className="min-h-screen bg-[#FFF8E1] text-stone-900 pb-28 flex flex-col font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <TopBar title="पूजा सामग्री दर व निःशुल्क शिविर" showBack />

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-4">
        <div role="status" className="rounded-2xl border border-amber-500 bg-amber-50 p-4 text-sm font-bold text-amber-950">
          यह दर सूची और शिविर विवरण अभी प्रशासन/विक्रेताओं से सत्यापित नहीं हैं। खरीदने या यात्रा करने से पहले स्थानीय रूप से पुष्टि करें।
        </div>
        {/* Banner */}
        <div className="bg-gradient-to-br from-[#0B5E8E] via-[#07476F] to-[#04283F] text-white rounded-3xl p-5 shadow-lg border-2 border-amber-400 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 border border-amber-300 text-amber-300 px-2.5 py-0.5 rounded-full inline-block">
              जिला प्रशासन व संस्था सेवा निगरानी
            </span>
            <h2 className="text-xl font-black text-white">
              पूजा सामग्री दर सूची एवं निःशुल्क शिविर
            </h2>
            <p className="text-xs text-amber-100">
              छठ व्रतियों की सुविधा हेतु आधिकारिक निर्धारित दरें एवं निःशुल्क वितरण केंद्र
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-[#0B5E8E]/10 p-1.5 rounded-2xl border border-[#0B5E8E]/20 text-xs font-black">
          <button
            onClick={() => setActiveTab('RATES')}
            className={`py-2.5 px-3 rounded-xl transition-all ${
              activeTab === 'RATES'
                ? 'bg-[#0B5E8E] text-white shadow-md'
                : 'text-[#0B5E8E] hover:bg-white/50'
            }`}
          >
            📋 आधिकारिक दर सूची (Fair Rates)
          </button>
          <button
            onClick={() => setActiveTab('FREE_CAMPS')}
            className={`py-2.5 px-3 rounded-xl transition-all ${
              activeTab === 'FREE_CAMPS'
                ? 'bg-[#0B5E8E] text-white shadow-md'
                : 'text-[#0B5E8E] hover:bg-white/50'
            }`}
          >
            🎁 निःशुल्क वितरण शिविर ({FREE_CAMPS.length})
          </button>
        </div>

        {/* TAB 1: OFFICIAL PRICE LIST */}
        {activeTab === 'RATES' && (
          <div className="space-y-3">
            {/* Anti-Price-Gouging Notice */}
            <div className="bg-amber-100 border border-amber-300 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-amber-950 font-medium">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">
                  ⚠️ अनुमंडल दंडाधिकारी (SDM) का सख्त निर्देश:
                </p>
                <p className="leading-relaxed mt-0.5">
                  मेला क्षेत्र में किसी भी दुकानदार द्वारा निर्धारित दर से अधिक वसूली करना दंडनीय अपराध है। अधिक दर मांगने पर तुरंत अनुमंडल नियंत्रण कक्ष (06186-223126) पर शिकायत करें।
                </p>
              </div>
            </div>

            {/* Price Table / Cards */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-xs space-y-2">
              <div className="border-b border-stone-200 pb-2">
                <h3 className="text-sm font-black text-[#0B5E8E]">
                  छठ महापर्व प्रमुख सामग्री अनुमोदित मूल्य सूची
                </h3>
              </div>

              <div className="divide-y divide-stone-100">
                {SAMAGRI_PRICE_LIST.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="space-y-0.5">
                      <p className="font-black text-stone-900">{item.name}</p>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {item.unit} • {item.notes}
                      </p>
                    </div>
                    <span className="shrink-0 font-black text-[#0B5E8E] bg-[#FFF8E1] border border-amber-300 px-3 py-1 rounded-xl text-xs sm:text-sm">
                      {item.adminRate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FREE DISTRIBUTION CAMPS */}
        {activeTab === 'FREE_CAMPS' && (
          <div className="space-y-3">
            {FREE_CAMPS.map((camp) => (
              <div
                key={camp.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-xs space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      100% निःशुल्क सेवा (Free)
                    </span>
                    <span className="text-[10px] font-bold text-stone-500">
                      आयोजक: {camp.organizer}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#0B5E8E]">{camp.name}</h3>

                  <p className="text-xs text-stone-600 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    {camp.locationDesc}
                  </p>
                </div>

                <div className="space-y-1 bg-[#FFF8E1] p-3 rounded-2xl border border-amber-200 text-xs">
                  <span className="font-bold text-stone-700 block">उपलब्ध सामग्री:</span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {camp.itemsOffered.map((it, i) => (
                      <span
                        key={i}
                        className="bg-white px-2 py-0.5 rounded-md border border-amber-300 font-semibold text-stone-800"
                      >
                        ✓ {it}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-stone-500 pt-1 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#0B5E8E]" />
                    {camp.timings}
                  </p>
                </div>

                <button
                  onClick={() => handleNavigate(camp.name, camp.lat, camp.lng)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0B5E8E] hover:bg-[#07476F] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>शिविर का रास्ता देखें (GPS)</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
