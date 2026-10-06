/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const STORAGE_KEY_DISMISSED = 'deo_install_prompt_dismissed';

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check if previously dismissed by user (respect user choice per Requirement 16)
    if (localStorage.getItem(STORAGE_KEY_DISMISSED) === 'true') {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY_DISMISSED, 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-[#0F2642] to-[#16365C] text-white p-3 rounded-2xl shadow-lg border-2 border-amber-400/60 flex items-center justify-between gap-3 font-['Mukta',sans-serif] animate-fade-in my-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shrink-0">
          📱
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-amber-300 leading-tight">
            DEO CHHATH SEVA को फोन में Install करें
          </p>
          <p className="text-[11px] text-stone-300 leading-tight truncate">
            बिना इंटरनेट भी ज़रूरी जानकारी तुरंत खोलें
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install करें</span>
        </button>

        <button
          onClick={handleDismiss}
          className="p-1.5 text-stone-400 hover:text-white rounded-lg"
          title="बंद करें"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
