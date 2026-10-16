/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Map Provider Abstraction for DEO CHHATH SEVA
// OpenStreetMap-compatible, attribution-compliant online tiles.

export interface MapTileConfig {
  tileUrl: string;
  attribution: string;
  maxZoom: number;
  minZoom: number;
  subdomains?: string[];
  styleUrl?: string;
}

export interface MapProvider {
  name: string;
  type: 'ONLINE' | 'OFFLINE';
  isConfigured(): boolean;
  getTileConfig(): MapTileConfig;
  getOfflineStatus(): { isOfflineReady: boolean; packageSizeMb?: number; lastDownloaded?: string };
}

// 1. Online Map Provider (Default: OpenStreetMap with proper public attribution)
export class OnlineMapProvider implements MapProvider {
  name = 'OpenStreetMap Standard';
  type = 'ONLINE' as const;

  private tileUrl: string;
  private attribution: string;

  constructor(customTileUrl?: string, customAttribution?: string) {
    this.tileUrl =
      customTileUrl ||
      import.meta.env.VITE_MAP_TILE_URL?.trim() ||
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    this.attribution =
      customAttribution ||
      import.meta.env.VITE_MAP_ATTRIBUTION?.trim() ||
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | NextGen Dev Bhoomi Foundation';
  }

  isConfigured(): boolean {
    return true;
  }

  getTileConfig(): MapTileConfig {
    return {
      tileUrl: this.tileUrl,
      attribution: this.attribution,
      maxZoom: 19,
      minZoom: 12,
      subdomains: ['a', 'b', 'c'],
    };
  }

  getOfflineStatus() {
    return { isOfflineReady: false };
  }
}

// A provider placeholder that remains unavailable until a licensed local tile package is configured.
export class OfflineMapProvider implements MapProvider {
  name = 'ऑफ़लाइन मानचित्र डेटा उपलब्ध नहीं है';
  type = 'OFFLINE' as const;

  private attribution: string;

  constructor() {
    this.attribution =
      '&copy; OpenStreetMap contributors';
  }

  isConfigured(): boolean {
    return false;
  }

  getTileConfig(): MapTileConfig {
    return {
      tileUrl: '',
      attribution: this.attribution,
      maxZoom: 17,
      minZoom: 13,
    };
  }

  getOfflineStatus() {
    return { isOfflineReady: false };
  }
}

// 3. Map Provider Factory
export class MapProviderFactory {
  static getProvider(forceOffline: boolean = false): MapProvider {
    if (forceOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      const offlineProvider = new OfflineMapProvider();
      if (offlineProvider.isConfigured()) {
        return offlineProvider;
      }
    }
    return new OnlineMapProvider();
  }
}
