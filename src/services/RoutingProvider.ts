/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Replaceable Routing Architecture for DEO CHHATH SEVA
// Providers: OSRM (OpenStreetMap default), GraphHopper, Valhalla

import { RouteResult, RouteStep, TravelMode } from '../types';

export interface RouteRequestParams {
  startLatitude: number;
  startLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  destinationName?: string;
  travelMode: TravelMode;
}

export interface RoutingProvider {
  name: string;
  providerId: 'OSRM' | 'GRAPHHOPPER' | 'VALHALLA' | 'NONE';
  isConfigured(): boolean;
  calculateRoute(params: RouteRequestParams): Promise<RouteResult>;
}

// Translate routing engine maneuvers into Hindi for elderly & local pilgrims
export const translateManeuverToHindi = (
  type: string,
  modifier?: string,
  streetName?: string
): string => {
  const streetPart = streetName && streetName !== '' ? ` (${streetName})` : '';

  if (type === 'depart') {
    return `यात्रा प्रारंभ करें और सीधे आगे बढ़ें${streetPart}`;
  }

  if (type === 'arrive') {
    return 'आप अपने गंतव्य के पास पहुँच गए हैं।';
  }

  if (type === 'roundabout' || type === 'rotary') {
    return `गोलचक्कर से निकलें${streetPart}`;
  }

  if (type === 'turn') {
    switch (modifier) {
      case 'left':
        return `बाएँ मुड़ें${streetPart}`;
      case 'right':
        return `दाएँ मुड़ें${streetPart}`;
      case 'slight left':
        return `हल्का बाएँ मुड़ें${streetPart}`;
      case 'slight right':
        return `हल्का दाएँ मुड़ें${streetPart}`;
      case 'sharp left':
        return `तीखा बाएँ मुड़ें${streetPart}`;
      case 'sharp right':
        return `तीखा दाएँ मुड़ें${streetPart}`;
      case 'uturn':
        return 'वापस यू-टर्न लें';
      default:
        return `मुड़ें${streetPart}`;
    }
  }

  if (type === 'continue' || type === 'new name') {
    return `सीधे जाएँ${streetPart}`;
  }

  if (type === 'fork') {
    return modifier === 'left' ? 'काँटे पर बाएँ रास्ते पर चलें' : 'काँटे पर दाएँ रास्ते पर चलें';
  }

  return `आगे बढ़ें${streetPart}`;
};

export const formatDistanceDisplay = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} मीटर`;
  }
  return `${(meters / 1000).toFixed(1)} किमी`;
};

export const formatDurationDisplay = (seconds: number): string => {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return `${minutes} मिनट`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours} घंटा ${remainingMins} मिनट`;
};

// 1. OSRM Provider (Open-access OpenStreetMap routing engine)
export class OSRMProvider implements RoutingProvider {
  name = 'OSRM OpenStreetMap Engine';
  providerId = 'OSRM' as const;
  private baseUrl: string;

  constructor(customUrl?: string) {
    this.baseUrl = customUrl || import.meta.env.VITE_ROUTING_ENGINE_URL?.trim() || 'https://router.project-osrm.org';
  }

  isConfigured(): boolean {
    return /^https:\/\//i.test(this.baseUrl);
  }

  async calculateRoute(params: RouteRequestParams): Promise<RouteResult> {
    const {
      startLatitude,
      startLongitude,
      destinationLatitude,
      destinationLongitude,
      destinationName = 'गंतव्य स्थल',
      travelMode,
    } = params;

    if (travelMode === 'WALKING') {
      throw new Error('रूट सेवा अभी उपलब्ध नहीं है। इस OSRM provider में पैदल रूट उपलब्ध नहीं है।');
    }
    const profile = 'driving';
    const coordinates = `${startLongitude},${startLatitude};${destinationLongitude},${destinationLatitude}`;
    const url = `${this.baseUrl}/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson&steps=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`OSRM HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.routes || data.routes.length === 0) {
        throw new Error('इस स्थान तक सड़क मार्ग उपलब्ध नहीं है।');
      }

      const primaryRoute = data.routes[0];
      if (!Array.isArray(primaryRoute.geometry?.coordinates) || primaryRoute.geometry.coordinates.length < 2) {
        throw new Error('OSRM से मान्य मार्ग ज्यामिति प्राप्त नहीं हुई।');
      }
      const distanceMeters = Math.round(primaryRoute.distance);
      const durationSeconds = Math.round(primaryRoute.duration);

      const geometry: [number, number][] = primaryRoute.geometry.coordinates.map(
        (pt: [number, number]) => [pt[1], pt[0]]
      );

      const steps: RouteStep[] = [];
      if (primaryRoute.legs && primaryRoute.legs[0] && primaryRoute.legs[0].steps) {
        primaryRoute.legs[0].steps.forEach((step: any, index: number) => {
          const maneuver = step.maneuver || {};
          const type = maneuver.type || 'continue';
          const modifier = maneuver.modifier || '';
          const streetName = step.name || '';

          const instructionHi = translateManeuverToHindi(type, modifier, streetName);
          const location: [number, number] = maneuver.location
            ? [maneuver.location[1], maneuver.location[0]]
            : [startLatitude, startLongitude];

          steps.push({
            id: `step-${index}`,
            instruction: instructionHi,
            originalInstruction: step.name,
            maneuverType: type,
            modifier,
            distanceMeters: Math.round(step.distance),
            durationSeconds: Math.round(step.duration),
            location,
          });
        });
      }

      return {
        id: `route-${Date.now()}`,
        start: [startLatitude, startLongitude],
        destination: [destinationLatitude, destinationLongitude],
        destinationName,
        distanceMeters,
        distanceDisplay: formatDistanceDisplay(distanceMeters),
        durationSeconds,
        durationDisplay: formatDurationDisplay(durationSeconds),
        geometry,
        steps,
        travelMode,
        provider: this.name,
        calculatedAt: Date.now(),
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('मार्ग गणना में समय अधिक लग रहा है।');
      }
      throw new Error(err.message || 'OSRM मार्ग सेवा अनुपलब्ध है।');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// 2. GraphHopper Provider (Requires ROUTING_API_KEY)
export class GraphHopperProvider implements RoutingProvider {
  name = 'GraphHopper Routing Service';
  providerId = 'GRAPHHOPPER' as const;
  private apiKey?: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || '';
  }

  isConfigured(): boolean {
    return !!(this.apiKey && !this.apiKey.includes('placeholder'));
  }

  async calculateRoute(params: RouteRequestParams): Promise<RouteResult> {
    if (!this.isConfigured()) {
      throw new Error('GraphHopper API कुंजी कॉन्फ़िगर नहीं है (Navigation service is not configured)।');
    }

    const {
      startLatitude,
      startLongitude,
      destinationLatitude,
      destinationLongitude,
      destinationName = 'गंतव्य स्थल',
      travelMode,
    } = params;

    const vehicle = travelMode === 'WALKING' ? 'foot' : 'car';
    const url = `${this.baseUrl}/route?point=${startLatitude},${startLongitude}&point=${destinationLatitude},${destinationLongitude}&vehicle=${vehicle}&locale=hi&points_encoded=false&key=${this.apiKey}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`GraphHopper Error: ${resp.status}`);
    }
    const data = await resp.json();
    const path = data.paths?.[0];
    if (!path) {
      throw new Error('GraphHopper मार्ग नहीं मिला।');
    }

    const distanceMeters = Math.round(path.distance);
    const durationSeconds = Math.round(path.time / 1000);
    const geometry: [number, number][] = path.points.coordinates.map(
      (c: [number, number]) => [c[1], c[0]]
    );

    const steps: RouteStep[] = (path.instructions || []).map((inst: any, idx: number) => ({
      id: `gh-step-${idx}`,
      instruction: inst.text,
      maneuverType: 'turn',
      distanceMeters: Math.round(inst.distance),
      durationSeconds: Math.round(inst.time / 1000),
      location: geometry[inst.interval?.[0] || 0] || [startLatitude, startLongitude],
    }));

    return {
      id: `gh-${Date.now()}`,
      start: [startLatitude, startLongitude],
      destination: [destinationLatitude, destinationLongitude],
      destinationName,
      distanceMeters,
      distanceDisplay: formatDistanceDisplay(distanceMeters),
      durationSeconds,
      durationDisplay: formatDurationDisplay(durationSeconds),
      geometry,
      steps,
      travelMode,
      provider: this.name,
      calculatedAt: Date.now(),
    };
  }
}

// 3. Valhalla Provider (Open-source multi-modal routing engine)
export class ValhallaProvider implements RoutingProvider {
  name = 'Valhalla Routing Engine';
  providerId = 'VALHALLA' as const;
  private baseUrl: string;
  private apiKey?: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || import.meta.env.VITE_ROUTING_ENGINE_URL?.trim() || 'https://valhalla1.openstreetmap.de';
  }

  isConfigured(): boolean {
    return /^https:\/\//i.test(this.baseUrl);
  }

  async calculateRoute(params: RouteRequestParams): Promise<RouteResult> {
    const {
      startLatitude,
      startLongitude,
      destinationLatitude,
      destinationLongitude,
      destinationName = 'गंतव्य स्थल',
      travelMode,
    } = params;

    const costing = travelMode === 'WALKING' ? 'pedestrian' : 'auto';
    const body = {
      locations: [
        { lat: startLatitude, lon: startLongitude },
        { lat: destinationLatitude, lon: destinationLongitude },
      ],
      costing,
      directions_options: { language: 'hi-IN' },
    };

    const url = `${this.baseUrl}/route${this.apiKey ? `?api_key=${this.apiKey}` : ''}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    let data: any;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!resp.ok) {
        throw new Error(`Valhalla Error: ${resp.status}`);
      }
      data = await resp.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('रूट सेवा से उत्तर मिलने में समय अधिक लग रहा है।');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    const trip = data.trip;
    if (!trip || !trip.legs || trip.legs.length === 0) {
      throw new Error('Valhalla मार्ग नहीं मिला।');
    }

    const leg = trip.legs[0];
    const distanceMeters = Math.round(leg.summary.length * 1000);
    const durationSeconds = Math.round(leg.summary.time);

    const geometry = decodePolyline(leg.shape);
    if (
      geometry.length < 2 ||
      geometry.some(([latitude, longitude]) =>
        !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180
      )
    ) {
      throw new Error('Valhalla से वास्तविक मार्ग ज्यामिति उपलब्ध नहीं हुई।');
    }
    const steps: RouteStep[] = (leg.maneuvers || [])
      .map((maneuver: any, index: number): RouteStep | null => {
        const location = geometry[maneuver.begin_shape_index];
        if (!location || typeof maneuver.instruction !== 'string') return null;
        return {
          id: `val-step-${index}`,
          instruction: maneuver.instruction,
          maneuverType: maneuver.type?.toString() || 'continue',
          distanceMeters: Math.round(maneuver.length * 1000),
          durationSeconds: Math.round(maneuver.time),
          location,
        };
      })
      .filter((step: RouteStep | null): step is RouteStep => step !== null);

    return {
      id: `val-${Date.now()}`,
      start: [startLatitude, startLongitude],
      destination: [destinationLatitude, destinationLongitude],
      destinationName,
      distanceMeters,
      distanceDisplay: formatDistanceDisplay(distanceMeters),
      durationSeconds,
      durationDisplay: formatDurationDisplay(durationSeconds),
      geometry,
      steps,
      travelMode,
      provider: this.name,
      calculatedAt: Date.now(),
    };
  }
}

// 4. Factory to instantiate the active routing provider
export class RoutingProviderFactory {
  static getProvider(): RoutingProvider {
    const configuredType = (import.meta.env.VITE_ROUTING_PROVIDER || 'VALHALLA').toUpperCase();
    const baseUrl = import.meta.env.VITE_ROUTING_ENGINE_URL?.trim();

    if (configuredType === 'GRAPHHOPPER') {
      const gh = new GraphHopperProvider(undefined, baseUrl);
      if (gh.isConfigured()) return gh;
      return new UnavailableRoutingProvider();
    }

    if (configuredType === 'VALHALLA') {
      const val = new ValhallaProvider(undefined, baseUrl);
      if (val.isConfigured()) return val;
      return new UnavailableRoutingProvider();
    }

    if (configuredType === 'OSRM') {
      const osrm = new OSRMProvider(baseUrl);
      return osrm.isConfigured() ? osrm : new UnavailableRoutingProvider();
    }
    return new UnavailableRoutingProvider();
  }
}

class UnavailableRoutingProvider implements RoutingProvider {
  name = 'रूट सेवा अनुपलब्ध';
  providerId = 'NONE' as const;
  isConfigured(): boolean {
    return false;
  }
  async calculateRoute(): Promise<RouteResult> {
    throw new Error('रूट सेवा अभी उपलब्ध नहीं है।');
  }
}

const decodePolyline = (encoded: unknown): [number, number][] => {
  if (typeof encoded !== 'string' || encoded.length === 0) return [];
  const coordinates: [number, number][] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  const factor = 1_000_000;

  const readDelta = (): number | null => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      if (index >= encoded.length || shift > 30) return null;
      byte = encoded.charCodeAt(index++) - 63;
      if (byte < 0 || byte > 63) return null;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };

  while (index < encoded.length) {
    const latitudeDelta = readDelta();
    const longitudeDelta = readDelta();
    if (latitudeDelta === null || longitudeDelta === null) return [];
    latitude += latitudeDelta;
    longitude += longitudeDelta;
    const point: [number, number] = [latitude / factor, longitude / factor];
    if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) return [];
    coordinates.push(point);
  }
  return coordinates;
};
