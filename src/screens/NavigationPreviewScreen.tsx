/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DeoMap } from '../components/DeoMap';
import { RouteService } from '../services/RouteService';
import { TravelMode, LocationItem } from '../types';
import { DEFAULT_AUTHENTIC_FACILITIES } from '../services/MapFacilityService';
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
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';

interface StartPointOption {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isGps?: boolean;
}

const COMMON_START_HUBS: StartPointOption[] = [
  {
    id: 'start-parking-1',
    name: 'पार्किंग 1 - राजा जगन्नाथ स्कूल मैदान',
    latitude: 24.6508,
    longitude: 84.4325,
  },
  {
    id: 'start-parking-2',
    name: 'पार्किंग 2 - देव डिग्री कॉलेज मैदान',
    latitude: 24.6565,
    longitude: 84.4285,
  },
  {
    id: 'start-bus-stand',
    name: 'देव बस स्टैंड / मुख्य चौक',
    latitude: 24.6528,
    longitude: 84.435,
  },
  {
    id: 'start-temple-gate',
    name: 'देव सूर्य मंदिर मुख्य द्वार',
    latitude: 24.6542,
    longitude: 84.4371,
  },
  {
    id: 'start-hospital',
    name: 'सामुदायिक स्वास्थ्य केंद्र (अस्पताल)',
    latitude: 24.6555,
    longitude: 84.4342,
  },
];

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

  const destination = activeNavigationTarget || selectedMapItem;

  const [selectedStartHub, setSelectedStartHub] = useState<StartPointOption | null>(null);
  const [useGpsAsStart, setUseGpsAsStart] = useState<boolean>(true);
  const [showStartSelector, setShowStartSelector] = useState<boolean>(false);
  const [showStepsList, setShowStepsList] = useState<boolean>(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Compute effective start point
  const effectiveStart = useMemo<StartPointOption | null>(() => {
    if (useGpsAsStart && deviceLocation) {
      return {
        id: 'gps-device',
        name: `आपका वर्तमान GPS स्थान (±${Math.round(deviceLocation.accuracy)}m)`,
        latitude: deviceLocation.latitude,
        longitude: deviceLocation.longitude,
        isGps: true,
      };
    }
    if (selectedStartHub) {
      return selectedStartHub;
    }
    if (deviceLocation) {
      return {
        id: 'gps-device',
        name: `आपका वर्तमान GPS स्थान (±${Math.round(deviceLocation.accuracy)}m)`,
        latitude: deviceLocation.latitude,
        longitude: deviceLocation.longitude,
        isGps: true,
      };
    }
    // Default to first hub if no GPS
    return COMMON_START_HUBS[0];
  }, [useGpsAsStart, deviceLocation, selectedStartHub]);

  // Fetch real road route
  const fetchRoute = async (mode: TravelMode = travelMode, startOverride?: StartPointOption) => {
    const start = startOverride || effectiveStart;

    if (!start) {
      setRouteError('कृपया शुरुआती स्थान (GPS या देव का कोई स्थल) चुनें।');
      return;
    }
    if (!destination || destination.latitude === undefined || destination.longitude === undefined) {
      setRouteError('गंतव्य स्थल के निर्देशांक उपलब्ध नहीं हैं।');
      return;
    }

    setIsLoadingRoute(true);
    setRouteError(null);

    try {
      const result = await RouteService.calculateRoute({
        startLatitude: start.latitude,
        startLongitude: start.longitude,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
        destinationName: destination.name,
        travelMode: mode,
      });

      setActiveRoute(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'मार्ग सेवा से संपर्क नहीं हो पाया।';
      setRouteError(message);
      setActiveRoute(null);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  useEffect(() => {
    if (effectiveStart && destination?.latitude !== undefined) {
      fetchRoute(travelMode);
    }
  }, [effectiveStart?.id, effectiveStart?.latitude, destination?.id, travelMode]);

  const handleModeChange = (mode: TravelMode) => {
    setTravelMode(mode);
    fetchRoute(mode);
  };

  const handleSelectStartHub = (hub: StartPointOption) => {
    setUseGpsAsStart(false);
    setSelectedStartHub(hub);
    setShowStartSelector(false);
    fetchRoute(travelMode, hub);
  };

  const handleUseGps = async () => {
    setUseGpsAsStart(true);
    setSelectedStartHub(null);
    setShowStartSelector(false);
    const success = await requestDeviceLocation();
    if (success && deviceLocation) {
      fetchRoute(travelMode, {
        id: 'gps-device',
        name: 'आपका वर्तमान GPS स्थान',
        latitude: deviceLocation.latitude,
        longitude: deviceLocation.longitude,
        isGps: true,
      });
    }
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

          <button
            onClick={() => setShowStartSelector(!showStartSelector)}
            className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 active:scale-95 text-xs font-bold flex items-center gap-1"
            title="शुरुआती स्थान बदलें"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-3 sm:p-4 space-y-3 flex flex-col">
        {/* Missing Destination Alert */}
        {!destination ? (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center space-y-3 shadow-sm">
            <MapPin className="w-8 h-8 text-amber-700 mx-auto" />
            <h4 className="text-base font-black text-stone-900">सत्यापित गंतव्य नहीं चुना गया है।</h4>
            <button onClick={() => navigate('search')} className="min-h-[44px] rounded-xl bg-[#075985] px-4 font-bold text-white">
              स्थान खोजें
            </button>
          </div>
        ) : (
          /* Route Source & Destination Card */
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
            <div className="flex flex-col items-start gap-1">
              {/* Start Point */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                    📍
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                      आरंभिक बिंदु (START POINT)
                    </span>
                    <span className="text-xs sm:text-sm font-black text-stone-900 leading-tight block truncate">
                      {effectiveStart?.name || 'आरंभिक स्थल चुनें'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowStartSelector(!showStartSelector)}
                  className="shrink-0 px-2.5 py-1 text-xs font-bold text-[#075985] bg-sky-50 rounded-lg border border-sky-200 hover:bg-sky-100"
                >
                  बदलें
                </button>
              </div>

              {/* Start Hub Selector Drawer */}
              {showStartSelector && (
                <div className="w-full mt-2 p-3 rounded-xl bg-amber-50/80 border border-amber-300/80 space-y-2 animate-fade-in text-xs">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span>शुरुआती स्थल चुनें:</span>
                    <button
                      onClick={() => setShowStartSelector(false)}
                      className="text-stone-500 hover:text-stone-800 text-[11px]"
                    >
                      ✕ बंद करें
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <button
                      onClick={handleUseGps}
                      className={`p-2 rounded-lg text-left font-bold flex items-center gap-2 ${
                        useGpsAsStart && deviceLocation
                          ? 'bg-[#075985] text-white'
                          : 'bg-white text-stone-800 border border-stone-200'
                      }`}
                    >
                      <span>📍</span>
                      <span>मेरा वर्तमान GPS स्थान {deviceLocation ? `(सटीकता ±${Math.round(deviceLocation.accuracy)}m)` : '(स्थान खोजें)'}</span>
                    </button>
                    {COMMON_START_HUBS.map((hub) => (
                      <button
                        key={hub.id}
                        onClick={() => handleSelectStartHub(hub)}
                        className={`p-2 rounded-lg text-left font-bold flex items-center gap-2 ${
                          !useGpsAsStart && selectedStartHub?.id === hub.id
                            ? 'bg-[#075985] text-white'
                            : 'bg-white text-stone-800 border border-stone-200'
                        }`}
                      >
                        <span>🏛️</span>
                        <span className="truncate">{hub.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pl-3 py-0.5 text-stone-400">
                <ArrowDown className="w-3.5 h-3.5 text-amber-700" />
              </div>

              {/* Destination Point */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
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

                <button
                  type="button"
                  onClick={() => navigate('search')}
                  className="shrink-0 px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-100 rounded-lg border border-amber-300 hover:bg-amber-200"
                >
                  बदलें
                </button>
              </div>
            </div>

            {/* Travel Mode Toggle (Default: 🚶 पैदल / Walking) */}
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
                  <span>🚶 पैदल चलें</span>
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
                  <span>🚗 वाहन मार्ग</span>
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
            showRouteLine={Boolean(activeRoute)}
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
                <p className="font-black text-sm">इस स्थान तक अभी लाइव सड़क मार्ग उपलब्ध नहीं है।</p>
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
                <span className="text-xs text-stone-500 font-semibold block">कुल सड़क दूरी</span>
                <span className="text-lg font-black text-stone-900">
                  {activeRoute.distanceDisplay}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500 font-semibold block">
                  {travelMode === 'WALKING' ? 'पैदल अनुमानित समय' : 'वाहन अनुमानित समय'}
                </span>
                <span className="text-lg font-black text-amber-700">
                  {activeRoute.durationDisplay}
                </span>
              </div>
            </div>

            {/* Turn Count Summary & Step Toggle */}
            <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowStepsList(!showStepsList)}
                className="font-bold text-[#075985] hover:underline flex items-center gap-1"
              >
                <span>मोड़ (Maneuvers): {activeRoute.steps.length} निर्देश</span>
                {showStepsList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <span className="font-mono text-[10px]">इंजन: {activeRoute.provider}</span>
            </div>

            {/* Expandable Turn-by-Turn Steps */}
            {showStepsList && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl bg-stone-50 p-2.5 border border-stone-200 text-xs">
                {activeRoute.steps.map((st, i) => (
                  <div key={st.id || i} className="flex items-start gap-2 py-1 border-b border-stone-200/60 last:border-0">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-stone-800">{st.instruction}</p>
                      {st.distanceMeters > 0 && (
                        <p className="text-[10px] text-stone-500">{st.distanceMeters} मीटर</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Start Navigation Action */}
            <button
              onClick={handleStartNav}
              className="w-full min-h-[52px] bg-gradient-to-r from-[#F47B20] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] active:scale-98 text-white font-black text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all border border-amber-300/40"
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
