import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Shield, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';
import { TopBar } from '../components/TopBar';

export const LocationScreen: React.FC = () => {
  const { navigate, requestDeviceLocation } = useApp();
  const [requesting, setRequesting] = useState<boolean>(false);

  const handleGrant = async () => {
    setRequesting(true);
    await requestDeviceLocation();
    setRequesting(false);
    navigate('home');
  };

  const handleSkip = () => {
    navigate('home');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between">
      <TopBar title="लोकेशन अनुमति" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 sm:p-5 flex flex-col justify-center space-y-6">
        <div className="text-center space-y-3">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#FFB52E]/30 animate-ping" />
            <div className="w-16 h-16 rounded-2xl bg-[#075985] text-[#FFB52E] border-2 border-[#FFB52E]/50 flex items-center justify-center shadow-lg relative">
              <MapPin className="w-8 h-8" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            देव मेला में सही रास्ता पाने हेतु
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
            आपके फोन की लोकेशन से हम आपको देव सूर्य मंदिर, सबसे नजदीकी अर्घ्य घाट और पार्किंग तक ले जाएंगे।
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">सटीक दिशा-निर्देश</h4>
              <p className="text-xs text-stone-600">
                भीड़ में भटकने से बचें, सीधा सूर्य कुंड और मंदिर मार्ग देखें।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">नजदीकी सुविधाएं</h4>
              <p className="text-xs text-stone-600">
                सबसे पास का पानी काउंटर, शौचालय और प्राथमिक चिकित्सा केंद्र तुरंत खोजें।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">परिवार सुरक्षा</h4>
              <p className="text-xs text-stone-600">
                बिछड़ने की स्थिति में परिवार और सहायता केंद्र से संपर्क सरल होगा।
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="text-center text-xs text-stone-500 flex items-center justify-center gap-1.5">
          <Shield className="w-4 h-4 text-stone-400" />
          <span>आपकी गोपनीयता सुरक्षित है। यह केवल जनसेवा हेतु है।</span>
        </div>
      </main>

      <footer className="p-4 bg-white border-t border-stone-200 space-y-2 sticky bottom-0">
        <div className="max-w-lg mx-auto space-y-2">
          <button
            onClick={handleGrant}
            disabled={requesting}
            className="w-full min-h-[52px] bg-gradient-to-r from-[#F47B20] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] active:scale-98 text-white font-black text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all border border-amber-300/40"
          >
            <MapPin className="w-5 h-5" />
            <span>{requesting ? 'अनुमति जांची जा रही है...' : 'लोकेशन अनुमति दें (Allow)'}</span>
          </button>

          <button
            onClick={handleSkip}
            className="w-full min-h-[44px] text-stone-600 hover:text-stone-900 font-semibold text-sm rounded-xl py-2 transition-colors"
          >
            बाद में पूछें (बिना जीपीएस आगे बढ़ें)
          </button>
        </div>
      </footer>
    </div>
  );
};
