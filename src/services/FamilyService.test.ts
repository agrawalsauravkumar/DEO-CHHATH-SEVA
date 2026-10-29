/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { FamilyService } from './FamilyService';
import { CHHATH_FOLK_PLAYLIST } from '../components/ChhathSongPlayer';

// Mock simple localStorage for Node.js test environment if not present
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

test('FamilyService creates group with valid DEO invite code and adds owner', () => {
  localStorage.clear();
  const group = FamilyService.createFamilyGroup('हमारा प्रिय परिवार');

  assert.ok(group.id, 'Group ID must be present');
  assert.equal(group.name, 'हमारा प्रिय परिवार');
  assert.match(group.inviteCode, /^DEO-\d{4}$/, 'Invite code must follow DEO-XXXX format');

  const retrieved = FamilyService.getFamilyGroup();
  assert.ok(retrieved, 'Persisted group must be retrievable');
  assert.equal(retrieved?.id, group.id);

  const members = FamilyService.getFamilyMembers();
  assert.equal(members.length, 1, 'Owner member must be added on creation');
  assert.equal(members[0].role, 'OWNER');
});

test('FamilyService allows a member to join via invite code', () => {
  const currentGroup = FamilyService.getFamilyGroup();
  assert.ok(currentGroup, 'Group must exist from previous step');

  const joinResult = FamilyService.joinFamilyGroup(currentGroup.inviteCode, 'सोनू कुमार');
  assert.ok(joinResult.success, 'Join must succeed with correct invite code');

  const members = FamilyService.getFamilyMembers();
  assert.ok(members.length >= 1);
});

test('CHHATH_FOLK_PLAYLIST contains all 4 traditional folk tracks with valid melodies and lyrics', () => {
  assert.equal(CHHATH_FOLK_PLAYLIST.length, 4, 'Must have 4 sacred tracks');

  for (const track of CHHATH_FOLK_PLAYLIST) {
    assert.ok(track.title, 'Track title must be non-empty');
    assert.ok(track.singer, 'Singer note must be non-empty');
    assert.ok(track.lyrics.length > 0, 'Must have lyrics');
    assert.ok(track.melodyNotes.length > 0, 'Must have melody frequency notes');
    assert.ok(track.youtubeQuery.includes('शारदा सिन्हा'), 'YouTube query must feature Sharda Sinha');
  }
});

