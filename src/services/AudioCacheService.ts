/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CachedAudioTrack {
  id: string;
  title: string;
  singer: string;
  audioBlob: Blob;
  mimeType: string;
  size: number;
  downloadedAt: number;
  verified: boolean;
}

export interface ChhathSongTrack {
  id: string;
  title: string;
  singer: string;
  category: 'GEET' | 'AARTI' | 'MANTRA' | 'BHAJAN';
  language: 'Bhojpuri' | 'Maithili' | 'Hindi' | 'Sanskrit';
  duration: number; // in seconds
  durationFormatted: string; // e.g. "06:01"
  sizeFormatted: string; // e.g. "5.5 MB"
  audioUrl: string;
  fallbackAudioUrl?: string;
  coverUrl: string;
  tagline: string;
  meaning: string;
  lyrics: string[];
  timestampedLyrics: Array<{ time: number; text: string }>;
  allowDownload?: boolean;
}

const DB_NAME = 'deo_chhath_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_tracks';

class AudioCacheServiceImpl {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private activeObjectUrls: Map<string, string> = new Map();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not supported on this platform.'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('AudioCacheService: Failed to open IndexedDB:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Check if a song is downloaded and available offline
   */
  async isSongCached(songId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise<boolean>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(songId);

        req.onsuccess = () => {
          const result = req.result as CachedAudioTrack | undefined;
          resolve(Boolean(result && result.verified && result.audioBlob && result.audioBlob.size > 1000));
        };

        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * Get all cached song IDs
   */
  async getAllCachedSongIds(): Promise<string[]> {
    try {
      const db = await this.getDB();
      return new Promise<string[]>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAllKeys();

        req.onsuccess = () => {
          resolve((req.result as string[]) || []);
        };

        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Retrieve cached audio Blob as an Object URL for offline playback
   */
  async getCachedAudioUrl(songId: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise<string | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(songId);

        req.onsuccess = () => {
          const item = req.result as CachedAudioTrack | undefined;
          if (item && item.audioBlob && item.audioBlob.size > 1000) {
            // Revoke any existing URL for this track
            const existing = this.activeObjectUrls.get(songId);
            if (existing) {
              URL.revokeObjectURL(existing);
            }
            const objectUrl = URL.createObjectURL(item.audioBlob);
            this.activeObjectUrls.set(songId, objectUrl);
            resolve(objectUrl);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Download a song completely and verify it before storing in IndexedDB
   */
  async downloadAndCacheSong(
    song: ChhathSongTrack,
    onProgress?: (pct: number) => void
  ): Promise<boolean> {
    try {
      if (onProgress) onProgress(5);

      const urlsToTry = [song.audioUrl];
      if (song.fallbackAudioUrl && song.fallbackAudioUrl !== song.audioUrl) {
        urlsToTry.push(song.fallbackAudioUrl);
      }

      let response: Response | null = null;
      let lastError: unknown = null;

      for (const url of urlsToTry) {
        try {
          const res = await fetch(url, { mode: 'cors' });
          if (res.ok) {
            response = res;
            break;
          }
        } catch (e) {
          lastError = e;
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Failed to fetch audio stream for "${song.title}": ${lastError || 'Network error'}`);
      }

      const contentLengthHeader = response.headers.get('content-length');
      const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
      let downloadedBytes = 0;

      let audioBlob: Blob;

      if (response.body && totalBytes > 0) {
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            downloadedBytes += value.length;
            if (onProgress && totalBytes > 0) {
              const pct = Math.min(95, Math.round((downloadedBytes / totalBytes) * 90) + 5);
              onProgress(pct);
            }
          }
        }

        const mime = response.headers.get('content-type') || 'audio/mpeg';
        audioBlob = new Blob(chunks as unknown as BlobPart[], { type: mime });
      } else {
        // Fallback standard blob reading
        if (onProgress) onProgress(50);
        audioBlob = await response.blob();
      }

      // Verification step: verify downloaded file size
      if (!audioBlob || audioBlob.size < 5000) {
        throw new Error('Downloaded audio file is invalid or incomplete (size too small).');
      }

      if (onProgress) onProgress(98);

      const db = await this.getDB();
      const trackRecord: CachedAudioTrack = {
        id: song.id,
        title: song.title,
        singer: song.singer,
        audioBlob,
        mimeType: audioBlob.type || 'audio/mpeg',
        size: audioBlob.size,
        downloadedAt: Date.now(),
        verified: true,
      };

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(trackRecord);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      if (onProgress) onProgress(100);
      return true;
    } catch (err) {
      console.error(`AudioCacheService download error for ${song.id}:`, err);
      throw err;
    }
  }

  /**
   * Remove cached song from IndexedDB
   */
  async removeCachedSong(songId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const existingUrl = this.activeObjectUrls.get(songId);
      if (existingUrl) {
        URL.revokeObjectURL(existingUrl);
        this.activeObjectUrls.delete(songId);
      }

      return new Promise<boolean>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(songId);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * Clear all cached audio files
   */
  async clearAllCache(): Promise<boolean> {
    try {
      const db = await this.getDB();
      this.activeObjectUrls.forEach((url) => URL.revokeObjectURL(url));
      this.activeObjectUrls.clear();

      return new Promise<boolean>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * Query storage usage and quota
   */
  async getStorageUsage(): Promise<{
    usedBytes: number;
    quotaBytes: number;
    usedFormatted: string;
    cachedSongCount: number;
  }> {
    let usedBytes = 0;
    let quotaBytes = 0;

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        usedBytes = estimate.usage || 0;
        quotaBytes = estimate.quota || 0;
      } catch {
        // Fallback
      }
    }

    const cachedIds = await this.getAllCachedSongIds();

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    return {
      usedBytes,
      quotaBytes,
      usedFormatted: formatBytes(usedBytes),
      cachedSongCount: cachedIds.length,
    };
  }

  /**
   * Save MP3 file directly to user device's storage (native file download)
   */
  async saveMp3ToDevice(song: ChhathSongTrack): Promise<boolean> {
    try {
      let blob: Blob | null = null;

      // Check if already in IndexedDB
      const db = await this.getDB();
      const cached = await new Promise<CachedAudioTrack | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(song.id);
        req.onsuccess = () => resolve((req.result as CachedAudioTrack) || null);
        req.onerror = () => resolve(null);
      });

      if (cached && cached.audioBlob) {
        blob = cached.audioBlob;
      } else {
        // Fetch audio
        const res = await fetch(song.audioUrl);
        if (!res.ok) throw new Error('Download failed from network.');
        blob = await res.blob();
      }

      if (!blob) throw new Error('No audio blob available');

      // Create download anchor
      const cleanTitle = song.title.replace(/[/\\?%*:|"<>]/g, '-').trim();
      const fileName = `${cleanTitle}.mp3`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.style.display = 'none';
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();

      setTimeout(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }, 2000);

      return true;
    } catch (err) {
      console.error('Save MP3 to Device failed:', err);
      throw err;
    }
  }
}

export const AudioCacheService = new AudioCacheServiceImpl();
