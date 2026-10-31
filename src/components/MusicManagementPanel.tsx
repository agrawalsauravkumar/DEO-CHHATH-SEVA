/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Plus,
  Trash2,
  Edit2,
  Play,
  Pause,
  Upload,
  Check,
  AlertCircle,
  FileAudio,
  HardDrive,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';
import {
  ChhathSongTrack,
  AudioCacheService,
} from '../services/AudioCacheService';
import {
  ChhathSongsService,
} from '../data/chhathSongsData';

interface MusicManagementPanelProps {
  notify: (msg: string) => void;
}

export const MusicManagementPanel: React.FC<MusicManagementPanelProps> = ({ notify }) => {
  const [songs, setSongs] = useState<ChhathSongTrack[]>([]);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [singer, setSinger] = useState<string>('');
  const [category, setCategory] = useState<'GEET' | 'AARTI' | 'MANTRA' | 'BHAJAN'>('GEET');
  const [language, setLanguage] = useState<'Bhojpuri' | 'Maithili' | 'Hindi' | 'Sanskrit'>('Bhojpuri');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [meaning, setMeaning] = useState<string>('');
  const [lyricsText, setLyricsText] = useState<string>('');
  const [timestampedText, setTimestampedText] = useState<string>('');
  const [allowDownload, setAllowDownload] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Audio Preview State
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Storage stats
  const [storageStats, setStorageStats] = useState<{ usedFormatted: string; count: number }>({
    usedFormatted: '0 B',
    count: 0,
  });

  const loadSongs = () => {
    const list = ChhathSongsService.getAllSongs();
    setSongs(list);
  };

  const updateStorage = async () => {
    try {
      const stats = await AudioCacheService.getStorageUsage();
      setStorageStats({
        usedFormatted: stats.usedFormatted,
        count: stats.cachedSongCount,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSongs();
    updateStorage();
  }, []);

  const resetForm = () => {
    setEditingSongId(null);
    setTitle('');
    setSinger('');
    setCategory('GEET');
    setLanguage('Bhojpuri');
    setAudioUrl('');
    setAudioFile(null);
    setCoverUrl('');
    setTagline('');
    setMeaning('');
    setLyricsText('');
    setTimestampedText('');
    setAllowDownload(true);
    setFormError(null);
  };

  const handleOpenAddForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const handleEditSong = (song: ChhathSongTrack) => {
    setEditingSongId(song.id);
    setTitle(song.title);
    setSinger(song.singer);
    setCategory(song.category || 'GEET');
    setLanguage(song.language || 'Bhojpuri');
    setAudioUrl(song.audioUrl);
    setCoverUrl(song.coverUrl || '');
    setTagline(song.tagline || '');
    setMeaning(song.meaning || '');
    setLyricsText(song.lyrics ? song.lyrics.join('\n') : '');

    if (song.timestampedLyrics && song.timestampedLyrics.length > 0) {
      const formatted = song.timestampedLyrics
        .map((l) => {
          const m = Math.floor(l.time / 60);
          const s = Math.floor(l.time % 60);
          const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          return `[${timeStr}] ${l.text}`;
        })
        .join('\n');
      setTimestampedText(formatted);
    } else {
      setTimestampedText('');
    }

    setAllowDownload(song.allowDownload !== false);
    setFormOpen(true);
  };

  const handleDeleteSong = (id: string, titleStr: string) => {
    if (!window.confirm(`क्या आप गीत "${titleStr}" को हटाना चाहते हैं?`)) return;

    try {
      ChhathSongsService.deleteSong(id);
      AudioCacheService.removeCachedSong(id).catch(() => undefined);
      loadSongs();
      updateStorage();
      notify(`गीत "${titleStr}" सफलतापूर्वक हटा दिया गया।`);
      if (previewTrackId === id) {
        stopPreview();
      }
    } catch (e: unknown) {
      notify('गीत हटाने में त्रुटि हुई।');
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
        setFormError('कृपया केवल मान्य ऑडियो फ़ाइल (MP3, WAV, OGG, M4A) चुनें।');
        return;
      }
      setAudioFile(file);
      setFormError(null);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const parseTimestampedLyrics = (raw: string): Array<{ time: number; text: string }> => {
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    const result: Array<{ time: number; text: string }> = [];

    for (const line of lines) {
      const match = line.match(/^\[(\d{1,2}):(\d{2})\]\s*(.*)$/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const text = match[3];
        result.push({ time: minutes * 60 + seconds, text });
      } else {
        // Fallback without timestamp
        result.push({ time: result.length * 15, text: line });
      }
    }

    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('कृपया गीत का शीर्षक दर्ज करें।');
      return;
    }
    if (!singer.trim()) {
      setFormError('कृपया गायक/गायिका का नाम दर्ज करें।');
      return;
    }
    if (!audioFile && !audioUrl.trim()) {
      setFormError('कृपया ऑडियो फ़ाइल अपलोड करें या ऑडियो URL दर्ज करें।');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalAudioUrl = audioUrl.trim();

      // If a file was uploaded, convert to data URL or object URL
      if (audioFile) {
        finalAudioUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(audioFile);
        });
      }

      const songId = editingSongId || `admin-song-${Date.now()}`;
      const lyricsArray = lyricsText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const parsedTimestamps = timestampedText.trim()
        ? parseTimestampedLyrics(timestampedText)
        : lyricsArray.map((text, i) => ({ time: i * 20, text }));

      const newSong: ChhathSongTrack = {
        id: songId,
        title: title.trim(),
        singer: singer.trim(),
        category,
        language,
        duration: 240, // default fallback duration
        durationFormatted: '04:00',
        sizeFormatted: audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(1)} MB` : '4.5 MB',
        audioUrl: finalAudioUrl,
        coverUrl: coverUrl.trim() || '/branding/chhath-hero-banner.jpg',
        tagline: tagline.trim() || 'छठ महापर्व पावन गान',
        meaning: meaning.trim() || 'श्रद्धा और भक्ति का पावन समर्पण।',
        lyrics: lyricsArray,
        timestampedLyrics: parsedTimestamps,
        allowDownload,
      };

      ChhathSongsService.addSong(newSong);
      loadSongs();
      setFormOpen(false);
      resetForm();
      notify(`गीत "${newSong.title}" सफलतापूर्वक सहेज लिया गया।`);
    } catch (err: unknown) {
      console.error('Error saving song:', err);
      setFormError('गीत सहेजने में त्रुटि हुई। कृपया फ़ाइल का आकार जांचें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview Player
  const togglePreview = (song: ChhathSongTrack) => {
    const audio = previewAudioRef.current;
    if (!audio) return;

    if (previewTrackId === song.id && isPlayingPreview) {
      audio.pause();
      setIsPlayingPreview(false);
    } else {
      audio.src = song.audioUrl;
      setPreviewTrackId(song.id);
      audio
        .play()
        .then(() => setIsPlayingPreview(true))
        .catch(() => {
          notify('पूर्वावलोकन प्लेबैक विफल।');
          setIsPlayingPreview(false);
        });
    }
  };

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setIsPlayingPreview(false);
    setPreviewTrackId(null);
  };

  const handleClearAllAudioCache = async () => {
    if (!window.confirm('क्या आप सभी सहेजे गए ऑफ़लाइन ऑडियो कैशे को साफ करना चाहते हैं?')) return;
    await AudioCacheService.clearAllCache();
    await updateStorage();
    notify('ऑफ़लाइन ऑडियो कैशे सफलतापूर्वक खाली कर दिया गया।');
  };

  return (
    <div className="space-y-6">
      {/* Hidden audio for preview */}
      <audio
        ref={previewAudioRef}
        onEnded={() => setIsPlayingPreview(false)}
        onPause={() => setIsPlayingPreview(false)}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#111A35] to-[#070B19] text-white p-5 rounded-2xl border border-amber-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-2xl font-bold shadow-inner">
            <Music className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-amber-200">छठ संगीत एवं गीत प्रबंधन</h2>
            <p className="text-xs text-slate-300 font-medium">
              नए छठ गीत, भजन व आरती अपलोड करें, बोल संपादित करें और ऑफ़लाइन सेटिंग्स प्रबंधित करें।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleClearAllAudioCache}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            title="ब्राउज़र ऑफ़लाइन ऑडियो कैशे साफ़ करें"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span>कैशे साफ करें ({storageStats.usedFormatted})</span>
          </button>

          <button
            onClick={handleOpenAddForm}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>नया छठ गीत जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Song Add/Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] bg-[#0B132B] text-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/50">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-3.5 flex items-center justify-between text-white">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span>{editingSongId ? 'गीत संपादित करें' : 'नया छठ गीत जोड़ें'}</span>
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 transition text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-medium">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-amber-300 font-bold">गीत का शीर्षक (Song Title) *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="उदा: काँच ही बाँस के बहँगिया"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-hidden"
                    required
                  />
                </div>

                {/* Singer */}
                <div className="space-y-1">
                  <label className="text-amber-300 font-bold">गायक / गायिका (Singer) *</label>
                  <input
                    type="text"
                    value={singer}
                    onChange={(e) => setSinger(e.target.value)}
                    placeholder="उदा: शारदा सिन्हा / पारंपरिक लोक स्वर"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-hidden"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">श्रेणी (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-hidden"
                  >
                    <option value="GEET">छठ लोकगीत (Geet)</option>
                    <option value="AARTI">आरती (Aarti)</option>
                    <option value="MANTRA">मंत्र / स्तोत्र (Mantra)</option>
                    <option value="BHAJAN">भजन (Bhajan)</option>
                  </select>
                </div>

                {/* Language */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">भाषा (Language)</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-hidden"
                  >
                    <option value="Bhojpuri">भोजपुरी (Bhojpuri)</option>
                    <option value="Maithili">मैथिली (Maithili)</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Sanskrit">संस्कृत (Sanskrit)</option>
                  </select>
                </div>
              </div>

              {/* Audio Upload or URL */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-amber-300 font-bold block">
                  ऑडियो फ़ाइल (MP3 Audio Source) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">फ़ाइल अपलोड करें:</span>
                    <input
                      type="file"
                      accept="audio/*,.mp3,.ogg,.wav,.m4a"
                      onChange={handleAudioFileChange}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                    />
                    {audioFile && (
                      <span className="text-[10px] text-emerald-400 mt-1 block">
                        चयनित: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">अथवा ऑडियो URL:</span>
                    <input
                      type="url"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://.../song.mp3"
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-amber-400 focus:outline-hidden text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Artwork */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-amber-300 font-bold block">
                  कवर आर्टवर्क (Artwork Image)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-700 file:text-white cursor-pointer"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="/audio/artwork/bahangiya.svg या URL"
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-amber-400 focus:outline-hidden text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Tagline & Meaning */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">टैगलाइन / प्रसंग</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="उदा: सूप-दउरा उठाव व घाट प्रस्थान"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">भावार्थ (Meaning / Context)</label>
                  <input
                    type="text"
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                    placeholder="उदा: भगवान भास्कर के प्रति अनन्य श्रद्धा"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Download permission */}
              <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="allowDownload"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <label htmlFor="allowDownload" className="text-slate-200 cursor-pointer">
                  उपयोगकर्ताओं को ऑफ़लाइन डाउनलोड की अनुमति दें (Allow Offline Download)
                </label>
              </div>

              {/* Lyrics Text */}
              <div className="space-y-1">
                <label className="text-amber-300 font-bold">संपूर्ण गीत के बोल (Full Lyrics)</label>
                <textarea
                  rows={4}
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value)}
                  placeholder="प्रत्येक पंक्ति को नई लाइन में लिखें..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              {/* Timestamped Lyrics */}
              <div className="space-y-1">
                <label className="text-amber-300 font-bold flex items-center justify-between">
                  <span>लाइव सिंक टाइमस्टैम्प बोल (Timestamped Lyrics)</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    प्रारूप: [mm:ss] पंक्ति के बोल
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={timestampedText}
                  onChange={(e) => setTimestampedText(e.target.value)}
                  placeholder={`[00:00] काँच ही बाँस के बहँगिया, बहँगी लचकत जाए…\n[00:35] बहँगी लचकत जाए, बहँगी लचकत जाए…\n[01:08] बात जे पुछेले बटोहिया...`}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow transition"
                >
                  {isSubmitting ? 'सहेज रहे हैं...' : editingSongId ? 'अद्यतन करें' : 'गीत सहेजें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Song List Table */}
      <div className="bg-[#0B132B] rounded-2xl border border-slate-800 overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
            <span>सक्रिय छठ गीत संग्रह</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
              कुल {songs.length} गीत
            </span>
          </h3>
          <span className="text-xs text-slate-400">
            प्रत्येक गीत को प्ले करके जांचें अथवा बोल संपादित करें
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {songs.map((song) => {
            const isPlayingThis = previewTrackId === song.id && isPlayingPreview;

            return (
              <div
                key={song.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-900/50 transition"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700">
                    <img
                      src={song.coverUrl || '/branding/chhath-hero-banner.jpg'}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => togglePreview(song)}
                      className={`absolute inset-0 flex items-center justify-center transition ${
                        isPlayingThis
                          ? 'bg-amber-500/80 text-slate-950'
                          : 'bg-black/40 text-white hover:bg-amber-500/80 hover:text-slate-950'
                      }`}
                      title={isPlayingThis ? 'रोकें' : 'पूर्वावलोकन बजाएं'}
                    >
                      {isPlayingThis ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white truncate">{song.title}</h4>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded-full border border-amber-400/30">
                        {song.category || 'GEET'}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.2 rounded-full border border-slate-700">
                        {song.language || 'Bhojpuri'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{song.singer}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span>अवधि: {song.durationFormatted || '05:00'}</span>
                      <span>•</span>
                      <span>आकार: {song.sizeFormatted || '5.5 MB'}</span>
                      <span>•</span>
                      <span>
                        बोल पंक्तियां: {song.lyrics ? song.lyrics.length : 0} | टाइमस्टैम्प: {song.timestampedLyrics ? song.timestampedLyrics.length : 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => togglePreview(song)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      isPlayingThis
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                    }`}
                  >
                    {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingThis ? 'रोकें' : 'टेस्ट करें'}</span>
                  </button>

                  <button
                    onClick={() => handleEditSong(song)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 transition"
                    title="संपादित करें"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteSong(song.id, song.title)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
                    title="हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
