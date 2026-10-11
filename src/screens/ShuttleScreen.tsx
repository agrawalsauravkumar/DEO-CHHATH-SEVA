import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DeoMap } from '../components/DeoMap';
import { FacilityService } from '../services/FacilityService';
import { LocationService } from '../services/LocationService';
import { Facility, LocationItem } from '../types';
import {
  Bus,
  MapPin,
  Navigation,
  Compass,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  List,
  Map as MapIcon,
  WifiOff,
} from 'lucide-react';

export const ShuttleScreen: React.FC = () => {
  const {
    deviceLocation,
    requestDeviceLocation,
    setSelectedMapItem,
    isOnline,
    navigate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'POINTS' | 'ROUTES' | 'MAP'>('POINTS');
  const [filterType, setFilterType] = useState<'ALL' | 'PICKUP' | 'DROP'>('ALL');
  const [sortByNearest, setSortByNearest] = useState<boolean>(false);
  const [gpsErrorNotice, setGpsErrorNotice] = useState<string | null>(null);

  const shuttlePoints = useMemo(() => {
    let list = FacilityService.getFacilitiesByCategory('SHUTTLE');

    if (filterType === 'PICKUP') {
      list = list.filter((f) => f.shuttleType === 'PICKUP' || f.shuttleType === 'BOTH');
    } else if (filterType === 'DROP') {
      list = list.filter((f) => f.shuttleType === 'DROP' || f.shuttleType === 'BOTH');
    }

    if (deviceLocation) {
      const withDistance = list.map((f) => {
        const distKm = LocationService.calculateDistanceKm(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: f.latitude, longitude: f.longitude }
        );
        const meters = Math.round(distKm * 1000);
        const display =
          meters < 1000 ? `${meters} मीटर` : `${(meters / 1000).toFixed(1)} किमी`;
        return {
          ...f,
          distanceMeters: meters,
          distanceDisplay: display,
        };
      });

      if (sortByNearest) {
        withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
      }
      return withDistance;
    }

    return list.map((f) => ({ ...f, distanceMeters: 0, distanceDisplay: 'GPS उपलब्ध नहीं' }));
  }, [filterType, sortByNearest, deviceLocation]);

  const shuttleRoutes = useMemo(() => {
    return FacilityService.getShuttleRoutes();
  }, []);

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
    setActiveTab('POINTS');
  };

  const handleNavigateToShuttle = (point: Facility) => {
    const distText = deviceLocation
      ? LocationService.formatDistanceHindi(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: point.latitude, longitude: point.longitude }
        )
      : 'दूरी उपलब्ध';

    const walkText = deviceLocation
      ? LocationService.formatWalkingTimeHindi(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: point.latitude, longitude: point.longitude }
        )
      : 'पैदल मार्ग';

    const locationItem: LocationItem = {
      id: point.id,
      name: point.name,
      nameEn: point.nameEn || point.name,
      category: 'shuttle',
      distance: distText,
      walkingTime: walkText,
      description: point.description,
      landmark: point.address,
      latitude: point.latitude,
      longitude: point.longitude,
      status: 'सक्रिय',
      isDemo: point.source === 'DEMO_DATA',
      x: 50,
      y: 50,
      isWheelchairAccessible: point.accessibility,
    };

    setSelectedMapItem(locationItem);
    navigate('navigation-preview');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="निःशुल्क शटल व ई-रिक्शा" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {/* Hero Header Banner */}
        <div className="bg-gradient-to-br from-[#0B5E8E] via-[#073B5A] to-[#041E2F] text-white rounded-3xl p-5 border-2 border-amber-500/40 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-2xl shrink-0">
              🛺
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                NEXTGEN DEVBHOOMI FOUNDATION सेवा
              </span>
              <h2 className="text-lg font-black text-white leading-tight">
                निःशुल्क ई-रिक्शा शटल सेवा
              </h2>
            </div>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            पार्किंग स्थलों (P1, P2, P3) से सूर्य मंदिर व सूर्य कुंड तक बुजुर्गों, दिव्यांगों एवं व्रतियों हेतु निःशुल्क सेवा।
          </p>

          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={handleNearestClick}
              className="flex-1 min-h-[44px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>📍 सबसे नजदीक शटल प्वाइंट</span>
            </button>
          </div>
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-950">
            <span className="font-bold flex items-center gap-1.5">
              <WifiOff className="w-4 h-4 text-amber-800" />
              <span>Offline Mode • सहेजी गई शटल जानकारी उपलब्ध</span>
            </span>
          </div>
        )}

        {/* GPS Error Alert */}
        {gpsErrorNotice && (
          <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{gpsErrorNotice}</span>
          </div>
        )}

        {/* Navigation Tabs: प्वाइंट्स | रूट विवरण | नक्शा */}
        <div className="grid grid-cols-3 gap-1.5 bg-stone-200/80 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('POINTS')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'POINTS'
                ? 'bg-white text-stone-900 shadow-xs font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            📍 शटल प्वाइंट्स
          </button>
          <button
            onClick={() => setActiveTab('ROUTES')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'ROUTES'
                ? 'bg-white text-stone-900 shadow-xs font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🛣️ रूट विवरण
          </button>
          <button
            onClick={() => setActiveTab('MAP')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'MAP'
                ? 'bg-white text-stone-900 shadow-xs font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🗺️ नक्शे पर देखें
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: SHUTTLE POINTS                                   */}
        {/* ======================================================== */}
        {activeTab === 'POINTS' && (
          <div className="space-y-3">
            {/* Filter Sub-Tabs */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-stone-500">प्रकार:</span>
              <div className="flex gap-1.5 flex-1">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    filterType === 'ALL'
                      ? 'bg-[#0B5E8E] text-white shadow-xs'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  सभी ({shuttlePoints.length})
                </button>
                <button
                  onClick={() => setFilterType('PICKUP')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    filterType === 'PICKUP'
                      ? 'bg-[#0B5E8E] text-white shadow-xs'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  पिकअप
                </button>
                <button
                  onClick={() => setFilterType('DROP')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    filterType === 'DROP'
                      ? 'bg-[#0B5E8E] text-white shadow-xs'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  ड्रॉप
                </button>
              </div>
            </div>

            {/* Shuttle Points Cards */}
            <div className="space-y-3">
              {shuttlePoints.map((point) => (
                <div
                  key={point.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs hover:border-amber-400 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-bold text-sm flex items-center justify-center shrink-0">
                          {point.shuttleType === 'PICKUP' ? '⬆️' : '⬇️'}
                        </span>
                        <h3 className="text-base font-black text-stone-900 leading-snug truncate">
                          {point.name}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-500 font-semibold flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{point.address}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {point.verified ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 inline-block">
                          DEMO DATA
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {point.description}
                  </p>

                  {/* Distance & Info Strip */}
                  <div className="bg-stone-50 rounded-2xl p-2.5 border border-stone-200 flex items-center justify-between text-xs text-stone-700">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-bold uppercase">GPS दूरी</span>
                      <span className="font-black text-stone-900">
                        {point.distanceDisplay}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 block font-bold uppercase">प्रकार</span>
                      <span className="font-bold text-stone-800">
                        {point.shuttleType === 'PICKUP'
                          ? 'पिकअप प्वाइंट'
                          : point.shuttleType === 'DROP'
                          ? 'ड्रॉप प्वाइंट'
                          : 'पिकअप व ड्रॉप'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block font-bold uppercase">सुलभता</span>
                      <span className="font-bold text-emerald-700">
                        {point.accessibility ? '✓ व्हीलचेयर सुलभ' : 'सामान्य'}
                      </span>
                    </div>
                  </div>

                  {/* Verified Timing Advisory per specification rule */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2 text-[11px] text-amber-900 font-medium">
                    <span>Shuttle की verified live जानकारी अभी उपलब्ध नहीं है। सेवा निरंतर संचालित है।</span>
                  </div>

                  {/* “📍 रास्ता दिखाएँ” Action Button */}
                  <button
                    onClick={() => handleNavigateToShuttle(point)}
                    className="w-full min-h-[46px] bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <Navigation className="w-4 h-4 fill-white" />
                    <span>📍 रास्ता दिखाएँ (Get Walking Route)</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SHUTTLE ROUTES                                   */}
        {/* ======================================================== */}
        {activeTab === 'ROUTES' && (
          <div className="space-y-3">
            {shuttleRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div>
                    <span className="text-[11px] font-black text-orange-700 uppercase tracking-wider block">
                      अधिकृत शटल रूट
                    </span>
                    <h3 className="text-base font-black text-stone-900 leading-snug">
                      {route.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ✓ Verified
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-500 block">रूट के मुख्य ठहराव (Stops):</span>
                  <div className="space-y-1.5 pl-2">
                    {route.stops.map((stop, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-bold text-stone-800">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-[10px] flex items-center justify-center font-black">
                          {idx + 1}
                        </span>
                        <span>{stop}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {route.schedule && (
                  <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-xs text-stone-700">
                    <span className="font-bold block text-stone-900">समय सारिणी:</span>
                    <span>{route.schedule}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SHUTTLE MAP VIEW                                 */}
        {/* ======================================================== */}
        {activeTab === 'MAP' && (
          <div className="space-y-3 animate-fade-in">
            <div className="h-[420px] rounded-3xl overflow-hidden shadow-md border border-stone-300">
              <DeoMap heightClass="h-full" showRouteLine={false} />
            </div>
            <p className="text-[11px] text-stone-500 text-center">
              नक्शे पर किसी भी 🛺 शटल मार्कर पर टैप करके रास्ता देखें।
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
