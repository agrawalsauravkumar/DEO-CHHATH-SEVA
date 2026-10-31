/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  X,
  Music,
  Sparkles,
  BookOpen,
  Sun,
  HardDrive,
  Download,
  CheckCircle2,
} from 'lucide-react';
import {
  CHHATH_DEFAULT_PLAYLIST,
} from '../data/chhathSongsData';
import {
  AudioCacheService,
  ChhathSongTrack,
} from '../services/AudioCacheService';

export const ChhathDevotionalPlayer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isCached, setIsCached] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack: ChhathSongTrack = CHHATH_DEFAULT_PLAYLIST[activeTrackIndex] || CHHATH_DEFAULT_PLAYLIST[0];

  // Check if current track is in IndexedDB cache
  useEffect(() => {
    let isMounted = true;
    AudioCacheService.isSongCached(currentTrack.id).then((cached) => {
      if (isMounted) setIsCached(cached);
    });
    return () => {
      isMounted = false;
    };
  }, [currentTrack]);

  // Handle Play/Pause
  const togglePlayAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      try {
        // Check cache first
        const cachedUrl = await AudioCacheService.getCachedAudioUrl(currentTrack.id);
        audio.src = cachedUrl || currentTrack.audioUrl;
        await audio.play();
        setIsPlayingAudio(true);
      } catch (e) {
        console.warn('Playback failed:', e);
        // Fallback to streaming URL
        if (currentTrack.fallbackAudioUrl) {
          audio.src = currentTrack.fallbackAudioUrl;
          audio.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(false));
        }
      }
    }
  };

  // Change track
  const handleSelectTrack = async (idx: number) => {
    setActiveTrackIndex(idx);
    const newTrack = CHHATH_DEFAULT_PLAYLIST[idx];
    const audio = audioRef.current;
    if (audio && newTrack) {
      try {
        const cachedUrl = await AudioCacheService.getCachedAudioUrl(newTrack.id);
        audio.src = cachedUrl || newTrack.audioUrl;
        if (isPlayingAudio) {
          await audio.play();
        }
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md font-['Mukta',sans-serif] animate-fade-in">
      {/* Real HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlayingAudio(false)}
        onPause={() => setIsPlayingAudio(false)}
        onPlay={() => setIsPlayingAudio(true)}
      />

      <div className="w-full max-w-lg max-h-[90vh] bg-gradient-to-b from-[#0B132B] via-[#111A35] to-[#070B19] text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/40">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300 text-amber-200 flex items-center justify-center text-xl shrink-0 font-bold shadow-inner">
              🎵
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight">
                छठ लोकगीत व सूर्य वंदना
              </h3>
              <p className="text-xs text-amber-100">
                भक्तिमय वास्तविक छठ गीत एवं संपूर्ण बोल
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              setIsPlayingAudio(false);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient/Active Sound Bar */}
        <div className="bg-[#111A35] px-4 py-2.5 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-pulse">☀️</span>
            <div>
              <span className="text-xs font-bold text-amber-300 block leading-tight">
                {currentTrack.title}
              </span>
              <span className="text-[10px] text-slate-300">
                {isPlayingAudio ? 'गीत बज रहा है' : 'रोक दिया गया है'} • {currentTrack.durationFormatted}
              </span>
            </div>
          </div>

          <button
            onClick={togglePlayAudio}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
              isPlayingAudio
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 animate-pulse'
                : 'bg-slate-800 text-amber-300 border border-amber-400/30 hover:bg-slate-700'
            }`}
          >
            {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlayingAudio ? 'रोकें' : 'बजाएँ'}</span>
          </button>
        </div>

        {/* Track Selection Tabs */}
        <div className="flex gap-1.5 p-2 bg-[#070B19] overflow-x-auto text-xs font-bold border-b border-slate-800 shrink-0">
          {CHHATH_DEFAULT_PLAYLIST.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => handleSelectTrack(idx)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTrackIndex === idx
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {track.title}
            </button>
          ))}
        </div>

        {/* Track Content & Lyrics */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="bg-[#111A35] rounded-2xl p-4 border border-amber-500/30 shadow space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                पारंपरिक छठ लोकगीत
              </span>
              <span className="text-xs text-slate-400 font-medium">{currentTrack.singer}</span>
            </div>
            <h4 className="text-lg font-bold text-amber-200">{currentTrack.title}</h4>

            {currentTrack.meaning && (
              <p className="text-xs text-sky-200 font-medium bg-sky-950/40 p-2.5 rounded-xl border border-sky-800/40">
                {currentTrack.meaning}
              </p>
            )}
          </div>

          {/* Lyrics Box */}
          <div className="bg-[#111A35]/80 rounded-2xl p-5 border border-slate-800 shadow space-y-3 text-center">
            {currentTrack.lyrics.map((line, idx) => (
              <p
                key={idx}
                className="text-base sm:text-lg font-bold text-amber-100 leading-relaxed font-['Mukta',sans-serif]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#070B19] border-t border-slate-800 text-center">
          <p className="text-xs text-amber-300/80 font-medium">
            🙏 भगवान भुवन भास्कर व छठी मैया आप सभी की मनोकामनाएं पूर्ण करें।
          </p>
        </div>
      </div>
    </div>
  );
};
