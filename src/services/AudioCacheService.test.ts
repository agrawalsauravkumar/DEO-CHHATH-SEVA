/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { CHHATH_DEFAULT_PLAYLIST, ChhathSongsService } from '../data/chhathSongsData';
import { AudioCacheService, ChhathSongTrack } from './AudioCacheService';

// Ensure mock localStorage
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    length: 0,
  } as unknown as Storage;
}

test('CHHATH_DEFAULT_PLAYLIST contains all 10 authentic full audio tracks', () => {
  assert.equal(CHHATH_DEFAULT_PLAYLIST.length, 10, 'Must contain 10 full audio tracks');

  for (const track of CHHATH_DEFAULT_PLAYLIST) {
    assert.ok(track.id, 'Track ID must be present');
    assert.ok(track.title, 'Track title must be present');
    assert.ok(track.singer, 'Singer name must be present');
    assert.ok(track.audioUrl.endsWith('.mp3'), `Track ${track.id} must point to a valid .mp3 file`);
    assert.ok(track.duration > 0, `Track ${track.id} must have non-zero duration`);
    assert.ok(track.lyrics && track.lyrics.length > 0, `Track ${track.id} must have Hindi/Bhojpuri lyrics`);
    assert.ok(track.timestampedLyrics && track.timestampedLyrics.length > 0, `Track ${track.id} must have timestamped lyrics for live sync`);
    assert.equal(track.allowDownload, true, `Track ${track.id} must allow download`);
  }
});

test('ChhathSongsService allows adding, retrieving and deleting admin custom songs', () => {
  localStorage.clear();

  const customSong: ChhathSongTrack = {
    id: 'test-custom-track-99',
    title: 'देव सूर्य देव वंदना',
    singer: 'पंडित रमेश शास्त्री',
    category: 'MANTRA',
    language: 'Hindi',
    duration: 180,
    durationFormatted: '03:00',
    sizeFormatted: '3.2 MB',
    audioUrl: '/audio/chhath/custom-vandana.mp3',
    coverUrl: '/audio/artwork/suraj-dev.svg',
    tagline: 'दैनिक सूर्य वंदना',
    meaning: 'भगवान सूर्य का दैनिक स्मरण',
    lyrics: ['ॐ मित्राय नमः', 'ॐ रवये नमः'],
    timestampedLyrics: [
      { time: 0, text: 'ॐ मित्राय नमः' },
      { time: 10, text: 'ॐ रवये नमः' },
    ],
    allowDownload: true,
  };

  // 1. Add song
  ChhathSongsService.addSong(customSong);

  // 2. Retrieve
  const allSongs = ChhathSongsService.getAllSongs();
  assert.equal(allSongs.length, 11, 'Should now have 11 songs (1 custom + 10 default)');
  const found = ChhathSongsService.getSongById('test-custom-track-99');
  assert.ok(found, 'Added custom song must be retrievable by ID');
  assert.equal(found?.title, 'देव सूर्य देव वंदना');

  // 3. Delete song
  ChhathSongsService.deleteSong('test-custom-track-99');
  const remaining = ChhathSongsService.getAllSongs();
  assert.equal(remaining.length, 10, 'Should be back to 10 default songs after deletion');
  assert.equal(ChhathSongsService.getSongById('test-custom-track-99'), undefined);
});

test('Timestamped lyrics contain chronological timestamps for accurate audio seek', () => {
  for (const track of CHHATH_DEFAULT_PLAYLIST) {
    let lastTime = -1;
    for (const verse of track.timestampedLyrics) {
      assert.ok(verse.time >= lastTime, `Verses in ${track.title} must be in non-decreasing time order`);
      assert.ok(verse.text.trim().length > 0, `Verse text must not be empty`);
      lastTime = verse.time;
    }
  }
});

