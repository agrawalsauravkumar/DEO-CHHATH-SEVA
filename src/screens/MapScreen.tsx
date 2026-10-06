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
    <div className="min-h-screen bg-stone-100 pb-20 flex flex-col font-['Mukta',sans-serif]">
      {/* Top Header matching exact specification:
          ← वापस | 🔍 Destination Search */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-3 sm:px-4 py-2.5 shadow-xs">
        <div className="max-w-lg mx-auto flex items-center justify-between min-h-[44px]">
          {/* ← वापस */}
          <button
            onClick={goBack}
            className="min-h-[44px] px-3 -ml-1 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 text-sm font-black flex items-center gap-1.5 transition-colors"
            aria-label="वापस"
          >
            <ArrowLeft className="w-5 h-5 text-stone-800" />
            <span>वापस</span>
          </button>

          {/* 🔍 Destination Search */}
          <button
            onClick={() => navigate('search')}
            className="min-h-[44px] px-3.5 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-300 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs transition-all"
          >
            <Search className="w-4 h-4 text-amber-800" />
            <span>Destination Search (खोजें)</span>
          </button>
        </div>
      </header>

      {/* Main Map Area - Occupies most of the screen */}
      <main className="flex-1 max-w-lg mx-auto w-full p-2 sm:p-3 flex flex-col">
        <DeoMap
          heightClass="h-[calc(100vh-230px)] min-h-[460px]"
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

