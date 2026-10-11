import { RouteResult, RouteStep, TravelMode } from '../types';
import { Coordinates, LocationService } from './LocationService';
import {
  RoutingProvider,
  RoutingProviderFactory,
  RouteRequestParams,
} from './RoutingProvider';
import { OfflineRouteService } from './OfflineRouteService';

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
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return OfflineRouteService.calculateRoute(params);
    }
    if (!this.provider.isConfigured()) {
      throw new Error('रूट सेवा अभी उपलब्ध नहीं है।');
    }

    const coordinates = [
      [params.startLatitude, params.startLongitude],
      [params.destinationLatitude, params.destinationLongitude],
    ];
    if (coordinates.some(([latitude, longitude]) =>
      !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180
    )) {
      throw new Error('प्रारंभ या गंतव्य स्थान के निर्देशांक मान्य नहीं हैं।');
    }

    let result: RouteResult;
    try {
      result = await this.provider.calculateRoute(params);
    } catch (error) {
      console.error('Route provider request failed:', error);
      const message = error instanceof Error ? error.message : '';
      throw new Error(
        /[\u0900-\u097F]/.test(message)
          ? message
          : 'रूट सेवा अभी उपलब्ध नहीं है। वास्तविक सड़क मार्ग प्राप्त नहीं हो सका।'
      );
    }

    if (
      !Array.isArray(result.geometry) ||
      result.geometry.length < 2 ||
      result.geometry.some(([latitude, longitude]) =>
        !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180
      ) ||
      !Number.isFinite(result.distanceMeters) ||
      result.distanceMeters < 0 ||
      !Number.isFinite(result.durationSeconds) ||
      result.durationSeconds < 0
    ) {
      throw new Error('रूट सेवा ने मान्य सड़क मार्ग नहीं दिया।');
    }
    return result;
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

}

export const RouteService = new RouteServiceManager();
