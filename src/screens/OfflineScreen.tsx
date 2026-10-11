/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { BrandFooter } from '../components/ChhathThemeComponents';
import { WifiOff, DownloadCloud, ArrowRight } from 'lucide-react';

/**
 * OFFLINE SCREEN (Step 21 Requirement 14)
 * 🟠 आप Offline हैं
 * "कुछ सुविधाएँ सीमित हो सकती हैं।"
 * DEO CHHATH SEVA
 */
export const OfflineScreen: React.FC = () => {
  const { navigate, isOnline } = useApp();

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="ऑफलाइन स्थिति" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 flex flex-col justify-between space-y-5">
        <div className="space-y-4 pt-2">
          {/* Main Offline Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 text-center space-y-3 shadow-sm relative overflow-hidden">
            {/* Subtle river/sunrise background */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <DeoChhathSevaLogo size={72} className="mx-auto drop-shadow-md relative z-10" />

            <div className="space-y-1 relative z-10">
              <h2 className="text-xl font-black text-amber-950">
                {isOnline ? 'इंटरनेट कनेक्शन उपलब्ध है' : 'आप अभी offline हैं'}
              </h2>
              <p className="text-sm font-bold text-amber-800">
                {isOnline
                  ? 'मैप टाइलें और ऑनलाइन सेवाएँ फिर से लोड की जा सकती हैं।'
                  : 'कुछ ऑनलाइन सेवाएँ उपलब्ध नहीं होंगी।'}
              </p>
              <p className="text-xs text-stone-600 pt-1 leading-relaxed">
                डिवाइस GPS इंटरनेट से अलग है और अनुमति मिलने पर ऑफलाइन भी स्थान दे सकता है। मैप टाइलें, रूट और लाइव सुविधा डेटा के लिए इंटरनेट आवश्यक है।
              </p>
            </div>
          </div>

          {/* Available Offline Features */}
          <div className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-500">
              ऑफलाइन स्थिति:
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200 font-bold text-stone-800">
                <span className="text-base">🗺️</span>
                <span>मैप टाइल/रूटिंग ऑफलाइन उपलब्ध नहीं; पहले सहेजे सत्यापित सुविधा-स्थान दिख सकते हैं</span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200 font-bold text-stone-800">
                <span className="text-base">📍</span>
                <span>डिवाइस GPS स्थान अनुरोध किया जा सकता है; उपलब्धता डिवाइस पर निर्भर है।</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200 font-bold text-stone-800">
                <span className="text-base">🚗</span>
                <span>पहले से सहेजी गई पार्किंग जानकारी, यदि उपलब्ध हो</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200 font-bold text-rose-900">
                <span className="text-base">🆘</span>
                <span>स्थानीय आपातकालीन संपर्क कॉन्फ़िगर नहीं है।</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="space-y-2">
            <button
              onClick={() => navigate('offline-map')}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-stone-950 font-black rounded-2xl shadow-md text-sm flex items-center justify-center gap-2 transition-all"
            >
              <DownloadCloud className="w-5 h-5" />
              <span>ऑफलाइन नक्शा प्रबंधक देखें</span>
            </button>

            <button
              onClick={() => navigate('home')}
              className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>होम स्क्रीन पर वापस जाएँ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <BrandFooter className="pt-4" />
      </main>
    </div>
  );
};
