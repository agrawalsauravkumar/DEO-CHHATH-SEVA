/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, X, Music, Sparkles, BookOpen, Sun } from 'lucide-react';

interface DevotionalTrack {
  id: string;
  title: string;
  category: 'GEET' | 'AARTI' | 'MANTRA';
  tagline: string;
  lyrics: string[];
  meaning?: string;
}

const DEVOTIONAL_TRACKS: DevotionalTrack[] = [
  {
    id: 'track-1',
    title: 'काँच ही बाँस के बहँगिया',
    category: 'GEET',
    tagline: 'पारंपरिक छठ लोकगीत (दउरा उठाव)',
    lyrics: [
      'काँच ही बाँस के बहँगिया, बहँगी लचकत जाए…',
      'बहँगी लचकत जाए…',
      'बात जे पुछेले बटोहिया, बहँगी केकरा के जाए?',
      'तू त आन्हर हउवे रे बटोहिया, बहँगी छठी माई के जाए…',
      'काँच ही बाँस के बहँगिया, बहँगी लचकत जाए…',
      'सूपे सूपे निपले अंगनवा, अरघ के बेरा भईल…',
      'उग हे सुरुज देव, अरघ के बेरा भईल…',
    ],
    meaning: 'बांस की बहंगी में पावन दउरा लेकर छठ व्रती घाट की ओर प्रस्थान करते हैं, छठी माई की असीम कृपा और भक्ति का अनुपम गान।',
  },
  {
    id: 'track-2',
    title: 'उग हे सुरुज देव (अरघ के बेरा)',
    category: 'GEET',
    tagline: 'सांध्य व उषा अर्घ्य प्रार्थना',
    lyrics: [
      'उग हे सुरुज देव, अरघ के बेरा भईल…',
      'अरघ के बेरा भईल, पूजन के बेरा भईल…',
      'जल बीच ठाढ़ व्रती विनती करेली…',
      'दर्शन देहू सुरुज देव, अरघ के बेरा भईल…',
      'अन्हरिया भगावल, जगमग उजियार भईल…',
      'दीनानाथ हे प्रभु, तोहर जय-जयकार भईल…',
    ],
    meaning: 'शीतल सरोवर के जल में खड़े होकर दोनों कर जोड़कर उदीयमान सूर्य देव से दर्शन देने की भावपूर्ण प्रार्थना।',
  },
  {
    id: 'track-3',
    title: 'भगवान सूर्य देव की पावन आरती',
    category: 'AARTI',
    tagline: 'दैनिक सूर्य मंदिर आरती',
    lyrics: [
      'जय कश्यप-नंदन, ॐ जय अदिति-नंदन।',
      'त्रिभुवन-तिमिर-निकंदन, भक्त-हृदय-वंदन॥ जय जय सूर्य हरे॥',
      'सप्त-अश्व-रथ सोहे, छवि निर्मल कांति।',
      'ऋषि-मुनि सुर-नर ध्यावत, मिटे सकल भ्रांति॥ जय जय सूर्य हरे॥',
      'अर्घ्य देत जो ध्यावे, रोग-शोक न रहे।',
      'छठी मैया के संग में, सुख-संपत्ति लहे॥ जय जय सूर्य हरे॥',
    ],
    meaning: 'भगवान भास्कर समस्त संसार के चक्षु हैं, उनके स्मरण मात्र से तेज, आयु, आरोग्य और ऐश्वर्य की प्राप्ति होती है।',
  },
  {
    id: 'track-4',
    title: 'सूर्य देव के 12 पावन नाम व मंत्र',
    category: 'MANTRA',
    tagline: 'द्वादश आदित्य नाम स्मरण',
    lyrics: [
      '१. ॐ मित्राय नमः (सर्वसखा)',
      '२. ॐ रवये नमः (प्रकाश दाता)',
      '३. ॐ सूर्याय नमः (गति प्रेरक)',
      '४. ॐ भानवे नमः (दीप्तिमान)',
      '५. ॐ खगाय नमः (आकाशगामी)',
      '६. ॐ पूष्णे नमः (पोषणकर्ता)',
      '७. ॐ हिरण्यगर्भाय नमः (स्वर्णमय तेज)',
      '८. ॐ मरीचये नमः (किरणों के स्वामी)',
      '९. ॐ आदित्याय नमः (अदिति पुत्र)',
      '१०. ॐ सवित्रे नमः (उत्पादक)',
      '११. ॐ अर्काय नमः (पूजनीय)',
      '१२. ॐ भास्कराय नमः (ज्ञान प्रकाशक)',
    ],
    meaning: 'अर्घ्य देते समय इन 12 नामों का उच्चारण करने से अनंत कोटि पुण्य और सूर्य कृपा प्राप्त होती है।',
  },
];

export const ChhathDevotionalPlayer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorIntervalRef = useRef<number | null>(null);

  const currentTrack = DEVOTIONAL_TRACKS[activeTrackIndex];

  // Synthesize peaceful temple bell & meditative drone sound offline
  const startDevotionalChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const playBellTone = (freq: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 3.6);
      };

      // Play immediate warm bell chord
      playBellTone(528); // 528 Hz Solfeggio / healing chime
      setTimeout(() => playBellTone(660), 300);

      // Repeat soothing ambient bell periodically
      const interval = window.setInterval(() => {
        playBellTone(528);
        setTimeout(() => playBellTone(792), 400);
      }, 5000);

      oscillatorIntervalRef.current = interval;
      setIsPlayingAudio(true);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const stopDevotionalChime = () => {
    if (oscillatorIntervalRef.current !== null) {
      clearInterval(oscillatorIntervalRef.current);
      oscillatorIntervalRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      stopDevotionalChime();
    } else {
      startDevotionalChime();
    }
  };

  useEffect(() => {
    return () => {
      stopDevotionalChime();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-['Mukta',sans-serif] animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] bg-gradient-to-b from-[#FFFDF7] to-[#FFF8E7] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-amber-400">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#075985] via-[#073B5A] to-[#041E2F] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF8C42] to-[#FFD54F] text-stone-950 flex items-center justify-center text-xl shrink-0 font-bold">
              🎵
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight">
                छठ लोकगीत व सूर्य वंदना
              </h3>
              <p className="text-xs text-amber-200">
                भक्तिमय गीत, स्तोत्र व शांतिदायक मंदिर घंटी
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopDevotionalChime();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient Sound Bar */}
        <div className="bg-amber-100/80 px-4 py-2 border-b border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-pulse">🔔</span>
            <div>
              <span className="text-xs font-black text-stone-900 block leading-tight">
                आध्यात्मिक मंदिर घंटी व धुन (Offline Sound)
              </span>
              <span className="text-[10px] text-stone-600">
                {isPlayingAudio ? 'धुन बज रही है • 100% ऑफलाइन' : 'धुन बंद है'}
              </span>
            </div>
          </div>

          <button
            onClick={toggleAudio}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
              isPlayingAudio
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-white text-stone-800 border border-stone-300'
            }`}
          >
            {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlayingAudio ? 'रोकें' : 'बजाएँ'}</span>
          </button>
        </div>

        {/* Track Selection Tabs */}
        <div className="flex gap-1.5 p-2 bg-stone-100 overflow-x-auto text-xs font-black border-b border-stone-200 shrink-0">
          {DEVOTIONAL_TRACKS.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => setActiveTrackIndex(idx)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTrackIndex === idx
                  ? 'bg-[#075985] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200'
              }`}
            >
              {track.title}
            </button>
          ))}
        </div>

        {/* Track Content & Lyrics */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                {currentTrack.category === 'GEET'
                  ? 'छठ लोकगीत'
                  : currentTrack.category === 'AARTI'
                  ? 'आरती'
                  : 'मंत्र स्तोत्र'}
              </span>
              <span className="text-xs text-stone-500 font-semibold">{currentTrack.tagline}</span>
            </div>
            <h4 className="text-lg font-black text-stone-900">{currentTrack.title}</h4>

            {currentTrack.meaning && (
              <p className="text-xs text-[#075985] font-semibold bg-sky-50 p-2.5 rounded-xl border border-sky-100">
                {currentTrack.meaning}
              </p>
            )}
          </div>

          {/* Lyrics Box */}
          <div className="bg-white/90 rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3 text-center">
            {currentTrack.lyrics.map((line, idx) => (
              <p
                key={idx}
                className="text-base sm:text-lg font-bold text-stone-800 leading-relaxed font-['Mukta',sans-serif]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-600 font-semibold">
            🙏 भगवान भास्कर व छठी मैया आप सभी की मनोकामनाएं पूर्ण करें।
          </p>
        </div>
      </div>
    </div>
  );
};

