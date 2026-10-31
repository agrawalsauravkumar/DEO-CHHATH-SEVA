import React from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import {
  Type,
  Accessibility,
  Globe,
  HardDrive,
  Volume2,
  CheckCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { isLanguageAvailable } from '../utils/languageSupport';

const languageOptions: { code: LanguageCode; label: string }[] = [
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'bho', label: 'भोजपुरी (Bhojpuri)' },
  { code: 'mag', label: 'मगही (Magahi)' },
  { code: 'en', label: 'English' },
];

export const SettingsScreen: React.FC = () => {
  const {
    seniorMode,
    toggleSeniorMode,
    fontSize,
    setFontSize,
    language,
    setLanguage,
    offlineMapDownloaded,
    navigate,
    currentUser,
    isAuthenticated,
  } = useApp();

  return (
    <div className="min-h-screen bg-[var(--chhath-cream)] pb-20 flex flex-col font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <TopBar title="ऐप सेटिंग्स" showBack />

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-4 space-y-4">
        {/* Account & Profile (Step 18) */}
        <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
                {isAuthenticated ? '👤' : '🔑'}
              </div>
              <div>
                <h4 className="text-sm font-black text-stone-900">
                  {isAuthenticated ? currentUser?.fullName : 'उपयोगकर्ता खाता (User Account)'}
                </h4>
                <p className="text-xs text-stone-500">
                  {isAuthenticated
                    ? `+91 ${currentUser?.mobileNumber} • भूमिका: ${currentUser?.role}`
                    : 'लॉगिन नहीं हैं। OTP द्वारा सुरक्षित प्रवेश करें।'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(isAuthenticated ? 'profile' : 'login')}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs transition-colors shadow-xs"
            >
              {isAuthenticated ? 'प्रोफ़ाइल देखें' : 'लॉगिन करें'}
            </button>
          </div>
        </div>

        {/* Accessibility & Font Size */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-amber-700" />
            <h3 className="text-base font-bold text-stone-900">अक्षर का आकार (Text Size)</h3>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFontSize('normal')}
              className={`min-h-[44px] rounded-xl text-xs font-bold border transition-all ${
                fontSize === 'normal'
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              सामान्य (Normal)
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`min-h-[44px] rounded-xl text-sm font-bold border transition-all ${
                fontSize === 'large'
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              बड़ा (Large)
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`min-h-[44px] rounded-xl text-base font-bold border transition-all ${
                fontSize === 'xlarge'
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              बहुत बड़ा (XL)
            </button>
          </div>
        </div>

        {/* Senior Citizen Mode Toggle */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">वरिष्ठ नागरिक एवं दिव्यांग मोड</h4>
              <p className="text-xs text-stone-500">अतिरिक्त बड़े बटन और उच्च कंट्रास्ट</p>
            </div>
          </div>

          <button
            onClick={toggleSeniorMode}
            className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
              seniorMode ? 'bg-amber-600' : 'bg-stone-300'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-md block transition-transform transform ${
                seniorMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Language Selection */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-700" />
            <h3 className="text-base font-bold text-stone-900">भाषा (Language)</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {languageOptions.map((l) => {
              const available = isLanguageAvailable(l.code);
              return (
                <button
                  key={l.code}
                  type="button"
                  disabled={!available}
                  aria-label={available ? l.label : `${l.label}, जल्द उपलब्ध`}
                  onClick={() => {
                    if (available) setLanguage(l.code);
                  }}
                  className={`min-h-[44px] px-3 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all ${
                    language === l.code
                      ? 'bg-amber-50 border-amber-600 text-amber-900'
                      : available
                        ? 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        : 'bg-stone-100 border-stone-200 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <span>{l.label}{available ? '' : ' · जल्द उपलब्ध'}</span>
                  {language === l.code && <CheckCircle className="w-4 h-4 text-amber-700" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Offline Storage Status */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-amber-700" />
              <h3 className="text-base font-bold text-stone-900">ऑफलाइन डेटा स्थिति</h3>
            </div>
            <span className="text-xs text-stone-500">
              {offlineMapDownloaded ? 'मैप पैकेज सक्रिय' : 'मैप टाइलें उपलब्ध नहीं'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('offline-map')}
              className="flex-1 min-h-[42px] bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl"
            >
              ऑफलाइन मैप स्क्रीन देखें
            </button>

          </div>
        </div>

        {/* App Version Info & Location Availability */}
        <div className="text-center text-xs text-stone-500 pt-3 space-y-3">
          <div className="space-y-1">
            <p className="font-bold text-stone-700">DEO CHHATH SEVA • v1.4.0 (Mela 2026)</p>
            <p className="font-bold text-amber-900">NEXTGEN DEVBHOOMI FOUNDATION</p>
            <p className="text-[11px] text-stone-400">“रास्ता भी • सहायता भी • सेवा भी”</p>
          </div>

          <details className="text-left bg-stone-100 rounded-xl p-3 border border-stone-200">
            <summary className="text-[11px] font-bold text-stone-600 cursor-pointer select-none">
              📍 GPS और ऑफलाइन जानकारी
            </summary>
            <div className="mt-2 space-y-2 text-xs text-stone-600 pt-1 border-t border-stone-200">
              <p className="text-[11px]">
                GPS केवल ब्राउज़र Geolocation API से डिवाइस पर अनुरोध किया जाता है। स्थान प्राप्त होना इंटरनेट स्थिति से अलग है।
              </p>
              <p className="text-[11px]">ऑफलाइन मैप टाइल पैकेज कॉन्फ़िगर नहीं है; इंटरनेट के बिना मानचित्र टाइलें नहीं दिखेंगी।</p>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
};
