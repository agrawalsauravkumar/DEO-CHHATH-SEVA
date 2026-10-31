/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Navigation,
  Compass,
  Train,
  Car,
  Clock,
  Sparkles,
  ShoppingBag,
  Info,
  Calendar,
  Waves,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { DEO_LOCATIONS } from '../data/deoData';

export const DeoChhathDarshan: React.FC = () => {
  const { navigate, startNavigation } = useApp();
  const [activeTab, setActiveTab] = useState<'PHOTOS' | 'HISTORY' | 'ROUTES'>('PHOTOS');

  const handleNavigateToLocation = (locationId: string) => {
    const loc = DEO_LOCATIONS.find((l) => l.id === locationId) || DEO_LOCATIONS[0];
    startNavigation(loc);
    navigate('map');
  };

  const galleryItems = [
    {
      id: 'temple',
      src: '/images/chhath/deo-sun-temple.jpg',
      title: 'देव सूर्य मंदिर (Deo Surya Mandir)',
      subtitle: 'विश्व का अद्वितीय पश्चिम-मुखी 100 फीट ऊंचा पाषाण मंदिर (1437 ई.)',
      badge: '🚩 प्राचीन पाषाण मंदिर',
      pills: ['100 फ़ीट शिखर', 'पश्चिमाभिमुख गर्भगृह', '1437 ई. शिलालेख'],
      description:
        'नागर एवं द्रविड़ स्थापत्य का अद्भुत संगम। एक ही रात्रि में भगवान विश्वकर्मा द्वारा निर्मित पाषाण मंदिर। उमगा नरेश भैरवेंद्र सिंह का 15वीं शताब्दी का शिलालेख आज भी विद्यमान है।',
      actionLabel: 'मंदिर का मार्ग व नेविगेशन',
      actionIcon: Navigation,
      onAction: () => handleNavigateToLocation('deo-surya-mandir'),
    },
    {
      id: 'kund',
      src: '/images/chhath/surya-kund-arghya.jpg',
      title: 'सूर्य कुंड महातीर्थ (Surya Kund Mahatirth)',
      subtitle: 'लाखों व्रतियों द्वारा कमर तक पावन जल में खड़े होकर अर्घ्य अर्पण',
      badge: '🌊 मुख्य अर्घ्य सरोवर',
      pills: ['पवित्र अर्घ्य सरोवर', 'राजा ऐल कुष्ठ मुक्ति तीर्थ', 'पक्की सीढ़ियां'],
      description:
        'त्रेतायुगीन पवित्र सरोवर जहाँ अयोध्यानरेश राजा ऐल का कुष्ठ रोग चमत्कारिक रूप से शांत हुआ था। आज भी लाखों श्रद्धालु यहाँ स्नान कर भगवान भास्कर को सांध्य व प्रातः अर्घ्य अर्पित करते हैं।',
      actionLabel: 'सूर्य कुंड घाट का मार्ग',
      actionIcon: Navigation,
      onAction: () => handleNavigateToLocation('surya-kund'),
    },
    {
      id: 'arghya',
      src: '/images/chhath/sandhya-arghya.jpg',
      title: 'सांध्य व उषा अर्घ्य (Sandhya & Usha Arghya)',
      subtitle: 'अस्ताचलगामी एवं उदीयमान भुवन भास्कर को पावन सूप से अर्घ्य अर्पण',
      badge: '🌅 पावन अर्घ्य विधान',
      pills: ['षष्ठी सांध्य 05:14 PM', 'सप्तमी उषा 06:08 AM', '36 घंटे निर्जला'],
      description:
        'छठ महापर्व की मुख्य विशेषता — डूबते सूर्य को पहला अर्घ्य तथा उगते सूर्य को दूसरा अर्घ्य। बांस के सूप में शुद्ध ऋतुफल, नारियल व दीप प्रज्वलित कर भगवान भुवन भास्कर की आराधना की जाती है।',
      actionLabel: 'अर्घ्य मुहूर्त व समय सारणी',
      actionIcon: Clock,
      onAction: () => {
        const muhuratEl = document.querySelector('[aria-label="छठ अर्घ्य मुहूर्त व समय"]');
        if (muhuratEl) {
          muhuratEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate('chhath-katha');
        }
      },
    },
    {
      id: 'prasad',
      src: '/images/chhath/chhath-arghya-bihar.jpg',
      title: 'पारंपरिक सूप, दउरा व ईख पूजन',
      subtitle: 'शुद्ध देशी घी ठेकुआ, मौसमी फल एवं निःशुल्क वितरण शिविर',
      badge: '🎋 सात्विक महाप्रसाद',
      pills: ['निःशुल्क सेवा शिविर', 'बांस का सूप व दउरा', 'शुद्ध घी ठेकुआ'],
      description:
        'छठ महापर्व का प्रसाद पूर्णतः सात्विक एवं प्राकृतिक होता है। संस्था एवं जिला प्रशासन द्वारा दूर-दराज से आए छठ व्रतियों हेतु निःशुल्क सूप, दउरा, कच्चा दूध एवं ठेकुआ शिविर संचालित किए जा रहे हैं।',
      actionLabel: 'निःशुल्क शिविर व सामग्री सूची',
      actionIcon: ShoppingBag,
      onAction: () => {
        navigate('prasad-camps');
      },
    },
  ];

  return (
    <section aria-label="देव छठ दर्शन एवं प्रामाणिक इतिहास" className="space-y-3.5 font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0B5E8E] to-[#073B78] text-[#FFD54F] flex items-center justify-center text-xl shadow-xs shrink-0 font-bold border border-[#FFD54F]/40">
            🌅
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
              देव छठ दर्शन एवं पावन इतिहास
            </h3>
            <p className="text-[11px] text-stone-600 font-bold">
              विश्व प्रसिद्ध सूर्य मंदिर • सूर्य कुंड महातीर्थ • प्रामाणिक इतिहास व मार्ग
            </p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center bg-stone-200/90 p-1 rounded-2xl text-xs font-black self-start sm:self-auto border border-stone-300/80">
          <button
            type="button"
            onClick={() => setActiveTab('PHOTOS')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'PHOTOS'
                ? 'bg-[#073B78] text-[#FFD54F] shadow-xs'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            चित्र दीर्घा
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-[#073B78] text-[#FFD54F] shadow-xs'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            इतिहास
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ROUTES')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'ROUTES'
                ? 'bg-[#073B78] text-[#FFD54F] shadow-xs'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            आगमन मार्ग
          </button>
        </div>
      </div>

      {/* TAB 1: AUTHENTIC PHOTOGRAPHIC GALLERY */}
      {activeTab === 'PHOTOS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {galleryItems.map((item) => {
            const ActionIcon = item.actionIcon;
            return (
              <div
                key={item.id}
                className="group bg-[#FFFDF8] rounded-3xl overflow-hidden border-2 border-amber-300/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-stone-900">
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-3 py-1 rounded-xl bg-[#073B78]/95 text-[#FFD54F] border border-[#FFD54F]/50 text-[11px] font-black shadow-md backdrop-blur-xs">
                      {item.badge}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-black/60 text-white/90 text-[10px] font-bold border border-white/20 backdrop-blur-xs">
                      देवार्क धाम
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                  <div className="space-y-2">
                    <h4 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-[#0B5E8E] transition-colors leading-snug">
                      {item.title}
                    </h4>

                    {/* Metadata Feature Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.pills.map((pill, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-950 border border-amber-300/80 text-[10px] font-black"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed font-semibold">
                      {item.description}
                    </p>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#073B78] to-[#0B5E8E] hover:from-[#052A56] hover:to-[#08486D] text-[#FFD54F] font-black text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-98 transition-all border border-[#FFD54F]/50 mt-1"
                  >
                    <ActionIcon className="w-4 h-4 shrink-0 text-[#FFD54F]" />
                    <span>{item.actionLabel}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: AUTHENTIC DEO CHHATH HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="bg-[#FFFDF8] rounded-3xl p-4 sm:p-5 border-2 border-amber-300/80 shadow-md space-y-4">
          <div className="flex items-center gap-3 border-b border-amber-200/80 pb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#073B78] to-[#0B5E8E] text-[#FFD54F] flex items-center justify-center text-2xl font-black shadow-xs shrink-0 border border-[#FFD54F]/40">
              ☀️
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                देवार्क धाम: सूर्य उपासना का वैश्विक महाकेंद्र
              </h4>
              <span className="text-[11px] font-bold text-amber-800">
                औरंगाबाद जिला, बिहार • 15 लाख श्रद्धालुओं का आस्था तीर्थ
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-stone-800 leading-relaxed">
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-1.5">
              <strong className="text-amber-950 font-black text-sm flex items-center gap-1.5">
                <span>🚩</span>
                <span>अद्वितीय पश्चिमाभिमुख मंदिर का रहस्य व विश्वकर्मा निर्माण:</span>
              </strong>
              <p>
                भारत के प्रायः सभी सूर्य मंदिर (जैसे कोणार्क) पूर्व दिशा में उदीयमान सूर्य की ओर मुख किए हुए हैं, परंतु <strong>देव का सूर्य मंदिर विश्व का एकमात्र प्रमुख सूर्य मंदिर है जो पश्चिमाभिमुख (West-Facing)</strong> है। लोक मान्यता है कि भगवान विश्वकर्मा ने इसका निर्माण एक ही रात्रि में किया था। गर्भगृह में भगवान भास्कर के तीनों रूप — उदयाचल (उगता सूर्य), मध्याह्न (दोपहर का सूर्य) और अस्ताचल (डूबता सूर्य) — की मूर्तियां पाषाण पर उत्कीर्ण हैं।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/90 border border-sky-300 space-y-1.5">
              <strong className="text-sky-950 font-black text-sm flex items-center gap-1.5">
                <span>🌊</span>
                <span>सूर्य कुंड महातीर्थ एवं अयोध्या नरेश राजा ऐल की पावन कथा:</span>
              </strong>
              <p>
                पौराणिक मान्यतानुसार, त्रेतायुग में अयोध्या के राजा ऐल शिकार के दौरान कुष्ठ रोग से पीड़ित होकर इस वन क्षेत्र में पहुंचे। यहाँ के पावन सरोवर (सूर्य कुंड) के जल से हाथ-मुंह धोने पर उनका रोग चमत्कारिक रूप से दूर हो गया। स्वप्न में भगवान सूर्य के आदेशानुसार उन्होंने मंदिर का निर्माण करवाया। आज भी लाखों श्रद्धालु सूर्य कुंड के पवित्र जल में स्नान कर भगवान सूर्य को अर्घ्य अर्पित करते हैं।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-300 space-y-1.5">
              <strong className="text-emerald-950 font-black text-sm flex items-center gap-1.5">
                <span>🏛️</span>
                <span>स्थापत्य कला, 100 फीट शिखर एवं 1437 ईस्वी का शिलालेख:</span>
              </strong>
              <p>
                मंदिर लगभग 100 फीट ऊंचा है तथा इसके निर्माण में नागर, द्रविड़ और वेसर शैलियों का अद्भुत संगम दिखता है। पत्थरों को बिना किसी गारे या सीमेंट के केवल खांचों (इंटर-लॉकिंग) द्वारा जोड़ा गया है। मंदिर के बाहर उत्कीर्ण 1437 ईस्वी (15वीं शताब्दी) का शिलालेख उमगा के राजा भैरवेंद्र सिंह द्वारा इसके जीर्णोद्धार का ऐतिहासिक प्रमाण प्रस्तुत करता है।
              </p>
            </div>
          </div>

          {/* Direct Navigation to Temple */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => handleNavigateToLocation('deo-surya-mandir')}
              className="flex-1 min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#073B78] to-[#0B5E8E] text-[#FFD54F] font-black text-xs flex items-center justify-center gap-2 border border-[#FFD54F]/50 shadow-sm active:scale-98 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>नक्शे पर मंदिर का मार्ग देखें</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('chhath-katha')}
              className="flex-1 min-h-[42px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center justify-center gap-2 border border-amber-600/30 shadow-sm active:scale-98 transition-all"
            >
              <span>📖 संपूर्ण देव कथा व महिमा पढ़ें</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFIED ROUTES & TRAVEL INFORMATION */}
      {activeTab === 'ROUTES' && (
        <div className="bg-[#FFFDF8] rounded-3xl p-4 sm:p-5 border-2 border-amber-300/80 shadow-md space-y-3.5">
          <div className="flex items-center gap-2.5 border-b border-amber-200/80 pb-2.5">
            <Compass className="w-5 h-5 text-[#073B78]" />
            <h4 className="text-base font-black text-stone-900">
              देव धाम पहुँचने के आधिकारिक मार्ग (How to Reach Deo)
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            {/* Train Route */}
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 flex items-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#073B78] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                <Train className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h5 className="font-black text-stone-900 text-sm">निकटतम रेलवे स्टेशन:</h5>
                <p className="text-stone-700 font-semibold mt-0.5 leading-relaxed">
                  <strong>अनुग्रह नारायण रोड (AUBR)</strong> — देव से लगभग 20 किमी दूर। दिल्ली-हावड़ा मुख्य ग्रैंड कॉर्ड लाइन पर स्थित। यहाँ से चौबीसों घंटे बस, ऑटो व ई-रिक्शा उपलब्ध हैं।
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold text-[10px]">
                    स्टेशन कोड: AUBR
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold text-[10px]">
                    दूरी: 20 किमी (35 मिनट)
                  </span>
                </div>
              </div>
            </div>

            {/* Road / Highway Route */}
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 flex items-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#FF8C00] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                <Car className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h5 className="font-black text-stone-900 text-sm">सड़क मार्ग (Grand Trunk Road):</h5>
                <p className="text-stone-700 font-semibold mt-0.5 leading-relaxed">
                  <strong>राष्ट्रीय राजमार्ग 19 (NH-19 / पुराना GT Road)</strong> से औरंगाबाद शहर पहुँचें। औरंगाबाद से जसोइया मोड़ होते हुए देव मुख्य मार्ग (10 किमी) सीधे मंदिर तक जाता है।
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-bold">
                    पटना ➔ देव: 160 किमी (4 घंटे)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-bold">
                    गया ➔ देव: 80 किमी (2 घंटे)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-bold">
                    वाराणसी ➔ देव: 180 किमी (4 घंटे)
                  </span>
                </div>
              </div>
            </div>

            {/* Official Parking Zones with Direct Navigation */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2">
              <h5 className="font-black text-amber-950 text-sm flex items-center gap-1.5">
                <span>🅿️</span>
                <span>प्रशासनिक अधिकृत पार्किंग स्थल (Official Parking Zones):</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleNavigateToLocation('parking-1')}
                  className="p-2.5 rounded-xl bg-white border border-amber-300 text-left hover:border-amber-500 shadow-xs transition-all flex flex-col justify-between"
                >
                  <span className="font-black text-amber-950 text-xs">P1: हाई स्कूल मैदान</span>
                  <span className="text-[10px] text-stone-600 font-semibold mt-0.5">बस व भारी वाहन • 950 मी</span>
                  <span className="text-[10px] text-[#073B78] font-bold mt-1.5 flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    <span>मार्ग देखें</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigateToLocation('parking-2')}
                  className="p-2.5 rounded-xl bg-white border border-amber-300 text-left hover:border-amber-500 shadow-xs transition-all flex flex-col justify-between"
                >
                  <span className="font-black text-amber-950 text-xs">P2: डिग्री कॉलेज मैदान</span>
                  <span className="text-[10px] text-stone-600 font-semibold mt-0.5">चार पहिया / कार • 800 मी</span>
                  <span className="text-[10px] text-[#073B78] font-bold mt-1.5 flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    <span>मार्ग देखें</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('parking')}
                  className="p-2.5 rounded-xl bg-white border border-amber-300 text-left hover:border-amber-500 shadow-xs transition-all flex flex-col justify-between"
                >
                  <span className="font-black text-amber-950 text-xs">सभी पार्किंग स्थल</span>
                  <span className="text-[10px] text-stone-600 font-semibold mt-0.5">सत्यापित स्थान व क्षमता</span>
                  <span className="text-[10px] text-[#073B78] font-bold mt-1.5 flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    <span>पार्किंग सूची</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
