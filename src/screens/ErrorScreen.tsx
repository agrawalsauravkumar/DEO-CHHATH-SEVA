/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { BrandFooter } from '../components/ChhathThemeComponents';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';

/**
 * BRANDED ERROR RECOVERY SCREEN (Step 21 Requirement 15)
 * "कुछ समस्या हुई है।"
 * DEO CHHATH SEVA
 * "कृपया दोबारा प्रयास करें।"
 * Buttons: "फिर से प्रयास करें", "होम पर जाएँ"
 */
export const ErrorScreen: React.FC<{
  errorMessage?: string;
  onRetry?: () => void;
}> = ({
  errorMessage = 'सर्वर या नेटवर्क से संपर्क करने में समस्या हुई।',
  onRetry,
}) => {
  const { navigate } = useApp();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="त्रुटि सुधार" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 flex flex-col items-center justify-center text-center space-y-5">
        <DeoChhathSevaLogo size={80} className="drop-shadow-md" />

        <div className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-amber-800">
            DEO CHHATH SEVA
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            कुछ समस्या हो गई
          </h2>
          <p className="text-sm font-bold text-stone-600">
            कृपया दोबारा प्रयास करें या मुख्य पृष्ठ पर वापस जाएँ।
          </p>
          <p className="text-xs text-stone-500 max-w-xs pt-1 leading-relaxed">
            {errorMessage}
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2.5 pt-2">
          <button
            onClick={handleRetry}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-stone-950 font-black rounded-2xl shadow-md text-sm flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>🔄 फिर से कोशिश करें</span>
          </button>

          <button
            onClick={() => navigate('home')}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>🏠 Home पर जाएँ</span>
          </button>
        </div>

        <BrandFooter className="pt-8" />
      </main>
    </div>
  );
};
