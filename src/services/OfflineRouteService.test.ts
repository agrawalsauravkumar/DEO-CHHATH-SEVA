/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { OfflineRouteService } from './OfflineRouteService';

test('OfflineRouteService calculates authentic road route between Deo landmarks', async () => {
  // From P1 High School Parking to Deo Sun Temple
  const route = await OfflineRouteService.calculateRoute({
    startLatitude: 24.6508,
    startLongitude: 84.4325,
    destinationLatitude: 24.6542,
    destinationLongitude: 84.4371,
    destinationName: 'देव सूर्य मंदिर मुख्य द्वार',
    travelMode: 'WALKING',
  });

  assert.ok(route, 'Route must be returned');
  assert.ok(route.geometry.length >= 2, 'Route must have at least 2 points');
  assert.ok(route.distanceMeters > 300, 'Distance must be realistic road distance');
  assert.ok(route.durationSeconds > 60, 'Walking duration must be positive');
  assert.ok(route.steps.length >= 2, 'Must generate step-by-step road instructions');
  assert.match(route.steps[route.steps.length - 1].instruction, /पहुँच गए हैं/, 'Final step must announce arrival');
});

test('OfflineRouteService adjusts duration between walking and driving modes', async () => {
  const walkRoute = await OfflineRouteService.calculateRoute({
    startLatitude: 24.6565,
    startLongitude: 84.4285,
    destinationLatitude: 24.6538,
    destinationLongitude: 84.4378,
    destinationName: 'सूर्य कुंड महातीर्थ',
    travelMode: 'WALKING',
  });

  const driveRoute = await OfflineRouteService.calculateRoute({
    startLatitude: 24.6565,
    startLongitude: 84.4285,
    destinationLatitude: 24.6538,
    destinationLongitude: 84.4378,
    destinationName: 'सूर्य कुंड महातीर्थ',
    travelMode: 'DRIVING',
  });

  assert.ok(walkRoute.durationSeconds > driveRoute.durationSeconds, 'Walking should take longer than driving');
});
