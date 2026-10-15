import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeVerifiedAnnouncement } from './VerifiedAnnouncementValidation';

const now = Date.parse('2026-10-15T12:00:00.000Z');
const validAnnouncement = {
  id: 'announcement-1',
  title: 'अधिकृत सूचना',
  shortDescription: 'सत्यापित सार्वजनिक सूचना',
  category: 'GENERAL',
  priority: 'NORMAL',
  status: 'PUBLISHED',
  isVerifiedOfficial: true,
  source: 'जिला प्रशासन',
  publishedAt: '2026-10-15T10:00:00.000Z',
  expiresAt: '2026-10-16T10:00:00.000Z',
};

test('accepts verified published announcements with an explicit future expiry', () => {
  const result = normalizeVerifiedAnnouncement(validAnnouncement, now);
  assert.equal(result?.id, validAnnouncement.id);
  assert.match(result?.publishedTime || '', /2026/);
});

test('rejects announcements without an explicit expiry', () => {
  const { expiresAt: _expiresAt, ...withoutExpiry } = validAnnouncement;
  assert.equal(normalizeVerifiedAnnouncement(withoutExpiry, now), undefined);
});

test('rejects expired announcements', () => {
  assert.equal(
    normalizeVerifiedAnnouncement(
      { ...validAnnouncement, expiresAt: '2026-10-15T11:59:59.000Z' },
      now
    ),
    undefined
  );
});

test('rejects unpublished, unverified, or future-published announcements', () => {
  assert.equal(
    normalizeVerifiedAnnouncement({ ...validAnnouncement, status: 'DRAFT' }, now),
    undefined
  );
  assert.equal(
    normalizeVerifiedAnnouncement({ ...validAnnouncement, isVerifiedOfficial: false }, now),
    undefined
  );
  assert.equal(
    normalizeVerifiedAnnouncement(
      { ...validAnnouncement, publishedAt: '2026-10-15T12:00:01.000Z' },
      now
    ),
    undefined
  );
});

test('rejects malformed or timezone-free timestamps and demo sources', () => {
  assert.equal(
    normalizeVerifiedAnnouncement(
      { ...validAnnouncement, expiresAt: '2026-10-16T10:00:00' },
      now
    ),
    undefined
  );
  assert.equal(
    normalizeVerifiedAnnouncement(
      { ...validAnnouncement, source: 'DEMO_DATA' },
      now
    ),
    undefined
  );
});
