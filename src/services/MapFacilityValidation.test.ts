import assert from 'node:assert/strict';
import test from 'node:test';
import { isVerifiedMapFacility } from './MapFacilityValidation';

const verifiedFacility = {
  id: 'facility-1',
  name: 'सहायता केंद्र',
  category: 'HELP',
  latitude: 24.8,
  longitude: 84.4,
  description: 'सत्यापित सार्वजनिक सहायता सुविधा',
  verificationStatus: 'VERIFIED',
  lastUpdated: '2026-01-01T00:00:00Z',
  source: 'authorized municipality feed',
};

test('map facility validation accepts only complete verified records with valid coordinates', () => {
  assert.equal(isVerifiedMapFacility(verifiedFacility), true);
  assert.equal(isVerifiedMapFacility({ ...verifiedFacility, verificationStatus: 'PENDING' }), false);
  assert.equal(isVerifiedMapFacility({ ...verifiedFacility, source: 'demo feed' }), false);
  assert.equal(isVerifiedMapFacility({ ...verifiedFacility, category: 'UNKNOWN' }), false);
  assert.equal(isVerifiedMapFacility({ ...verifiedFacility, latitude: 91 }), false);
  assert.equal(isVerifiedMapFacility({ ...verifiedFacility, longitude: Number.NaN }), false);
  assert.equal(isVerifiedMapFacility(null), false);
});
