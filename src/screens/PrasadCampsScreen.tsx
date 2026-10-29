/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DEO_LOCATIONS } from '../data/deoData';
import {
  ShoppingBag,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  PhoneCall,
} from 'lucide-react';

interface PrasadCamp {
  id: string;
  name: string;
  locationName: string;
  landmark: string;
  organizer: string;
  timing: string;
  freeItems: string[];
  distance: string;
  walkingTime: string;
  latitude: number;
  longitude: number;
  contact?: string;
  badge: string;
}

const PRASAD_CAMPS: PrasadCamp[] = [
  {
    id: 'camp-1',
    name: 'निःशुल्क ईख, सूप व दउरा वितरण सेवा केंद्र',
    locationName: 'राजा जगन्नाथ उच्च विद्यालय मैदान, देव',
    landmark: 'P2 पार्किंग के ठीक सामने',
    organizer: 'NextGen DevBhoomi Foundation व जिला प्रशासन',
    timing: 'कार्तिक शुक्ल चतुर्थी से षष्ठी (प्रातः 07:00 बजे से)',
    freeItems: [
      'पत्ते सहित पवित्र ईख (गन्ना)',
      'बांस का नया सूप',
      'दउरा ढकने हेतु पवित्र लाल-पीला वस्त्र',
      'मिट्टी के दीप व बत्तियां',
    ],
    distance: '350 मी',
    walkingTime: '4 मिनट',
    latitude: 24.6548,
    longitude: 84.4346,
    contact: '06186-222100',
    badge: 'सामग्री वितरण',
  },
  {
    id: 'camp-2',
    name: 'पावन कच्चा दूध व अर्घ्य सामग्री शिविर',
    locationName: 'सूर्य कुंड पश्चिमी तट सेवा शिविर',
    landmark: 'सूर्य कुंड मुख्य सीढ़ियों के पास',
    organizer: 'श्री सूर्य मंदिर न्यास समिति व स्वयंसेवक दल',
    timing: 'सांध्य अर्घ्य (दोपहर 02:00 से) एवं उषा अर्घ्य (भोर 03:30 से)',
    freeItems: [
      'अर्घ्य हेतु शुद्ध देशी गाय का कच्चा दूध',
      'पवित्र गंगाजल की बोतलें',
      'पीला सिन्दूर व रोली-अक्षत',
      'हल्दी-अदरक का हरा पौधा',
    ],
    distance: '200 मी',
    walkingTime: '2 मिनट',
    latitude: 24.6538,
    longitude: 84.4375,
    badge: 'अर्घ्य सामग्री',
  },
  {
    id: 'camp-3',
    name: 'ठेकुआ महाप्रसाद व फल सेवा शिविर',
    locationName: 'डिग्री कॉलेज मोड़, देव',
    landmark: 'P1 मुख्य पार्किंग प्रवेश द्वार',
    organizer: 'औरंगाबाद नागरिक सेवा संघ व युवा मंडल',
    timing: 'सतत २४ घंटे (मेला अवधि)',
    freeItems: [
      'पारंपरिक शुद्ध घी का ठेकुआ महाप्रसाद',
      'केला, सेब व ऋतु फल',
      'कसार व गुड़ का प्रसाद',
      'शीतल फिल्टर पेयजल',
    ],
    distance: '450 मी',
    walkingTime: '6 मिनट',
    latitude: 24.6565,
    longitude: 84.4332,
    badge: 'महाप्रसाद',
  },
  {
    id: 'camp-4',
    name: 'कद्दू-भात एवं सात्विक भोजन सेवा शिविर',
    locationName: 'सूर्य मंदिर मुख्य सिंहद्वार धर्मशाला',
    landmark: 'सूर्य मंदिर उत्तरी परिक्रमा मार्ग',
    organizer: 'NextGen देव सेवा न्यास',
    timing: 'नहाय-खाय दिवस (दोपहर 11:30 से 04:00 बजे तक)',
    freeItems: [
      'अरवा चावल, चना दाल व कद्दू का सात्विक प्रसाद',
      'शुद्ध घी व सेंधा नमक युक्त आहार',
      'पारण हेतु कच्चा दूध व अदरक',
    ],
    distance: '150 मी',
    walkingTime: '2 मिनट',
    latitude: 24.6545,
    longitude: 84.4378,
    badge: 'नहाय-खाय',
  },
  {
    id: 'camp-5',
    name: 'विश्राम, गर्म पेय व प्राथमिक सहायता शिविर',
    locationName: 'थाना मोड़ व ब्लॉक परिसर',
    landmark: 'देव थाना मोड़ तिराहा',
    organizer: 'आपदा प्रबंधन एवं स्वास्थ्य विभाग',
    timing: 'सतत २४ घंटे (मेला अवधि)',
    freeItems: [
      'थके व्रतियों व परिजनों हेतु विश्राम स्थल',
      'गर्म पेयजल व हर्बल चाय (पारण पूर्व)',
      'ओआरएस घोल व ग्लूकोज',
      'प्राथमिक मरहम-पट्टी सहायता',
    ],
    distance: '500 मी',
    walkingTime: '7 मिनट',
    latitude: 24.6515,
    longitude: 84.4348,
    contact: '108',
    badge: 'विश्राम व सहायता',
  },
];

export const PrasadCampsScreen: React.FC = () => {
  const { navigate, setSelectedMapItem } = useApp();
  const [filter, setFilter] = useState<string>('ALL');

  const handleNavigateToCamp = (camp: PrasadCamp) => {
    // Find closest location match or construct map item
    const targetLoc = DEO_LOCATIONS.find((l) =>
      l.name.includes('सूर्य मंदिर') || l.id === 'surya-kund'
    ) || DEO_LOCATIONS[0];

    setSelectedMapItem({
      ...targetLoc,
      id: camp.id,
      name: camp.name,
      latitude: camp.latitude,
      longitude: camp.longitude,
      landmark: camp.landmark,
    });
    navigate('navigation-preview');
  };

  const filteredCamps =
    filter === 'ALL'
      ? PRASAD_CAMPS
      : PRASAD_CAMPS.filter((c) => c.badge.includes(filter));

  return (
    <div className="min-h-screen bg-[var(--chhath-cream)] pb-24 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="निःशुल्क सामग्री व प्रसाद शिविर" showBack />

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-5">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-[#075985] via-[#063B5C] to-[#041E2F] text-white rounded-3xl p-5 shadow-lg border border-[#FFB52E]/50 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-6 -bottom-6 w-32 h-32 bg-[#F47B20]/25 rounded-full blur-2xl" />
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FFB52E] bg-[#FFB52E]/20 border border-[#FFB52E]/40 px-2 py-0.5 rounded-full inline-block">
              सेवा ही संकल्प • देव छठ मेला
            </span>
            <h2 className="text-xl font-black text-white leading-tight">
              निःशुल्क छठ सामग्री व प्रसाद वितरण
            </h2>
            <p className="text-xs text-[#FFF7E5]/90 leading-relaxed">
              देव मेला क्षेत्र में प्रशासन एवं समाजसेवी संस्थाओं द्वारा संचालित अधिकृत सेवा शिविर
            </p>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-black no-scrollbar">
          {[
            { label: 'सभी शिविर', key: 'ALL' },
            { label: '🎋 सामग्री', key: 'सामग्री' },
            { label: '🥛 अर्घ्य दूध', key: 'अर्घ्य' },
            { label: '🍪 महाप्रसाद', key: 'महाप्रसाद' },
            { label: '🏨 विश्राम', key: 'विश्राम' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                filter === item.key
                  ? 'bg-[#075985] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Camp Cards List */}
        <div className="space-y-3.5">
          {filteredCamps.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-3xl p-4 border-2 border-stone-200/90 shadow-xs space-y-3 relative overflow-hidden transition-all hover:border-[#FFB52E]/70"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                      {camp.badge}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>सत्यापित शिविर</span>
                    </span>
                  </div>
                  <h3 className="text-base font-black text-stone-900 leading-tight pt-1">
                    {camp.name}
                  </h3>
                </div>

                <div className="text-right shrink-0 bg-stone-50 border border-stone-200 px-2 py-1 rounded-xl">
                  <span className="block text-xs font-black text-stone-900 leading-none">
                    {camp.walkingTime}
                  </span>
                  <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">
                    ({camp.distance})
                  </span>
                </div>
              </div>

              {/* Location & Landmark */}
              <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-stone-700 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-[#F47B20] shrink-0" />
                  <span>{camp.locationName}</span>
                </div>
                <div className="text-[11px] text-stone-500 pl-5">
                  पहचान: <strong>{camp.landmark}</strong>
                </div>
              </div>

              {/* Timing */}
              <div className="flex items-center gap-1.5 text-xs text-amber-950 font-bold bg-amber-50/80 px-2.5 py-1.5 rounded-xl border border-amber-200/60">
                <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>समय: {camp.timing}</span>
              </div>

              {/* Free Items Provided */}
              <div className="space-y-1.5 pt-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                  निःशुल्क उपलब्ध सेवा व वस्तुएं:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-stone-800 font-semibold">
                  {camp.freeItems.map((item, iidx) => (
                    <div key={iidx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span className="text-[11px] text-stone-500 font-bold truncate max-w-[160px]">
                  {camp.organizer}
                </span>

                <button
                  onClick={() => handleNavigateToCamp(camp)}
                  className="px-3.5 py-2 bg-[#075985] hover:bg-[#063B5C] active:scale-95 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Compass className="w-3.5 h-3.5 text-[#FFB52E]" />
                  <span>शिविर तक पैदल रास्ता</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

