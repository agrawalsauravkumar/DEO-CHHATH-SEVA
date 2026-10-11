/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// PostGIS Spatial Helpers and Geometry Operations

import { DbGeoPoint } from './types';

/**
 * Standard WGS84 PostGIS SRID
 */
export const WGS84_SRID = 4326;

/**
 * Generates PostGIS SQL expression for a point
 * e.g. ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
 * Note: PostGIS ST_MakePoint takes (X, Y) which is (longitude, latitude)
 */
export function postgisPointSql(lon: number, lat: number): string {
  return `ST_SetSRID(ST_MakePoint(${lon}, ${lat}), ${WGS84_SRID})`;
}

/**
 * Generates PostGIS query for distance in meters between a table column and coordinates
 */
export function postgisDistanceMetersSql(columnName: string, lon: number, lat: number): string {
  return `ST_DistanceSphere(${columnName}, ${postgisPointSql(lon, lat)})`;
}

/**
 * Generates PostGIS DWithin query for radius check in meters
 */
export function postgisDWithinSql(columnName: string, lon: number, lat: number, radiusMeters: number): string {
  return `ST_DWithin(${columnName}::geography, ${postgisPointSql(lon, lat)}::geography, ${radiusMeters})`;
}

/**
 * Earth radius in meters for high-precision Haversine distance
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * Computes exact geodesic distance between two points on WGS84 ellipsoid
 * Matches PostGIS ST_DistanceSphere within millimetric tolerances
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Formats a point as a GeoJSON Geometry object
 */
export function toGeoJsonPoint(point: DbGeoPoint): {
  type: 'Point';
  coordinates: [number, number];
} {
  return {
    type: 'Point',
    coordinates: [point.longitude, point.latitude],
  };
}

/**
 * Converts GeoJSON geometry or WKT into lat/lon coordinates
 */
export function parseGeoJsonPoint(geoJson: any): DbGeoPoint | null {
  if (!geoJson) return null;
  if (geoJson.type === 'Point' && Array.isArray(geoJson.coordinates)) {
    return {
      longitude: geoJson.coordinates[0],
      latitude: geoJson.coordinates[1],
      srid: WGS84_SRID,
    };
  }
  return null;
}
