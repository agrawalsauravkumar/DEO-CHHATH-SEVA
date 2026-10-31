/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  Music,
  Sun,
  Sparkles,
  Share2,
  Check,
  ChevronRight,
} from 'lucide-react';
import { ChhathSongPlayer } from '../components/ChhathSongPlayer';

export const ChhathKathaScreen: React.FC = () => {
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'KATHA' | 'GEET' | 'MANTRA' | 'AARTI'>('KATHA');
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copiedMantra, setCopiedMantra] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const chimeIntervalRef = useRef<number | null>(null);

  // Synthesize soft temple bell & meditative Om resonance (100% offline, zero internet required)
  const startOfflineChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const playBellTone = () => {
        if (!audioContextRef.current) return;
        const now = audioContextRef.current.currentTime;
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();

        // Sacred 432Hz Om / Temple bell fundamental harmonic
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, now);
        osc.frequency.exponentialRampToValueAtTime(864, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(432, now + 1.2);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);

        osc.start(now);
        osc.stop(now + 3.2);
      };

      playBellTone();
      chimeIntervalRef.current = window.setInterval(playBellTone, 3800);
      setIsPlayingAudio(true);
    } catch (err) {
      console.warn('Audio synthesis unavailable:', err);
    }
  };

  const stopOfflineChime = () => {
    if (chimeIntervalRef.current) {
      clearInterval(chimeIntervalRef.current);
      chimeIntervalRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    return () => {
      stopOfflineChime();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  const handleCopyMantra = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedMantra(true);
    setTimeout(() => setCopiedMantra(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 pb-24 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="छठ व्रत कथा, गीत व मंत्र" showBack />

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-5">
        {/* Divine Hero Card */}
        <div className="bg-gradient-to-br from-[#075985] via-[#063B5C] to-[#041E2F] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden border border-[#FFB52E]/50">
          <div className="pointer-events-none absolute -right-6 -bottom-6 w-36 h-36 bg-[#F47B20]/25 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB52E] bg-[#FFB52E]/20 border border-[#FFB52E]/40 px-2.5 py-0.5 rounded-full inline-block">
                छठ महापर्व आध्यात्मिक संग्रह
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                संपूर्ण व्रत कथा व पावन भक्ति
              </h2>
              <p className="text-xs text-[#FFF7E5]/90">
                भगवान भास्कर एवं षष्ठी माता की महिमा, पारंपरिक लोकगीत व आरती
              </p>
            </div>

            {/* Offline Audio Chime Control Button */}
            <button
              onClick={isPlayingAudio ? stopOfflineChime : startOfflineChime}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-all active:scale-95 shadow-md ${
                isPlayingAudio
                  ? 'bg-[#F47B20] text-white border-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-[#FFB52E] border-[#FFB52E]/40'
              }`}
              title={isPlayingAudio ? 'धुन बंद करें' : 'मंदिर की पावन धुन बजाएं'}
            >
              {isPlayingAudio ? <Volume2 className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span className="text-[9px] font-black mt-1">
                {isPlayingAudio ? 'धुन बज रही' : 'मंदिर धुन'}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (4 Pillars) */}
        <div className="grid grid-cols-4 gap-1.5 bg-[#111A35] p-1.5 rounded-2xl text-[11px] font-black border border-amber-500/30">
          <button
            onClick={() => setActiveTab('KATHA')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'KATHA'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            📖 व्रत कथा
          </button>
          <button
            onClick={() => setActiveTab('GEET')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'GEET'
                ? 'bg-[#075985] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            🎵 छठ गीत
          </button>
          <button
            onClick={() => setActiveTab('MANTRA')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'MANTRA'
                ? 'bg-[#075985] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            🕉️ मन्त्र
          </button>
          <button
            onClick={() => setActiveTab('AARTI')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'AARTI'
                ? 'bg-[#075985] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            🙏 आरती
          </button>
        </div>

        {/* TAB 1: SACRED CHHATH VRATA KATHA */}
        {activeTab === 'KATHA' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-4 text-stone-800 animate-fade-in">
            <div className="border-b border-amber-100 pb-3">
              <span className="text-[11px] font-black text-[#F47B20] uppercase tracking-wider block">
                पौराणिक संदर्भ • ब्रह्मवैवर्त पुराण
              </span>
              <h3 className="text-lg font-black text-[#075985]">
                छठ महापर्व की प्रामाणिक व्रत कथा
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                राजा प्रियंवद एवं षष्ठी देवी (छठी मइया) का दिव्य प्राकट्य
              </p>
            </div>

            {/* Real Chhath Arghya Photo */}
            <div className="relative h-48 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-sm">
              <img
                src="/images/chhath/sandhya-arghya.jpg"
                alt="छठ महापर्व सांध्य अर्घ्य"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3.5">
                <span className="text-white text-xs sm:text-sm font-black drop-shadow-md">
                  🌅 सूर्य कुंड एवं पावन घाटों पर अस्ताचलगामी व उदयगामी भगवान भास्कर को अर्घ्य
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-stone-700">
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60 text-amber-950">
                <span className="font-black block text-sm mb-1">👑 १. राजा प्रियंवद की संतान कामना:</span>
                पौराणिक काल में राजा प्रियंवद और उनकी पत्नी मालिनी के कोई संतान नहीं थी। संतान प्राप्ति के लिए महर्षि कश्यप ने पुत्रकामेष्टि यज्ञ संपन्न कराया और महारानी मालिनी को आहुति की खीर दी।
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-stone-800">
                <span className="font-black block text-sm mb-1 text-stone-900">⚡ २. मृत शिशु का जन्म व वैराग्य:</span>
                यज्ञ के प्रभाव से रानी ने एक सुंदर पुत्र को जन्म दिया, किंतु वह बालक मृत उत्पन्न हुआ। राजा प्रियंवद अगाध शोक में डूब गए और श्मशान में अपने प्राण त्यागने को उद्यत हुए।
              </div>

              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200/80 text-sky-950">
                <span className="font-black block text-sm mb-1 text-[#075985]">✨ ३. देवसेना (षष्ठी देवी) का दिव्य प्राकट्य:</span>
                उसी क्षण आकाश में एक अलौकिक ज्योतिर्मय विमान उतरा, जिस पर भगवान ब्रह्मा की मानस पुत्री <strong>देवी षष्ठी (छठी मइया)</strong> विराजमान थीं। देवी ने कहा:
                <blockquote className="my-2 p-2.5 bg-white/80 rounded-xl border-l-4 border-[#075985] italic font-semibold text-stone-800">
                  “हे राजन! मैं मूल प्रकृति के छठे अंश से उत्पन्न हुई हूँ, इसलिए मेरा नाम ‘षष्ठी’ है। मैं समस्त जगत के शिशुओं की रक्षिका और निःसंतानों को संतान व आरोग्य प्रदान करने वाली हूँ। तुम मेरी आराधना करो और प्रजा में मेरा प्रचार करो।”
                </blockquote>
                देवी ने अपने दिव्य स्पर्श से बालक को जीवित कर दिया।
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950">
                <span className="font-black block text-sm mb-1 text-[#2E7D32]">☀️ ४. कार्तिक शुक्ल षष्ठी का प्रथम महाव्रत:</span>
                राजा प्रियंवद ने कार्तिक शुक्ल षष्ठी के दिन संपूर्ण विधि-विधान से देवी षष्ठी एवं प्रत्यक्ष देवता भगवान सूर्य का पूजन किया। तभी से संतान की दीर्घायु, पारिवारिक सुख-समृद्धि एवं आरोग्य के लिए यह महापर्व निरंतर मनाया जाने लगा।
              </div>
            </div>

            {/* Arghya Significance Banner */}
            <div className="bg-[#FFF7E5] border border-[#FFB52E]/60 p-4 rounded-2xl text-xs space-y-1.5 text-stone-900">
              <span className="font-black text-[#075985] flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-[#F47B20]" />
                छठ पूजा की अद्वितीय विशेषता:
              </span>
              <p className="leading-relaxed">
                संसार में केवल छठ पर्व ही ऐसा पावन अनुष्ठान है जहाँ अस्ताचलगामी (डूबते हुए) सूर्य को पहले नमन किया जाता है और तत्पश्चात उदीयमान (उगते हुए) सूर्य को अर्घ्य दिया जाता है। यह प्रकृति के समभाव का प्रतीक है।
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: FOLK SONGS (GEET) WITH LIVE AUDIO & MELODY PLAYER */}
        {activeTab === 'GEET' && (
          <div className="animate-fade-in">
            <ChhathSongPlayer
              currentTrackIndex={selectedTrackIndex}
              onSelectTrack={setSelectedTrackIndex}
            />
          </div>
        )}

        {/* TAB 3: MANTRAS & 12 ADITYA NAMES */}
        {activeTab === 'MANTRA' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4 animate-fade-in">
            <div className="border-b border-stone-100 pb-2">
              <h3 className="text-base font-black text-[#075985]">
                वैदिक सूर्य अर्घ्य मन्त्र व गायत्री
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                अर्घ्य अर्पण एवं सूर्य नमस्कार के समय उच्चारणीय पावन मन्त्र
              </p>
            </div>

            {/* Main Arghya Mantra */}
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full inline-block">
                मुख्य अर्घ्य अर्पण मन्त्र
              </span>
              <p className="text-sm sm:text-base font-black text-stone-900 leading-relaxed font-serif">
                ॐ एहि सूर्य सहस्त्रांशो तेजोराशे जगत्पते।<br />
                अनुकम्पय मां भक्त्या गृहाणार्घ्यं दिवाकर॥
              </p>
              <p className="text-xs text-stone-600 leading-normal pt-1 border-t border-amber-200">
                <strong>अर्थ:</strong> हे सहस्र किरणों वाले, तेज के सागर, समस्त जगत के स्वामी भगवान सूर्य! मुझ भक्त पर अनुकम्पा करते हुए मेरे द्वारा समर्पित इस पावन अर्घ्य को स्वीकार करें।
              </p>
            </div>

            {/* Surya Gayatri Mantra */}
            <div className="p-4 bg-sky-50 border border-sky-300 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-900 bg-sky-200 px-2 py-0.5 rounded-full inline-block">
                सूर्य गायत्री मन्त्र
              </span>
              <p className="text-sm font-black text-[#075985] leading-relaxed">
                ॐ भास्कराय विद्महे महातेजाय धीमहि।<br />
                तन्नः सूर्यः प्रचोदयात्॥
              </p>
            </div>

            {/* 12 Holy Sun Names */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-600">
                द्वादश आदित्य नाम (भगवान सूर्य के १२ पावन नाम):
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-stone-800">
                {[
                  '१. ॐ मित्राय नमः',
                  '२. ॐ रवये नमः',
                  '३. ॐ सूर्याय नमः',
                  '४. ॐ भानवे नमः',
                  '५. ॐ खगाय नमः',
                  '६. ॐ पूष्णे नमः',
                  '७. ॐ हिरण्यगर्भाय नमः',
                  '८. ॐ मरीचये नमः',
                  '९. ॐ आदित्याय नमः',
                  '१०. ॐ सवित्रे नमः',
                  '११. ॐ अर्काय नमः',
                  '१२. ॐ भास्कराय नमः',
                ].map((m, midx) => (
                  <div key={midx} className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AARTI */}
        {activeTab === 'AARTI' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4 animate-fade-in">
            <div className="border-b border-stone-100 pb-2">
              <h3 className="text-base font-black text-[#075985]">
                भगवान भास्कर एवं षष्ठी माता की पावन आरती
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                देव सूर्य मंदिर में प्रातः व सायंकाल गाई जाने वाली नित्य आरती
              </p>
            </div>

            <div className="space-y-2 p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs sm:text-sm font-semibold text-stone-800 leading-relaxed">
              <p className="font-black text-[#075985] text-base text-center pb-2 border-b border-amber-200">
                ॥ श्री सूर्य देव की आरती ॥
              </p>
              <p>जय कश्यप-नंदन, ॐ जय अदिति-नंदन।</p>
              <p>त्रिभुवन-तिमिर-निकंदन, भक्त-हृदय-वंदन॥ जय जय सूर्य हरे॥</p>
              <p>सप्त-अश्व-रथ सोहे, छवि निर्मल कांति।</p>
              <p>ऋषि-मुनि सुर-नर ध्यावत, मिटे सकल भ्रांति॥ जय जय सूर्य हरे॥</p>
              <p>अर्घ्य देत जो ध्यावे, रोग-शोक न रहे।</p>
              <p>छठी मैया के संग में, सुख-संपत्ति लहे॥ जय जय सूर्य हरे॥</p>
              <p>कंचन थार कपूर लौ छाई, आरती करत सब नर-नारी।</p>
              <p>देव सूर्य मंदिर में गूंजे, जयकार तिहारी॥ जय जय सूर्य हरे॥</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

