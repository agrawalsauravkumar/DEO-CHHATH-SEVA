import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DataFreshnessNotice } from '../components/DataFreshnessNotice';
import { DeoMap } from '../components/DeoMap';
import { FacilityService } from '../services/FacilityService';
import { LocationService } from '../services/LocationService';
import { Facility, LocationItem } from '../types';
import {
  Droplets,
  MapPin,
  Navigation,
  Compass,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  List,
  Map as MapIcon,
  WifiOff,
} from 'lucide-react';

export const WaterScreen: React.FC = () => {
  const {
    deviceLocation,
    requestDeviceLocation,
    setSelectedMapItem,
    isOnline,
    navigate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'LIST' | 'MAP'>('LIST');
  const [filterType, setFilterType] = useState<'ALL' | 'SEVA_CAMP' | 'WATER_TANKER' | 'DRINKING_WATER'>('ALL');
  const [sortByNearest, setSortByNearest] = useState<boolean>(false);
  const [gpsErrorNotice, setGpsErrorNotice] = useState<string | null>(null);

  const waterList = useMemo(() => {
    let list = FacilityService.getFacilitiesByCategory('WATER');

    if (filterType !== 'ALL') {
      list = list.filter((w) => w.waterType === filterType);
    }

    if (deviceLocation) {
      const withDistance = list.map((w) => {
        const distKm = LocationService.calculateDistanceKm(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: w.latitude, longitude: w.longitude }
        );
        const meters = Math.round(distKm * 1000);
        const display =
          meters < 1000 ? `${meters} मीटर` : `${(meters / 1000).toFixed(1)} किमी`;
        return {
          ...w,
          distanceMeters: meters,
          distanceDisplay: display,
        };
      });

      if (sortByNearest) {
        withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
      }
      return withDistance;
    }

    return list.map((w) => ({ ...w, distanceMeters: 0, distanceDisplay: 'GPS उपलब्ध नहीं' }));
  }, [filterType, sortByNearest, deviceLocation]);

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

  const handleNavigateToWater = (facility: Facility) => {
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
      category: 'water',
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
      isWheelchairAccessible: true,
    };

    setSelectedMapItem(locationItem);
    navigate('navigation-preview');
  };

  const getWaterTypeLabel = (type?: string) => {
    switch (type) {
      case 'SEVA_CAMP':
        return 'NextGen आरओ जल शिविर';
      case 'WATER_TANKER':
        return 'पीएचईडी सरकारी टैंकर';
      case 'DRINKING_WATER':
        return 'शीतल पेयजल बूथ';
      default:
        return 'पेयजल केंद्र';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="💧 पानी की सुविधा" showBack />
      <DataFreshnessNotice />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {/* Foundation Amrit Jal Seva Header Banner */}
        <div className="bg-gradient-to-br from-[#0B5E8E] via-[#0284C7] to-[#0369A1] text-white rounded-3xl p-5 border-2 border-cyan-400/40 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center font-bold text-2xl shrink-0">
              💧
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider block">
                NEXTGEN DEVBHOOMI FOUNDATION
              </span>
              <h2 className="text-lg font-black text-white leading-tight">
                अमृत जल सेवा केंद्र
              </h2>
            </div>
          </div>
          <p className="text-xs text-cyan-100 leading-relaxed">
            मंदिर पूर्वी द्वार, सूर्य कुंड तट, रुद्र कुंड एवं मुख्य पार्किंग स्थलों पर 24 घंटे आरओ शुद्ध शीतल पेयजल व टैंकर की निःशुल्क व्यवस्था।
          </p>

          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={handleNearestClick}
              className="flex-1 min-h-[44px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>📍 सबसे नजदीक पेयजल केंद्र</span>
            </button>
          </div>
        </div>

        {/* Devotional Quote */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-amber-800 shrink-0" />
          <span className="font-bold">“जल सेवा ही नारायण सेवा है — व्रतियों व श्रद्धालुओं हेतु पूर्णतः निःशुल्क।”</span>
        </div>

        {/* GPS Error Alert */}
        {gpsErrorNotice && (
          <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{gpsErrorNotice}</span>
          </div>
        )}

        {/* Filter Sub-Tabs & View Toggle */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterType === 'ALL'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              सभी ({waterList.length})
            </button>
            <button
              onClick={() => setFilterType('SEVA_CAMP')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterType === 'SEVA_CAMP'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              NextGen आरओ शिविर
            </button>
            <button
              onClick={() => setFilterType('WATER_TANKER')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterType === 'WATER_TANKER'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              पीएचईडी टैंकर
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
            {waterList.map((water) => (
              <div
                key={water.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs hover:border-cyan-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold text-sm flex items-center justify-center shrink-0">
                        💧
                      </span>
                      <h3 className="text-base font-black text-stone-900 leading-snug truncate">
                        {water.name}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 font-semibold flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{water.address}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block">
                      ✓ निःशुल्क जल
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {water.description}
                </p>

                {/* Verified Strip */}
                <div className="bg-stone-50 rounded-2xl p-2.5 border border-stone-200 flex items-center justify-between text-xs text-stone-700">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">GPS दूरी</span>
                    <span className="font-black text-stone-900">
                      {water.distanceDisplay}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">प्रकार</span>
                    <span className="font-bold text-cyan-800">
                      {getWaterTypeLabel(water.waterType)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">उपलब्धता</span>
                    <span className="font-bold text-amber-800">समय सत्यापित नहीं</span>
                  </div>
                </div>

                {/* “📍 रास्ता दिखाएँ” Action Button */}
                <button
                  onClick={() => handleNavigateToWater(water)}
                  className="w-full min-h-[46px] bg-cyan-700 hover:bg-cyan-800 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
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
              नक्शे पर किसी भी 💧 जल सेवा मार्कर पर टैप करके तुरंत रास्ता देखें।
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
