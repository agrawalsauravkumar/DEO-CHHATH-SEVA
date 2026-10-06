import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEO_LOCATIONS } from '../data/deoData';
import {
  Navigation,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Sun,
  MapPin,
  Heart,
  Droplets,
} from 'lucide-react';

export const DeoSuryaMandirHero: React.FC = () => {
  const { navigate, setSelectedMapItem, startNavigation } = useApp();
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  const templeLocation = DEO_LOCATIONS[0]; // Deo Surya Mandir

  const handleNavigateToTemple = () => {
    setSelectedMapItem(templeLocation);
    navigate('navigation-preview');
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2642] via-[#16365C] to-[#0A1A2E] text-white p-5 border-2 border-amber-500/40 shadow-xl">
        {/* Decorative Golden Aura Glow & Sunburst */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Tag & Sacred Shloka */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wide">
              <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-spin-slow" />
              <span>विश्वप्रसिद्ध पश्चिमाभिमुख महातीर्थ</span>
            </div>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-xs font-bold text-amber-300/90 hover:text-white flex items-center gap-1 underline underline-offset-2 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>इतिहास व महत्व</span>
            </button>
          </div>

          {/* Central Temple Visual & Title Row */}
          <div className="flex items-center gap-4">
            {/* Visual Temple Icon Monolith */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-amber-600/30 to-orange-950/60 border-2 border-amber-400/50 p-1.5 flex flex-col items-center justify-center shrink-0 shadow-lg relative overflow-hidden group">
              {/* Mini SVG representation of Deo Temple Shikhara */}
              <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow">
                <defs>
                  <linearGradient id="shikharaGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="40%" stopColor="#EA580C" />
                    <stop offset="100%" stopColor="#9A3412" />
                  </linearGradient>
                </defs>
                {/* Sun Disk in background */}
                <circle cx="32" cy="18" r="14" fill="#FDE047" opacity="0.35" />
                {/* Temple Base */}
                <rect x="10" y="44" width="44" height="16" rx="2" fill="#7C2D12" />
                <rect x="14" y="48" width="36" height="4" fill="#C2410C" />
                {/* Sanctum Door */}
                <rect x="25" y="46" width="14" height="14" rx="2" fill="#1C0A04" />
                <circle cx="32" cy="50" r="2" fill="#FBBF24" />
                {/* Towering Curvilinear Shikhara */}
                <path d="M 18,44 C 18,28 24,12 32,4 C 40,12 46,28 46,44 Z" fill="url(#shikharaGrad)" stroke="#431407" strokeWidth="1" />
                <line x1="32" y1="4" x2="32" y2="44" stroke="#7C2D12" strokeWidth="1" opacity="0.6" />
                <path d="M 21,34 Q 32,31 43,34" stroke="#FEF08A" strokeWidth="1" fill="none" />
                <path d="M 24,24 Q 32,22 40,24" stroke="#FEF08A" strokeWidth="1" fill="none" />
                <path d="M 27,15 Q 32,13 37,15" stroke="#FEF08A" strokeWidth="1" fill="none" />
                {/* Kalash & Saffron Flag */}
                <ellipse cx="32" cy="4" rx="4" ry="2" fill="#FBBF24" />
                <polygon points="32,2 42,4 32,6" fill="#F97316" />
              </svg>
            </div>

            <div className="space-y-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                देव सूर्य मंदिर
              </h2>
              <p className="text-xs text-amber-200/90 font-medium line-clamp-2">
                तपस्वी राजा ईल व भगवान विश्वकर्मा द्वारा निर्मित त्रेतायुगीन पाषाण सूर्य मंदिर।
              </p>
              <div className="flex items-center gap-2 text-[11px] text-amber-300/80 font-bold pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  देव, औरंगाबाद (बिहार)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-sky-400" />
                  सूर्य कुंड तट
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Grid: Darshan & Arghya Timing */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-xs">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-amber-300 font-bold uppercase block">दर्शन समय (Mela)</span>
              <span className="font-black text-white block">24x7 निरंतर खुला</span>
              <span className="text-[10px] text-stone-300">गर्भगृह कतारबद्ध प्रवेश</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-amber-300 font-bold uppercase block">छठ महापर्व अर्घ्य</span>
              <span className="font-black text-amber-200 block">सायं 05:12 • प्रातः 06:04</span>
              <span className="text-[10px] text-stone-300">सूर्य कुंड एवं रुद्र कुंड घाट</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-1">
            <button
              onClick={handleNavigateToTemple}
              className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all border border-amber-300/40"
            >
              <Navigation className="w-4 h-4 fill-white" />
              <span>मंदिर का सीधा रास्ता दिखाएँ (Navigate)</span>
            </button>
          </div>
        </div>
      </div>

      {/* History and Significance Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-stone-900 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">☀️</span>
                <h3 className="text-lg font-black text-stone-900">
                  देव सूर्य मंदिर का इतिहास व महिमा
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-stone-700">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                <span className="font-black text-amber-950 block text-sm mb-1">
                  1. पश्चिमाभिमुख अद्वितीय वास्तुकला
                </span>
                <p>
                  संसार के प्रायः सभी सूर्य मंदिर पूर्वाभिमुख होते हैं, परंतु देव का यह सूर्य मंदिर दुर्लभ <strong>पश्चिमाभिमुख</strong> (पश्चिम की ओर मुख) है। मान्यता है कि मुगल आक्रांताओं के काल में भगवान भास्कर ने रात भर में मंदिर के मुख्य द्वार की दिशा पूर्व से पश्चिम घुमा दी थी।
                </p>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <span className="font-black text-stone-900 block text-sm mb-1">
                  2. 100 फीट ऊँचा अखंड पाषाण शिखर
                </span>
                <p>
                  यह मंदिर नागर एवं कलिंग शैली के मिश्रण से निर्मित है। पत्थरों को बिना किसी चूने-सीमेंट के केवल खाँचों व सोने के कीलों द्वारा आपस में जोड़कर भव्य 100 फीट ऊँचा शिखर गढ़ा गया है।
                </p>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <span className="font-black text-stone-900 block text-sm mb-1">
                  3. पवित्र सूर्य कुंड व रुद्र कुंड
                </span>
                <p>
                  मंदिर के ठीक सामने स्थित पवित्र <strong>सूर्य कुंड</strong> में स्नान करने से राजा ईल का कुष्ठ रोग दूर हुआ था। छठ महापर्व के अवसर पर लाखों व्रती इसी कुंड में खड़े होकर अस्ताचलगामी और उदीयमान भगवान भास्कर को अर्घ्य समर्पित करते हैं।
                </p>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <span className="font-black text-stone-900 block text-sm mb-1">
                  4. NextGen Devbhoomi Foundation का संकल्प
                </span>
                <p>
                  तीर्थयात्रियों की सुविधा, स्वच्छता, सुगम दर्शन मार्ग, बुजुर्गों हेतु ई-रिक्शा, शीतल पेयजल एवं सुरक्षित परिक्रमा व्यवस्था हेतु फाउंडेशन निरंतर सेवारत है।
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  handleNavigateToTemple();
                }}
                className="w-full min-h-[46px] bg-[#0F2642] hover:bg-[#16365C] text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-4 h-4 fill-white" />
                <span>मंदिर हेतु रास्ता प्रारंभ करें</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
