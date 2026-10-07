import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DeoMap } from '../components/DeoMap';
import { DEO_LOCATIONS } from '../data/deoData';
import { RouteService } from '../services/RouteService';
import { TravelMode } from '../types';
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Clock,
  Footprints,
  Car,
  AlertTriangle,
  ArrowDown,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  WifiOff,
} from 'lucide-react';

export const NavigationPreviewScreen: React.FC = () => {
  const {
    activeNavigationTarget,
    selectedMapItem,
    deviceLocation,
    requestDeviceLocation,
    activeRoute,
    setActiveRoute,
    travelMode,
    setTravelMode,
    isOnline,
    navigate,
    goBack,
  } = useApp();

  const destination = activeNavigationTarget || selectedMapItem || DEO_LOCATIONS[0];

  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Fetch real road route
  const fetchRoute = async (mode: TravelMode = travelMode) => {
    if (!deviceLocation) return;
    if (!destination.latitude || !destination.longitude) {
      setRouteError('गंतव्य स्थल के निर्देशांक उपलब्ध नहीं हैं।');
      return;
    }

    setIsLoadingRoute(true);
    setRouteError(null);

    try {
      const result = await RouteService.calculateRoute({
        startLatitude: deviceLocation.latitude,
        startLongitude: deviceLocation.longitude,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
        destinationName: destination.name,
        travelMode: mode,
      });

      setActiveRoute(result);
    } catch (err: any) {
      setRouteError(err?.message || 'मार्ग सेवा से संपर्क नहीं हो पाया।');
      setActiveRoute(null);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  useEffect(() => {
    if (deviceLocation) {
      fetchRoute(travelMode);
    }
  }, [deviceLocation, destination.id, travelMode]);

  const handleModeChange = (mode: TravelMode) => {
    setTravelMode(mode);
    fetchRoute(mode);
  };

  const handleStartNav = () => {
    navigate('navigation');
  };

  return (
    <div className="min-h-screen bg-stone-100 pb-20 flex flex-col font-['Mukta',sans-serif]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 shadow-xs">
        <div className="max-w-lg mx-auto flex items-center justify-between min-h-[44px]">
          <button
            onClick={goBack}
            className="min-h-[44px] px-3 -ml-2 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 text-sm font-black flex items-center gap-1.5 transition-colors"
            aria-label="वापस"
          >
            <ArrowLeft className="w-5 h-5 text-stone-800" />
            <span>वापस</span>
          </button>

          <h1 className="text-base sm:text-lg font-black text-stone-900 truncate">
            रास्ता पूर्वावलोकन (Route Preview)
          </h1>

          <div className="w-8" />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-3 sm:p-4 space-y-3 flex flex-col">
        {/* Missing GPS Location Alert */}
        {!deviceLocation ? (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center space-y-3 shadow-sm">
            <MapPin className="w-8 h-8 text-amber-700 mx-auto" />
            <h4 className="text-base font-black text-stone-900">
              आपका वर्तमान स्थान उपलब्ध नहीं है।
            </h4>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              सड़क मार्ग से सही दिशा-निर्देश पाने के लिए डिवाइस की लोकेशन सक्रिय करें।
            </p>
            <button
              onClick={requestDeviceLocation}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>📍 Location फिर से प्राप्त करें</span>
            </button>
          </div>
        ) : (
          /* Route Source & Destination Card */
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
            <div className="flex flex-col items-start gap-1">
              {/* Start */}
              <div className="flex items-center gap-2.5 w-full">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                  📍
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                    आरंभिक बिंदु (START)
                  </span>
                  <span className="text-xs sm:text-sm font-black text-stone-900 leading-tight block truncate">
                    आपका स्थान ({deviceLocation.latitude.toFixed(4)}°, {deviceLocation.longitude.toFixed(4)}°)
                  </span>
                </div>
              </div>

              <div className="pl-3 py-0.5 text-stone-400">
                <ArrowDown className="w-3.5 h-3.5 text-amber-700" />
              </div>

              {/* Destination */}
              <div className="flex items-center gap-2.5 w-full">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                  📌
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                    गंतव्य स्थल (DESTINATION)
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-900 leading-tight block truncate">
                    {destination.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Travel Mode Toggle (Default: 🚶 पैदल) */}
            <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
              <span className="text-xs font-bold text-stone-600">मार्ग माध्यम:</span>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleModeChange('WALKING')}
                  className={`min-h-[40px] px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                    travelMode === 'WALKING'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Footprints className="w-4 h-4" />
                  <span>🚶 पैदल</span>
                </button>

                <button
                  onClick={() => handleModeChange('DRIVING')}
                  className={`min-h-[40px] px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                    travelMode === 'DRIVING'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>🚗 वाहन</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real Leaflet Map with Route Geometry */}
        <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden shadow-inner border border-stone-300 relative">
          <DeoMap
            heightClass="h-full min-h-[300px]"
            routeGeometry={activeRoute?.geometry}
            showRouteLine={!activeRoute}
          />

          {isLoadingRoute && (
            <div className="absolute inset-0 z-[1000] bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs font-black bg-stone-900/90 px-3 py-1.5 rounded-xl border border-amber-300/40">
                सड़क मार्ग की गणना हो रही है…
              </p>
            </div>
          )}
        </div>

        {/* Route Error Handling */}
        {routeError && (
          <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-xs text-rose-950 space-y-2 shadow-xs">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-sm">इस स्थान तक अभी मार्ग उपलब्ध नहीं है।</p>
                <p className="text-[11px] text-stone-600 mt-0.5">{routeError}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => navigate('search')}
                className="min-h-[40px] bg-white border border-stone-300 text-stone-800 font-bold rounded-xl hover:bg-stone-50 flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>दूसरा स्थान चुनें</span>
              </button>
              <button
                onClick={() => fetchRoute(travelMode)}
                className="min-h-[40px] bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>फिर से प्रयास करें</span>
              </button>
            </div>
          </div>
        )}

        {/* Route Details Card */}
        {activeRoute && !isLoadingRoute && (
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 font-semibold block">कुल दूरी</span>
                <span className="text-lg font-black text-stone-900">
                  {activeRoute.distanceDisplay}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500 font-semibold block">अनुमानित समय</span>
                <span className="text-lg font-black text-amber-700">
                  {activeRoute.durationDisplay}
                </span>
              </div>
            </div>

            {/* Chhath Zone Warning Note */}
            {activeRoute.warning && (
              <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-[11px] text-amber-950 font-bold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>{activeRoute.warning}</span>
              </div>
            )}

            {/* Turn Count Summary */}
            <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1 border-t border-stone-100">
              <span>मोड़ (Maneuvers): {activeRoute.steps.length} निर्देश</span>
              <span className="font-mono">प्रदाता: {activeRoute.provider}</span>
            </div>

            {/* Start Navigation Action */}
            <button
              onClick={handleStartNav}
              className="w-full min-h-[52px] bg-gradient-to-r from-[#FF8C42] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] active:scale-98 text-white font-black text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all border border-amber-300/40"
            >
              <Navigation className="w-5 h-5 fill-white" />
              <span>नेविगेशन प्रारंभ करें (Start Navigation)</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
