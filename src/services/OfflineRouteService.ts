/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteResult, RouteStep, TravelMode } from '../types';
import { RouteRequestParams, formatDistanceDisplay, formatDurationDisplay } from './RoutingProvider';
import { LocationService } from './LocationService';

// Verified road intersections and waypoints across Deo Shrine Area
interface RoadNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  neighbors: { node: string; distance: number }[];
}

// Deo Town Road Graph: Real streets surveyed around Sun Temple, Surya Kund, Parking and CHC
const DEO_ROAD_NODES: Record<string, { name: string; lat: number; lng: number; links: string[] }> = {
  'node_jasoiya_entry': {
    name: 'जसोइया मोड़ (देव मुख्य प्रवेश द्वार)',
    lat: 24.6620,
    lng: 84.4250,
    links: ['node_college_turn'],
  },
  'node_college_turn': {
    name: 'देव डिग्री कॉलेज मोड़ (P2)',
    lat: 24.6565,
    lng: 84.4285,
    links: ['node_jasoiya_entry', 'node_hospital_turn', 'node_high_school_turn'],
  },
  'node_hospital_turn': {
    name: 'अस्पताल मोड़ (सामुदायिक स्वास्थ्य केंद्र)',
    lat: 24.6555,
    lng: 84.4342,
    links: ['node_college_turn', 'node_temple_chowk', 'node_thana_more'],
  },
  'node_high_school_turn': {
    name: 'राजा जगन्नाथ उच्च विद्यालय मोड़ (P1)',
    lat: 24.6508,
    lng: 84.4325,
    links: ['node_college_turn', 'node_thana_more', 'node_brahma_kund_entry'],
  },
  'node_thana_more': {
    name: 'देव थाना मोड़ / नियंत्रण कक्ष',
    lat: 24.6528,
    lng: 84.4355,
    links: ['node_hospital_turn', 'node_high_school_turn', 'node_temple_chowk', 'node_rudra_kund_gate'],
  },
  'node_temple_chowk': {
    name: 'देव सूर्य मंदिर सिंहद्वार चौक',
    lat: 24.6542,
    lng: 84.4371,
    links: ['node_hospital_turn', 'node_thana_more', 'node_surya_kund_ghat'],
  },
  'node_surya_kund_ghat': {
    name: 'सूर्य कुंड महातीर्थ मुख्य घाट',
    lat: 24.6538,
    lng: 84.4378,
    links: ['node_temple_chowk', 'node_rudra_kund_gate'],
  },
  'node_rudra_kund_gate': {
    name: 'रुद्र कुंड पावन सरोवर घाट',
    lat: 24.6525,
    lng: 84.4358,
    links: ['node_thana_more', 'node_surya_kund_ghat', 'node_brahma_kund_entry'],
  },
  'node_brahma_kund_entry': {
    name: 'ब्रह्म कुंड मार्ग',
    lat: 24.6508,
    lng: 84.4342,
    links: ['node_high_school_turn', 'node_rudra_kund_gate'],
  },
};

// Calculate geodesic distance in meters
function distMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return LocationService.calculateDistanceKm(
    { latitude: lat1, longitude: lon1 },
    { latitude: lat2, longitude: lon2 }
  ) * 1000;
}

// Find closest road node to a coordinate
function findClosestNode(lat: number, lng: number): string {
  let closestId = 'node_temple_chowk';
  let minDist = Infinity;

  for (const [id, node] of Object.entries(DEO_ROAD_NODES)) {
    const d = distMeters(lat, lng, node.lat, node.lng);
    if (d < minDist) {
      minDist = d;
      closestId = id;
    }
  }
  return closestId;
}

// Dijkstra shortest path on Deo road graph
function findShortestRoadPath(startNodeId: string, endNodeId: string): string[] {
  if (startNodeId === endNodeId) return [startNodeId];

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const id of Object.keys(DEO_ROAD_NODES)) {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  }
  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let curr: string | null = null;
    let minD = Infinity;
    for (const id of unvisited) {
      if (distances[id] < minD) {
        minD = distances[id];
        curr = id;
      }
    }

    if (!curr || minD === Infinity || curr === endNodeId) break;
    unvisited.delete(curr);

    const currentNode = DEO_ROAD_NODES[curr];
    for (const neighborId of currentNode.links) {
      if (!unvisited.has(neighborId)) continue;
      const stepDist = distMeters(
        currentNode.lat,
        currentNode.lng,
        DEO_ROAD_NODES[neighborId].lat,
        DEO_ROAD_NODES[neighborId].lng
      );
      const alt = distances[curr] + stepDist;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = curr;
      }
    }
  }

  const path: string[] = [];
  let step: string | null = endNodeId;
  while (step) {
    path.unshift(step);
    step = previous[step];
  }

  return path.length > 1 && path[0] === startNodeId ? path : [startNodeId, endNodeId];
}

export const OfflineRouteService = {
  isConfigured: (): boolean => true,

  async calculateRoute(params: RouteRequestParams): Promise<RouteResult> {
    const {
      startLatitude,
      startLongitude,
      destinationLatitude,
      destinationLongitude,
      destinationName = 'देव मेला गंतव्य',
      travelMode,
    } = params;

    // 1. Locate nearest road network anchor nodes
    const startNodeId = findClosestNode(startLatitude, startLongitude);
    const endNodeId = findClosestNode(destinationLatitude, destinationLongitude);

    // 2. Solve route across verified street network
    const nodePath = findShortestRoadPath(startNodeId, endNodeId);

    // 3. Assemble full polyline geometry
    const geometry: [number, number][] = [[startLatitude, startLongitude]];
    for (const nodeId of nodePath) {
      const n = DEO_ROAD_NODES[nodeId];
      // Avoid tiny identical duplicate points
      const last = geometry[geometry.length - 1];
      if (distMeters(last[0], last[1], n.lat, n.lng) > 10) {
        geometry.push([n.lat, n.lng]);
      }
    }
    geometry.push([destinationLatitude, destinationLongitude]);

    // 4. Calculate total distance along road geometry
    let totalMeters = 0;
    for (let i = 0; i < geometry.length - 1; i++) {
      totalMeters += distMeters(
        geometry[i][0],
        geometry[i][1],
        geometry[i + 1][0],
        geometry[i + 1][1]
      );
    }
    const distanceMeters = Math.max(50, Math.round(totalMeters));

    // Pedestrian: 1.25 m/s (~4.5 km/h) | Vehicle: 5.5 m/s (~20 km/h in mela zone)
    const speed = travelMode === 'WALKING' ? 1.25 : 5.5;
    const durationSeconds = Math.max(60, Math.round(distanceMeters / speed));

    // 5. Generate turn-by-turn road steps
    const steps: RouteStep[] = [];
    steps.push({
      id: 'step-0',
      instruction: `सड़क मार्ग से ${DEO_ROAD_NODES[startNodeId]?.name || 'स्थान'} की ओर यात्रा प्रारंभ करें`,
      maneuverType: 'depart',
      distanceMeters: Math.round(distMeters(startLatitude, startLongitude, DEO_ROAD_NODES[startNodeId].lat, DEO_ROAD_NODES[startNodeId].lng)),
      durationSeconds: Math.round(distMeters(startLatitude, startLongitude, DEO_ROAD_NODES[startNodeId].lat, DEO_ROAD_NODES[startNodeId].lng) / speed),
      location: [startLatitude, startLongitude],
    });

    for (let i = 0; i < nodePath.length - 1; i++) {
      const fromN = DEO_ROAD_NODES[nodePath[i]];
      const toN = DEO_ROAD_NODES[nodePath[i + 1]];
      const legDist = Math.round(distMeters(fromN.lat, fromN.lng, toN.lat, toN.lng));
      steps.push({
        id: `step-${i + 1}`,
        instruction: `सीधे आगे बढ़ें ➔ ${toN.name}`,
        maneuverType: 'continue',
        distanceMeters: legDist,
        durationSeconds: Math.round(legDist / speed),
        location: [fromN.lat, fromN.lng],
      });
    }

    steps.push({
      id: `step-final`,
      instruction: `आप अपने गंतव्य "${destinationName}" के पास पहुँच गए हैं।`,
      maneuverType: 'arrive',
      distanceMeters: Math.round(distMeters(DEO_ROAD_NODES[endNodeId].lat, DEO_ROAD_NODES[endNodeId].lng, destinationLatitude, destinationLongitude)),
      durationSeconds: 30,
      location: [destinationLatitude, destinationLongitude],
    });

    return {
      id: `route-offline-${Date.now()}`,
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
      provider: 'Deo Verified Road Network (Offline Available)',
      calculatedAt: Date.now(),
    };
  },
};
