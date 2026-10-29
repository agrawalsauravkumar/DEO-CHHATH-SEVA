/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { DeoMap } from '../components/DeoMap';
import { LocationPermissionModal } from '../components/LocationPermissionModal';
import { ArrowLeft, Search, Navigation, Compass, X } from 'lucide-react';
import { LocationItem } from '../types';

export const MapScreen: React.FC = () => {
  const {
    navigate,
    goBack,
    startNavigation,
    activeRoute,
    setActiveRoute,
    showPrePermissionModal,
    setShowPrePermissionModal,
  } = useApp();

  const handleNavigateToPreview = (item: LocationItem) => {
    startNavigation(item);
    navigate('navigation-preview');
  };

  return (
    <div className="map-screen min-h-[100dvh] bg-[var(--chhath-cream)] pb-20 flex flex-col font-['Mukta',sans-serif]">
      {/* Top Header matching Chhath Puja official logo identity */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#041E2F] via-[#073B5A] to-[#041E2F] border-b-2 border-[#FFD54F] px-3 sm:px-4 py-2.5 shadow-md text-white">
        <div className="map-screen__header-inner flex items-center justify-between min-h-[44px]">
          {/* ← वापस */}
          <button
            onClick={goBack}
            className="min-h-[44px] px-3 -ml-1 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-sm font-black flex items-center gap-1.5 transition-colors border border-white/15"
            aria-label="वापस"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
            <span>वापस</span>
          </button>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-base sm:text-lg font-black text-white leading-tight">
              देव सेवा नक्शा व सड़क मार्ग
            </h1>
            <span className="text-[10px] text-[#FFD54F] font-bold block">
              सूर्य मंदिर • सूर्य कुंड • घाट एवं पार्किंग
            </span>
          </div>

          {/* 🔍 Destination Search */}
          <button
            onClick={() => navigate('search')}
            className="min-h-[44px] px-3.5 bg-gradient-to-r from-[#FFE082] to-[#FFD54F] hover:from-[#FFD54F] hover:to-[#FFA000] active:scale-95 text-[#041E2F] border border-[#FFD54F] rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Search className="w-4 h-4 text-[#041E2F]" />
            <span className="hidden sm:inline">स्थान</span> खोजें
          </button>
        </div>
      </header>

      {/* Floating Active Route Banner (when route is computed) */}
      {activeRoute && activeRoute.geometry && activeRoute.geometry.length > 1 && (
        <div className="bg-[#041E2F] text-white px-3 sm:px-4 py-2.5 border-b border-[#FFD54F] shadow-lg flex items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#FFD54F] text-[#041E2F] flex items-center justify-center font-black text-sm shrink-0">
              🧭
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-[#FFD54F] truncate block">
                {activeRoute.destinationName || 'गंतव्य मार्ग'}
              </span>
              <span className="text-[11px] text-white/90 font-bold block">
                सड़क दूरी: {activeRoute.distanceDisplay} • {activeRoute.durationDisplay}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => navigate('navigation')}
              className="px-3 py-1.5 bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs active:scale-95 flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>नेविगेट</span>
            </button>
            <button
              onClick={() => setActiveRoute(null)}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl active:scale-95"
              title="मार्ग हटाएं"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Map Area */}
      <main className="map-screen__main flex-1 w-full p-2 sm:p-3 flex flex-col">
        <DeoMap
          heightClass="h-[calc(100dvh-200px)] min-h-[340px] sm:min-h-[460px]"
          routeGeometry={activeRoute?.geometry}
          showRouteLine={Boolean(activeRoute && activeRoute.geometry && activeRoute.geometry.length > 1)}
          onNavigateToPreview={handleNavigateToPreview}
        />
      </main>

      <LocationPermissionModal
        isOpen={showPrePermissionModal}
        onClose={() => setShowPrePermissionModal(false)}
      />
    </div>
  );
};
