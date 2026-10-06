import { RouteResult, RouteStep, TravelMode } from '../types';
import { Coordinates, LocationService } from './LocationService';
import {
  RoutingProvider,
  RoutingProviderFactory,
  RouteRequestParams,
} from './RoutingProvider';

const ROUTE_CACHE_KEY = 'deo_chhath_cached_active_route';

class RouteServiceManager {
  private provider: RoutingProvider = RoutingProviderFactory.getProvider();

  // Allow plugging in production routing providers (e.g. Mapbox, Google Maps API proxy)
  public setProvider(provider: RoutingProvider): void {
    this.provider = provider;
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  // 1. Calculate Real Road / Walking Route
  public async calculateRoute(params: RouteRequestParams): Promise<RouteResult> {
    if (!this.provider.isConfigured()) {
      throw new Error('वास्तविक मार्ग सेवा अभी कॉन्फ़िगर नहीं है।');
    }

    try {
      const result = await this.provider.calculateRoute(params);

      // Check Chhath pedestrian-only zone restrictions
      const deoMandirLat = 24.6542;
      const deoMandirLng = 84.4371;
      const distanceToMandir = LocationService.calculateDistanceKm(
        { latitude: params.destinationLatitude, longitude: params.destinationLongitude },
        { latitude: deoMandirLat, longitude: deoMandirLng }
      );

      if (params.travelMode === 'DRIVING' && distanceToMandir < 0.6) {
        result.warning =
          'छठ महापर्व सूचना: सूर्य मंदिर व सूर्य कुंड के 500 मीटर परिधि में वाहन प्रवेश निषेध है। वाहन निकटतम अधिकृत पार्किंग (P1/P2) में पार्क करें।';
      }

      // Cache route locally in case of mid-journey network loss
      this.cacheRoute(result);

      return result;
    } catch (err: any) {
      // Check if we have a valid cached route for this destination
      const cached = this.getCachedRoute();
      if (
        cached &&
        cached.destination[0] === params.destinationLatitude &&
        cached.destination[1] === params.destinationLongitude
      ) {
        return cached;
      }
      throw err;
    }
  }

  // 2. Off-Route Detection (calculates distance from user to closest point on route polyline)
  public isUserOffRoute(
    userLat: number,
    userLng: number,
    geometry: [number, number][],
    thresholdMeters: number = 75
  ): boolean {
    if (!geometry || geometry.length < 2) return false;

    let minDistanceKm = Infinity;
    const userCoord = { latitude: userLat, longitude: userLng };

    for (let i = 0; i < geometry.length; i++) {
      const pt = geometry[i];
      const dist = LocationService.calculateDistanceKm(userCoord, {
        latitude: pt[0],
        longitude: pt[1],
      });
      if (dist < minDistanceKm) {
        minDistanceKm = dist;
      }
    }

    return minDistanceKm * 1000 > thresholdMeters;
  }

  // 3. Arrival Detection (Checks if user has entered arrival radius)
  public isUserAtDestination(
    userLat: number,
    userLng: number,
    destLat: number,
    destLng: number,
    arrivalRadiusMeters: number = 35
  ): boolean {
    const distKm = LocationService.calculateDistanceKm(
      { latitude: userLat, longitude: userLng },
      { latitude: destLat, longitude: destLng }
    );
    return distKm * 1000 <= arrivalRadiusMeters;
  }

  // 4. Find current active step index along the route
  public findCurrentStepIndex(
    userLat: number,
    userLng: number,
    steps: RouteStep[]
  ): number {
    if (!steps || steps.length === 0) return 0;

    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const dist = LocationService.calculateDistanceKm(
        { latitude: userLat, longitude: userLng },
        { latitude: step.location[0], longitude: step.location[1] }
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  // 5. Route Cache Management
  public cacheRoute(route: RouteResult): void {
    try {
      sessionStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(route));
    } catch {
      // Ignore session storage quota errors
    }
  }

  public getCachedRoute(): RouteResult | null {
    try {
      const raw = sessionStorage.getItem(ROUTE_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public clearCachedRoute(): void {
    try {
      sessionStorage.removeItem(ROUTE_CACHE_KEY);
    } catch {
      // Ignore
    }
  }
}

export const RouteService = new RouteServiceManager();
