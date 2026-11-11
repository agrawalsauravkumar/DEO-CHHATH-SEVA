/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import {
  Building2,
  PhoneCall,
  Navigation,
  MapPin,
  CheckCircle2,
  Users,
  Shield,
  Zap,
  Droplets,
  Heart,
  ExternalLink,
  BedDouble,
  Info,
} from 'lucide-react';
import { DEO_LOCATIONS } from '../data/deoData';

interface AccommodationItem {
  id: string;
  name: string;
  type: 'TENT_CITY' | 'DHARAMSHALA' | 'RAIN_BASERA';
  typeLabel: string;
  capacity: string;
  status: 'AMPLE' | 'FILLING' | 'FULL';
  statusLabel: string;
  fee: 'निःशुल्क (Free)' | 'सशुल्क (Nominal Fee)';
  locationDesc: string;
  facilities: string[];
  inCharge: string;
  phone: string;
  lat: number;
  lng: number;
}

const ACCOMMODATIONS: AccommodationItem[] = [
  {
    id: 'gandhi-maidan-tent',
    name: 'गांधी मैदान विशाल टेंट सिटी (जिला प्रशासन)',
    type: 'TENT_CITY',
    typeLabel: 'विशाल टेंट सिटी',
    capacity: '50,000 श्रद्धालु',
    status: 'AMPLE',
    statusLabel: 'पर्याप्त स्थान उपलब्ध',
    fee: 'निःशुल्क (Free)',
    locationDesc: 'गांधी मैदान, देव मेला प्रवेश मार्ग (सूर्य मंदिर से 800 मीटर)',
    facilities: ['निःशुल्क कंबल', '24 घंटे पेयजल', 'मोबाइल चार्जिंग प्वाइंट', 'चिकित्सा शिविर', 'सुरक्षा बल तैनात'],
    inCharge: 'कैंप प्रभारी: श्री आर. के. सिंह (दंडाधिकारी)',
    phone: '06186223126',
    lat: 24.6565,
    lng: 84.4362,
  },
  {
    id: 'raja-bagicha-camp',
    name: 'राजा बगीचा निःशुल्क आश्रय स्थल',
    type: 'RAIN_BASERA',
    typeLabel: 'आश्रय स्थल',
    capacity: '25,000 श्रद्धालु',
    status: 'AMPLE',
    statusLabel: 'पर्याप्त स्थान उपलब्ध',
    fee: 'निःशुल्क (Free)',
    locationDesc: 'राजा बगीचा परिसर, देव (सूर्य कुंड से 500 मीटर)',
    facilities: ['विशाल शेड', 'पेयजल टैंकर', 'अस्थाई बायो-टॉयलेट', 'प्रकाश व्यवस्था', 'हेल्प डेस्क'],
    inCharge: 'कैंप प्रभारी: मो. इरफान (प्रशासनिक अधिकारी)',
    phone: '06186223127',
    lat: 24.6582,
    lng: 84.4348,
  },
  {
    id: 'deo-high-school-camp',
    name: 'देव उच्च विद्यालय परिसर रैन बसेरा',
    type: 'RAIN_BASERA',
    typeLabel: 'रैन बसेरा',
    capacity: '15,000 श्रद्धालु',
    status: 'FILLING',
    statusLabel: 'सीमित स्थान शेष',
    fee: 'निःशुल्क (Free)',
    locationDesc: 'देव-अंबा मुख्य मार्ग, देव',
    facilities: ['पक्के हॉल', 'कंबल व दरी', 'महिला एवं पुरुष पृथक कक्ष', 'शुद्ध पेयजल'],
    inCharge: 'कैंप प्रभारी: श्री संजय कुमार',
    phone: '06186223128',
    lat: 24.654,
    lng: 84.4395,
  },
  {
    id: 'surya-mandir-dharamshala',
    name: 'देव सूर्य मंदिर न्यास धर्मशाला',
    type: 'DHARAMSHALA',
    typeLabel: 'पक्की धर्मशाला',
    capacity: '3,000 श्रद्धालु',
    status: 'FILLING',
    statusLabel: 'कमरे तेजी से भर रहे हैं',
    fee: 'सशुल्क (Nominal Fee)',
    locationDesc: 'सूर्य मंदिर उत्तरी द्वार के समीप, देव',
    facilities: ['पक्के कमरे व डोरमेट्री', 'स्वच्छ शौचालय', 'सुरक्षित सामान गृह', 'अन्नक्षेत्र'],
    inCharge: 'प्रबंधक: मंदिर न्यास समिति देव',
    phone: '06186223129',
    lat: 24.6598,
    lng: 84.4332,
  },
  {
    id: 'shanti-kunj-niwas',
    name: 'शांति कुंज यात्री निवास एवं सेवा सदन',
    type: 'DHARAMSHALA',
    typeLabel: 'यात्री निवास',
    capacity: '2,000 श्रद्धालु',
    status: 'AMPLE',
    statusLabel: 'कमरे उपलब्ध',
    fee: 'सशुल्क (Nominal Fee)',
    locationDesc: 'अस्पताल रोड, देव',
    facilities: ['पारिवारिक कक्ष', 'गर्म पानी व्यवस्था', 'पार्किंग सुविधा', 'चाय-नाश्ता कैंटीन'],
    inCharge: 'व्यवस्थापक: श्री अरुण गुप्ता',
    phone: '06186223130',
    lat: 24.6552,
    lng: 84.4378,
  },
];

export const AccommodationScreen: React.FC = () => {
  const { startNavigation, navigate } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'DHARAMSHALA'>('ALL');

  const filteredItems = ACCOMMODATIONS.filter((item) => {
    if (filter === 'FREE') return item.fee.includes('निःशुल्क');
    if (filter === 'DHARAMSHALA') return item.type === 'DHARAMSHALA';
    return true;
  });

  const handleNavigate = (title: string, lat: number, lng: number) => {
    const matched = DEO_LOCATIONS.find((l) => l.latitude && Math.abs(l.latitude - lat) < 0.005) || {
      id: `acc-${Date.now()}`,
      name: title,
      nameEn: title,
      category: 'help' as const,
      distance: '500 मी',
      walkingTime: '6 मिनट',
      description: title,
      landmark: 'देव मेला क्षेत्र',
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
      <TopBar title="रैन बसेरा, टेंट सिटी व धर्मशाला" showBack />

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-4">
        {/* Banner */}
        <div className="bg-gradient-to-br from-[#0B5E8E] via-[#07476F] to-[#04283F] text-white rounded-3xl p-5 shadow-lg border-2 border-amber-400 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 border border-amber-300 text-amber-300 px-2.5 py-0.5 rounded-full inline-block">
              छठ व्रतियों हेतु रात्रि विश्राम व्यवस्था
            </span>
            <h2 className="text-xl font-black text-white">
              निःशुल्क टेंट सिटी, रैन बसेरा व धर्मशालाएं
            </h2>
            <p className="text-xs text-amber-100">
              जिला प्रशासन एवं देव सूर्य मंदिर न्यास द्वारा 1,00,000+ श्रद्धालुओं हेतु सुरक्षित विश्राम स्थल
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black border transition-all ${
              filter === 'ALL'
                ? 'bg-[#0B5E8E] text-white border-[#0B5E8E] shadow-sm'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            सभी विश्राम स्थल ({ACCOMMODATIONS.length})
          </button>
          <button
            onClick={() => setFilter('FREE')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black border transition-all ${
              filter === 'FREE'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            💚 केवल निःशुल्क (Free)
          </button>
          <button
            onClick={() => setFilter('DHARAMSHALA')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black border transition-all ${
              filter === 'DHARAMSHALA'
                ? 'bg-[#0B5E8E] text-white border-[#0B5E8E] shadow-sm'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            🏛️ धर्मशाला / अतिथि गृह
          </button>
        </div>

        {/* List of Accommodation Cards */}
        <div className="space-y-3.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E]">
                      {item.typeLabel}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        item.fee.includes('निःशुल्क')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {item.fee}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'AMPLE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.status === 'FILLING'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      ● {item.statusLabel}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#0B5E8E] leading-snug">
                    {item.name}
                  </h3>

                  <p className="text-xs text-stone-600 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    {item.locationDesc}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-stone-800 bg-stone-100 px-2 py-1 rounded-xl block">
                    {item.capacity}
                  </span>
                </div>
              </div>

              {/* Facilities tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.facilities.map((fac, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-[#FFF8E1] text-stone-800 px-2 py-0.5 rounded-md border border-amber-200 font-semibold"
                  >
                    ✓ {fac}
                  </span>
                ))}
              </div>

              <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                <span className="font-bold">{item.inCharge}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${item.phone}`}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>सीधे कॉल करें</span>
                </a>

                <button
                  onClick={() => handleNavigate(item.name, item.lat, item.lng)}
                  className="py-2.5 px-3 rounded-xl bg-[#0B5E8E] hover:bg-[#07476F] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>रास्ता (GPS)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
