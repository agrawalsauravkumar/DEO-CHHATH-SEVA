/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Clock,
  Heart,
  Share2,
  Calendar,
  Flame,
  Radio,
  MapPin,
  ExternalLink,
  Info,
} from 'lucide-react';

interface AartiSlot {
  id: string;
  name: string;
  time: string;
  period: 'प्रातः' | 'दोपहर' | 'सायं' | 'रात्रि';
  description: string;
}

const AARTI_TIMETABLE: AartiSlot[] = [
  {
    id: 'mangala',
    name: 'मंगला आरती एवं सूर्योदय दर्शन',
    time: '05:00 AM',
    period: 'प्रातः',
    description: 'भगवान भास्कर के प्रथम दर्शन, गर्भगृह प्रक्षालन व वैदिक मंत्रोच्चार।',
  },
  {
    id: 'shringar',
    name: 'शृंगार एवं राजभोग आरती',
    time: '12:00 PM',
    period: 'दोपहर',
    description: 'भगवान भुवन भास्कर का दिव्य शृंगार व सात्विक भोग समर्पण।',
  },
  {
    id: 'sandhya',
    name: 'सांध्य महाआरती व दीपदान',
    time: '06:30 PM',
    period: 'सायं',
    description: 'सूर्यास्त के उपरांत 108 दीपों की पावन महाआरती व शंखघोष।',
  },
  {
    id: 'shayan',
    name: 'शयन आरती व पुष्पांजलि',
    time: '09:00 PM',
    period: 'रात्रि',
    description: 'नित्य दर्शन का समापन, शयन आरती एवं शांति पाठ।',
  },
];

export const LiveDarshanScreen: React.FC = () => {
  const { navigate, language } = useApp();
  const [activeCamera, setActiveCamera] = useState<'TEMPLE' | 'KUND' | 'AARTI'>('TEMPLE');
  const [bellRinging, setBellRinging] = useState(false);
  const [shankhBlowing, setShankhBlowing] = useState(false);
  const [diyaLit, setDiyaLit] = useState(false);
  const [flowerShower, setFlowerShower] = useState(false);
  const [flowerPetals, setFlowerPetals] = useState<{ id: number; left: number; delay: number }[]>([]);
  const [jaiCount, setJaiCount] = useState(38420);
  const [userCheered, setUserCheered] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize or resume Web Audio Context
  const getAudioContext = (): AudioContext | null => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  // Synthesize realistic Tibetan / Hindu bronze temple bell chime
  const ringTempleBell = () => {
    setBellRinging(true);
    setTimeout(() => setBellRinging(false), 1200);

    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Strike fundamental + harmonics (587Hz D5 + 1174Hz D6 + 1761Hz A6)
      const freqs = [587.33, 1174.66, 1761.99, 2349.32];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const decay = 2.5 / (idx + 1);
        gain.gain.setValueAtTime(0.2 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + decay);
      });
    } catch (e) {
      console.warn('Bell synthesis error:', e);
    }
  };

  // Synthesize deep resonant Shankh (Conch) vibration
  const blowShankh = () => {
    setShankhBlowing(true);
    setTimeout(() => setShankhBlowing(false), 2400);

    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      // Low sacred fundamental ramping up like a horn blow
      osc.frequency.setValueAtTime(146.83, now); // D3
      osc.frequency.linearRampToValueAtTime(220.0, now + 0.5); // A3
      osc.frequency.linearRampToValueAtTime(293.66, now + 1.2); // D4
      osc.frequency.exponentialRampToValueAtTime(146.83, now + 2.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
      gain.gain.linearRampToValueAtTime(0.15, now + 1.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      // Lowpass filter to soften the brassy edge
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.5);
    } catch (e) {
      console.warn('Shankh synthesis error:', e);
    }
  };

  // Trigger divine flower shower animation
  const triggerFlowerShower = () => {
    setFlowerShower(true);
    const newPetals = Array.from({ length: 24 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 90 + 5, // 5% to 95%
      delay: Math.random() * 0.8,
    }));
    setFlowerPetals(newPetals);

    setTimeout(() => {
      setFlowerShower(false);
      setFlowerPetals([]);
    }, 3200);
  };

  // Cheer Jai Chhathi Maiya
  const handleJaiCheer = () => {
    if (!userCheered) {
      setJaiCount((prev) => prev + 1);
      setUserCheered(true);
      ringTempleBell();
      triggerFlowerShower();
    }
  };

  const handleShare = () => {
    const text = '🚩 देव सूर्य मंदिर व सूर्य कुंड लाइव दर्शन — DEO CHHATH SEVA\nhttps://seva.nextgendevbhoomi.org/\nघर बैठे करें भगवान भास्कर के पावन दर्शन व आरती!';
    if (navigator.share) {
      navigator.share({ title: 'देव सूर्य मंदिर लाइव दर्शन', text, url: 'https://seva.nextgendevbhoomi.org/' }).catch(() => undefined);
    } else {
      navigator.clipboard?.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#07131D] text-slate-100 pb-28 flex flex-col font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <TopBar title="देव सूर्य मंदिर लाइव दर्शन" showBack />

      {/* Flower Shower Animation Layer */}
      {flowerShower && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {flowerPetals.map((petal) => (
            <div
              key={petal.id}
              className="absolute text-xl animate-fall"
              style={{
                left: `${petal.left}%`,
                top: '-20px',
                animation: `fallDown 3s linear forwards ${petal.delay}s`,
              }}
            >
              🌸
            </div>
          ))}
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-5">
        {/* Live Status Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/20 via-sky-500/10 to-transparent p-3 rounded-2xl border border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
            </span>
            <div>
              <p className="text-xs font-black text-white flex items-center gap-1.5">
                सीधा प्रसारण • देवार्क धाम, औरंगाबाद
              </p>
              <p className="text-[10px] text-amber-300 font-bold">
                आज {jaiCount.toLocaleString('hi-IN')} श्रद्धालुओं ने दर्शन लाभ प्राप्त किया
              </p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1 text-amber-200 transition-all active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedShare ? 'कॉपी हुआ!' : 'साझा करें'}</span>
          </button>
        </div>

        {/* Video Player / Sacred Darshan Screen */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/80 shadow-2xl bg-black aspect-video flex items-center justify-center">
          {/* Authentic Deo Sun Temple Heritage Video / Visual */}
          {activeCamera === 'TEMPLE' && (
            <img
              src="/images/chhath/deo-sun-temple.jpg"
              alt="देव सूर्य मंदिर मुख्य गर्भगृह"
              className="w-full h-full object-cover"
            />
          )}

          {activeCamera === 'KUND' && (
            <img
              src="/images/chhath/surya-kund-arghya.jpg"
              alt="सूर्य कुंड महातीर्थ पावन घाट"
              className="w-full h-full object-cover"
            />
          )}

          {activeCamera === 'AARTI' && (
            <img
              src="/images/chhath/sandhya-arghya.jpg"
              alt="सांध्य व उषा महाआरती"
              className="w-full h-full object-cover"
            />
          )}

          {/* Diya Overlay when lit */}
          {diyaLit && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center animate-bounce">
              <span className="text-4xl drop-shadow-[0_0_20px_rgba(255,180,0,1)]">🪔</span>
              <span className="text-[10px] bg-black/70 px-2 py-0.5 rounded-full text-amber-300 font-bold mt-1">
                आपकी मनोकामना व दीप प्रज्वलित
              </span>
            </div>
          )}

          {/* Player Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

          {/* Top Camera Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-black tracking-wider flex items-center gap-1.5 shadow-md">
              <Radio className="w-3 h-3 animate-pulse" />
              LIVE HD
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-black border border-white/10">
              {activeCamera === 'TEMPLE' && 'मुख्य पाषाण मंदिर गर्भगृह'}
              {activeCamera === 'KUND' && 'सूर्य कुंड पावन अर्घ्य सरोवर'}
              {activeCamera === 'AARTI' && 'सांध्य व उषा महाआरती मंच'}
            </span>
          </div>

          {/* Bottom Live Info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="space-y-0.5">
              <p className="text-white text-sm sm:text-base font-black drop-shadow-md">
                ॥ ॐ आदित्याय नमः • जय छठी मइया ॥
              </p>
              <p className="text-[11px] text-amber-200/90 font-semibold drop-shadow-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                पश्चिमाभिमुख देवार्क धाम, देव (औरंगाबाद)
              </p>
            </div>

            <button
              onClick={handleJaiCheer}
              className={`px-3 py-1.5 rounded-xl font-black text-xs shadow-lg transition-all active:scale-90 flex items-center gap-1.5 ${
                userCheered
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:brightness-110 animate-pulse'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${userCheered ? 'fill-white' : 'fill-red-600'}`} />
              <span>{userCheered ? 'जयकार समर्पित' : 'जय छठी मैया (नमन)'}</span>
            </button>
          </div>
        </div>

        {/* Camera Selector Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveCamera('TEMPLE')}
            className={`p-2.5 rounded-2xl text-xs font-black border transition-all text-center ${
              activeCamera === 'TEMPLE'
                ? 'bg-amber-400 text-black border-amber-300 shadow-md scale-[1.02]'
                : 'bg-[#0E1E2E] text-slate-300 border-white/10 hover:border-amber-400/40'
            }`}
          >
            🏛️ सूर्य मंदिर गर्भगृह
          </button>
          <button
            onClick={() => setActiveCamera('KUND')}
            className={`p-2.5 rounded-2xl text-xs font-black border transition-all text-center ${
              activeCamera === 'KUND'
                ? 'bg-amber-400 text-black border-amber-300 shadow-md scale-[1.02]'
                : 'bg-[#0E1E2E] text-slate-300 border-white/10 hover:border-amber-400/40'
            }`}
          >
            🌊 सूर्य कुंड सरोवर
          </button>
          <button
            onClick={() => setActiveCamera('AARTI')}
            className={`p-2.5 rounded-2xl text-xs font-black border transition-all text-center ${
              activeCamera === 'AARTI'
                ? 'bg-amber-400 text-black border-amber-300 shadow-md scale-[1.02]'
                : 'bg-[#0E1E2E] text-slate-300 border-white/10 hover:border-amber-400/40'
            }`}
          >
            🌅 महाआरती मंच
          </button>
        </div>

        {/* Interactive E-Puja Ritual Toolbar */}
        <div className="bg-[#0E1E2E] p-4 rounded-3xl border border-amber-400/40 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              डिजिटल ई-पूजा एवं नमन अनुष्ठान
            </h3>
            <span className="text-[10px] text-slate-400">श्रद्धापूर्वक स्पर्श करें</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* Bell Chime */}
            <button
              onClick={ringTempleBell}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all active:scale-95 ${
                bellRinging
                  ? 'bg-amber-500 text-black border-white shadow-lg animate-wiggle'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              <span className="text-2xl">🔔</span>
              <span className="text-[10px] font-black">घंटी बजाएं</span>
            </button>

            {/* Shankh Naad */}
            <button
              onClick={blowShankh}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all active:scale-95 ${
                shankhBlowing
                  ? 'bg-sky-500 text-white border-white shadow-lg animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              <span className="text-2xl">🐚</span>
              <span className="text-[10px] font-black">शंखनाद</span>
            </button>

            {/* Light Diya */}
            <button
              onClick={() => {
                setDiyaLit(!diyaLit);
                ringTempleBell();
              }}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all active:scale-95 ${
                diyaLit
                  ? 'bg-orange-500 text-white border-white shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              <span className="text-2xl">🪔</span>
              <span className="text-[10px] font-black">{diyaLit ? 'दीप प्रज्वलित' : 'दीपदान'}</span>
            </button>

            {/* Flower Shower */}
            <button
              onClick={() => {
                triggerFlowerShower();
                ringTempleBell();
              }}
              className="p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
            >
              <span className="text-2xl">🌸</span>
              <span className="text-[10px] font-black">पुष्प अर्पण</span>
            </button>
          </div>
        </div>

        {/* Daily Aarti Timetable */}
        <div className="bg-[#0E1E2E] p-4 rounded-3xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              दैनिक महाआरती समय सारणी
            </h3>
            <span className="text-[11px] text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded-full">
              नित्य चार पहर
            </span>
          </div>

          <div className="space-y-2">
            {AARTI_TIMETABLE.map((aarti) => (
              <div
                key={aarti.id}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-300">{aarti.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold">
                      {aarti.period}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {aarti.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-black text-white bg-amber-500/20 border border-amber-400/40 px-2.5 py-1 rounded-xl">
                  {aarti.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links to Stotra & Sankalp */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => navigate('surya-stotra')}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs text-left shadow-md flex items-center justify-between active:scale-95 transition-all"
          >
            <span>📜 आदित्य हृदय स्तोत्र पाठ</span>
            <span>➔</span>
          </button>
          <button
            onClick={() => navigate('sankalp')}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-[#075985] text-white font-black text-xs text-left shadow-md flex items-center justify-between active:scale-95 transition-all"
          >
            <span>🙏 देवार्क दूरस्थ ई-संकल्प</span>
            <span>➔</span>
          </button>
        </div>
      </main>
    </div>
  );
};

