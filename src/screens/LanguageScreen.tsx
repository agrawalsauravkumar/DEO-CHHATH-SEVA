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
      desc: 'Navigation and services in English.',
      badge: 'General',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between">
      <TopBar title="भाषा चयन / Select Language" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 sm:p-5 space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-2 shadow-xs">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className={`font-bold text-stone-900 ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
            अपनी पसंदीदा भाषा चुनें
          </h2>
          <p className="text-sm text-stone-600">
            आप इसे बाद में भी सेटिंग्स से बदल सकते हैं
          </p>
        </div>

        <div className="space-y-3">
          {languages.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-98 flex items-center justify-between ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/90 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-amber-200 hover:bg-stone-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-stone-900">{item.title}</span>
                    <span className="text-xs text-stone-500 font-medium">({item.sub})</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{item.desc}</p>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    isSelected
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'border-stone-300 bg-stone-100'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Audio helper notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
          <Volume2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>सलाह:</strong> यदि पढ़ने में कठिनाई हो, तो आप होम स्क्रीन से{' '}
            <strong>वरिष्ठ नागरिक मोड</strong> चालू कर सकते हैं जिसमें बड़े अक्षर और सरल विकल्प हैं।
          </span>
        </div>
      </main>

      <footer className="p-4 bg-white border-t border-stone-200 sticky bottom-0">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate('location-permission')}
            className="w-full min-h-[50px] bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-base rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <span>आगे बढ़ें (लोकेशन अनुमति)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
