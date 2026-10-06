import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { DeoMap } from '../components/DeoMap';
import { DEO_LOCATIONS } from '../data/deoData';
import { RouteService } from '../services/RouteService';
import { VoiceNavigationService } from '../services/VoiceNavigationService';
import { AnnouncementService } from '../services/AnnouncementService';
import { RouteStep, RouteAlert } from '../types';
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

  const destination = activeNavigationTarget || selectedMapItem || DEO_LOCATIONS[0];

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);
  const [isDestinationReached, setIsDestinationReached] = useState<boolean>(false);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [conflictingRouteAlert, setConflictingRouteAlert] = useState<RouteAlert | null>(null);

  // Monitor activeRoute for any verified road closures or route restrictions (Step 16)
  useEffect(() => {
    if (activeRoute?.geometry) {
      const conflict = AnnouncementService.checkRouteConflict(activeRoute.geometry);
      setConflictingRouteAlert(conflict);
      if (conflict) {
        VoiceNavigationService.speak(
          'सावधान: आपके रास्ते में मार्ग प्रतिबंध की आधिकारिक सूचना मिली है।',
          false
        );
      }
    }
  }, [activeRoute]);

  const handleTakeAlternativeRoute = async () => {
    if (!conflictingRouteAlert) return;
    if (!conflictingRouteAlert.alternativeRouteAvailable) {
      setVoiceNotice('कृपया map पर नया रास्ता चुनें।');
      setTimeout(() => setVoiceNotice(null), 3500);
      return;
    }

    setIsRecalculating(true);
    setVoiceNotice('वैकल्पिक सुगम मार्ग खोजा जा रहा है…');
    try {
      const altLat = conflictingRouteAlert.latitude + 0.003;
      const altLng = conflictingRouteAlert.longitude + 0.003;
      const altRoute = await RouteService.calculateRoute({
        startLatitude: deviceLocation?.latitude || 24.6500,
        startLongitude: deviceLocation?.longitude || 84.4350,
        destinationLatitude: altLat,
        destinationLongitude: altLng,
        destinationName: `${conflictingRouteAlert.roadName} (वैकल्पिक बाईपास)`,
        travelMode,
      });
      setActiveRoute(altRoute);
      setCurrentStepIndex(0);
      setConflictingRouteAlert(null);
      VoiceNavigationService.speak('वैकल्पिक मार्ग सेट हो गया है। नेविगेशन जारी है।', true);
    } catch {
      setVoiceNotice('वैकल्पिक मार्ग हेतु कृपया map पर नया बिंदु चुनें।');
    } finally {
      setIsRecalculating(false);
    }
  };

  const steps: RouteStep[] = activeRoute?.steps && activeRoute.steps.length > 0
    ? activeRoute.steps
    : [
        {
          id: 'step-fallback-0',
          instruction: 'सीधे आगे बढ़ें और मुख्य देव मार्ग का अनुसरण करें।',
          maneuverType: 'continue',
          distanceMeters: 450,
          durationSeconds: 300,
          location: [destination.latitude || 24.6542, destination.longitude || 84.4371],
        },
        {
          id: 'step-fallback-1',
          instruction: 'आप अपने गंतव्य के पास पहुँच गए हैं।',
          maneuverType: 'arrive',
          distanceMeters: 0,
          durationSeconds: 0,
          location: [destination.latitude || 24.6542, destination.longitude || 84.4371],
        },
      ];

  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];
  const nextStep = currentStepIndex + 1 < steps.length ? steps[currentStepIndex + 1] : null;

  // Speak instruction whenever current step changes
  useEffect(() => {
    if (!isPaused && !isMuted && currentStep) {
      VoiceNavigationService.speak(currentStep.instruction);
    }
  }, [currentStepIndex, isPaused, isMuted]);

  // Monitor live GPS for off-route, arrival, and step progression
  useEffect(() => {
    if (!deviceLocation || isPaused || isDestinationReached) return;

    const destLat = destination.latitude || 24.6542;
    const destLng = destination.longitude || 84.4371;

    // 1. Check Arrival Detection (within 35 meters)
    if (RouteService.isUserAtDestination(deviceLocation.latitude, deviceLocation.longitude, destLat, destLng, 35)) {
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
  }, [deviceLocation, isPaused, isDestinationReached]);

  // Recalculate route if off-route
  const handleRecalculate = async () => {
    if (!deviceLocation || isRecalculating) return;

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
        destinationLatitude: destination.latitude || 24.6542,
        destinationLongitude: destination.longitude || 84.4371,
        destinationName: destination.name,
        travelMode,
      });

      setActiveRoute(newRoute);
      setCurrentStepIndex(0);
      setIsOffRoute(false);
      setVoiceNotice('नया मार्ग निर्धारित कर लिया गया है।');
      setTimeout(() => setVoiceNotice(null), 3000);
    } catch {
      // Keep existing route on recalculate failure
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

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-6 flex flex-col font-['Mukta',sans-serif] select-none">
      {/* Top Header: ← वापस | 🧭 Navigation */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 py-2.5 shadow-md sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between min-h-[44px]">
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

      {/* Route Restriction Alert Banner (Step 16 Requirement 7) */}
      {conflictingRouteAlert && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 px-4 py-2.5 shadow-lg border-b-2 border-stone-900 animate-fade-in space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-xs">
              <span className="text-base">⚠️</span>
              <span className="tracking-wide">मार्ग में बदलाव (Route Restriction Alert)</span>
            </div>
            <span className="text-[10px] bg-stone-950 text-amber-300 px-2 py-0.5 rounded-full font-black">
              VERIFIED OFFICIAL
            </span>
          </div>

          <p className="text-xs font-bold leading-snug">
            “आपके रास्ते में verified route restriction की सूचना मिली है ({conflictingRouteAlert.roadName} — {conflictingRouteAlert.reason})।”
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            {conflictingRouteAlert.alternativeRouteAvailable ? (
              <button
                onClick={handleTakeAlternativeRoute}
                disabled={isRecalculating}
                className="px-3 py-1 bg-stone-950 hover:bg-stone-800 text-amber-300 text-xs font-black rounded-xl flex items-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <span>↪️</span>
                <span>{isRecalculating ? 'खोजा जा रहा है…' : 'वैकल्पिक रास्ता'}</span>
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-stone-900">
                “कृपया map पर नया रास्ता चुनें।”
              </span>
            )}

            <button
              onClick={() => navigate('map')}
              className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold rounded-xl border border-stone-400 active:scale-95"
            >
              नक्शा देखें
            </button>
          </div>
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
          <span>इंटरनेट बंद है • सहेजे गए मार्ग पर नेविगेशन जारी है।</span>
        </div>
      )}

      {/* Middle: Real Interactive Leaflet Map */}
      <main className="flex-1 max-w-lg mx-auto w-full p-2 sm:p-3 flex flex-col space-y-3">
        <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden shadow-2xl border border-stone-800 relative">
          <DeoMap
            heightClass="h-full min-h-[300px]"
            routeGeometry={activeRoute?.geometry}
            showRouteLine={!activeRoute}
            centerOnUserByDefault={true}
          />
        </div>

        {/* ARRIVAL SCREEN (When destination reached) */}
        {isDestinationReached ? (
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
                  {activeRoute?.distanceDisplay || destination.distance}
                </span>
              </div>
              <div className="bg-stone-950 p-2 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block font-semibold">अनुमानित समय</span>
                <span className="text-base font-black text-emerald-400">
                  {activeRoute?.durationDisplay || destination.walkingTime}
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
