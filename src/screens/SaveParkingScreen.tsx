import React from 'react';
import { useApp } from '../context/AppContext';
import { DataFreshnessNotice } from '../components/DataFreshnessNotice';
import { TopBar } from '../components/TopBar';
import { ArrowRight, MapPin } from 'lucide-react';

export const SaveParkingScreen: React.FC = () => {
  const { savedParking, navigate } = useApp();

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="मेरी पार्किंग" showBack />
      <DataFreshnessNotice />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {savedParking ? (
          <section className="rounded-2xl border border-[#075985]/25 bg-white p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#075985]" aria-hidden />
              <div className="min-w-0">
                <h2 className="font-black text-stone-900">{savedParking.parkingName}</h2>
                <p className="mt-1 text-sm text-stone-700">
                  {savedParking.note || 'आपकी सहेजी गई पार्किंग जगह'}
                </p>
                <p className="mt-2 text-xs text-stone-500">
                  सहेजा गया: {savedParking.savedAt}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('my-parking')}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#075985] px-4 font-bold text-white"
            >
              सहेजी जगह देखें
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </section>
        ) : (
          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
            <h2 className="font-black">कोई पार्किंग जगह सहेजी नहीं गई है</h2>
            <p className="mt-1 text-sm">
              केवल सत्यापित पार्किंग स्थल उपलब्ध होने पर ही उन्हें चुनकर सहेजें। इस स्क्रीन पर कोई अनुमानित या डेमो स्थल नहीं दिखाया जाता।
            </p>
          </section>
        )}

        <button
          type="button"
          onClick={() => navigate('parking')}
          className="min-h-12 w-full rounded-xl bg-[#075985] px-4 font-bold text-white"
        >
          सत्यापित पार्किंग जानकारी देखें
        </button>
      </main>
    </div>
  );
};
