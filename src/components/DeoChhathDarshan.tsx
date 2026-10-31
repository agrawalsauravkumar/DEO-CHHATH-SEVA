/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sun,
  MapPin,
  Navigation,
  ChevronRight,
  Info,
  Sparkles,
  Train,
  Car,
  Compass,
  BookOpen,
} from 'lucide-react';

export const DeoChhathDarshan: React.FC = () => {
  const { navigate, startNavigation } = useApp();
  const [activeTab, setActiveTab] = useState<'PHOTOS' | 'HISTORY' | 'ROUTES'>('PHOTOS');

  const galleryImages = [
    {
      src: '/images/chhath/deo-sun-temple.jpg',
      title: 'देव सूर्य मंदिर (Deo Surya Mandir)',
      subtitle: 'विश्व का अद्वितीय पश्चिम-मुखी 100 फीट ऊंचा पाषाण मंदिर (1437 ई.)',
      badge: 'प्राचीन धरोहर',
      actionTarget: {
        id: 'temple-singhdwar',
        name: 'देव सूर्य मंदिर मुख्य द्वार',
        latitude: 24.6542,
        longitude: 84.4371,
        category: 'temple' as const,
        distance: 'स्थान चुनें',
        walkingTime: 'गणना जारी',
      },
    },
    {
      src: '/images/chhath/surya-kund-arghya.jpg',
      title: 'सूर्य कुंड महातीर्थ अर्घ्य (Surya Kund)',
      subtitle: 'लाखों व्रतियों द्वारा कमर तक पवित्र जल में खड़े होकर भगवान भास्कर को अर्घ्य',
      badge: 'मुख्य अर्घ्य सरोवर',
      actionTarget: {
        id: 'surya-kund-ghat',
        name: 'सूर्य कुंड अर्घ्य घाट',
        latitude: 24.6538,
        longitude: 84.4378,
        category: 'ghat' as const,
        distance: 'स्थान चुनें',
        walkingTime: 'गणना जारी',
      },
    },
    {
      src: '/images/chhath/sandhya-arghya.jpg',
      title: 'सांध्य अर्घ्य का पावन दृश्य',
      subtitle: 'अस्ताचलगामी सूर्य को अर्पण — आस्था, नियम और निष्ठा का महापर्व',
      badge: 'कार्तिक षष्ठी',
    },
    {
      src: '/images/chhath/chhath-arghya-bihar.jpg',
      title: 'पारंपरिक सूप, दउरा व ईख पूजन',
      subtitle: 'निःशुल्क सूप, दउरा, दूध एवं ठेकुआ वितरण शिविरों की सुविधा',
      badge: 'सात्विक परंपरा',
    },
  ];

  return (
    <section aria-label="देव छठ दर्शन एवं प्रामाणिक इतिहास" className="space-y-3 font-['Mukta',sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌅</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
              देव छठ दर्शन एवं पावन इतिहास
            </h3>
            <p className="text-[11px] text-stone-600 font-bold">
              देव सूर्य मंदिर • सूर्य कुंड • प्रामाणिक इतिहास एवं मार्ग
            </p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center bg-stone-200/80 p-0.5 rounded-xl text-xs font-black">
          <button
            onClick={() => setActiveTab('PHOTOS')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'PHOTOS' ? 'bg-[#041E2F] text-[#FFD54F] shadow-xs' : 'text-stone-700'
            }`}
          >
            चित्र दीर्घा
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'HISTORY' ? 'bg-[#041E2F] text-[#FFD54F] shadow-xs' : 'text-stone-700'
            }`}
          >
            इतिहास
          </button>
          <button
            onClick={() => setActiveTab('ROUTES')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'ROUTES' ? 'bg-[#041E2F] text-[#FFD54F] shadow-xs' : 'text-stone-700'
            }`}
          >
            आगमन मार्ग
          </button>
        </div>
      </div>

      {/* TAB 1: REAL CHHATH PUJA & TEMPLE PHOTOS */}
      {activeTab === 'PHOTOS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              className="group relative bg-[#FFFDF7] rounded-3xl overflow-hidden border-2 border-[#FFD54F]/70 shadow-md hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative h-48 w-full overflow-hidden bg-stone-900">
                <img
                  src={img.src}
                  alt={img.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/branding/chhath-hero-banner.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#041E2F]/90 text-[#FFD54F] border border-[#FFD54F]/60 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {img.badge}
                </span>
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h4 className="text-sm sm:text-base font-black leading-tight drop-shadow-md">
                    {img.title}
                  </h4>
                </div>
              </div>

              <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                <p className="text-xs text-stone-700 leading-relaxed font-semibold">
                  {img.subtitle}
                </p>

                {img.actionTarget && (
                  <button
                    onClick={() => {
                      startNavigation(img.actionTarget as any);
                      navigate('map');
                    }}
                    className="w-full min-h-[38px] rounded-xl bg-gradient-to-r from-[#0B5E8E] to-[#041E2F] hover:from-[#073B5A] hover:to-[#02131E] text-[#FFD54F] font-black text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all border border-[#FFD54F]/40"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>नक्शे पर देखें व मार्ग पाएं</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: AUTHENTIC DEO CHHATH HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="bg-[#FFFDF7] rounded-3xl p-4 sm:p-5 border-2 border-[#FFD54F]/70 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 border-b border-amber-200/80 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0B5E8E] to-[#041E2F] text-[#FFD54F] flex items-center justify-center text-xl font-black">
              ☀️
            </div>
            <div>
              <h4 className="text-base font-black text-stone-900 leading-tight">
                देवार्क धाम: सूर्य उपासना का वैश्विक महाकेंद्र
              </h4>
              <span className="text-[11px] font-bold text-amber-800">
                औरंगाबाद जिला, बिहार • 15 लाख श्रद्धालुओं का आस्था स्थल
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-stone-800 leading-relaxed">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 space-y-1">
              <strong className="text-amber-950 font-black block">
                🚩 अद्वितीय पश्चिम-मुखी मंदिर का रहस्य:
              </strong>
              <p>
                भारत के प्रायः सभी सूर्य मंदिर (जैसे कोणार्क) पूर्व दिशा में उदीयमान सूर्य की ओर मुख किए हुए हैं, परंतु <strong>देव का सूर्य मंदिर विश्व का एकमात्र प्रमुख सूर्य मंदिर है जो पश्चिमाभिमुख (West-Facing)</strong> है। लोक मान्यता है कि भगवान विश्वकर्मा ने इसका निर्माण एक ही रात्रि में किया था।
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
              <strong className="text-blue-950 font-black block">
                🌊 सूर्य कुंड महातीर्थ एवं राजा ऐल की कथा:
              </strong>
              <p>
                पौराणिक मान्यतानुसार, अयोध्या के राजा ऐल शिकार के दौरान कुष्ठ रोग से पीड़ित होकर इस वन क्षेत्र में पहुंचे। यहाँ के पावन सरोवर (सूर्य कुंड) के जल से हाथ-मुंह धोने पर उनका रोग चमत्कारिक रूप से दूर हो गया। आज भी लाखों श्रद्धालु सूर्य कुंड के जल में पवित्र स्नान कर भगवान भास्कर को सांध्य व प्रातः अर्घ्य अर्पित करते हैं।
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
              <strong className="text-emerald-950 font-black block">
                🏛️ स्थापत्य कला एवं ऐतिहासिक अभिलेख:
              </strong>
              <p>
                मंदिर लगभग 100 फीट ऊंचा है तथा इसके निर्माण में नागर, द्रविड़ और वेसर शैलियों का अद्भुत संगम दिखता है। मंदिर के बाहर उत्कीर्ण 1437 ईस्वी (15वीं शताब्दी) का शिलालेख उमगा के राजा भैरवेंद्र सिंह द्वारा इसके जीर्णोद्धार का प्रमाण प्रस्तुत करता है।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFIED ROUTES & TRAVEL INFORMATION */}
      {activeTab === 'ROUTES' && (
        <div className="bg-[#FFFDF7] rounded-3xl p-4 sm:p-5 border-2 border-[#FFD54F]/70 shadow-md space-y-3.5">
          <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2.5">
            <Compass className="w-5 h-5 text-[#0B5E8E]" />
            <h4 className="text-sm font-black text-stone-900">
              देव धाम पहुँचने के आधिकारिक मार्ग (How to Reach Deo)
            </h4>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Train Route */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0B5E8E] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                <Train className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h5 className="font-black text-stone-900">निकटतम रेलवे स्टेशन:</h5>
                <p className="text-stone-700 font-semibold">
                  <strong>अनुग्रह नारायण रोड (AUBR)</strong> — देव से लगभग 20 किमी दूर। दिल्ली-हावड़ा ग्रैंड कॉर्ड लाइन पर स्थित। यहाँ से चौबीसों घंटे ऑटो, बस व ई-रिक्शा उपलब्ध हैं।
                </p>
              </div>
            </div>

            {/* Road / Highway Route */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F47B20] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                <Car className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h5 className="font-black text-stone-900">सड़क मार्ग (Grand Trunk Road):</h5>
                <p className="text-stone-700 font-semibold">
                  <strong>राष्ट्रीय राजमार्ग 19 (NH-19 / GT Road)</strong> से औरंगाबाद शहर पहुँचें। औरंगाबाद से जसोइया मोड़ होते हुए देव मुख्य मार्ग (10 किमी) सीधे मंदिर तक जाता है।
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold">
                    पटना ➔ देव: 160 किमी
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold">
                    गया ➔ देव: 80 किमी
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold">
                    वाराणसी ➔ देव: 180 किमी
                  </span>
                </div>
              </div>
            </div>

            {/* Official Parking Zones */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-300">
              <h5 className="font-black text-amber-950 mb-1">प्रशासनिक पार्किंग स्थल:</h5>
              <ul className="list-disc list-inside text-stone-700 space-y-0.5 font-semibold">
                <li><strong>P1: राजा जगन्नाथ हाई स्कूल मैदान</strong> (बस एवं भारी वाहन)</li>
                <li><strong>P2: देव डिग्री कॉलेज मैदान</strong> (चार पहिया वाहन / कार)</li>
                <li><strong>P3: प्रखंड सह अंचल कार्यालय परिसर</strong> (दो पहिया वाहन)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

