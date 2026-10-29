/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ExternalLink,
  Repeat,
  Sparkles,
  Music,
  Share2,
  Check,
} from 'lucide-react';

export interface ChhathFolkTrack {
  id: string;
  title: string;
  singer: string;
  tagline: string;
  lyrics: string[];
  meaning: string;
  youtubeQuery: string;
  melodyNotes: number[][]; // Frequency sequence for each verse line
}

export const CHHATH_FOLK_PLAYLIST: ChhathFolkTrack[] = [
  {
    id: 'katha-track-1',
    title: 'काँच ही बाँस के बहँगिया',
    singer: 'पारंपरिक अमर लोकगीत (शारदा सिन्हा स्वर प्रेरणा)',
    tagline: 'सूप-दउरा उठाव व घाट प्रस्थान',
    youtubeQuery: 'काँच ही बाँस के बहँगिया शारदा सिन्हा',
    lyrics: [
      'काँच ही बाँस के बहँगिया, बहँगी लचकत जाए…',
      'बहँगी लचकत जाए…',
      'बात जे पुछेले बटोहिया, बहँगी केकरा के जाए?',
      'तू त आन्हर हउवे रे बटोहिया, बहँगी छठी माई के जाए…',
      'काँच ही बाँस के बहँगिया, बहँगी लचकत जाए…',
      'सूपे सूपे निपले अंगनवा, अरघ के बेरा भईल…',
      'उग हे सुरुज देव, अरघ के बेरा भईल…',
    ],
    meaning: 'बांस की बहंगी में पावन दउरा लेकर छठ व्रती और परिजन देव के सूर्य कुंड घाट की ओर प्रस्थान करते हैं।',
    melodyNotes: [
      [392, 392, 329.6, 392, 440, 392, 329.6, 293.7, 261.6],
      [293.7, 329.6, 392, 329.6, 293.7, 261.6],
      [392, 440, 523.3, 440, 392, 329.6, 392],
      [261.6, 293.7, 329.6, 392, 440, 392, 329.6, 261.6],
      [392, 392, 329.6, 392, 440, 392, 329.6, 293.7, 261.6],
      [329.6, 392, 440, 392, 329.6, 293.7, 261.6],
      [392, 523.3, 440, 392, 329.6, 293.7, 261.6],
    ],
  },
  {
    id: 'katha-track-2',
    title: 'उग हे सुरुज देव (अरघ के बेरा भईल)',
    singer: 'पारंपरिक सांध्य व उषा अर्घ्य गान',
    tagline: 'भगवान भुवन भास्कर को भावपूर्ण पुकार',
    youtubeQuery: 'उग हे सुरुज देव अरघ के बेरा भईल शारदा सिन्हा',
    lyrics: [
      'उग हे सुरुज देव, अरघ के बेरा भईल…',
      'अरघ के बेरा भईल, पूजन के बेरा भईल…',
      'जल बीच ठाढ़ व्रती विनती करेली…',
      'दर्शन देहू सुरुज देव, अरघ के बेरा भईल…',
      'अन्हरिया भगावल, जगमग उजियार भईल…',
      'दीनानाथ हे प्रभु, तोहर जय-जयकार भईल…',
    ],
    meaning: 'शीतल सूर्य कुंड के जल में कमर तक खड़े होकर दोनों कर जोड़कर भगवान भास्कर से दर्शन देने की भावपूर्ण प्रार्थना।',
    melodyNotes: [
      [261.6, 329.6, 392, 440, 523.3, 440, 392],
      [392, 440, 523.3, 440, 392, 329.6, 293.7],
      [329.6, 392, 440, 493.9, 440, 392, 329.6],
      [261.6, 329.6, 392, 440, 523.3, 392, 261.6],
      [392, 440, 523.3, 587.3, 523.3, 440, 392],
      [261.6, 293.7, 329.6, 392, 440, 329.6, 261.6],
    ],
  },
  {
    id: 'katha-track-3',
    title: 'केलवा के पात पर उगेलन सुरुजमल',
    singer: 'पारंपरिक मांगलिक अर्घ्य गीत',
    tagline: 'पवित्र वेदी व प्रसाद अर्पण',
    youtubeQuery: 'केलवा के पात पर उगेलन सुरुजमल शारदा सिन्हा',
    lyrics: [
      'केलवा के पात पर उगेलन सुरुजमल झांके झुके…',
      'करेलू छठ परबिया, से झांके झुके…',
      'हम तोसे पुछी बरतिया हे, कवन फल पावेला…',
      'से कवन फल पावेला…',
      'पुत्र पावे अन्न-धन लछिमी, अमर सुहाग पावेला…',
      'केलवा के पात पर उगेलन सुरुजमल झांके झुके…',
    ],
    meaning: 'केले के पत्तों और सूप में सजे ऋतु फलों के मध्य भगवान सूर्य की स्वर्णिम किरणों का अवतरण।',
    melodyNotes: [
      [293.7, 329.6, 392, 440, 392, 329.6, 293.7, 261.6],
      [329.6, 392, 440, 392, 329.6, 293.7],
      [392, 440, 523.3, 440, 392, 329.6, 392],
      [329.6, 392, 440, 392, 293.7],
      [261.6, 293.7, 329.6, 392, 440, 392, 329.6, 261.6],
      [293.7, 329.6, 392, 440, 392, 329.6, 293.7, 261.6],
    ],
  },
  {
    id: 'katha-track-4',
    title: 'पहिले पहिल हम कइनी छठी मइया',
    singer: 'छठ व्रत संकल्प व समर्पण गान',
    tagline: 'प्रथम व्रत की निष्ठा और श्रद्धा',
    youtubeQuery: 'पहिले पहिल हम कइनी छठी मइया शारदा सिन्हा',
    lyrics: [
      'पहिले पहिल हम कइनी, छठी मइया बरत तोहार…',
      'करिहा क्षमा छठी मइया, भूल-चूक गलती हमार…',
      'सबके सुहाग रखिहा, अंचरा के लाज रखिहा…',
      'गोदी में बालक खेलै, घर-अंगना भरल रखिहा…',
      'पहिले पहिल हम कइनी, छठी मइया बरत तोहार…',
    ],
    meaning: 'निष्ठापूर्वक प्रथम बार छठ व्रत धारण करने वाली माताओं-बहनों की क्षमायाचना व मंगल कामना।',
    melodyNotes: [
      [261.6, 293.7, 329.6, 392, 440, 392, 329.6, 261.6],
      [329.6, 392, 440, 523.3, 440, 392, 329.6],
      [392, 440, 523.3, 440, 392, 329.6, 293.7],
      [261.6, 329.6, 392, 440, 392, 329.6, 261.6],
      [261.6, 293.7, 329.6, 392, 440, 392, 329.6, 261.6],
    ],
  },
];

interface ChhathSongPlayerProps {
  currentTrackIndex: number;
  onSelectTrack: (index: number) => void;
}

export const ChhathSongPlayer: React.FC<ChhathSongPlayerProps> = ({
  currentTrackIndex,
  onSelectTrack,
}) => {
  const track = CHHATH_FOLK_PLAYLIST[currentTrackIndex] || CHHATH_FOLK_PLAYLIST[0];

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Audio & Speech references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const tanpuraGainRef = useRef<GainNode | null>(null);
  const tanpuraOscsRef = useRef<OscillatorNode[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const activeVerseRef = useRef<number>(0);
  const timeoutIdRef = useRef<number | null>(null);

  // Keep ref synchronized
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    activeVerseRef.current = activeVerseIndex;
  }, [activeVerseIndex]);

  // When track changes, reset verse & stop previous audio
  useEffect(() => {
    stopPlayback();
    setActiveVerseIndex(0);
  }, [currentTrackIndex]);

  // Initialize or resume AudioContext
  const getAudioContext = (): AudioContext | null => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch (e) {
      console.warn('AudioContext unavailable:', e);
      return null;
    }
  };

  // Start continuous meditative Tanpura Drone (C3 + G3 + C4 chord)
  const startTanpuraDrone = (ctx: AudioContext) => {
    stopTanpuraDrone();
    try {
      const masterGain = ctx.createGain();
      const currentVol = isMuted ? 0 : volume * 0.18;
      masterGain.gain.setValueAtTime(currentVol, ctx.currentTime);
      masterGain.connect(ctx.destination);
      tanpuraGainRef.current = masterGain;

      // C3 (130.81Hz), G3 (196.00Hz), C4 (261.63Hz)
      const droneFreqs = [130.81, 196.0, 261.63];
      const oscs: OscillatorNode[] = [];

      droneFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.35 / (idx + 1), ctx.currentTime);

        // Strumming LFO shimmer
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.25 + idx * 0.1, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.12, ctx.currentTime);
        lfo.connect(lfoGain.gain);
        lfo.start();

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });

      tanpuraOscsRef.current = oscs;
    } catch (err) {
      console.warn('Tanpura drone init error:', err);
    }
  };

  const stopTanpuraDrone = () => {
    try {
      tanpuraOscsRef.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      tanpuraOscsRef.current = [];
      if (tanpuraGainRef.current) {
        tanpuraGainRef.current.disconnect();
        tanpuraGainRef.current = null;
      }
    } catch {
      // ignore
    }
  };

  // Play a single flute / harmonium melody note
  const playMelodyNote = (ctx: AudioContext, freq: number, startTime: number, duration: number) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft flute/harmonium timbre: triangle wave with gentle lowpass
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Pitch vibrato (5Hz subtle sway)
      const vibrato = ctx.createOscillator();
      vibrato.frequency.setValueAtTime(5, startTime);
      const vibratoGain = ctx.createGain();
      vibratoGain.gain.setValueAtTime(freq * 0.015, startTime);
      vibrato.connect(osc.frequency);
      vibrato.start(startTime);
      vibrato.stop(startTime + duration);

      // ADSR envelope
      const maxVol = isMuted ? 0 : volume * 0.28;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(maxVol, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    } catch {
      // ignore
    }
  };

  // Play Temple Ghanta / Bell Chime
  const playTempleBell = (ctx: AudioContext) => {
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now); // 528Hz Solfeggio / Temple bronze bell
      osc.frequency.exponentialRampToValueAtTime(1056, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(528, now + 0.8);

      const maxBell = isMuted ? 0 : volume * 0.22;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(maxBell, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.6);
    } catch {
      // ignore
    }
  };

  // Play an entire verse line: Melody notes + Hindi Speech Recitation
  const playVerse = (verseIndex: number) => {
    if (!isPlayingRef.current) return;

    setActiveVerseIndex(verseIndex);
    activeVerseRef.current = verseIndex;

    const ctx = getAudioContext();
    if (ctx) {
      // Ring soft temple bell at verse start
      playTempleBell(ctx);

      // Play melodic flute notes for this verse
      const notesForVerse =
        track.melodyNotes[verseIndex] ||
        track.melodyNotes[verseIndex % track.melodyNotes.length] ||
        [392, 440, 523.3, 440, 392];

      const noteDuration = (0.55 / playbackSpeed);
      const startTime = ctx.currentTime + 0.15;

      notesForVerse.forEach((freq, nIdx) => {
        playMelodyNote(ctx, freq, startTime + nIdx * noteDuration, noteDuration * 0.95);
      });
    }

    // Vocalize lyrics using Web Speech Synthesis
    const currentLineText = track.lyrics[verseIndex];
    let spokenDurationSec = 4.2 / playbackSpeed;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // cancel any active speech
        const utterance = new SpeechSynthesisUtterance(currentLineText);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.9 * playbackSpeed;
        utterance.pitch = 1.05; // sweet vocal pitch
        utterance.volume = isMuted ? 0 : Math.min(1, volume * 1.2);

        // Find Hindi voice if installed
        const voices = window.speechSynthesis.getVoices();
        const hiVoice = voices.find((v) => v.lang.startsWith('hi'));
        if (hiVoice) {
          utterance.voice = hiVoice;
        }

        utterance.onend = () => {
          if (!isPlayingRef.current) return;
          advanceToNextVerse(verseIndex);
        };

        utterance.onerror = () => {
          // Fallback to timer if speech encounters issue
          if (!isPlayingRef.current) return;
          advanceToNextVerse(verseIndex);
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback to timer
        scheduleTimerAdvance(verseIndex, spokenDurationSec);
      }
    } else {
      // Fallback timer if speech synthesis is not supported
      scheduleTimerAdvance(verseIndex, spokenDurationSec);
    }
  };

  const scheduleTimerAdvance = (verseIndex: number, durationSec: number) => {
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = window.setTimeout(() => {
      if (isPlayingRef.current) {
        advanceToNextVerse(verseIndex);
      }
    }, durationSec * 1000);
  };

  const advanceToNextVerse = (currentIdx: number) => {
    if (!isPlayingRef.current) return;
    const nextIdx = currentIdx + 1;
    if (nextIdx < track.lyrics.length) {
      playVerse(nextIdx);
    } else {
      // End of song reached
      if (isLooping) {
        // Loop back to start
        playVerse(0);
      } else {
        stopPlayback();
      }
    }
  };

  const startPlayback = (fromVerse: number = 0) => {
    const ctx = getAudioContext();
    if (ctx) {
      startTanpuraDrone(ctx);
    }
    setIsPlaying(true);
    isPlayingRef.current = true;
    playVerse(fromVerse);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    stopTanpuraDrone();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback(activeVerseIndex);
    }
  };

  const handleReset = () => {
    stopPlayback();
    setActiveVerseIndex(0);
  };

  const handleSelectVerse = (vIdx: number) => {
    setActiveVerseIndex(vIdx);
    if (isPlaying) {
      playVerse(vIdx);
    } else {
      startPlayback(vIdx);
    }
  };

  const handleCopyLyrics = () => {
    const text = `${track.title} - ${track.singer}\n\n${track.lyrics.join('\n')}\n\nभावार्थ: ${track.meaning}\n(प्रस्तुत: देव छठ सेवा)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Track Selector Carousel / Pills */}
      <div className="grid grid-cols-2 gap-2">
        {CHHATH_FOLK_PLAYLIST.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTrack(idx)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              currentTrackIndex === idx
                ? 'bg-[#075985] text-white border-[#075985] shadow-md scale-[1.01]'
                : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">
                गीत {idx + 1}
              </span>
              {currentTrackIndex === idx && isPlaying && (
                <span className="flex items-center gap-0.5 text-xs text-[#FFB52E]">
                  <span className="w-1 h-3 bg-[#FFB52E] rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-[#FFB52E] rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-[#FFB52E] rounded-full animate-pulse delay-150" />
                </span>
              )}
            </div>
            <h4 className="text-xs font-black truncate leading-tight mt-1">{t.title}</h4>
            <span className="text-[10px] block truncate opacity-75 mt-0.5">{t.tagline}</span>
          </button>
        ))}
      </div>

      {/* Main Music Player Stage Card */}
      <div className="bg-gradient-to-br from-white via-amber-50/40 to-orange-50/30 rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 bg-amber-400/15 rounded-full blur-xl" />

        {/* Player Header */}
        <div className="flex items-start justify-between relative z-10 border-b border-amber-200/70 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#F47B20] bg-amber-100/80 px-2 py-0.5 rounded-full inline-block">
              भक्तिमय छठ लोकगीत संगीत प्लेयर
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#075985] leading-tight">
              {track.title}
            </h3>
            <p className="text-xs text-stone-600 font-bold">{track.singer}</p>
          </div>

          <button
            type="button"
            onClick={handleCopyLyrics}
            className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-xs flex items-center gap-1 text-xs font-bold active:scale-95 transition-all"
            title="बोल कॉपी करें"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-stone-600" />}
            <span className="hidden sm:inline">{copied ? 'कॉपी हुआ' : 'शेयर'}</span>
          </button>
        </div>

        {/* Live Audio Visualizer & Playing Status */}
        <div className="bg-[#075985] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPlaying ? 'bg-[#F47B20] text-white animate-pulse' : 'bg-white/15 text-[#FFB52E]'}`}>
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-200 block">
                {isPlaying ? 'धुन व स्वर बज रहा है…' : 'गीत सुनने के लिए "गीत बजाएं" दबाएं'}
              </span>
              <span className="text-xs font-black text-white">
                पंक्ति {activeVerseIndex + 1} / {track.lyrics.length}
              </span>
            </div>
          </div>

          {/* Equalizer Wave when playing */}
          {isPlaying && (
            <div className="flex items-end gap-1 h-6 px-2">
              <span className="w-1 bg-[#FFB52E] rounded-full animate-bounce h-3" />
              <span className="w-1 bg-amber-300 rounded-full animate-bounce delay-100 h-5" />
              <span className="w-1 bg-white rounded-full animate-bounce delay-200 h-6" />
              <span className="w-1 bg-[#FFB52E] rounded-full animate-bounce delay-75 h-4" />
              <span className="w-1 bg-amber-200 rounded-full animate-bounce delay-150 h-2" />
            </div>
          )}
        </div>

        {/* Audio Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Main Play / Pause Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`min-h-[48px] px-5 rounded-2xl flex items-center gap-2 text-sm font-black shadow-md transition-all active:scale-95 ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-gradient-to-r from-[#F47B20] to-[#E65100] text-white hover:brightness-105'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>रोकें (Pause)</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>गीत बजाएं (Play Song)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="min-h-[48px] px-3.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all"
              title="गीत पुनः शुरू करें"
            >
              <RotateCcw className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">पुनः प्रारंभ</span>
            </button>
          </div>

          {/* Secondary Controls: Repeat & Mute & Speed */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                isLooping
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
              title={isLooping ? 'लूप सक्रिय (गीत दोहराया जाएगा)' : 'लूप बंद'}
            >
              <Repeat className="w-4 h-4" />
              <span className="text-[10px] hidden sm:inline">दोहराएं</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200"
              title={isMuted ? 'अनम्यूट करें' : 'म्यूट करें'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-stone-700" />}
            </button>

            {/* Speed Selector */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-white border border-stone-200 rounded-xl px-2 py-2 text-xs font-bold text-stone-800"
              title="गाने की गति चुनें"
            >
              <option value="0.8">०.८x (धीमी)</option>
              <option value="1.0">१.०x (सामान्य)</option>
              <option value="1.2">१.२x (तीव्र)</option>
            </select>
          </div>
        </div>

        {/* Interactive Lyrics Board with Real-Time Karaoke Highlighting */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 pb-1">
            <span>गीत के बोल (पंक्ति पर टैप करके वहीं से बजाएं):</span>
            <span className="text-amber-800 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              लाइव स्वर पाठ
            </span>
          </div>

          <div className="space-y-2 bg-white/95 rounded-2xl p-3 border border-amber-200/80 shadow-xs">
            {track.lyrics.map((line, lidx) => {
              const isActive = activeVerseIndex === lidx;
              return (
                <div
                  key={lidx}
                  onClick={() => handleSelectVerse(lidx)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-100 via-orange-100/90 to-amber-50 border-2 border-[#F47B20] text-stone-950 font-black shadow-xs scale-[1.01]'
                      : 'hover:bg-amber-50/60 text-stone-700 font-semibold border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isActive
                          ? 'bg-[#F47B20] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {isActive && isPlaying ? '♪' : lidx + 1}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed tracking-wide">
                      {line}
                    </span>
                  </div>

                  {isActive && isPlaying && (
                    <span className="text-xs text-[#F47B20] font-black animate-pulse shrink-0 ml-2">
                      बज रहा है ▶
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Meaning / Bhavarth */}
        <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-stone-700 space-y-1">
          <span className="font-black text-[#075985] block">भावार्थ:</span>
          <p className="leading-relaxed">{track.meaning}</p>
        </div>

        {/* Studio Recording Direct YouTube Link Button */}
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.youtubeQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[46px] rounded-2xl bg-[#CC0000] hover:bg-[#AA0000] active:scale-95 text-white flex items-center justify-center gap-2 text-xs font-black shadow-md transition-all"
        >
          <span>▶️ यूट्यूब पर शारदा सिन्हा जी के मूल स्टूडियो स्वर में सुनें</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

