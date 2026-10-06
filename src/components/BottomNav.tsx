import React from 'react';
import { useApp } from '../context/AppContext';
import { ScreenId } from '../types';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigate, seniorMode } = useApp();

  const navItems: { id: ScreenId; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'help', label: 'Help', icon: '🆘' },
    { id: 'more', label: 'More', icon: '☰' },
  ];

  // Hidden on splash or full-screen navigation HUD
  if (currentScreen === 'splash' || currentScreen === 'navigation') {
    return null;
  }

  return (
    <nav
      aria-label="मुख्य नेविगेशन"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-stone-200 shadow-xl pb-safe select-none font-['Mukta',sans-serif]"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive =
            currentScreen === item.id ||
            (item.id === 'help' && (currentScreen === 'emergency' || currentScreen === 'volunteer-request')) ||
            (item.id === 'more' &&
              ['announcements', 'about', 'settings', 'volunteer', 'family', 'lost-found'].includes(
                currentScreen
              ));

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`min-h-[50px] w-full flex flex-col items-center justify-center transition-all active:scale-95 relative ${
                isActive
                  ? 'text-[#0F2642] font-black'
                  : 'text-stone-500 hover:text-stone-800 font-semibold'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 w-8 h-1 bg-amber-500 rounded-full" />
              )}
              <span className={`text-xl transition-transform ${isActive ? 'scale-115 text-[#0F2642]' : ''}`}>
                {item.icon}
              </span>
              <span
                className={`leading-none mt-1 tracking-tight ${
                  isActive ? 'text-[#0F2642] font-black text-xs' : 'text-stone-600 text-[11px]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
