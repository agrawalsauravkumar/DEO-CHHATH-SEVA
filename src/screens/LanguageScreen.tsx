import React from 'react';
import { useApp } from '../context/AppContext';
import { LanguageCode } from '../types';
import { Check, ArrowRight, Volume2, Globe } from 'lucide-react';
import { TopBar } from '../components/TopBar';

export const LanguageScreen: React.FC = () => {
  const { language, setLanguage, navigate, seniorMode } = useApp();

  const languages: {
    code: LanguageCode;
    title: string;
    sub: string;
    desc: string;
    badge: string;
  }[] = [
    {
      code: 'hi',
      title: 'हिन्दी',
      sub: 'Hindi',
      desc: 'पूरी जानकारी सरल हिन्दी में उपलब्ध है।',
      badge: 'सर्वाधिक अनुशंसित',
    },
    {
      code: 'bho',
      title: 'भोजपुरी',
      sub: 'Bhojpuri',
      desc: 'छठ माई के कृपा से रउआ खातिर सरल सेवा।',
      badge: 'क्षेत्रीय भाषा',
    },
    {
      code: 'mag',
      title: 'मगही',
      sub: 'Magahi',
      desc: 'औरंगाबाद-मगध के स्थानीय बोली में जानकारी।',
      badge: 'स्थानीय बोली',
    },
    {
      code: 'en',
      title: 'English',
      sub: 'अंग्रेजी',
      desc: 'Navigation and essential pilgrimage services in English.',
      badge: 'General',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8E1]/60 flex flex-col justify-between font-['Mukta',sans-serif]">
      <TopBar title="भाषा चयन / Select Language" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 sm:p-5 space-y-5">
        {/* Welcome Header with Chhath Sunrise Aura */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0B5E8E] to-[#123052] text-[#FFD54F] mx-auto flex items-center justify-center mb-1 shadow-md border border-[#FFD54F]/40 text-2xl">
            ☀️
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#0B5E8E] block">
            NEXTGEN DEVBHOOMI FOUNDATION
          </span>
          <h2 className={`font-black text-stone-900 ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
            अपनी पसंदीदा भाषा चुनें
          </h2>
          <p className="text-xs text-stone-600">
            आप इसे बाद में भी सेटिंग्स से कभी भी बदल सकते हैं
          </p>
        </div>

        <div className="space-y-3">
          {languages.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-98 flex items-center justify-between min-h-[68px] ${
                  isSelected
                    ? 'border-[#0B5E8E] bg-white shadow-md ring-2 ring-[#0B5E8E]/20'
                    : 'border-stone-200 bg-white hover:border-[#FFD54F] hover:bg-[#FFF8E1]/30 shadow-2xs'
                }`}
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-stone-900">{item.title}</span>
                    <span className="text-xs text-stone-500 font-semibold">({item.sub})</span>
                    <span className="text-xs text-[#0B5E8E] font-bold">
                      · {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{item.desc}</p>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    isSelected
                      ? 'bg-[#0B5E8E] border-[#0B5E8E] text-white shadow-xs'
                      : 'border-stone-300 bg-stone-100'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Audio helper notice with warm Ivory / Cream card */}
        <div className="bg-[#FFF8E1] border-2 border-[#FFD54F]/70 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-950 shadow-2xs">
          <Volume2 className="w-4 h-4 text-[#FF8C42] shrink-0 mt-0.5" />
          <span>
            <strong>सलाह:</strong> यदि पढ़ने में कठिनाई हो, तो आप होम स्क्रीन से{' '}
            <strong>वरिष्ठ नागरिक मोड</strong> चालू कर सकते हैं जिसमें बड़े अक्षर और आवाज़ सहायता उपलब्ध है।
          </span>
        </div>
      </main>

      <footer className="p-4 bg-white border-t border-stone-200 sticky bottom-0">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate('location-permission')}
            className="w-full min-h-[52px] bg-gradient-to-r from-[#FF8C42] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] active:scale-98 text-white font-black text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all border border-amber-300/40"
          >
            <span>आगे बढ़ें (लोकेशन अनुमति)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
