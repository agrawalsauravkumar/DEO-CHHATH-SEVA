/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

class TestStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  clear(): void {
    this.values.clear();
  }
}

const storage = new TestStorage();
let online = false;
let fetchCalls = 0;

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: storage,
});
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  get: () => ({ onLine: online }),
});
globalThis.fetch = async () => {
  fetchCalls += 1;
  throw new Error('Network requests are not expected in this test.');
};

const { AuthService } = await import('./AuthService');

test('offline OTP stays local and can be verified after connectivity returns', async () => {
  storage.clear();
  AuthService.logout();
  fetchCalls = 0;
  online = false;

  const requested = await AuthService.requestOtp('9876543210');
  assert.equal(requested.success, true);
  assert.equal(requested.challenge?.isOfflineMode, true);
  assert.match(requested.challenge?.devOtpHint ?? '', /^\d{6}$/);

  online = true;
  const verified = await AuthService.verifyOtp('9876543210', requested.challenge?.devOtpHint ?? '');
  assert.equal(verified.success, true);
  assert.equal(verified.user?.authMode, 'offline');
  assert.equal(verified.user?.token, undefined);
  assert.equal(AuthService.getOfflineAccessStatus().available, true);
  assert.equal(fetchCalls, 0);
});

test('offline OTP expires and cannot be verified after its expiry', async () => {
  storage.clear();
  AuthService.logout();
  online = false;

  const requested = await AuthService.requestOtp('9876543210');
  assert.equal(requested.success, true);

  const challenge = JSON.parse(storage.getItem('deo_auth_active_challenge_v1') || '{}') as {
    expiresAt: number;
  };
  storage.setItem(
    'deo_auth_active_challenge_v1',
    JSON.stringify({ ...challenge, expiresAt: Date.now() - 1 })
  );

  const verified = await AuthService.verifyOtp('9876543210', requested.challenge?.devOtpHint ?? '');
  assert.equal(verified.success, false);
  assert.equal(storage.getItem('deo_auth_active_challenge_v1'), null);
});

test('offline OTP is invalidated after the maximum number of incorrect attempts', async () => {
  storage.clear();
  AuthService.logout();
  online = false;

  const requested = await AuthService.requestOtp('9876543210');
  assert.equal(requested.success, true);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const result = await AuthService.verifyOtp('9876543210', '000000');
    assert.equal(result.success, false);
  }
  assert.equal(storage.getItem('deo_auth_active_challenge_v1'), null);

  online = true;
  const verified = await AuthService.verifyOtp('9876543210', requested.challenge?.devOtpHint ?? '');
  assert.equal(verified.success, false);
  assert.equal(fetchCalls, 0);
});
