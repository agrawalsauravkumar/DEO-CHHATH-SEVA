/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

export const routesRouter = Router();

// Configuration status endpoint (safely exposes provider availability without leaking private keys)
routesRouter.get('/config', (_req, res) => {
  const googleApiKey = process.env.GOOGLE_ROUTES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  const isGoogleConfigured = Boolean(googleApiKey && !googleApiKey.includes('placeholder'));

  return res.json({
    googleConfigured: isGoogleConfigured,
    defaultProvider: isGoogleConfigured ? 'GOOGLE' : 'VALHALLA',
    supportedModes: ['WALKING', 'DRIVING'],
    maxDistanceMeters: 500000, // 500 km max
  });
});

// Calculate route via Google Routes API or Directions API
routesRouter.post(
  '/calculate',
  asyncHandler(async (req, res) => {
    const {
      startLatitude,
      startLongitude,
      destinationLatitude,
      destinationLongitude,
      destinationName = 'गंतव्य स्थल',
      travelMode = 'WALKING',
    } = req.body;

    if (
      typeof startLatitude !== 'number' || !Number.isFinite(startLatitude) || startLatitude < -90 || startLatitude > 90 ||
      typeof startLongitude !== 'number' || !Number.isFinite(startLongitude) || startLongitude < -180 || startLongitude > 180 ||
      typeof destinationLatitude !== 'number' || !Number.isFinite(destinationLatitude) || destinationLatitude < -90 || destinationLatitude > 90 ||
      typeof destinationLongitude !== 'number' || !Number.isFinite(destinationLongitude) || destinationLongitude < -180 || destinationLongitude > 180
    ) {
      return res.status(400).json({ error: 'Valid start and destination coordinates required' });
    }

    const apiKey = process.env.GOOGLE_ROUTES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    // If Google API Key is available, invoke Google Routes API
    if (apiKey && !apiKey.includes('placeholder')) {
      try {
        const isWalk = travelMode === 'WALKING';
        const googleMode = isWalk ? 'WALK' : 'DRIVE';

        const requestBody = {
          origin: {
            location: {
              latLng: {
                latitude: startLatitude,
                longitude: startLongitude,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              },
            },
          },
          travelMode: googleMode,
          routingPreference: isWalk ? undefined : 'TRAFFIC_AWARE',
          computeAlternativeRoutes: false,
          languageCode: 'hi-IN',
          units: 'METRIC',
        };

        const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          const route = data.routes?.[0];

          if (route) {
            const distanceMeters = route.distanceMeters || 0;
            // duration is a string like "120s"
            const durationSeconds = parseInt(route.duration?.replace('s', '') || '0', 10);
            const encodedPolyline = route.polyline?.encodedPolyline || '';
            const geometry = decodeGooglePolyline(encodedPolyline);

            const steps = (route.legs?.[0]?.steps || []).map((step: any, idx: number) => ({
              id: `step-${idx}`,
              instruction: step.navigationInstruction?.instructions || 'आगे बढ़ें',
              distanceMeters: step.distanceMeters || 0,
              durationSeconds: parseInt(step.staticDuration?.replace('s', '') || '0', 10),
              location: [
                step.startLocation?.latLng?.latitude || startLatitude,
                step.startLocation?.latLng?.longitude || startLongitude,
              ] as [number, number],
              maneuverType: step.navigationInstruction?.maneuver || 'continue',
            }));

            return res.json({
              id: `google-${Date.now()}`,
              start: [startLatitude, startLongitude],
              destination: [destinationLatitude, destinationLongitude],
              destinationName,
              distanceMeters,
              distanceDisplay: formatDistance(distanceMeters),
              durationSeconds,
              durationDisplay: formatDuration(durationSeconds),
              geometry,
              steps,
              travelMode,
              provider: 'Google Routes API',
              calculatedAt: Date.now(),
            });
          }
        }
      } catch (googleError) {
        console.warn('[Google Routes API] Call failed, fallback to open routing engine:', googleError);
      }
    }

    // Fallback: Use server-side Valhalla / OSRM
    try {
      const profile = travelMode === 'WALKING' ? 'foot' : 'car';
      const osrmUrl = `https://router.project-osrm.org/route/v1/${profile === 'foot' ? 'driving' : 'driving'}/${startLongitude},${startLatitude};${destinationLongitude},${destinationLatitude}?overview=full&geometries=geojson&steps=true`;

      const osrmResp = await fetch(osrmUrl);
      if (osrmResp.ok) {
        const data = await osrmResp.json();
        const primaryRoute = data.routes?.[0];
        if (primaryRoute && primaryRoute.geometry?.coordinates) {
          const distanceMeters = Math.round(primaryRoute.distance);
          const durationSeconds = travelMode === 'WALKING'
            ? Math.max(60, Math.round(distanceMeters / 1.25))
            : Math.round(primaryRoute.duration);

          const geometry: [number, number][] = primaryRoute.geometry.coordinates.map(
            (pt: [number, number]) => [pt[1], pt[0]]
          );

          return res.json({
            id: `osrm-${Date.now()}`,
            start: [startLatitude, startLongitude],
            destination: [destinationLatitude, destinationLongitude],
            destinationName,
            distanceMeters,
            distanceDisplay: formatDistance(distanceMeters),
            durationSeconds,
            durationDisplay: formatDuration(durationSeconds),
            geometry,
            steps: [],
            travelMode,
            provider: 'OpenStreetMap Routing Engine',
            calculatedAt: Date.now(),
          });
        }
      }
    } catch (osrmError) {
      console.warn('[OSRM Server Fallback] Failed:', osrmError);
    }

    return res.status(503).json({
      error: 'सड़क मार्ग गणना सेवा अभी व्यस्त है। कृपया पुनः प्रयास करें।',
    });
  })
);

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} मीटर`;
  return `${(meters / 1000).toFixed(1)} किमी`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} मिनट`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return `${hours} घंटा ${rem} मिनट`;
}

function decodeGooglePolyline(encoded: string): [number, number][] {
  if (!encoded) return [];
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}
