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
  if (
    currentScreen === 'splash' ||
    currentScreen === 'language' ||
    currentScreen === 'location-permission' ||
    currentScreen === 'navigation'
  ) {
    return null;
  }

  return (
    <nav
      aria-label="मुख्य नेविगेशन"
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md bg-white border-t-2 border-[#FFD54F] shadow-[0_-8px_24px_rgba(6,59,92,0.12)] pb-[env(safe-area-inset-bottom)] select-none font-['Mukta',sans-serif]"
    >
      <div className="grid grid-cols-4 items-center min-h-16 px-1">
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
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[56px] w-full flex flex-col items-center justify-center transition-all active:scale-95 relative py-1 rounded-xl focus-visible:outline-offset-[-2px] ${
                isActive
                  ? 'text-[#F57C00] font-black'
                  : 'text-[#063B5C] hover:text-[#0B5E8E] font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 w-9 h-1 bg-[#F57C00] rounded-full" />
              )}
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : 'opacity-90'}`}>
                {item.icon}
              </span>
              <span
                className={`leading-none mt-1 tracking-wide ${
                  isActive ? 'text-[#F57C00] font-black text-xs' : 'text-[#063B5C] text-[11px]'
                }`}
              >
                {({ home: 'होम', map: 'नक्शा', help: 'सहायता', more: 'अन्य' } as Record<string, string>)[item.id] ?? item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
