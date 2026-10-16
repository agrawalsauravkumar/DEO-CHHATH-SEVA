import assert from 'node:assert/strict';
import test from 'node:test';
import { getAvailableLanguage, isLanguageAvailable, SUPPORTED_LANGUAGE_CODES } from './languageSupport';

test('Hindi and English are available while untranslated regional options remain representable', () => {
  assert.deepEqual(SUPPORTED_LANGUAGE_CODES, ['hi', 'en']);
  assert.equal(isLanguageAvailable('hi'), true);
  assert.equal(isLanguageAvailable('bho'), false);
  assert.equal(isLanguageAvailable('mag'), false);
  assert.equal(isLanguageAvailable('en'), true);
});

test('stored supported language preferences are retained and unsupported values fall back to Hindi', () => {
  assert.equal(getAvailableLanguage('hi'), 'hi');
  assert.equal(getAvailableLanguage('en'), 'en');
  assert.equal(getAvailableLanguage('bho'), 'hi');
  assert.equal(getAvailableLanguage(null), 'hi');
});
