/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { LostFoundService } from './LostFoundService';

// Ensure mock localStorage is available in node:test
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

test('LostFoundService creates a report locally and retrieves it correctly', () => {
  localStorage.clear();
  const report = LostFoundService.createReport({
    type: 'LOST_ITEM',
    category: 'सूप व दउरा',
    title: 'पीतल का सूप खोया',
    description: 'सूर्य कुंड घाट के सीढ़ियों के पास',
    location: 'सूर्य कुंड मुख्य घाट',
    contactName: 'रमेश शर्मा',
    contactPhone: '9876543210',
  });

  assert.ok(report.id, 'Report ID must exist');
  assert.match(report.reportId, /^LF-2026-\d{6}$/, 'Report reference must match LF-2026-XXXXXX');
  assert.equal(report.status, 'SUBMITTED');

  const all = LostFoundService.getAllReports();
  assert.equal(all.length, 1);
  assert.equal(all[0].title, 'पीतल का सूप खोया');

  // Verify privacy protection on public reports
  const publicReports = LostFoundService.getPublicReports();
  assert.equal(publicReports[0].contactPhone, undefined, 'Contact phone must be stripped on public listings');
});

test('LostFoundService updates report status when claimed or transferred', () => {
  const all = LostFoundService.getAllReports();
  assert.ok(all.length > 0);
  const targetId = all[0].id;

  const updated = LostFoundService.updateReportStatus(targetId, 'RESOLVED');
  assert.equal(updated, true);

  const reportAfter = LostFoundService.getReportById(targetId);
  assert.equal(reportAfter?.status, 'RESOLVED');
});
