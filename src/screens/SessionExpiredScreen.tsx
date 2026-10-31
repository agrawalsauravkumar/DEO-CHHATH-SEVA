/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { Clock, ShieldAlert, ArrowRight, Home, RefreshCw } from 'lucide-react';

export const SessionExpiredScreen: React.FC = () => {
  const { navigate, logoutUser } = useApp();

  const handleReLogin = () => {
    logoutUser();
    navigate('login');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <TopBar title="सत्र समाप्त (Session Expired)" />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 flex flex-col items-center justify-center text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center text-4xl shadow-md border-2 border-amber-300">
          ⏳
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-stone-900">
            सुरक्षा सत्र समाप्त हो गया है
          </h2>
          <p className="text-sm font-bold text-amber-800">
            आपकी सुरक्षा हेतु निष्क्रिय सत्र स्वतः समाप्त कर दिया गया है।
          </p>
          <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
            कृपया अपने मोबाइल नंबर और नए OTP के माध्यम से पुनः लॉगिन करें।
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2 pt-2">
          <button
            onClick={handleReLogin}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-2xl shadow-md text-base flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>पुनः लॉगिन करें</span>
          </button>

          <button
            onClick={() => navigate('home')}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>होम स्क्रीन पर वापस जाएं</span>
          </button>
        </div>
      </main>
    </div>
  );
};
