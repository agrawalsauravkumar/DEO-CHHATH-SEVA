import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LanguageCode } from '../types';
import { Check, ArrowRight, Volume2, Globe, Sparkles } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { isLanguageAvailable } from '../utils/languageSupport';
import { VoiceService } from '../services/VoiceService';

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
      desc: 'English is available on the About Us screen; other screens are currently in Hindi.',
      badge: 'General',
    },
  ];

  const [dialectNotice, setDialectNotice] = useState<string | null>(null);

  const handleDialectClick = (code: LanguageCode) => {
    if (code === 'bho') {
      const msg = 'प्रणाम! छठ माई के कृपा से देव सूर्य मंदिर में रउआ सब के बहुत-बहुत स्वागत बा। पूरा ऐप सरल हिन्दी में भी उपलब्ध बा।';
      VoiceService.speak(msg);
      setDialectNotice('भोजपुरी स्वागत: ' + msg);
    } else if (code === 'mag') {
      const msg = 'प्रणाम! भगवान भास्कर के पावन धाम देव में अपने सब के स्वागत हे। पूरा ऐप सरल हिन्दी में भी उपलब्ध हे।';
      VoiceService.speak(msg);
      setDialectNotice('मगही स्वागत: ' + msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7E5]/60 flex flex-col justify-between font-['Mukta',sans-serif]">
      <TopBar title="भाषा चयन / Select Language" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 sm:p-5 space-y-4">
        {/* Welcome Header with Chhath Sunrise Aura */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#075985] to-[#123052] text-[#FFB52E] mx-auto flex items-center justify-center mb-1 shadow-md border border-[#FFB52E]/40 text-2xl">
            ☀️
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#075985] block">
            NEXTGEN DEVBHOOMI FOUNDATION
          </span>
          <h2 className={`font-black text-stone-900 ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
            अपनी पसंदीदा भाषा चुनें
          </h2>
          <p className="text-xs text-stone-600">
            मुख्य ऐप हिन्दी और अंग्रेजी में सक्रिय है। मगही व भोजपुरी में स्थानीय अभिवादन उपलब्ध है।
          </p>
        </div>

        {dialectNotice && (
          <div className="bg-amber-100 border border-amber-300 text-amber-950 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Volume2 className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{dialectNotice}</span>
          </div>
        )}

        <div className="space-y-3">
          {languages.map((item) => {
            const isSelected = language === item.code;
            const isAvailable = isLanguageAvailable(item.code);
            return (
              <button
                key={item.code}
                onClick={() => {
                  if (isAvailable) {
                    setLanguage(item.code);
                  } else {
                    handleDialectClick(item.code);
                  }
                }}
                aria-label={isAvailable ? item.title : `${item.title}, स्थानीय बोली सुनें`}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between min-h-[68px] ${
                  isSelected
                    ? 'border-[#075985] bg-white shadow-md ring-2 ring-[#075985]/20'
                    : isAvailable
                    ? 'border-stone-200 bg-white hover:border-[#FFB52E] hover:bg-[#FFF7E5]/30 shadow-2xs active:scale-98'
                    : 'border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-stone-800 shadow-2xs cursor-pointer'
                }`}
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-stone-900">{item.title}</span>
                    <span className="text-xs text-stone-500 font-semibold">({item.sub})</span>
                    <span className="text-xs text-[#075985] font-bold">
                      · {isAvailable ? item.badge : '🔊 बोली सुनें'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{item.desc}</p>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    isSelected
                      ? 'bg-[#075985] border-[#075985] text-white shadow-xs'
                      : isAvailable
                      ? 'border-stone-300 bg-stone-100'
                      : 'border-amber-300 bg-amber-100 text-amber-800'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : !isAvailable ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Audio helper notice with warm Ivory / Cream card */}
        <div className="bg-[#FFF7E5] border-2 border-[#FFB52E]/70 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-950 shadow-2xs">
          <Volume2 className="w-4 h-4 text-[#F47B20] shrink-0 mt-0.5" />
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
            className="w-full min-h-[52px] bg-gradient-to-r from-[#F47B20] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] active:scale-98 text-white font-black text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all border border-amber-300/40"
          >
            <span>आगे बढ़ें (लोकेशन अनुमति)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
