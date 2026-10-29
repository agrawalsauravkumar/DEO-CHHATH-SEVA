import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DeoMap } from '../components/DeoMap';
import { RouteService } from '../services/RouteService';
import { VoiceNavigationService } from '../services/VoiceNavigationService';
import { RouteStep } from '../types';
import {
  ArrowLeft,
  Compass,
  Volume2,
  VolumeX,
  Pause,
  Play,
  StopCircle,
  AlertTriangle,
  CheckCircle2,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  RefreshCw,
  MapPin,
  WifiOff,
} from 'lucide-react';

export const NavigationScreen: React.FC = () => {
  const {
    activeNavigationTarget,
    selectedMapItem,
    deviceLocation,
    activeRoute,
    setActiveRoute,
    travelMode,
    isOnline,
    stopNavigation,
    goBack,
    navigate,
  } = useApp();

  const destination = activeNavigationTarget || selectedMapItem;
  const destinationCoordinates = useMemo(
    () => destination?.latitude !== undefined && destination.longitude !== undefined
      ? [destination.latitude, destination.longitude] as const
      : null,
    [destination?.latitude, destination?.longitude]
  );

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);
  const [isDestinationReached, setIsDestinationReached] = useState<boolean>(false);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const steps: RouteStep[] = activeRoute?.steps || [];

  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];
  const nextStep = currentStepIndex + 1 < steps.length ? steps[currentStepIndex + 1] : null;

  // Speak instruction whenever current step changes
  useEffect(() => {
    if (isOnline && activeRoute && !isPaused && !isMuted && currentStep) {
      VoiceNavigationService.speak(currentStep.instruction);
    }
  }, [currentStepIndex, isPaused, isMuted, isOnline, activeRoute, currentStep]);

  // Monitor live GPS for off-route, arrival, and step progression
  useEffect(() => {
    if (!deviceLocation || !destinationCoordinates || !activeRoute || !isOnline || isPaused || isDestinationReached) return;

    // 1. Check Arrival Detection (within 35 meters)
    if (RouteService.isUserAtDestination(deviceLocation.latitude, deviceLocation.longitude, destinationCoordinates[0], destinationCoordinates[1], 35)) {
      setIsDestinationReached(true);
      VoiceNavigationService.speak('आप अपने गंतव्य पर पहुँच गए हैं।', true);
      return;
    }

    // 2. Check Off-Route Detection (deviated > 75 meters)
    if (activeRoute?.geometry) {
      const offRoute = RouteService.isUserOffRoute(
        deviceLocation.latitude,
        deviceLocation.longitude,
        activeRoute.geometry,
        75
      );

      if (offRoute && !isOffRoute) {
        setIsOffRoute(true);
        VoiceNavigationService.speak('आप निर्धारित रास्ते से हट गए हैं। नया मार्ग खोजा जा रहा है।');
        handleRecalculate();
      } else if (!offRoute && isOffRoute) {
        setIsOffRoute(false);
      }
    }

    // 3. Advance to closest step along route
    if (activeRoute?.steps) {
      const nextIdx = RouteService.findCurrentStepIndex(
        deviceLocation.latitude,
        deviceLocation.longitude,
        activeRoute.steps
      );
      if (nextIdx > currentStepIndex) {
        setCurrentStepIndex(nextIdx);
      }
    }
  }, [deviceLocation, isPaused, isDestinationReached, activeRoute, destinationCoordinates, isOnline]);

  // Recalculate route if off-route
  const handleRecalculate = async () => {
    if (!deviceLocation || !destination || !destinationCoordinates || isRecalculating) return;

    if (!isOnline) {
      setVoiceNotice('नया मार्ग प्राप्त करने के लिए इंटरनेट की आवश्यकता है।');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    setIsRecalculating(true);
    try {
      const newRoute = await RouteService.calculateRoute({
        startLatitude: deviceLocation.latitude,
        startLongitude: deviceLocation.longitude,
        destinationLatitude: destinationCoordinates[0],
        destinationLongitude: destinationCoordinates[1],
        destinationName: destination.name,
        travelMode,
      });

      setActiveRoute(newRoute);
      setCurrentStepIndex(0);
      setIsOffRoute(false);
      setVoiceNotice('नया मार्ग निर्धारित कर लिया गया है।');
      setTimeout(() => setVoiceNotice(null), 3000);
    } catch (error: unknown) {
      setVoiceNotice(error instanceof Error ? error.message : 'रूट सेवा अभी उपलब्ध नहीं है।');
      setTimeout(() => setVoiceNotice(null), 4000);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    VoiceNavigationService.setMuted(next);
    setVoiceNotice(next ? 'ध्वनि निर्देश बंद' : 'ध्वनि निर्देश चालू');
    setTimeout(() => setVoiceNotice(null), 2500);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      VoiceNavigationService.stop();
    }
  };

  const handleStopNavigation = () => {
    VoiceNavigationService.stop();
    stopNavigation();
    navigate('map');
  };

  // Helper for maneuver icons
  const getManeuverIcon = (type: string, modifier?: string) => {
    if (type === 'arrive') return '🏁';
    if (modifier?.includes('right')) return <CornerUpRight className="w-8 h-8 text-amber-400" />;
    if (modifier?.includes('left')) return <CornerUpLeft className="w-8 h-8 text-amber-400" />;
    return <ArrowUp className="w-8 h-8 text-amber-400" />;
  };

  if (!destination || !destinationCoordinates) {
    return (
      <main className="min-h-screen bg-[#FFF7E5] p-6 text-center">
        <h1 className="text-xl font-black text-[#063B5C]">गंतव्य उपलब्ध नहीं है</h1>
        <p className="mt-2 text-sm text-stone-700">सत्यापित स्थान खोजकर फिर से मार्ग चुनें।</p>
        <button onClick={() => navigate('search')} className="mt-4 min-h-[48px] rounded-xl bg-[#075985] px-5 font-bold text-white">
          स्थान खोजें
        </button>
      </main>
    );
  }

  const routeAvailable = Boolean(activeRoute && currentStep);

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-6 flex flex-col font-['Mukta',sans-serif] select-none">
      {/* Top Header: ← वापस | 🧭 Navigation */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 py-2.5 shadow-md sticky top-0 z-30">
        <div className="max-w-3xl sm:max-w-4xl mx-auto flex items-center justify-between min-h-[44px]">
          <button
            onClick={goBack}
            className="min-h-[44px] px-3 -ml-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-white text-sm font-black flex items-center gap-1.5 transition-colors"
            aria-label="वापस"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
            <span>वापस</span>
          </button>

          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
              🧭 Live Navigation
            </h1>
          </div>

          <div className="w-8" />
        </div>
      </header>

      {/* Voice notice toast */}
      {voiceNotice && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-black flex items-center justify-center gap-2 shadow-md animate-fade-in">
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>{voiceNotice}</span>
        </div>
      )}

      {/* Off-Route Alert Banner */}
      {isOffRoute && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-black flex items-center justify-between gap-2 shadow-md animate-bounce">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>आप निर्धारित रास्ते से हट गए हैं।</span>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="px-2.5 py-1 bg-white text-rose-900 text-[11px] font-black rounded-lg"
          >
            {isRecalculating ? 'मार्ग खोजा जा रहा है…' : 'नया मार्ग खोजें'}
          </button>
        </div>
      )}

      {/* Low GPS Accuracy Alert */}
      {deviceLocation && deviceLocation.accuracy > 50 && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 text-amber-200 px-3 py-1.5 text-[11px] font-bold text-center">
          ⚠️ Location की सटीकता कम है (±{deviceLocation.accuracy}m)। रास्ता अनुमानित हो सकता है।
        </div>
      )}

      {/* Offline Mode Alert */}
      {!isOnline && (
        <div className="bg-stone-800 text-stone-300 px-3 py-1 text-[11px] text-center flex items-center justify-center gap-1">
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>ऑफलाइन मोड • देव स्थानीय सड़क नेटवर्क एवं GPS दिशा-निर्देश चालू हैं।</span>
        </div>
      )}

      {/* Middle: Real Interactive Leaflet Map */}
      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-2 sm:p-3 flex flex-col space-y-3">
        <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden shadow-2xl border border-stone-800 relative">
          <DeoMap
            heightClass="h-full min-h-[300px]"
            routeGeometry={activeRoute?.geometry}
            showRouteLine={Boolean(activeRoute && activeRoute.geometry && activeRoute.geometry.length > 1)}
            centerOnUserByDefault={true}
          />
        </div>

        {/* ARRIVAL SCREEN (When destination reached) */}
        {!routeAvailable ? (
          <section className="rounded-2xl border border-amber-400 bg-stone-900 p-5 text-center text-white">
            <h2 className="font-black text-amber-300">रूट सेवा अभी उपलब्ध नहीं है</h2>
            <p className="mt-2 text-sm text-stone-200">
              {!isOnline
                ? 'इंटरनेट कनेक्शन नहीं है। GPS स्थान उपलब्ध हो सकता है, लेकिन लाइव रूट और दिशा-निर्देश नहीं।'
                : 'वास्तविक रूट और दिशा-निर्देश मिलने तक नेविगेशन शुरू नहीं होगा।'}
            </p>
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating || !deviceLocation}
              className="mt-4 min-h-[44px] rounded-xl bg-amber-600 px-4 font-bold text-white disabled:opacity-50"
            >
              {deviceLocation ? 'रूट फिर से प्राप्त करें' : 'पहले मेरा स्थान प्राप्त करें'}
            </button>
          </section>
        ) : isDestinationReached ? (
          <div className="bg-emerald-950 border-2 border-emerald-400 rounded-3xl p-5 text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-400/40">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white leading-tight">
                ✓ आप अपने गंतव्य पर पहुँच गए हैं।
              </h2>
              <p className="text-xs text-emerald-200 mt-1">
                {destination.name} • देव, औरंगाबाद
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleStopNavigation}
                className="min-h-[48px] bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-md"
              >
                Navigation समाप्त करें
              </button>
              <button
                onClick={() => {
                  setIsDestinationReached(false);
                  setCurrentStepIndex(0);
                }}
                className="min-h-[48px] bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700"
              >
                फिर से रास्ता देखें
              </button>
            </div>
          </div>
        ) : (
          /* TURN-BY-TURN HUD (Bottom Section) */
          <div className="bg-stone-900 border-2 border-amber-500/60 rounded-3xl p-4 shadow-2xl space-y-3">
            {/* Step Instruction Card */}
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-inner">
                {getManeuverIcon(currentStep?.maneuverType || 'continue', currentStep?.modifier)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  वर्तमान निर्देश (Next Turn)
                </span>
                <p className="text-lg sm:text-xl font-black text-white leading-tight">
                  {currentStep?.instruction || 'सीधे जाएँ'}
                </p>
                {currentStep?.distanceMeters > 0 && (
                  <p className="text-xs text-stone-400 font-semibold mt-0.5">
                    अगले {currentStep.distanceMeters} मीटर तक
                  </p>
                )}
              </div>
            </div>

            {/* Next Step Preview */}
            {nextStep && (
              <div className="bg-stone-850 bg-stone-950/70 p-2.5 rounded-xl border border-stone-800 flex items-center gap-2 text-xs text-stone-400">
                <span className="text-[10px] font-bold text-amber-500 uppercase shrink-0">इसके बाद:</span>
                <span className="truncate text-stone-300 font-semibold">{nextStep.instruction}</span>
              </div>
            )}

            {/* Metrics: Distance remaining & Time remaining */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-800 text-center">
              <div className="bg-stone-950 p-2 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block font-semibold">शेष दूरी</span>
                <span className="text-base font-black text-amber-300">
                  {activeRoute?.distanceDisplay || '—'}
                </span>
              </div>
              <div className="bg-stone-950 p-2 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block font-semibold">अनुमानित समय</span>
                <span className="text-base font-black text-emerald-400">
                  {activeRoute?.durationDisplay || '—'}
                </span>
              </div>
            </div>

            {/* Senior-Friendly Controls: 🔊 आवाज़, ⏸️ रोकें, ⏹️ Navigation समाप्त */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* 🔊 आवाज़ */}
              <button
                onClick={handleToggleMute}
                className={`min-h-[46px] rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                  !isMuted
                    ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500 shadow-sm'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-400 border-stone-700'
                }`}
              >
                {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{!isMuted ? 'आवाज़ ऑन' : 'म्यूट'}</span>
              </button>

              {/* ⏸️ रोकें / ▶️ जारी */}
              <button
                onClick={handleTogglePause}
                className="min-h-[46px] rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 border border-stone-700 text-stone-200 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                <span>{isPaused ? 'जारी रखें' : 'रोकें'}</span>
              </button>

              {/* ⏹️ Navigation समाप्त करें */}
              <button
                onClick={handleStopNavigation}
                className="min-h-[46px] rounded-xl bg-rose-700 hover:bg-rose-800 active:scale-95 border border-rose-600 text-white font-black text-xs flex items-center justify-center gap-1 shadow-md transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                <span>समाप्त</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
