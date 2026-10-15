import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DataFreshnessNotice } from '../components/DataFreshnessNotice';
import { DeoMap } from '../components/DeoMap';
import { FacilityService } from '../services/FacilityService';
import { LocationService } from '../services/LocationService';
import { Facility, LocationItem } from '../types';
import {
  Sparkles,
  MapPin,
  Navigation,
  Compass,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  List,
  Map as MapIcon,
  WifiOff,
} from 'lucide-react';

export const ToiletScreen: React.FC = () => {
  const {
    deviceLocation,
    requestDeviceLocation,
    setSelectedMapItem,
    isOnline,
    navigate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'LIST' | 'MAP'>('LIST');
  const [filterGender, setFilterGender] = useState<'ALL' | 'FEMALE' | 'ACCESSIBLE'>('ALL');
  const [sortByNearest, setSortByNearest] = useState<boolean>(false);
  const [gpsErrorNotice, setGpsErrorNotice] = useState<string | null>(null);

  const toiletsList = useMemo(() => {
    let list = FacilityService.getFacilitiesByCategory('TOILET');

    if (filterGender === 'FEMALE') {
      list = list.filter((t) => t.toiletGender === 'FEMALE' || t.toiletGender === 'ALL');
    } else if (filterGender === 'ACCESSIBLE') {
      list = list.filter((t) => t.accessibility);
    }

    if (deviceLocation) {
      const withDistance = list.map((t) => {
        const distKm = LocationService.calculateDistanceKm(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: t.latitude, longitude: t.longitude }
        );
        const meters = Math.round(distKm * 1000);
        const display =
          meters < 1000 ? `${meters} मीटर` : `${(meters / 1000).toFixed(1)} किमी`;
        return {
          ...t,
          distanceMeters: meters,
          distanceDisplay: display,
        };
      });

      if (sortByNearest) {
        withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
      }
      return withDistance;
    }

    return list.map((t) => ({ ...t, distanceMeters: 0, distanceDisplay: 'GPS उपलब्ध नहीं' }));
  }, [filterGender, sortByNearest, deviceLocation]);

  const handleNearestClick = async () => {
    if (!deviceLocation) {
      const success = await requestDeviceLocation();
      if (!success) {
        setGpsErrorNotice('आपकी location उपलब्ध नहीं है।');
        setTimeout(() => setGpsErrorNotice(null), 4000);
        return;
      }
    }
    setSortByNearest(true);
    setActiveTab('LIST');
  };

  const handleNavigateToToilet = (facility: Facility) => {
    const distText = deviceLocation
      ? LocationService.formatDistanceHindi(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: facility.latitude, longitude: facility.longitude }
        )
      : 'दूरी उपलब्ध';

    const walkText = deviceLocation
      ? LocationService.formatWalkingTimeHindi(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: facility.latitude, longitude: facility.longitude }
        )
      : 'पैदल मार्ग';

    const locationItem: LocationItem = {
      id: facility.id,
      name: facility.name,
      nameEn: facility.nameEn || facility.name,
      category: 'toilet',
      distance: distText,
      walkingTime: walkText,
      description: facility.description,
      landmark: facility.address,
      latitude: facility.latitude,
      longitude: facility.longitude,
      status: facility.verified ? 'सक्रिय' : undefined,
      isDemo: !facility.verified,
      x: 50,
      y: 50,
      isWheelchairAccessible: facility.accessibility,
    };

    setSelectedMapItem(locationItem);
    navigate('navigation-preview');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="🚻 पास के शौचालय" showBack />
      <DataFreshnessNotice />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {/* Header Summary Banner */}
        <div className="bg-gradient-to-br from-[#0B5E8E] via-[#073B5A] to-[#041E2F] text-white rounded-3xl p-5 border-2 border-emerald-500/40 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold text-2xl shrink-0">
              🚻
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                स्वच्छता एवं जन-सुविधा
              </span>
              <h2 className="text-lg font-black text-white leading-tight">
                शौचालय सुविधा
              </h2>
            </div>
          </div>
          <p className="text-xs text-stone-200 leading-relaxed">
            {toiletsList.length
              ? 'दिखाए गए स्थल सत्यापित सूची से हैं; स्वच्छता और वर्तमान उपलब्धता की स्थानीय पुष्टि करें।'
              : 'सत्यापित शौचालय और चेंजिंग सुविधाओं की सूची अभी उपलब्ध नहीं है। यहाँ कोई अनुमानित स्थान नहीं दिखाया जाएगा।'}
          </p>

          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={handleNearestClick}
              className="flex-1 min-h-[44px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>📍 सबसे नजदीक शौचालय</span>
            </button>
          </div>
        </div>

        {/* GPS Error Alert */}
        {gpsErrorNotice && (
          <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{gpsErrorNotice}</span>
          </div>
        )}

        {/* View Mode & Filter Sub-Tabs */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setFilterGender('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterGender === 'ALL'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              सभी ({toiletsList.length})
            </button>
            <button
              onClick={() => setFilterGender('FEMALE')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterGender === 'FEMALE'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              महिला विशेष
            </button>
            <button
              onClick={() => setFilterGender('ACCESSIBLE')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterGender === 'ACCESSIBLE'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              ♿ दिव्यांग सुलभ
            </button>
          </div>

          <div className="flex items-center bg-stone-200/80 p-0.5 rounded-xl font-bold shrink-0">
            <button
              onClick={() => setActiveTab('LIST')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                activeTab === 'LIST' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>सूची</span>
            </button>
            <button
              onClick={() => setActiveTab('MAP')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                activeTab === 'MAP' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>नक्शा</span>
            </button>
          </div>
        </div>

        {/* LIST VIEW */}
        {activeTab === 'LIST' && (
          <div className="space-y-3">
            {toiletsList.map((toilet) => (
              <div
                key={toilet.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs hover:border-emerald-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
                        🚻
                      </span>
                      <h3 className="text-base font-black text-stone-900 leading-snug truncate">
                        {toilet.name}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 font-semibold flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{toilet.address}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block">
                      {toilet.verified ? 'अधिकृत परिसर' : 'सूची सत्यापित नहीं'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {toilet.description}
                </p>

                {/* Verified Attributes Strip */}
                <div className="bg-stone-50 rounded-2xl p-2.5 border border-stone-200 flex items-center justify-between text-xs text-stone-700">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">GPS दूरी</span>
                    <span className="font-black text-stone-900">
                      {toilet.distanceDisplay}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">सुविधा प्रकार</span>
                    <span className="font-bold text-stone-800">
                      {toilet.toiletGender === 'FEMALE' ? 'महिला आरक्षित' : 'महिला एवं पुरुष'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">दिव्यांग रैंप</span>
                    <span className="font-bold text-emerald-700">
                      {toilet.accessibility ? 'सूची में दर्शाया गया' : 'विवरण उपलब्ध नहीं'}
                    </span>
                  </div>
                </div>

                {/* “📍 रास्ता दिखाएँ” Action Button */}
                <button
                  onClick={() => handleNavigateToToilet(toilet)}
                  className="w-full min-h-[46px] bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Navigation className="w-4 h-4 fill-white" />
                  <span>📍 रास्ता दिखाएँ (Get Walking Route)</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MAP VIEW */}
        {activeTab === 'MAP' && (
          <div className="space-y-3 animate-fade-in">
            <div className="h-[420px] rounded-3xl overflow-hidden shadow-md border border-stone-300">
              <DeoMap heightClass="h-full" showRouteLine={false} />
            </div>
            <p className="text-[11px] text-stone-500 text-center">
              नक्शे पर किसी भी 🚻 शौचालय मार्कर पर टैप करके तुरंत रास्ता देखें।
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
