import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfflineMapService } from '../services/OfflineMapService';
import {
  DownloadCloud,
  CheckCircle2,
  WifiOff,
  HardDrive,
  ArrowRight,
  Trash2,
  MapPin,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { TopBar } from '../components/TopBar';

export const OfflineMapScreen: React.FC = () => {
  const {
    navigate,
    offlineMapDownloaded,
    offlineDownloadProgress,
    isDownloadingOfflineMap,
    startOfflineDownload,
    deleteOfflineMap,
    offlinePackage,
    isSimulatedOffline,
    setSimulatedOffline,
  } = useApp();

  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleStartDownload = async () => {
    setDownloadError(null);
    try {
      await startOfflineDownload();
    } catch (err: any) {
      setDownloadError(err?.message || 'डाउनलोड पूरा नहीं हो पाया।');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col justify-between font-['Mukta',sans-serif]">
      <TopBar title="ऑफलाइन मैप" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 sm:p-5 space-y-4">
        {/* Header Title & Explanation */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center shadow-xs">
            <DownloadCloud className="w-8 h-8 text-amber-700" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            देव का ऑफलाइन मैप
          </h1>
          <p className="text-sm font-bold text-stone-700 leading-relaxed max-w-sm mx-auto">
            “इंटरनेट कमजोर होने पर भी जरूरी नक्शा और स्थानों की जानकारी देखने के लिए पहले से ऑफलाइन डेटा डाउनलोड करें।”
          </p>
        </div>

        {/* Offline Package Detail Card */}
        <div className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
          {/* Area & Size row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                मानचित्र क्षेत्र (Map Area):
              </span>
              <span className="text-sm font-black text-stone-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>देव, औरंगाबाद, बिहार</span>
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                डाउनलोड आकार (Download Size):
              </span>
              <span className="text-sm font-black text-stone-900 font-mono">
                {offlinePackage.dataSizeDisplay}
              </span>
            </div>

            <div className="flex items-center justify-between pb-1 text-xs text-stone-500">
              <span>डेटा संस्करण (Data Version):</span>
              <span className="font-semibold text-stone-700">
                v{offlinePackage.version} (छठ महापर्व 2026)
              </span>
            </div>
          </div>

          {/* Download Progress State (0%, 25%, 50%, 75%, 100%) */}
          {isDownloadingOfflineMap && (
            <div className="space-y-2 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 animate-fade-in">
              <div className="flex justify-between text-xs font-black text-amber-950">
                <span>ऑफलाइन डेटा डाउनलोड हो रहा है…</span>
                <span>{offlineDownloadProgress}%</span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-amber-200">
                <div
                  className="h-full bg-amber-600 transition-all duration-300 rounded-full"
                  style={{ width: `${offlineDownloadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-amber-800 font-semibold text-center">
                धार्मिक स्थल, पार्किंग, चिकित्सा, जल व शौचालय डेटा सहेजा जा रहा है...
              </p>
            </div>
          )}

          {/* Error Message */}
          {downloadError && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">डाउनलोड पूरा नहीं हो पाया।</span>
                <span>{downloadError}</span>
              </div>
            </div>
          )}

          {/* Downloaded Success Badge & Metadata */}
          {offlineMapDownloaded && !isDownloadingOfflineMap && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 space-y-1.5 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>✓ ऑफलाइन डेटा तैयार है</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-semibold">
                “ऑफलाइन डेटा सफलतापूर्वक तैयार है। बिना इंटरनेट भी देव का पूरा नक्शा और सुविधाएं उपलब्ध रहेंगी।”
              </p>
              {offlinePackage.downloadedAt && (
                <p className="text-[10px] text-emerald-700 font-medium">
                  डाउनलोड समय: {offlinePackage.downloadedAt}
                </p>
              )}
            </div>
          )}

          {/* What's Stored in this Package */}
          <div className="bg-stone-50 rounded-2xl p-3.5 space-y-2 text-xs text-stone-700 border border-stone-200">
            <span className="font-black text-stone-900 block">
              इस ऑफलाइन पैकेज में सुरक्षित जानकारी:
            </span>
            <ul className="space-y-1 pl-4 list-disc marker:text-amber-600 font-medium">
              <li>सूर्य मंदिर एवं गर्भगृह परिक्रमा क्षेत्र</li>
              <li>सूर्य कुंड व रुद्र कुंड के सभी प्रमुख अर्घ्य घाट</li>
              <li>सभी अधिकृत वाहन पड़ाव स्थल (P1 से P3)</li>
              <li>पेयजल बूथ, 108 एम्बुलेंस कैंप, शौचालय व सहायता केंद्र</li>
              <li>महत्वपूर्ण पैदल संपर्क मार्ग एवं लैंडमार्क</li>
            </ul>
            <p className="text-[10px] text-stone-500 pt-1 border-t border-stone-200">
              नोट: इस पैकेज में कोई भी व्यक्तिगत डेटा संकलित नहीं किया जाता है।
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="space-y-2 pt-1">
            {!offlineMapDownloaded ? (
              <button
                onClick={handleStartDownload}
                disabled={isDownloadingOfflineMap}
                className="w-full min-h-[52px] bg-amber-600 hover:bg-amber-700 active:scale-98 disabled:opacity-70 text-white font-black text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <DownloadCloud className="w-5 h-5 fill-white" />
                <span>
                  {isDownloadingOfflineMap
                    ? `डाउनलोड हो रहा है (${offlineDownloadProgress}%)`
                    : '⬇️ ऑफलाइन मैप डाउनलोड करें'}
                </span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {/* 🔄 अपडेट करें */}
                <button
                  onClick={handleStartDownload}
                  disabled={isDownloadingOfflineMap}
                  className="min-h-[48px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 text-amber-800" />
                  <span>🔄 अपडेट करें</span>
                </button>

                {/* 🗑️ ऑफलाइन डेटा हटाएँ */}
                <button
                  onClick={deleteOfflineMap}
                  className="min-h-[48px] bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <Trash2 className="w-4 h-4 text-rose-700" />
                  <span>🗑️ ऑफलाइन डेटा हटाएँ</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Developer Offline Testing Mode (Discreet) */}
        <div className="bg-stone-100 rounded-2xl p-3.5 border border-stone-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-black text-stone-800 flex items-center gap-1.5">
              <span>🛠️ ऑफलाइन मोड परीक्षण (Test Mode)</span>
            </span>
            <button
              onClick={() => setSimulatedOffline(!isSimulatedOffline)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                isSimulatedOffline
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
              }`}
            >
              {isSimulatedOffline ? 'Offline Mode चालू है' : 'Offline सिमुलेट करें'}
            </button>
          </div>
          <p className="text-[11px] text-stone-500">
            इस बटन से आप बिना इंटरनेट कनेक्शन बंद किए ऐप के ऑफलाइन व्यवहार का परीक्षण कर सकते हैं।
          </p>
        </div>

        {/* Return to Map or Home */}
        <button
          onClick={() => navigate('map')}
          className="w-full min-h-[48px] bg-stone-900 hover:bg-stone-800 text-white font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>नक्शे पर जाएं</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </main>
    </div>
  );
};
