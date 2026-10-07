import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEO_LOCATIONS } from '../data/deoData';
import { OfflineMapService } from '../services/OfflineMapService';
import { LocationItem, LocationCategory } from '../types';
import {
  ArrowLeft,
  Search,
  X,
  MapPin,
  ChevronRight,
  Info,
  WifiOff,
} from 'lucide-react';

export const SearchScreen: React.FC = () => {
  const { setSelectedMapItem, navigate, goBack, isOnline } = useApp();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Use locally stored POIs when offline
  const sourceLocations: LocationItem[] = isOnline
    ? DEO_LOCATIONS
    : (OfflineMapService.getOfflinePOIs().map((poi) => ({
        id: poi.id,
        name: poi.name,
        nameEn: poi.nameEn,
        category:
          poi.category === 'RELIGIOUS'
            ? 'temple'
            : (poi.category.toLowerCase() as any),
        distance: 'दूरी उपलब्ध',
        walkingTime: 'पैदल मार्ग',
        description: poi.description,
        landmark: poi.landmark,
        latitude: poi.latitude,
        longitude: poi.longitude,
        status: poi.status,
        isDemo: poi.isDemo,
        x: 50,
        y: 50,
        isWheelchairAccessible: poi.isWheelchairAccessible,
      })) as LocationItem[]);

  // Popular category items requested in the prompt
  const popularCategories: {
    id: string;
    icon: string;
    label: string;
    filterCategory?: LocationCategory;
    targetKeyword?: string;
  }[] = [
    { id: 'temple', icon: '☀️', label: 'सूर्य मंदिर', filterCategory: 'temple', targetKeyword: 'सूर्य' },
    { id: 'ghat', icon: '🙏', label: 'छठ घाट', filterCategory: 'kund', targetKeyword: 'घाट' },
    { id: 'parking', icon: '🅿️', label: 'Parking', filterCategory: 'parking', targetKeyword: 'parking' },
    { id: 'medical', icon: '🚑', label: 'Medical', filterCategory: 'medical', targetKeyword: 'medical' },
    { id: 'toilet', icon: '🚻', label: 'Toilet', filterCategory: 'toilet', targetKeyword: 'toilet' },
    { id: 'water', icon: '💧', label: 'Water', filterCategory: 'water', targetKeyword: 'water' },
    { id: 'help', icon: '🆘', label: 'सहायता केंद्र', filterCategory: 'help', targetKeyword: 'सहायता' },
    { id: 'shuttle', icon: '🛺', label: 'Shuttle Point', filterCategory: 'shuttle', targetKeyword: 'shuttle' },
    { id: 'other', icon: '📍', label: 'अन्य स्थान', filterCategory: 'other', targetKeyword: 'अन्य' },
  ];

  // Search logic supporting Hindi and English, case-insensitive
  const filteredLocations = sourceLocations.filter((loc) => {
    // If category filter is actively picked
    if (activeCategory) {
      const cat = popularCategories.find((c) => c.id === activeCategory);
      if (cat?.filterCategory && loc.category !== cat.filterCategory) {
        return false;
      }
    }

    if (!query.trim()) {
      return true;
    }

    const q = query.trim().toLowerCase();
    const nameHi = loc.name.toLowerCase();
    const nameEn = loc.nameEn.toLowerCase();
    const desc = loc.description.toLowerCase();
    const landmark = loc.landmark.toLowerCase();
    const category = loc.category.toLowerCase();

    // Direct matches or transliteration aliases
    const aliases: Record<string, string[]> = {
      'सूर्य': ['surya', 'sun', 'mandir', 'temple', 'सूर्य'],
      'parking': ['parking', 'पार्किंग', 'park', 'गाड़ी', 'वाहन', 'p1', 'p2'],
      'medical': ['medical', 'hospital', 'चिकित्सा', 'अस्पताल', 'दवा', 'एम्बुलेंस', 'doctor'],
      'water': ['water', 'पानी', 'जल', 'पेयजल', 'ro'],
      'toilet': ['toilet', 'शौचालय', 'bio', 'bathroom', 'लैट्रिन'],
      'shuttle': ['shuttle', 'शटल', 'rickshaw', 'ई-रिक्शा', 'रिक्शा'],
      'help': ['help', 'सहायता', 'control', 'मदद', 'पुलिस', 'खोया'],
      'ghat': ['ghat', 'घाट', 'kund', 'कुंड', 'अर्घ्य', 'तालाब'],
    };

    // Check direct substring
    if (nameHi.includes(q) || nameEn.includes(q) || desc.includes(q) || landmark.includes(q) || category.includes(q)) {
      return true;
    }

    // Check aliases
    for (const [key, aliasList] of Object.entries(aliases)) {
      if (aliasList.some((alias) => q.includes(alias) || alias.includes(q))) {
        if (nameHi.includes(key) || nameEn.toLowerCase().includes(key) || category.includes(key)) {
          return true;
        }
      }
    }

    return false;
  });

  const handleSelectLocation = (loc: LocationItem) => {
    setSelectedMapItem(loc);
    navigate('map');
  };

  const handleSelectCategory = (catId: string) => {
    if (activeCategory === catId) {
      setActiveCategory(null);
    } else {
      setActiveCategory(catId);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 shadow-xs">
        <div className="max-w-lg mx-auto flex items-center justify-between min-h-[44px]">
          <button
            onClick={goBack}
            aria-label="वापस जाएं"
            className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-800" />
          </button>

          <h1 className="text-lg sm:text-xl font-black text-stone-900 truncate">
            आप कहाँ जाना चाहते हैं?
          </h1>

          <div className="w-8" />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {/* Large Search Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-wider text-stone-600">
            🔍 कहाँ जाना है?
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-5 h-5 text-amber-700" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="जैसे सूर्य मंदिर, छठ घाट, Parking…"
              className="w-full min-h-[52px] pl-11 pr-11 bg-white border-2 border-stone-300 rounded-2xl text-stone-900 text-base font-semibold focus:outline-none focus:border-[#0B5E8E] focus:ring-2 focus:ring-[#0B5E8E]/20 shadow-xs"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="खोज साफ करें"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* लोकप्रिय स्थान (Selectable Cards) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-800 tracking-tight">
              लोकप्रिय स्थान
            </h3>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                सभी दिखाएँ
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {popularCategories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`min-h-[56px] p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-amber-100/90 border-amber-600 text-stone-900 font-black shadow-xs ring-1 ring-amber-600'
                      : 'bg-white border-stone-200 hover:border-amber-300 text-stone-800 font-bold'
                  }`}
                >
                  <span className="text-xl mb-0.5">{cat.icon}</span>
                  <span className="text-xs leading-tight block truncate w-full">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 px-1">
            <span>उपलब्ध स्थल ({filteredLocations.length})</span>
            <span className="text-[11px] text-amber-800">टच करके नक्शे पर देखें</span>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 space-y-2">
              <span className="text-3xl block">🔍</span>
              <h4 className="text-base font-black text-stone-800">
                कोई स्थान नहीं मिला
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                कृपया दूसरा नाम खोजें। (जैसे: सूर्य मंदिर, सूर्य कुंड, पार्किंग, अस्पताल)
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setActiveCategory(null);
                }}
                className="mt-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl"
              >
                सभी स्थान दिखाएँ
              </button>
            </div>
          ) : (
            filteredLocations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => handleSelectLocation(loc)}
                className="bg-white border border-stone-200/90 hover:border-amber-400 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3 cursor-pointer active:scale-98 transition-all group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base shrink-0">
                      {loc.category === 'temple'
                        ? '☀️'
                        : loc.category === 'kund'
                        ? '🙏'
                        : loc.category === 'parking'
                        ? '🅿️'
                        : loc.category === 'medical'
                        ? '🚑'
                        : loc.category === 'toilet'
                        ? '🚻'
                        : loc.category === 'water'
                        ? '💧'
                        : loc.category === 'help'
                        ? '🆘'
                        : loc.category === 'shuttle'
                        ? '🛺'
                        : '📍'}
                    </span>
                    <h4 className="text-base font-black text-stone-900 truncate leading-snug group-hover:text-amber-800 transition-colors">
                      {loc.name}
                    </h4>
                    {!isOnline && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded shrink-0">
                        ऑफलाइन जानकारी
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-1">{loc.description}</p>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-0.5">
                    <span className="flex items-center gap-1 font-bold text-amber-800">
                      <MapPin className="w-3 h-3" />
                      {loc.landmark}
                    </span>
                    <span>•</span>
                    <span className="font-semibold">{loc.distance}</span>
                    <span>•</span>
                    <span>{loc.walkingTime}</span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-amber-100 text-stone-600 group-hover:text-amber-900 flex items-center justify-center shrink-0 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reusable Data architecture notice */}
        <div className="bg-stone-100 rounded-xl p-3 border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
          <p>
            यह देव तीर्थ क्षेत्र के आधिकारिक पड़ावों की डेमो सूची है। जीपीएस व ऑफलाइन मैप कनेक्ट होने पर लाइव रूट स्वतः उपलब्ध होगा।
          </p>
        </div>
      </main>
    </div>
  );
};
