import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import {
  Type,
  Accessibility,
  Globe,
  HardDrive,
  Volume2,
  Trash2,
  CheckCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { LanguageCode } from '../types';

export const SettingsScreen: React.FC = () => {
  const {
    seniorMode,
    toggleSeniorMode,
    fontSize,
    setFontSize,
    language,
    setLanguage,
    offlineMapDownloaded,
    deleteOfflineMap,
    navigate,
    isDeveloperSimulatedLocation,
    setDeveloperSimulatedLocation,
    isSimulatedOffline,
    setSimulatedOffline,
    currentUser,
    isAuthenticated,
  } = useApp();

  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    deleteOfflineMap();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col">
      <TopBar title="ऐप सेटिंग्स" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
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
            {[
              { code: 'hi', label: 'हिन्दी (Hindi)' },
              { code: 'bho', label: 'भोजपुरी (Bhojpuri)' },
              { code: 'mag', label: 'मगही (Magahi)' },
              { code: 'en', label: 'English' },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code as LanguageCode)}
                className={`min-h-[44px] px-3 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all ${
                  language === l.code
                    ? 'bg-amber-50 border-amber-600 text-amber-900'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>{l.label}</span>
                {language === l.code && <CheckCircle className="w-4 h-4 text-amber-700" />}
              </button>
            ))}
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
              {offlineMapDownloaded ? '24.2 MB सुरक्षित' : 'डाउनलोड नहीं'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('offline-map')}
              className="flex-1 min-h-[42px] bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl"
            >
              ऑफलाइन मैप स्क्रीन देखें
            </button>

            {offlineMapDownloaded && (
              <button
                onClick={handleClearCache}
                className="min-h-[42px] px-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>कैश हटाएं</span>
              </button>
            )}
          </div>

          {cacheCleared && (
            <p className="text-xs text-emerald-700 font-semibold">ऑफलाइन कैश साफ कर दिया गया है।</p>
          )}
        </div>

        {/* App Version Info & Hidden Developer Test Mode */}
        <div className="text-center text-xs text-stone-500 pt-3 space-y-3">
          <div className="space-y-1">
            <p className="font-bold text-stone-700">DEO CHHATH SEVA • v1.4.0 (Mela 2026)</p>
            <p className="font-bold text-amber-900">NEXTGEN DEVBHOOMI FOUNDATION</p>
            <p className="text-[11px] text-stone-400">“रास्ता भी • सहायता भी • सेवा भी”</p>
          </div>

          {/* Separated Developer / Test Mode (Discreet) */}
          <details className="text-left bg-stone-100 rounded-xl p-3 border border-stone-200">
            <summary className="text-[11px] font-bold text-stone-600 cursor-pointer select-none">
              🛠️ डेवलपर टेस्ट मोड (आंतरिक परीक्षण)
            </summary>
            <div className="mt-2 space-y-2 text-xs text-stone-600 pt-1 border-t border-stone-200">
              <p className="text-[11px]">
                सामान्य मोड में केवल <strong>वास्तविक डिवाइस GPS</strong> का उपयोग होता है। परीक्षण हेतु यहाँ देव मेला स्थान (P1 पड़ाव) सिमुलेट किया जा सकता है।
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-stone-800">
                  {isDeveloperSimulatedLocation ? 'सिमुलेशन सक्रिय' : 'वास्तविक डिवाइस GPS'}
                </span>
                <button
                  onClick={() => setDeveloperSimulatedLocation(!isDeveloperSimulatedLocation)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    isDeveloperSimulatedLocation
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                  }`}
                >
                  {isDeveloperSimulatedLocation ? 'वास्तविक GPS चालू करें' : 'सिमुलेशन चालू करें'}
                </button>
              </div>

              {/* Offline Test Simulation */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <span className="font-bold text-stone-800">
                  {isSimulatedOffline ? '⚪ Offline Mode सिमुलेशन' : '🟢 Online Mode (सामान्य)'}
                </span>
                <button
                  onClick={() => setSimulatedOffline(!isSimulatedOffline)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    isSimulatedOffline
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                  }`}
                >
                  {isSimulatedOffline ? 'Online करें' : 'Offline सिमुलेट करें'}
                </button>
              </div>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
};
