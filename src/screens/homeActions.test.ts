import assert from 'node:assert/strict';
import test from 'node:test';
import { HOME_EMERGENCY_SCREEN, HOME_PRIMARY_ACTIONS } from './homeActions';

test('home service actions point to supported screens and have unique destinations', () => {
  const destinations = HOME_PRIMARY_ACTIONS.map(({ id }) => id);

  assert.deepEqual(destinations, [
    'map',
    'help',
    'parking',
    'lost-found',
    'family',
    'announcements',
    'shuttle',
    'medical',
    'toilet',
    'water',
  ]);
  assert.equal(new Set(destinations).size, destinations.length);
  assert.equal(HOME_EMERGENCY_SCREEN, 'emergency');
  assert.ok(HOME_PRIMARY_ACTIONS.every(({ title, description }) => title && description));
});
