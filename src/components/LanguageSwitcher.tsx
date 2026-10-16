import React from 'react';
import { useApp } from '../context/AppContext';

interface Props {
  className?: string;
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<Props> = ({ className = '', compact = false }) => {
  const { language, setLanguage } = useApp();

  return (
    <div
      role="group"
      aria-label={language === 'en' ? 'Website language' : 'वेबसाइट की भाषा'}
      className={`inline-flex shrink-0 overflow-hidden rounded-xl border border-[#FFD54F]/70 bg-white/10 ${className}`}
    >
      <button
        type="button"
        lang="hi"
        aria-pressed={language === 'hi'}
        onClick={() => setLanguage('hi')}
        className={`min-h-11 px-2.5 text-xs font-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#FFD54F] ${
          language === 'hi' ? 'bg-[#FFD54F] text-[#073B5A]' : 'text-white hover:bg-white/15'
        }`}
      >
        {compact ? 'हि' : 'हिन्दी'}
      </button>
      <button
        type="button"
        lang="en"
        aria-pressed={language === 'en'}
        onClick={() => setLanguage('en')}
        className={`min-h-11 border-l border-[#FFD54F]/40 px-2.5 text-xs font-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#FFD54F] ${
          language === 'en' ? 'bg-[#FFD54F] text-[#073B5A]' : 'text-white hover:bg-white/15'
        }`}
      >
        EN
      </button>
    </div>
  );
};
