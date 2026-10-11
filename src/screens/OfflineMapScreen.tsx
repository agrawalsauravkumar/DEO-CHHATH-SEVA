import React from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { MapPin, WifiOff } from 'lucide-react';
import { OfflineMapService } from '../services/OfflineMapService';

export const OfflineMapScreen: React.FC = () => {
  const { navigate, deleteOfflineMap, isOnline } = useApp();

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <TopBar title="ऑफलाइन मैप" showBack />
      <main className="mx-auto flex max-w-lg flex-col gap-4 p-4 sm:p-5">
        <section className="rounded-3xl border border-stone-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#FFF8E1] text-[#0B5E8E]">
            {!isOnline ? <WifiOff className="h-8 w-8" /> : <MapPin className="h-8 w-8" />}
          </div>
          <h1 className="mt-3 text-xl font-black text-[#063B5C]">{OfflineMapService.getStatusMessage()}</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            ऑफलाइन मैप टाइल और सड़क-रूटिंग पैकेज उपलब्ध नहीं है। ऑनलाइन मानचित्र OpenStreetMap से लोड होता है; पहले से सहेजे सत्यापित सुविधा-स्थान ऑफलाइन दिख सकते हैं।
          </p>
        </section>

        <section className="rounded-2xl border border-[#0B5E8E]/20 bg-[#FFF8E1] p-4 text-sm text-[#063B5C]">
          <h2 className="font-black">GPS अलग से काम करता है</h2>
          <p className="mt-1">
            इंटरनेट बंद होने पर भी डिवाइस GPS स्थान अनुरोध किया जा सकता है। GPS स्थिति देखने के लिए मानचित्र खोलें और “मेरा स्थान” दबाएँ।
          </p>
        </section>

        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <h2 className="font-black">ऑफलाइन रूटिंग अभी उपलब्ध नहीं है</h2>
          <p className="mt-1">
            कोई ऑफलाइन रूट इंजन या वास्तविक मार्ग डेटा इंस्टॉल नहीं है। ऑनलाइन मार्ग सेवा को इंटरनेट चाहिए।
          </p>
        </section>

        <button
          onClick={() => navigate('map')}
          className="min-h-[48px] rounded-xl bg-[#0B5E8E] px-4 font-bold text-white"
        >
          मानचित्र खोलें
        </button>
        <button
          onClick={deleteOfflineMap}
          className="min-h-[44px] rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-700"
        >
          पुराने डेमो मैप डेटा हटाएँ
        </button>
        <p className="text-center text-xs text-stone-500">
          यह केवल पुराने मैप डेमो कैश हटाता है; सहेजी गई पार्किंग और अन्य उपयोगकर्ता डेटा सुरक्षित रहता है।
        </p>
      </main>
    </div>
  );
};
