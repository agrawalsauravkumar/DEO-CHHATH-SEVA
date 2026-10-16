import React from 'react';
import { useApp } from '../context/AppContext';
import { DeoMap } from '../components/DeoMap';
import { LocationPermissionModal } from '../components/LocationPermissionModal';
import { ArrowLeft, Search } from 'lucide-react';
import { LocationItem } from '../types';

export const MapScreen: React.FC = () => {
  const {
    navigate,
    goBack,
    startNavigation,
    showPrePermissionModal,
    setShowPrePermissionModal,
  } = useApp();

  const handleNavigateToPreview = (item: LocationItem) => {
    startNavigation(item);
    navigate('navigation-preview');
  };

  return (
    <div className="map-screen min-h-[100dvh] bg-[var(--chhath-cream)] pb-20 flex flex-col font-['Mukta',sans-serif]">
      {/* Top Header matching Chhath Puja identity:
          ← वापस | 🔍 Destination Search */}
      <header className="sticky top-0 z-30 bg-[#075985] border-b-2 border-[#FFB52E]/70 px-3 sm:px-4 py-2.5 shadow-md text-white">
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

          {/* 🔍 Destination Search */}
          <button
            onClick={() => navigate('search')}
            className="min-h-[44px] px-3.5 bg-[#FFB52E] hover:bg-amber-300 active:scale-95 text-stone-950 border border-amber-300 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs transition-all"
          >
            <Search className="w-4 h-4 text-stone-950" />
            <span>स्थान खोजें</span>
          </button>
        </div>
      </header>

      {/* Main Map Area - Occupies most of the screen */}
      <main className="map-screen__main flex-1 w-full p-2 sm:p-3 flex flex-col">
        <DeoMap
          heightClass="h-[calc(100dvh-190px)] min-h-[320px] sm:min-h-[440px]"
          showRouteLine={false}
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
