/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import {
  MapPin,
  WifiOff,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Compass,
  Layers,
} from 'lucide-react';
import { OfflineMapService, OfflinePackageMetadata } from '../services/OfflineMapService';

export const OfflineMapScreen: React.FC = () => {
  const { navigate, isOnline } = useApp();
  const [meta, setMeta] = useState<OfflinePackageMetadata>(OfflineMapService.getOfflineDataStatus());
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshStatus = () => {
    setMeta(OfflineMapService.getOfflineDataStatus());
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadError(null);
    setSuccessMessage(null);

    const result = await OfflineMapService.downloadOfflineData((percent) => {
      setDownloadProgress(percent);
    });

    setIsDownloading(false);
    if (result.success) {
      setSuccessMessage('देव क्षेत्र का ऑफलाइन मैप सफलतापूर्वक डाउनलोड हुआ। बिना इंटरनेट के भी सभी घाट व सुविधाएं उपलब्ध रहेंगी।');
      refreshStatus();
    } else {
      setDownloadError(result.error || 'डाउनलोड विफल हुआ।');
    }
  };

  const handleDelete = () => {
    if (window.confirm('क्या आप डाउनलोड किया गया देव ऑफलाइन मैप डेटा हटाना चाहते हैं?')) {
      OfflineMapService.deleteOfflineData();
      setSuccessMessage('ऑफलाइन मैप डेटा हटा दिया गया है।');
      setDownloadError(null);
      refreshStatus();
    }
  };

  const isReady = meta.status === 'ready';

  return (
    <div className="min-h-screen bg-[var(--chhath-cream)] pb-20 font-['Mukta',sans-serif]">
      <TopBar title="ऑफलाइन मैप (Offline Map)" showBack />

      <main className="mx-auto flex max-w-3xl sm:max-w-4xl flex-col gap-4 p-4 sm:p-5">
        {/* Main Status Hero Card */}
        <section className="rounded-3xl border border-stone-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#FFF7E5] text-[#075985]">
            {isReady ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : !isOnline ? (
              <WifiOff className="h-8 w-8 text-amber-600" />
            ) : (
              <Layers className="h-8 w-8 text-[#075985]" />
            )}
          </div>

          <h1 className="mt-3 text-xl font-black text-[#063B5C]">
            {isReady
              ? 'देव क्षेत्र का ऑफलाइन मैप सक्रिय है'
              : 'देव क्षेत्र का ऑफलाइन मैप डाउनलोड करें'}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            {isReady
              ? 'देव सूर्य मंदिर, सूर्य कुंड, रुद्र कुंड, पार्किंग व आपातकालीन केंद्र बिना इंटरनेट के भी मैप में उपलब्ध हैं।'
              : 'मेला क्षेत्र में नेटवर्क कंजेशन या इंटरनेट न होने पर भी रास्ता देखने हेतु ऑफलाइन पैकेज डाउनलोड करें।'}
          </p>

          {/* Details Pill */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-stone-50 p-3 text-left text-xs text-stone-700 border border-stone-100">
            <div>
              <span className="font-bold text-stone-500">कवर क्षेत्र:</span>
              <p className="font-black text-[#063B5C]">{meta.area}</p>
            </div>
            <div>
              <span className="font-bold text-stone-500">पैकेज आकार:</span>
              <p className="font-black text-[#063B5C]">{meta.dataSizeDisplay}</p>
            </div>
            <div>
              <span className="font-bold text-stone-500">सत्यापित स्थल:</span>
              <p className="font-black text-[#063B5C]">{meta.poiCount} स्थान (Ghats & Facilities)</p>
            </div>
            <div>
              <span className="font-bold text-stone-500">पैदल कॉरिडोर:</span>
              <p className="font-black text-[#063B5C]">{meta.routeCount} मुख्य मार्ग</p>
            </div>
            {meta.downloadedAt && (
              <div className="col-span-2 border-t border-stone-200/60 pt-2 text-stone-500">
                अंतिम डाउनलोड: <strong className="text-stone-800">{new Date(meta.downloadedAt).toLocaleString('hi-IN')}</strong>
              </div>
            )}
          </div>
        </section>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="rounded-2xl border border-green-300 bg-green-50 p-4 text-sm font-bold text-green-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-700" />
            <span>{successMessage}</span>
          </div>
        )}

        {downloadError && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-700" />
            <span>{downloadError}</span>
          </div>
        )}

        {/* Downloading Progress Bar */}
        {isDownloading && (
          <div className="rounded-2xl border border-sky-300 bg-sky-50 p-4 space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#075985]">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                ऑफलाइन मैप डाउनलोड हो रहा है…
              </span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-sky-200">
              <div
                className="h-full bg-[#075985] transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {!isReady ? (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="min-h-[50px] w-full rounded-2xl bg-[#075985] px-4 font-black text-white shadow-md hover:bg-[#063B5C] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>डाउनलोड जारी है…</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>देव ऑफलाइन मैप डाउनलोड करें (3.8 MB)</span>
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('map')}
                className="min-h-[50px] w-full rounded-2xl bg-[#075985] px-4 font-black text-white shadow-md hover:bg-[#063B5C] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Compass className="h-5 w-5" />
                <span>मानचित्र खोलें (View Map)</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="min-h-[44px] flex-1 rounded-xl border border-[#075985]/30 bg-white px-3 text-xs font-bold text-[#075985] hover:bg-stone-50 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>डेटा अपडेट करें</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="min-h-[44px] flex-1 rounded-xl border border-rose-300 bg-white px-3 text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>ऑफलाइन डेटा हटाएं</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* GPS Independent Guidance */}
        <section className="rounded-2xl border border-[#075985]/20 bg-[#FFF7E5] p-4 text-sm text-[#063B5C] space-y-1">
          <h2 className="font-black flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>GPS बिना इंटरनेट के भी काम करता है</span>
          </h2>
          <p className="text-xs text-stone-700 leading-relaxed">
            आपके स्मार्टफोन का इन-बिल्ट GPS सैटेलाइट से जुड़ता है। इंटरनेट बंद रहने पर भी मैप में “मेरा स्थान” बटन दबाने पर आपकी वर्तमान लोकेशन प्रदर्शित होगी।
          </p>
        </section>

        {/* Routing Distiction Note */}
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-1">
          <h2 className="font-black flex items-center gap-1.5 text-amber-900 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>लाइव रूटिंग एवं ऑफलाइन व्यू में अंतर</span>
          </h2>
          <p className="leading-relaxed text-stone-700">
            टर्न-बाय-टर्न लाइव सड़क नेविगेशन की गणना सर्वर रूट इंजन (Valhalla/OSRM) से होती है, जिसके लिए इंटरनेट आवश्यक है। ऑफलाइन मैप में देव के सभी मुख्य पक्के पैदल कॉरिडोर और घाट स्थल बिना इंटरनेट के भी देखे जा सकते हैं।
          </p>
        </section>

        <p className="text-center text-[11px] text-stone-500">
          मानचित्र डेटा: &copy; OpenStreetMap contributors | NextGen DevBhoomi Foundation
        </p>
      </main>
    </div>
  );
};
