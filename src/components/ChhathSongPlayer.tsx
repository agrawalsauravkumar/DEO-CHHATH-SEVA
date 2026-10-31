/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Download,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  HardDrive,
  FileDown,
  BookOpen,
  Music,
  Share2,
  Check,
  Sparkles,
  Wifi,
  WifiOff,
  Sun,
  Flame,
} from 'lucide-react';
import {
  AudioCacheService,
  ChhathSongTrack,
} from '../services/AudioCacheService';
import {
  ChhathSongsService,
  CHHATH_DEFAULT_PLAYLIST,
} from '../data/chhathSongsData';

export interface ChhathFolkTrack {
  id: string;
  title: string;
  singer: string;
  tagline: string;
  lyrics: string[];
  meaning: string;
  youtubeQuery: string;
  melodyNotes: number[][];
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
    singer: 'पारंपरिक सांध्य व उषा अर्घ्य गान (शारदा सिन्हा)',
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
    singer: 'पारंपरिक मांगलिक अर्घ्य गीत (शारदा सिन्हा)',
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
    singer: 'छठ व्रत संकल्प व समर्पण गान (शारदा सिन्हा)',
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

export interface ChhathSongPlayerProps {
  currentTrackIndex?: number;
  onSelectTrack?: (index: number) => void;
  initialSongId?: string;
  onClose?: () => void;
}

export const ChhathSongPlayer: React.FC<ChhathSongPlayerProps> = ({
  currentTrackIndex = 0,
  onSelectTrack,
}) => {
  const [playlist, setPlaylist] = useState<ChhathSongTrack[]>(() => ChhathSongsService.getAllSongs());
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(currentTrackIndex);
  const [activeTab, setActiveTab] = useState<'NOW_PLAYING' | 'PLAYLIST' | 'OFFLINE' | 'LYRICS'>('NOW_PLAYING');

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [repeatMode, setRepeatMode] = useState<'NONE' | 'ALL' | 'ONE'>('ALL');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Offline / Cache state
  const [cachedSongIds, setCachedSongIds] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [downloadErrors, setDownloadErrors] = useState<Record<string, string>>({});
  const [storageInfo, setStorageInfo] = useState<{ usedFormatted: string; count: number }>({
    usedFormatted: '0 B',
    count: 0,
  });
  const [isPlayingFromCache, setIsPlayingFromCache] = useState<boolean>(false);

  // Synchronized Lyrics
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(-1);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const isSeekingRef = useRef<boolean>(false);

  // Active track
  const currentTrack: ChhathSongTrack = useMemo(() => {
    return playlist[activeTrackIndex] || playlist[0] || ({} as ChhathSongTrack);
  }, [playlist, activeTrackIndex]);

  // Sync external index changes
  useEffect(() => {
    if (typeof currentTrackIndex === 'number' && currentTrackIndex !== activeTrackIndex) {
      setActiveTrackIndex(currentTrackIndex);
    }
  }, [currentTrackIndex]);

  // Refresh cache status on mount
  const refreshCacheStatus = useCallback(async () => {
    try {
      const ids = await AudioCacheService.getAllCachedSongIds();
      setCachedSongIds(new Set(ids));
      const storage = await AudioCacheService.getStorageUsage();
      setStorageInfo({
        usedFormatted: storage.usedFormatted,
        count: storage.cachedSongCount,
      });
    } catch (e) {
      console.warn('Error reading audio cache status:', e);
    }
  }, []);

  useEffect(() => {
    refreshCacheStatus();
  }, [refreshCacheStatus]);

  // Load and play track
  const loadTrackSource = useCallback(
    async (track: ChhathSongTrack, autoPlay: boolean = false) => {
      if (!audioRef.current || !track) return;
      setIsLoadingAudio(true);
      setPlaybackError(null);

      try {
        // 1. Check if downloaded in IndexedDB
        const isCached = await AudioCacheService.isSongCached(track.id);
        let audioSrc: string | null = null;

        if (isCached) {
          audioSrc = await AudioCacheService.getCachedAudioUrl(track.id);
          setIsPlayingFromCache(true);
        }

        // 2. If not in IndexedDB, use bundled local URL or network URL
        if (!audioSrc) {
          audioSrc = track.audioUrl;
          setIsPlayingFromCache(false);
        }

        const audio = audioRef.current;
        audio.src = audioSrc;
        audio.playbackRate = playbackSpeed;
        audio.volume = isMuted ? 0 : volume;

        if (autoPlay) {
          try {
            await audio.play();
            setIsPlaying(true);
            setPlaybackError(null);
          } catch (playErr: unknown) {
            console.warn('AutoPlay blocked or failed:', playErr);
            setIsPlaying(false);
            setPlaybackError('ऑडियो शुरू करने हेतु प्ले (▶) बटन दबाएं');
          }
        }
      } catch (err: unknown) {
        console.error('Failed to load track source:', err);
        setPlaybackError('ऑडियो लोड करने में असमर्थ। कृपया नेटवर्क या ऑफ़लाइन डाउनलोड जांचें।');
        setIsPlaying(false);
      } finally {
        setIsLoadingAudio(false);
      }
    },
    [playbackSpeed, isMuted, volume]
  );

  // When track index changes, load the new track
  useEffect(() => {
    if (currentTrack?.id) {
      loadTrackSource(currentTrack, isPlaying);
    }
    // Inform parent if callback provided
    if (onSelectTrack && activeTrackIndex !== currentTrackIndex) {
      onSelectTrack(activeTrackIndex);
    }
  }, [activeTrackIndex]);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || currentTrack.duration || 0);
      setIsLoadingAudio(false);
    };

    const handleTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setCurrentTime(audio.currentTime);
      }

      // Synchronize lyrics based on current timestamp
      if (currentTrack?.timestampedLyrics && currentTrack.timestampedLyrics.length > 0) {
        const cur = audio.currentTime;
        let matchedIndex = -1;
        for (let i = 0; i < currentTrack.timestampedLyrics.length; i++) {
          if (cur >= currentTrack.timestampedLyrics[i].time) {
            matchedIndex = i;
          } else {
            break;
          }
        }
        if (matchedIndex !== activeLyricIndex) {
          setActiveLyricIndex(matchedIndex);
          // Scroll active lyric verse smoothly into view
          const activeEl = document.getElementById(`lyric-line-${matchedIndex}`);
          if (activeEl && lyricsContainerRef.current) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    };

    const handleEnded = () => {
      if (repeatMode === 'ONE') {
        audio.currentTime = 0;
        audio.play().catch(() => undefined);
      } else if (repeatMode === 'ALL') {
        handleNextTrack();
      } else {
        // NONE
        if (activeTrackIndex < playlist.length - 1) {
          handleNextTrack();
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      }
    };

    const handleError = () => {
      console.warn('Audio element error encountered. Attempting fallback...');
      if (currentTrack.fallbackAudioUrl && audio.src !== currentTrack.fallbackAudioUrl) {
        audio.src = currentTrack.fallbackAudioUrl;
        audio.play().catch(() => {
          setPlaybackError('ऑडियो प्लेबैक त्रुटि।');
          setIsPlaying(false);
          setIsLoadingAudio(false);
        });
      } else {
        setPlaybackError('ऑडियो स्ट्रीम उपलब्ध नहीं है।');
        setIsPlaying(false);
        setIsLoadingAudio(false);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, activeLyricIndex, repeatMode, activeTrackIndex, playlist.length]);

  // Audio control functions
  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsLoadingAudio(true);
        if (!audio.src || audio.src === '' || audio.src.endsWith('/')) {
          await loadTrackSource(currentTrack, true);
        } else {
          await audio.play();
          setIsPlaying(true);
        }
      } catch (err) {
        console.error('Play failed:', err);
        setPlaybackError('गीत प्रारंभ नहीं हो सका।');
      } finally {
        setIsLoadingAudio(false);
      }
    }
  };

  const handleNextTrack = () => {
    if (playlist.length === 0) return;
    if (isShuffle) {
      let randIdx = Math.floor(Math.random() * playlist.length);
      if (randIdx === activeTrackIndex && playlist.length > 1) {
        randIdx = (randIdx + 1) % playlist.length;
      }
      setActiveTrackIndex(randIdx);
    } else {
      setActiveTrackIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const handlePrevTrack = () => {
    if (playlist.length === 0) return;
    const audio = audioRef.current;
    // If more than 3 seconds in, restart track
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setActiveTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const handleSeek = (newTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      setIsMuted(false);
      audioRef.current.volume = volume > 0 ? volume : 0.8;
    } else {
      setIsMuted(true);
      audioRef.current.volume = 0;
    }
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'ALL') return 'ONE';
      if (prev === 'ONE') return 'NONE';
      return 'ALL';
    });
  };

  // Download Handler with Progress
  const handleDownloadTrack = async (track: ChhathSongTrack) => {
    const songId = track.id;
    try {
      setDownloadErrors((prev) => ({ ...prev, [songId]: '' }));
      setDownloadProgress((prev) => ({ ...prev, [songId]: 5 }));

      await AudioCacheService.downloadAndCacheSong(track, (pct) => {
        setDownloadProgress((prev) => ({ ...prev, [songId]: pct }));
      });

      await refreshCacheStatus();
      setDownloadProgress((prev) => {
        const copy = { ...prev };
        delete copy[songId];
        return copy;
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'डाउनलोड विफल हुआ।';
      setDownloadErrors((prev) => ({ ...prev, [songId]: errMsg }));
      setDownloadProgress((prev) => {
        const copy = { ...prev };
        delete copy[songId];
        return copy;
      });
    }
  };

  // Delete cached song
  const handleDeleteCachedTrack = async (songId: string) => {
    try {
      await AudioCacheService.removeCachedSong(songId);
      await refreshCacheStatus();
      if (currentTrack.id === songId && isPlayingFromCache) {
        setIsPlayingFromCache(false);
      }
    } catch (err) {
      console.warn('Error removing cached song:', err);
    }
  };

  // Native MP3 Save to device
  const handleSaveMp3ToDevice = async (track: ChhathSongTrack) => {
    try {
      await AudioCacheService.saveMp3ToDevice(track);
    } catch {
      alert('डिवाइस में डाउनलोड असफल रहा। कृपया इंटरनेट कनेक्शन जांचें।');
    }
  };

  // Jump audio playback to specific lyric timestamp
  const handleSeekToLyric = (timeSec: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = timeSec;
    setCurrentTime(timeSec);
    if (!isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => undefined);
    }
  };

  // Copy song lyrics & details to clipboard
  const handleShareSong = () => {
    const shareText = `🎵 ${currentTrack.title}\n🎤 ${currentTrack.singer}\n\nबोल:\n${currentTrack.lyrics?.join('\n')}\n\n— देव छठ सेवा (NextGen DevBhoomi Foundation)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtered offline songs
  const offlineSongs = useMemo(() => {
    return playlist.filter((track) => cachedSongIds.has(track.id));
  }, [playlist, cachedSongIds]);

  return (
    <div className="w-full bg-[#0B132B] text-slate-100 rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Hidden real HTML5 audio engine */}
      <audio ref={audioRef} preload="metadata" />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300 flex items-center justify-center text-amber-200">
            <Sun className="w-5 h-5 animate-spin-slow text-amber-200" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>छठ पावन संगीत वाटिका</span>
              <span className="text-[10px] bg-amber-950/60 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30">
                100% पावन
              </span>
            </h2>
            <p className="text-xs text-amber-100/90 font-medium">
              श्रद्धा, भक्ति और लोक संस्कृति का अनुपम संगम
            </p>
          </div>
        </div>

        {/* Offline Badge & Share */}
        <div className="flex items-center space-x-1.5">
          {isPlayingFromCache ? (
            <span className="flex items-center text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-semibold shadow-inner">
              <WifiOff className="w-3 h-3 mr-1 text-emerald-400" />
              ऑफ़लाइन
            </span>
          ) : (
            <span className="flex items-center text-[11px] bg-sky-950/80 text-sky-300 border border-sky-500/40 px-2 py-1 rounded-full">
              <Wifi className="w-3 h-3 mr-1 text-sky-400" />
              लाइव
            </span>
          )}

          <button
            onClick={handleShareSong}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition text-white"
            title="गीत व बोल साझा करें"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-[#070B19]/80 px-2 pt-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('NOW_PLAYING')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'NOW_PLAYING'
              ? 'border-amber-400 text-amber-300 font-bold bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>अब बज रहा है</span>
        </button>

        <button
          onClick={() => setActiveTab('PLAYLIST')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'PLAYLIST'
              ? 'border-amber-400 text-amber-300 font-bold bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>गीत सूची ({playlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('OFFLINE')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'OFFLINE'
              ? 'border-emerald-400 text-emerald-300 font-bold bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>ऑफ़लाइन गीत ({cachedSongIds.size})</span>
        </button>

        <button
          onClick={() => setActiveTab('LYRICS')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'LYRICS'
              ? 'border-amber-400 text-amber-300 font-bold bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>सम्पूर्ण बोल (Lyrics)</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-4">
        {/* TAB 1: NOW PLAYING */}
        {activeTab === 'NOW_PLAYING' && (
          <div className="space-y-4">
            {/* Song Info & Artwork */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#111A35] p-3.5 rounded-xl border border-amber-500/20 shadow-inner">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden border border-amber-400/40 shadow-lg bg-slate-900 group">
                <img
                  src={currentTrack.coverUrl || '/branding/chhath-hero-banner.jpg'}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {isPlaying && (
                  <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                    <span className="w-1 h-3 bg-amber-400 animate-pulse rounded-full" />
                    <span className="w-1 h-5 bg-amber-300 animate-pulse delay-75 rounded-full" />
                    <span className="w-1 h-2 bg-amber-400 animate-pulse delay-150 rounded-full" />
                  </div>
                )}
                {cachedSongIds.has(currentTrack.id) && (
                  <div className="absolute top-1.5 right-1.5 bg-emerald-600/90 text-white rounded-full p-1 shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                  <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                    {currentTrack.category || 'पारंपरिक गीत'}
                  </span>
                  <span className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                    {currentTrack.language || 'भोजपुरी'}
                  </span>
                  {cachedSongIds.has(currentTrack.id) && (
                    <span className="text-[11px] font-medium bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ऑफ़लाइन सुरक्षित ({currentTrack.sizeFormatted || '5.5 MB'})
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-amber-200 truncate">
                  {currentTrack.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mb-1 truncate">
                  {currentTrack.singer}
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                  {currentTrack.tagline || currentTrack.meaning}
                </p>

                {/* Error Banner */}
                {playbackError && (
                  <div className="mt-2 text-xs bg-rose-950/80 text-rose-300 border border-rose-500/40 px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{playbackError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Seek Bar & Timers */}
            <div className="space-y-1 bg-[#111A35]/60 p-3 rounded-xl border border-slate-800">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || currentTrack.duration || 100}
                  value={currentTime}
                  onMouseDown={() => {
                    isSeekingRef.current = true;
                  }}
                  onTouchStart={() => {
                    isSeekingRef.current = true;
                  }}
                  onChange={(e) => {
                    setCurrentTime(parseFloat(e.target.value));
                  }}
                  onMouseUp={(e) => {
                    isSeekingRef.current = false;
                    handleSeek(parseFloat((e.target as HTMLInputElement).value));
                  }}
                  onTouchEnd={(e) => {
                    isSeekingRef.current = false;
                    handleSeek(parseFloat((e.target as HTMLInputElement).value));
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300 transition"
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span className="text-amber-300 font-semibold">{formatTime(currentTime)}</span>
                <span>{formatTime(duration || currentTrack.duration || 0)}</span>
              </div>
            </div>

            {/* Main Player Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#111A35] p-3 rounded-xl border border-amber-500/20">
              {/* Shuffle & Repeat */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsShuffle((prev) => !prev)}
                  className={`p-2 rounded-lg transition ${
                    isShuffle
                      ? 'text-amber-300 bg-amber-500/20 border border-amber-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="शफल मोड"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={toggleRepeat}
                  className={`p-2 rounded-lg transition text-xs font-semibold flex items-center gap-1 ${
                    repeatMode !== 'NONE'
                      ? 'text-amber-300 bg-amber-500/20 border border-amber-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`दोहराएं: ${repeatMode}`}
                >
                  <Repeat className="w-4 h-4" />
                  {repeatMode === 'ONE' && <span className="text-[10px]">1</span>}
                </button>
              </div>

              {/* Prev / Play / Next */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevTrack}
                  className="p-2.5 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition"
                  title="पिछला गीत"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlayPause}
                  disabled={isLoadingAudio}
                  className="w-13 h-13 p-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 active:scale-95 transition shadow-lg shadow-amber-500/30 flex items-center justify-center font-bold"
                  title={isPlaying ? 'रोकें (Pause)' : 'बजाएं (Play)'}
                >
                  {isLoadingAudio ? (
                    <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  className="p-2.5 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition"
                  title="अगला गीत"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Speed & Volume */}
              <div className="flex items-center space-x-2">
                {/* Speed selector */}
                <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
                  <span className="text-[10px] text-slate-400">गति:</span>
                  {[0.75, 1.0, 1.25].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        playbackSpeed === spd
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Volume slider */}
                <div className="hidden sm:flex items-center space-x-1.5">
                  <button onClick={toggleMute} className="text-slate-400 hover:text-white p-1">
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Offline Download Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0E172F] p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300 font-medium">ऑफ़लाइन उपलब्धता:</span>
                {cachedSongIds.has(currentTrack.id) ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> सुरक्षित (बिना इंटरनेट सुन सकते हैं)
                  </span>
                ) : (
                  <span className="text-slate-400">डाउनलोड नहीं किया गया है</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {cachedSongIds.has(currentTrack.id) ? (
                  <button
                    onClick={() => handleDeleteCachedTrack(currentTrack.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition text-xs"
                    title="कैशे से हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>कैशे हटाएं</span>
                  </button>
                ) : downloadProgress[currentTrack.id] !== undefined ? (
                  <div className="flex items-center gap-2 bg-amber-950/60 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>डाउनलोड हो रहा है... {downloadProgress[currentTrack.id]}%</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownloadTrack(currentTrack)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow transition text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ऑफ़लाइन डाउनलोड करें</span>
                  </button>
                )}

                {/* Save MP3 directly to device */}
                <button
                  onClick={() => handleSaveMp3ToDevice(currentTrack)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-xs"
                  title="फोन में MP3 फाइल सेव करें"
                >
                  <FileDown className="w-3.5 h-3.5 text-sky-400" />
                  <span>फोन में MP3 सेव करें</span>
                </button>
              </div>
            </div>

            {/* Synchronized Lyrics Preview */}
            <div className="bg-[#111A35] rounded-xl border border-amber-500/20 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>लाइव सिंक गीत के बोल (Synchronized Lyrics)</span>
                </h4>
                <span className="text-[11px] text-slate-400 italic">
                  (किसी भी पंक्ति पर क्लिक करके वहां से सुनें)
                </span>
              </div>

              <div
                ref={lyricsContainerRef}
                className="max-h-56 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-amber-500/30"
              >
                {currentTrack.timestampedLyrics && currentTrack.timestampedLyrics.length > 0 ? (
                  currentTrack.timestampedLyrics.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    return (
                      <div
                        id={`lyric-line-${idx}`}
                        key={idx}
                        onClick={() => handleSeekToLyric(line.time)}
                        className={`p-2.5 rounded-lg cursor-pointer transition text-left duration-200 flex items-start gap-2.5 ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-200 font-bold border-l-4 border-amber-400 shadow-md scale-[1.01]'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <span className="text-[11px] font-mono text-amber-400/70 pt-0.5 flex-shrink-0">
                          {formatTime(line.time)}
                        </span>
                        <span className="text-sm leading-relaxed">{line.text}</span>
                        {isActive && (
                          <span className="ml-auto flex items-center gap-1 text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30 flex-shrink-0">
                            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                            सक्रिय
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-slate-400 text-xs">
                    {currentTrack.lyrics?.map((line, idx) => (
                      <p key={idx} className="py-1">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLAYLIST */}
        {activeTab === 'PLAYLIST' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>छठ महापर्व के अमर लोकगीत एवं अर्घ्य प्रार्थना</span>
              <span>कुल {playlist.length} गीत</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {playlist.map((track, idx) => {
                const isSelected = idx === activeTrackIndex;
                const isCached = cachedSongIds.has(track.id);
                const isDownloading = downloadProgress[track.id] !== undefined;

                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400/60 shadow-md'
                        : 'bg-[#111A35] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      onClick={() => {
                        setActiveTrackIndex(idx);
                        setActiveTab('NOW_PLAYING');
                        loadTrackSource(track, true);
                      }}
                      className="flex items-center space-x-3 flex-1 cursor-pointer min-w-0 pr-2"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-700">
                        <img
                          src={track.coverUrl || '/branding/chhath-hero-banner.jpg'}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && isPlaying && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="flex space-x-0.5">
                              <span className="w-1 h-3 bg-amber-400 animate-pulse rounded-full" />
                              <span className="w-1 h-5 bg-amber-300 animate-pulse delay-75 rounded-full" />
                              <span className="w-1 h-2 bg-amber-400 animate-pulse delay-150 rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            className={`text-sm font-bold truncate ${
                              isSelected ? 'text-amber-300' : 'text-slate-100'
                            }`}
                          >
                            {track.title}
                          </h4>
                          {isCached && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                              ऑफ़लाइन
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{track.singer}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span>{track.durationFormatted || '05:00'}</span>
                          <span>•</span>
                          <span>{track.sizeFormatted || '5.5 MB'}</span>
                          <span>•</span>
                          <span>{track.language || 'भोजपुरी'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Download / Play */}
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {isCached ? (
                        <button
                          onClick={() => handleDeleteCachedTrack(track.id)}
                          className="p-2 rounded-lg bg-emerald-950/60 hover:bg-rose-950/80 text-emerald-400 hover:text-rose-300 border border-emerald-500/30 hover:border-rose-500/40 transition"
                          title="ऑफ़लाइन उपलब्ध (क्लिक करके हटाएं)"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      ) : isDownloading ? (
                        <div
                          className="p-2 text-amber-400 flex items-center justify-center"
                          title={`डाउनलोड हो रहा है: ${downloadProgress[track.id]}%`}
                        >
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDownloadTrack(track)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-400/40 transition"
                          title="ऑफ़लाइन डाउनलोड करें"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (isSelected) {
                            togglePlayPause();
                          } else {
                            setActiveTrackIndex(idx);
                            setActiveTab('NOW_PLAYING');
                            loadTrackSource(track, true);
                          }
                        }}
                        className={`p-2 rounded-lg transition ${
                          isSelected && isPlaying
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                        }`}
                        title={isSelected && isPlaying ? 'रोकें' : 'बजाएं'}
                      >
                        {isSelected && isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: OFFLINE SONGS */}
        {activeTab === 'OFFLINE' && (
          <div className="space-y-4">
            <div className="bg-[#111A35] p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4" />
                  <span>ऑफ़लाइन सुरक्षित ऑडियो लाइब्रेरी</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  ये गीत आपके ब्राउज़र IndexedDB में सुरक्षित हैं। बिना इंटरनेट कहीं भी बजाएं।
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-amber-300">{storageInfo.count} गीत</span>
                <p className="text-slate-400 text-[11px]">{storageInfo.usedFormatted} प्रयुक्त</p>
              </div>
            </div>

            {offlineSongs.length === 0 ? (
              <div className="text-center py-8 bg-[#111A35]/40 rounded-xl border border-slate-800 space-y-3">
                <WifiOff className="w-10 h-10 text-slate-500 mx-auto" />
                <h5 className="text-sm font-semibold text-slate-300">
                  अभी कोई गीत ऑफ़लाइन डाउनलोड नहीं किया गया है
                </h5>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  गीत सूची में जाकर किसी भी गीत के आगे दिए गए डाउनलोड बटन (
                  <Download className="w-3 h-3 inline text-amber-400" />) पर क्लिक करें ताकि आप
                  बिना इंटरनेट भी छठ गीत सुन सकें।
                </p>
                <button
                  onClick={() => setActiveTab('PLAYLIST')}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-lg text-xs shadow hover:opacity-90 transition"
                >
                  गीत सूची देखें
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {offlineSongs.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#111A35] border border-emerald-500/20 hover:border-emerald-500/40 transition"
                  >
                    <div
                      onClick={() => {
                        const targetIdx = playlist.findIndex((p) => p.id === track.id);
                        if (targetIdx >= 0) {
                          setActiveTrackIndex(targetIdx);
                          setActiveTab('NOW_PLAYING');
                          loadTrackSource(track, true);
                        }
                      }}
                      className="flex items-center space-x-3 flex-1 cursor-pointer min-w-0 pr-2"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-700">
                        <img
                          src={track.coverUrl || '/branding/chhath-hero-banner.jpg'}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-100 truncate">{track.title}</h4>
                        <p className="text-xs text-slate-400 truncate">{track.singer}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSaveMp3ToDevice(track)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition"
                        title="फोन स्टोरेज में MP3 सेव करें"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteCachedTrack(track.id)}
                        className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition"
                        title="ऑफ़लाइन कैशे से हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          const targetIdx = playlist.findIndex((p) => p.id === track.id);
                          if (targetIdx >= 0) {
                            setActiveTrackIndex(targetIdx);
                            setActiveTab('NOW_PLAYING');
                            loadTrackSource(track, true);
                          }
                        }}
                        className="p-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
                        title="बजाएं"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COMPLETE LYRICS (READING MODE) */}
        {activeTab === 'LYRICS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#111A35] p-3 rounded-xl border border-amber-500/20">
              <div>
                <h4 className="text-base font-bold text-amber-200">{currentTrack.title}</h4>
                <p className="text-xs text-slate-300 font-medium">स्वर: {currentTrack.singer}</p>
              </div>
              <button
                onClick={handleShareSong}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-xs transition"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedShare ? 'कॉपी हुआ!' : 'बोल शेयर करें'}</span>
              </button>
            </div>

            <div className="bg-[#111A35]/70 rounded-xl border border-slate-800 p-5 space-y-4 text-center leading-relaxed font-serif">
              {currentTrack.lyrics?.map((verse, idx) => (
                <p key={idx} className="text-base sm:text-lg text-amber-100 font-medium tracking-wide">
                  {verse}
                </p>
              ))}
            </div>

            <div className="bg-amber-950/40 rounded-xl border border-amber-500/30 p-3.5 text-xs text-amber-200/90 leading-relaxed">
              <span className="font-bold text-amber-300">भावार्थ: </span>
              {currentTrack.meaning}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
