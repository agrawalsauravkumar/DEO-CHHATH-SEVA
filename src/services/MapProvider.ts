/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Map Provider Abstraction for DEO CHHATH SEVA
// OpenStreetMap-compatible, offline-capable, strictly attribution-compliant

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
    // Allows environment-driven override without hardcoding secrets
    this.tileUrl =
      customTileUrl ||
      (typeof process !== 'undefined' && process.env?.MAP_TILE_URL) ||
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    this.attribution =
      customAttribution ||
      (typeof process !== 'undefined' && process.env?.MAP_ATTRIBUTION) ||
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

// 2. Offline Map Provider (Vector / Pre-cached boundary tiles for Deo Mela Area)
export class OfflineMapProvider implements MapProvider {
  name = 'Deo Offline Vector Package (PMTiles / Local Cache)';
  type = 'OFFLINE' as const;

  private offlineUrl: string;
  private attribution: string;

  constructor(customOfflineUrl?: string) {
    this.offlineUrl =
      customOfflineUrl ||
      (typeof process !== 'undefined' && process.env?.OFFLINE_MAP_URL) ||
      '/offline-maps/deo-region.pmtiles';

    this.attribution =
      '&copy; OpenStreetMap contributors (Offline Cached for Deo Chhath Seva)';
  }

  isConfigured(): boolean {
    // Check if offline package is installed locally
    if (typeof localStorage !== 'undefined') {
      const pkg = localStorage.getItem('deo_offline_map_package_v1');
      if (pkg) {
        try {
          const parsed = JSON.parse(pkg);
          return parsed.isDownloaded === true;
        } catch {
          return false;
        }
      }
    }
    return false;
  }

  getTileConfig(): MapTileConfig {
    // When offline, fallback to local storage cached tile data or offline SVG grid
    return {
      tileUrl: this.offlineUrl,
      attribution: this.attribution,
      maxZoom: 17,
      minZoom: 13,
    };
  }

  getOfflineStatus() {
    if (typeof localStorage !== 'undefined') {
      const pkg = localStorage.getItem('deo_offline_map_package_v1');
      if (pkg) {
        try {
          const parsed = JSON.parse(pkg);
          return {
            isOfflineReady: parsed.isDownloaded === true,
            packageSizeMb: parsed.sizeMb || 4.8,
            lastDownloaded: parsed.downloadedAt || 'उपलब्ध',
          };
        } catch {
          // ignore
        }
      }
    }
    return { isOfflineReady: false, packageSizeMb: 4.8 };
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
