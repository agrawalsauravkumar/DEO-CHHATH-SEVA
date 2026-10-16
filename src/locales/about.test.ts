import assert from 'node:assert/strict';
import test from 'node:test';
import { getAboutTranslations } from './about';

test('Hindi and English Foundation content have matching complete translation keys', () => {
  const hindi = getAboutTranslations('hi');
  const english = getAboutTranslations('en');

  assert.deepEqual(Object.keys(hindi).sort(), Object.keys(english).sort());
  assert.equal(hindi.title, 'हमारे बारे में');
  assert.equal(english.title, 'About Us');
  assert.equal(hindi.focusAreas.length, 6);
  assert.equal(english.focusAreas.length, 6);
  assert.equal(hindi.services.length, 10);
  assert.equal(english.services.length, 10);
  assert.equal(hindi.pillars.length, 3);
  assert.equal(english.pillars.length, 3);
  assert.match(hindi.verificationNote, /स्वतंत्र रूप से सत्यापित नहीं/);
  assert.match(english.verificationNote, /not been independently verified/);
  assert.equal(english.logoAlt.includes('Combined'), true);
});

test('the About translation helper falls back to Hindi for untranslated languages', () => {
  assert.deepEqual(getAboutTranslations('bho'), getAboutTranslations('hi'));
  assert.deepEqual(getAboutTranslations('mag'), getAboutTranslations('hi'));
});
