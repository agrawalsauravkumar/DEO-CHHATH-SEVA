import React from 'react';
import { useApp } from '../context/AppContext';
import { ScreenId } from '../types';
import { HandHeart, House, Map, Menu } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigate, language } = useApp();
  const isEnglish = language === 'en';

  const navItems: {
    id: ScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  }[] = [
    { id: 'home', label: isEnglish ? 'Home' : 'होम', icon: House },
    { id: 'map', label: isEnglish ? 'Map' : 'नक्शा', icon: Map },
    { id: 'help', label: isEnglish ? 'Help' : 'सहायता', icon: HandHeart },
    { id: 'more', label: isEnglish ? 'Services' : 'सेवाएँ', icon: Menu },
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
      aria-label={isEnglish ? 'Main navigation' : 'मुख्य नेविगेशन'}
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md md:max-w-xl bg-[#041E2F]/98 backdrop-blur-md border-t-2 md:border-x-2 md:rounded-t-3xl border-[#FFD54F] shadow-[0_-10px_32px_rgba(4,30,47,0.35)] pb-[env(safe-area-inset-bottom)] select-none font-['Mukta',sans-serif]"
    >
      <div className="grid grid-cols-4 items-center min-h-16 px-1">
        {navItems.map((item) => {
          const isActive =
            currentScreen === item.id ||
            (item.id === 'help' && (currentScreen === 'emergency' || currentScreen === 'volunteer-request')) ||
            (item.id === 'more' &&
              ['announcements', 'about', 'team', 'settings', 'volunteer', 'family', 'lost-found'].includes(
                currentScreen
              ));

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[56px] w-full flex flex-col items-center justify-center transition-all active:scale-95 relative py-1 rounded-2xl focus-visible:outline-offset-[-2px] ${
                isActive
                  ? 'text-[#FFD54F] font-black'
                  : 'text-[#FFF8E1]/75 hover:text-[#FFD54F] font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 w-9 h-1 bg-gradient-to-r from-[#FFE082] via-[#FFD54F] to-[#FFA000] rounded-full shadow-[0_0_10px_rgba(255,213,79,0.8)]" />
              )}
              <span className={`transition-transform ${isActive ? 'scale-110 drop-shadow-[0_2px_6px_rgba(255,213,79,0.5)]' : 'opacity-85'}`}>
                <item.icon className="h-5 w-5" aria-hidden />
              </span>
              <span
                className={`leading-none mt-1 tracking-wide ${
                  isActive ? 'text-[#FFD54F] font-black text-xs' : 'text-[#FFF8E1]/80 text-[11px]'
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
