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
      className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#041E2F] via-[#0B5E8E] to-[#041E2F] border-t-2 border-[#FFD54F]/70 shadow-2xl pb-safe select-none font-['Mukta',sans-serif]"
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
              className={`min-h-[50px] w-full flex flex-col items-center justify-center transition-all active:scale-95 relative py-1 rounded-xl ${
                isActive
                  ? 'text-[#FFD54F] font-black'
                  : 'text-[#FFF8E1]/80 hover:text-white font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 w-9 h-1 bg-gradient-to-r from-[#FF8C42] to-[#FFD54F] rounded-full shadow-sm" />
              )}
              <span className={`text-xl transition-transform ${isActive ? 'scale-115 drop-shadow' : 'opacity-90'}`}>
                {item.icon}
              </span>
              <span
                className={`leading-none mt-1 tracking-wide ${
                  isActive ? 'text-[#FFD54F] font-black text-xs' : 'text-[#FFF8E1]/85 text-[11px]'
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
