import React, { useEffect, useRef, useState, useMemo } from 'react';
import '../services/leafletSafePatch';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { POIService, POIItem, POICategory, DEO_DEFAULT_CENTER } from '../services/POIService';
import { MapFacilityService } from '../services/MapFacilityService';
import { LocationService } from '../services/LocationService';
import { MapService } from '../services/MapService';
import { OfflineMapService } from '../services/OfflineMapService';
import { LocationItem, MapFacility } from '../types';
import {
  ZoomIn,
  ZoomOut,
  Navigation,
  Check,
  Filter,
  X,
  Loader2,
  RefreshCw,
  WifiOff,
  Info as InfoIcon,
} from 'lucide-react';

interface Props {
  heightClass?: string;
  showRouteLine?: boolean;
  routeGeometry?: [number, number][];
  onNavigateToPreview?: (item: LocationItem) => void;
  centerOnUserByDefault?: boolean;
}

export const DeoMap: React.FC<Props> = ({
  heightClass = 'h-[500px]',
  showRouteLine = false,
  routeGeometry,
  onNavigateToPreview,
  centerOnUserByDefault = true,
}) => {
  const {
    selectedMapItem,
    setSelectedMapItem,
    deviceLocation,
    locationStatus,
    locationErrorMessage,
    requestDeviceLocation,
    isOnline,
    navigate,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const routeLineRef = useRef<L.LayerGroup | L.Polyline | null>(null);
  const offlineRoutesLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const centerOnNextLocationRef = useRef(false);
  const previousOnlineRef = useRef(isOnline);

  const [tileError, setTileError] = useState<boolean>(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<MapFacility[]>([]);
  const [facilityLoadStatus, setFacilityLoadStatus] = useState<'loading' | 'loaded' | 'cached' | 'unavailable' | 'error'>('loading');
  const [facilityCacheTimestamp, setFacilityCacheTimestamp] = useState<number | null>(null);
  const [facilityReload, setFacilityReload] = useState(0);

  // Category filter state
  const [enabledCategories, setEnabledCategories] = useState<Record<POICategory, boolean>>({
    RELIGIOUS: true,
    PARKING: true,
    SHUTTLE: true,
    MEDICAL: true,
    TOILET: true,
    WATER: true,
    HELP: true,
  });

  // Selected POI item
  const verifiedPOIs = useMemo<POIItem[]>(
    () =>
      facilities.map((facility) => ({
        id: facility.id,
        name: facility.name,
        nameEn: facility.nameEn || facility.name,
        category: facility.category,
        latitude: facility.latitude,
        longitude: facility.longitude,
        description: facility.description,
        landmark: facility.landmark || '',
        isDemo: false,
        source: facility.source,
        lastUpdated: facility.lastUpdated,
        accessibilityInfo: facility.accessibilityInfo,
        isWheelchairAccessible: Boolean(facility.accessibilityInfo),
      })),
    [facilities]
  );
  const [selectedPOI, setSelectedPOI] = useState<POIItem | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setFacilityLoadStatus('loading');
    MapFacilityService.getVerifiedFacilities(controller.signal)
      .then((result) => {
        setFacilities(result.facilities);
        setFacilityCacheTimestamp(result.source === 'CACHE' ? result.syncedAt ?? null : null);
        setFacilityLoadStatus(
          result.facilities.length === 0
            ? 'unavailable'
            : result.source === 'CACHE'
              ? 'cached'
              : 'loaded'
        );
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Verified map facilities could not be loaded:', error);
        setFacilityLoadStatus('error');
      });
    return () => controller.abort();
  }, [facilityReload, isOnline]);

  // Sync selectedMapItem changes from outside (e.g., Destination Search selection)
  useEffect(() => {
    if (selectedMapItem) {
      const match = verifiedPOIs.find(
        (p) => p.id === selectedMapItem.id || p.name === selectedMapItem.name
      );
      if (match) setSelectedPOI(match);
      const map = mapInstanceRef.current;
      if (
        !selectedMapItem.isDemo &&
        selectedMapItem.latitude !== undefined &&
        selectedMapItem.longitude !== undefined &&
        map &&
        (map as any)._mapPane
      ) {
        map.flyTo([selectedMapItem.latitude, selectedMapItem.longitude], 16, { duration: 0.8 });
      }
    }
  }, [selectedMapItem, verifiedPOIs]);

  // 1. Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Reset any dangling leaflet identifier on the DOM element
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Determine initial center: if device location available and centerOnUserByDefault, start there; else Deo center
    const initialCenter: [number, number] =
      centerOnUserByDefault && deviceLocation
        ? [deviceLocation.latitude, deviceLocation.longitude]
        : [DEO_DEFAULT_CENTER.latitude, DEO_DEFAULT_CENTER.longitude];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: DEO_DEFAULT_CENTER.zoom,
      zoomControl: false, // We use custom large touch controls
      attributionControl: true,
    });

    const tileLayer = L.tileLayer(MapService.TILE_URL, {
      maxZoom: MapService.MAX_ZOOM,
      minZoom: MapService.MIN_ZOOM,
      attribution: MapService.ATTRIBUTION,
    });

    tileLayer.on('tileerror', () => setTileError(true));

    tileLayer.on('load', () => {
      setTileError(false);
    });

    tileLayerRef.current = tileLayer;
    if (isOnline) {
      tileLayer.addTo(map);
    } else {
      setTileError(true);
    }

    // Layer group for POI markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    // 1. Setup ResizeObserver for responsive container resizing on mobile
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current && (mapInstanceRef.current as any)._mapPane) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch {
            // Container not ready
          }
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      if (mapInstanceRef.current && (mapInstanceRef.current as any)._mapPane) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    // Invalidate size safely after container settles
    const settleTimer = window.setTimeout(() => {
      if (mapInstanceRef.current && (mapInstanceRef.current as any)._mapPane) {
        try {
          map.invalidateSize();
        } catch {
          // container not ready yet
        }
      }
    }, 200);

    return () => {
      window.clearTimeout(settleTimer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
      if (mapInstanceRef.current) {
        try {
          map.scrollWheelZoom?.disable();
          map.doubleClickZoom?.disable();
          map.touchZoom?.disable();
          map.stop();
          map.off();
          map.remove();
        } catch (err) {
          // teardown safety
        }
        mapInstanceRef.current = null;
      }
      tileLayerRef.current = null;
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Offline walking routes layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (offlineRoutesLayerRef.current) {
      map.removeLayer(offlineRoutesLayerRef.current);
      offlineRoutesLayerRef.current = null;
    }

    if (!isOnline && OfflineMapService.isOfflineMapAvailable()) {
      const offlineLayer = L.layerGroup().addTo(map);
      const routes = OfflineMapService.getOfflineRoutes();
      routes.forEach((route) => {
        const line = L.polyline(route.waypoints, {
          color: '#F47B20',
          weight: 4,
          dashArray: '6, 6',
          opacity: 0.85,
        });
        line.bindPopup(`<b>${route.name}</b><br/>दूरी: ${route.distanceMeters} मी (${route.walkingMinutes} मिनट)`);
        line.addTo(offlineLayer);
      });
      offlineRoutesLayerRef.current = offlineLayer;
    }
  }, [isOnline]);

  useEffect(() => {
    if (previousOnlineRef.current === isOnline) return;
    previousOnlineRef.current = isOnline;
    const map = mapInstanceRef.current;
    if (!map) return;
    if (isOnline) {
      tileLayerRef.current?.addTo(map);
      tileLayerRef.current?.redraw();
      map.invalidateSize();
    } else {
      tileLayerRef.current?.remove();
      setTileError(true);
    }
  }, [isOnline]);

  // 2. Render and Update POI Markers based on active category filters
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    const filteredPOIs = verifiedPOIs.filter((poi) => enabledCategories[poi.category]);

    filteredPOIs.forEach((poi) => {
      const isSelected = selectedPOI?.id === poi.id;
      const icon = MapService.createPOIIcon(poi.category, isSelected);

      const marker = L.marker([poi.latitude, poi.longitude], {
        icon,
        title: poi.name,
        zIndexOffset: isSelected ? 1000 : 100,
      });

      marker.on('click', () => {
        setSelectedPOI(poi);
        // Also update app context selectedMapItem for downstream screens
        setSelectedMapItem({
          id: poi.id,
          name: poi.name,
          nameEn: poi.nameEn,
          category:
            poi.category === 'RELIGIOUS'
              ? 'temple'
              : (poi.category.toLowerCase() as any),
          distance: 'रूट सेवा उपलब्ध नहीं',
          walkingTime: 'रूट सेवा उपलब्ध नहीं',
          description: poi.description,
          landmark: poi.landmark,
          latitude: poi.latitude,
          longitude: poi.longitude,
          isDemo: false,
          x: 50,
          y: 50,
          isWheelchairAccessible: poi.isWheelchairAccessible,
        });

        // Pan map smoothly to marker
        const map = mapInstanceRef.current;
        if (map && (map as any)._mapPane) {
          try {
            map.panTo([poi.latitude, poi.longitude], {
              animate: true,
              duration: 0.5,
            });
          } catch {
            // Safe catch
          }
        }
      });

      marker.addTo(markersLayer);
    });
  }, [enabledCategories, selectedPOI, verifiedPOIs]);

  // 3. Render and Update Real Device GPS Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove previous user marker and circle
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (userAccuracyCircleRef.current) {
      map.removeLayer(userAccuracyCircleRef.current);
      userAccuracyCircleRef.current = null;
    }

    if (deviceLocation && (locationStatus === 'success' || locationStatus === 'low-accuracy' || locationStatus === 'loading')) {
      const userLatLng: [number, number] = [deviceLocation.latitude, deviceLocation.longitude];

      // Accuracy radius circle
      const accuracyCircle = L.circle(userLatLng, {
        radius: Math.max(1, deviceLocation.accuracy),
        color: '#075985',
        fillColor: '#075985',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(map);

      // User Icon Marker
      const userMarker = L.marker(userLatLng, {
        icon: MapService.createUserLocationIcon(locationStatus === 'low-accuracy'),
        title:
          locationStatus === 'low-accuracy'
            ? 'आपका अनुमानित डिवाइस स्थान'
            : 'आप यहाँ हैं (डिवाइस स्थान)',
        zIndexOffset: 2000,
      }).addTo(map);

      userMarkerRef.current = userMarker;
      userAccuracyCircleRef.current = accuracyCircle;
      if (centerOnNextLocationRef.current && (map as any)._mapPane) {
        const zoom =
          deviceLocation.accuracy > 400
            ? Math.max(6, 16 - Math.ceil(Math.log2(deviceLocation.accuracy / 100)))
            : 16;
        map.flyTo(userLatLng, zoom, { duration: 0.8 });
        centerOnNextLocationRef.current = false;
        setStatusToast(null);
      }
    }
  }, [deviceLocation, locationStatus]);

  // 4. Render geometry returned by the configured routing provider.
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (showRouteLine && routeGeometry && routeGeometry.length > 1) {
      const routeGroup = L.layerGroup();

      // Outer luminous gold border casing
      const casing = L.polyline(routeGeometry, {
        color: '#FFD54F',
        weight: 9,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Inner high-visibility deep river blue road core
      const core = L.polyline(routeGeometry, {
        color: '#0B5E8E',
        weight: 5,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Start Marker (Green beacon)
      const startMarker = L.circleMarker(routeGeometry[0], {
        radius: 7,
        color: '#FFFFFF',
        fillColor: '#16A34A',
        fillOpacity: 1,
        weight: 3,
      });

      // Destination Marker (Red beacon)
      const endMarker = L.circleMarker(routeGeometry[routeGeometry.length - 1], {
        radius: 8,
        color: '#FFFFFF',
        fillColor: '#DC2626',
        fillOpacity: 1,
        weight: 3,
      });

      routeGroup.addLayer(casing);
      routeGroup.addLayer(core);
      routeGroup.addLayer(startMarker);
      routeGroup.addLayer(endMarker);
      routeGroup.addTo(map);

      routeLineRef.current = routeGroup;

      const bounds = L.latLngBounds(routeGeometry);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 17 });
    }
  }, [routeGeometry, showRouteLine]);

  // Handlers for Map Controls
  const handleZoomIn = () => {
    const map = mapInstanceRef.current;
    if (map && (map as any)._mapPane) {
      try {
        map.zoomIn();
      } catch {
        // Safe catch
      }
    }
  };

  const handleZoomOut = () => {
    const map = mapInstanceRef.current;
    if (map && (map as any)._mapPane) {
      try {
        map.zoomOut();
      } catch {
        // Safe catch
      }
    }
  };

  // “📍 मेरा स्थान” Handler
  const handleMyLocationPress = async () => {
    setStatusToast('आपका स्थान खोजा जा रहा है…');
    centerOnNextLocationRef.current = true;
    const success = await requestDeviceLocation();
    if (!success) {
      centerOnNextLocationRef.current = false;
      setStatusToast(null);
    }
  };

  const toggleCategory = (cat: POICategory) => {
    setEnabledCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Calculate distance from live device location to selected POI
  const distanceText = useMemo(() => {
    if (!deviceLocation || !selectedPOI) {
      return 'GPS उपलब्ध होने पर दूरी दिखाई जाएगी।';
    }
    return LocationService.formatDistanceHindi(
      { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
      { latitude: selectedPOI.latitude, longitude: selectedPOI.longitude }
    );
  }, [deviceLocation, selectedPOI]);

  const handleNavigateClick = () => {
    if (!selectedPOI) return;
    const locationItem: LocationItem = {
      id: selectedPOI.id,
      name: selectedPOI.name,
      nameEn: selectedPOI.nameEn,
      category:
        selectedPOI.category === 'RELIGIOUS'
          ? 'temple'
          : (selectedPOI.category.toLowerCase() as any),
      distance: distanceText,
      walkingTime: 'रूट सेवा अभी उपलब्ध नहीं है।',
      description: selectedPOI.description,
      landmark: selectedPOI.landmark,
      latitude: selectedPOI.latitude,
      longitude: selectedPOI.longitude,
      status: selectedPOI.status,
      isDemo: selectedPOI.isDemo,
      x: 50,
      y: 50,
      isWheelchairAccessible: selectedPOI.isWheelchairAccessible,
    };

    setSelectedMapItem(locationItem);

    if (onNavigateToPreview) {
      onNavigateToPreview(locationItem);
    } else {
      navigate('navigation-preview');
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-stone-300 bg-stone-100 shadow-md flex flex-col font-['Mukta',sans-serif]">
      {/* ============================================================ */}
      {/* TOP FLOATING STRIP: Internet Status & ☰ सुविधाएँ Filter      */}
      {/* ============================================================ */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        {/* Internet status is independent of the device GPS status. */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-300 shadow-sm text-xs font-black flex items-center gap-1.5">
          {isOnline ? (
            <span className="text-emerald-800 flex items-center gap-1">
              <span className="text-sm">🟢</span>
              <span>Online</span>
            </span>
          ) : (
            <span className="text-amber-800 flex items-center gap-1">
              <span className="text-sm">🟠</span>
              <span>Offline</span>
            </span>
          )}
        </div>

        {/* ☰ सुविधाएँ Filter Button */}
        <button
          onClick={() => setFilterMenuOpen(!filterMenuOpen)}
          className="pointer-events-auto min-h-[42px] px-3.5 bg-white/95 backdrop-blur-md border border-stone-300 text-stone-900 rounded-xl shadow-sm text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <span>☰ सुविधाएँ</span>
          <Filter className="w-3.5 h-3.5 text-amber-700" />
        </button>
      </div>

      <div className="absolute top-14 left-3 right-3 z-[980] pointer-events-none space-y-1">
        <div className="inline-flex rounded-lg border border-stone-300 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#063B5C] shadow-sm">
          मानचित्र क्षेत्र • देव, औरंगाबाद, बिहार
        </div>
        <div className="max-w-[calc(100%-3.5rem)] rounded-lg border border-stone-300 bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-stone-800 shadow-sm">
          {deviceLocation ? (
            <>
              <span>
                {locationStatus === 'success' || locationStatus === 'low-accuracy'
                  ? 'वर्तमान GPS स्थान'
                  : 'अंतिम प्राप्त GPS स्थान'}
                {' '}• सटीकता ±{deviceLocation.accuracy} मीटर
              </span>
              <span className="block text-[10px] text-stone-600">
                अंतिम अपडेट: {new Date(deviceLocation.timestamp).toLocaleString('hi-IN')}
                {locationStatus === 'low-accuracy' ? ' • कम सटीकता' : ''}
              </span>
              {locationErrorMessage && <span className="block text-rose-800">{locationErrorMessage}</span>}
            </>
          ) : locationStatus === 'loading' ? (
            'डिवाइस GPS स्थान खोजा जा रहा है…'
          ) : locationErrorMessage ? (
            <span className="text-rose-800">{locationErrorMessage}</span>
          ) : (
            'वर्तमान GPS स्थान उपलब्ध नहीं • देव क्षेत्र का मानचित्र'
          )}
        </div>
        {facilityLoadStatus === 'cached' && (
          <div className="max-w-[calc(100%-3.5rem)] rounded-lg border border-amber-300 bg-amber-50/95 px-2.5 py-1.5 text-[10px] font-bold text-amber-950 shadow-sm">
            ऑफलाइन सहेजा सत्यापित डेटा • अंतिम सिंक:{' '}
            {facilityCacheTimestamp
              ? new Date(facilityCacheTimestamp).toLocaleString('hi-IN')
              : 'समय उपलब्ध नहीं'}
          </div>
        )}
        {locationErrorMessage && (
          <button
            onClick={() => void requestDeviceLocation()}
            className="pointer-events-auto min-h-[40px] rounded-lg bg-white px-3 text-xs font-black text-[#075985] shadow-sm"
          >
            GPS फिर से प्रयास करें
          </button>
        )}
      </div>

      {/* Floating Status Toast */}
      {statusToast && (
        <div className="absolute top-16 left-4 right-4 z-[1000] bg-stone-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between border border-amber-400/40 text-xs">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            <span className="font-bold">{statusToast}</span>
          </div>
          <button onClick={() => setStatusToast(null)} className="p-1 text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Facility Filter Drawer */}
      {filterMenuOpen && (
        <div className="absolute top-16 right-3 z-[1010] bg-white/95 backdrop-blur-md border border-stone-300 rounded-2xl p-3 shadow-2xl w-60 space-y-2 select-none animate-fade-in">
          <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-800">
              मानचित्र सुविधाएँ
            </h4>
            <button
              onClick={() => setFilterMenuOpen(false)}
              className="p-1 rounded-lg text-stone-500 hover:text-stone-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1 text-xs font-bold text-stone-800">
            {[
              { key: 'RELIGIOUS' as POICategory, label: '☀️ धार्मिक स्थल' },
              { key: 'PARKING' as POICategory, label: '🅿️ Parking' },
              { key: 'SHUTTLE' as POICategory, label: '🛺 Shuttle' },
              { key: 'MEDICAL' as POICategory, label: '🚑 Medical' },
              { key: 'TOILET' as POICategory, label: '🚻 Toilet' },
              { key: 'WATER' as POICategory, label: '💧 Water' },
              { key: 'HELP' as POICategory, label: '🆘 सहायता' },
            ].map((f) => {
              const active = enabledCategories[f.key];
              return (
                <button
                  key={f.key}
                  onClick={() => toggleCategory(f.key)}
                  className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                    active ? 'bg-amber-100 text-stone-900' : 'bg-stone-50 text-stone-400 line-through'
                  }`}
                >
                  <span>{f.label}</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                      active ? 'bg-amber-600 text-white' : 'border border-stone-300'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* REAL LEAFLET MAP CONTAINER                                   */}
      {/* ============================================================ */}
      <div className={`relative w-full ${heightClass} bg-stone-200`}>
        {/* Leaflet DOM Node */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Keep the base map unobscured so an actual GPS marker remains visible without tiles. */}
        {tileError && (
          <div className="absolute bottom-3 left-3 right-16 z-[950] rounded-xl border border-stone-500 bg-stone-950/90 p-3 text-white shadow-lg">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
              <h4 className="text-xs font-black">
                {isOnline
                  ? 'ऑनलाइन मैप टाइलें लोड नहीं हो पाईं।'
                  : OfflineMapService.isOfflineMapAvailable()
                    ? 'देव ऑफलाइन मैप सक्रिय है'
                    : 'ऑफलाइन — ऑनलाइन मैप टाइलें अनुपलब्ध'}
              </h4>
            </div>
            <p className="mt-1 text-[11px] text-stone-200">
              {OfflineMapService.isOfflineMapAvailable()
                ? 'देव तीर्थ क्षेत्र के सभी सत्यापित घाट, मंदिर, पार्किंग व आपातकालीन केंद्र प्रदर्शित हैं।'
                : 'GPS बिना इंटरनेट के भी काम करता है। बिना इंटरनेट देखने हेतु ऑफलाइन मैप डाउनलोड करें।'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {isOnline && (
                <button
                  onClick={() => {
                    const map = mapInstanceRef.current;
                    if (map && (map as any)._mapPane) {
                      map.invalidateSize();
                      tileLayerRef.current?.redraw();
                    }
                  }}
                  className="min-h-[40px] px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>टाइलें फिर से लोड करें</span>
                </button>
              )}
              {!OfflineMapService.isOfflineMapAvailable() && (
                <button
                  onClick={() => navigate('offline-map')}
                  className="min-h-[40px] px-3 bg-[#075985] hover:bg-[#063B5C] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <span>ऑफलाइन मैप डाउनलोड करें</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Large Touch Controls (+, -, 📍 मेरा स्थान) positioned away from bottom nav */}
        <div className="absolute bottom-4 right-3 flex flex-col gap-2 z-[990]">
          <button
            onClick={handleZoomIn}
            aria-label="ज़ूम इन करें"
            className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-stone-800 hover:bg-stone-50 active:scale-95 border border-stone-300"
          >
            <ZoomIn className="w-6 h-6" />
          </button>

          <button
            onClick={handleZoomOut}
            aria-label="ज़ूम आउट करें"
            className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-stone-800 hover:bg-stone-50 active:scale-95 border border-stone-300"
          >
            <ZoomOut className="w-6 h-6" />
          </button>

          <button
            onClick={handleMyLocationPress}
            aria-label="मेरा स्थान"
            disabled={locationStatus === 'loading'}
            className="min-h-[46px] px-3.5 rounded-2xl bg-white shadow-lg flex items-center justify-center gap-1.5 text-[#075985] hover:bg-stone-50 active:scale-95 border border-stone-300 text-xs font-black transition-all"
            title="मेरा स्थान दिखाएँ"
          >
            {locationStatus === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
            ) : (
              <span className="text-base">📍</span>
            )}
            <span>मेरा स्थान</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. POI INFORMATION CARD                                      */}
      {/* ============================================================ */}
      {selectedPOI && (
        <div className="bg-white border-t border-stone-200 p-4 space-y-3 z-20">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">
                  {POIService.getCategoryIcon(selectedPOI.category)}
                </span>
                <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight truncate">
                  {selectedPOI.name}
                </h3>
              </div>
              <p className="text-xs text-stone-600 font-semibold truncate">
                Category: {POIService.getCategoryHindiLabel(selectedPOI.category)} • {selectedPOI.landmark}
              </p>
              <p className="text-xs text-stone-500 line-clamp-1">
                {selectedPOI.description}
              </p>
              <p className="text-[11px] font-semibold text-emerald-800">
                सत्यापित • स्रोत: {selectedPOI.source} • अपडेट: {selectedPOI.lastUpdated}
              </p>
              <div className="text-xs text-amber-800 font-bold pt-0.5">
                <span>दूरी: </span>
                <span className="text-stone-700 font-semibold">{distanceText}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: 🧭 रास्ता दिखाएँ & ℹ️ जानकारी */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleNavigateClick}
              className="flex-1 min-h-[48px] bg-gradient-to-r from-[#075985] to-[#123052] hover:from-[#08182B] hover:to-[#075985] active:scale-95 text-white font-black text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all border border-[#075985]/40"
            >
              <Navigation className="w-4 h-4 fill-white" />
              <span>🧭 रास्ता दिखाएँ</span>
            </button>

            <button
              onClick={() => setInfoModalOpen(true)}
              className="min-h-[48px] px-4 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 flex items-center gap-1 transition-colors"
            >
              <InfoIcon className="w-3.5 h-3.5 text-amber-800" />
              <span>जानकारी</span>
            </button>
          </div>
        </div>
      )}

      {!selectedPOI && (
        <section className="border-t border-stone-200 bg-white p-4 text-sm text-stone-700" aria-live="polite">
          <h3 className="font-black text-[#063B5C]">
            {facilityLoadStatus === 'loading'
              ? 'सत्यापित सुविधाएँ लोड हो रही हैं…'
              : facilityLoadStatus === 'error'
                ? 'सुविधा डेटा लोड नहीं हो पाया'
                : facilityLoadStatus === 'cached'
                  ? 'ऑफ़लाइन सहेजा सत्यापित सुविधा डेटा'
                  : 'सत्यापित सुविधा डेटा उपलब्ध नहीं है'}
          </h3>
          <p className="mt-1 text-xs">
            {facilityLoadStatus === 'error'
              ? 'कनेक्शन जाँचें और फिर से प्रयास करें।'
              : facilityLoadStatus === 'cached'
                ? `यह लाइव डेटा नहीं है। अंतिम सफल सिंक: ${
                    facilityCacheTimestamp
                      ? new Date(facilityCacheTimestamp).toLocaleString('hi-IN')
                      : 'समय उपलब्ध नहीं'
                  }`
                : 'अधिकृत डेटा स्रोत से सत्यापित स्थान मिलने पर ही मैप पर दिखेंगे।'}
          </p>
          {facilityLoadStatus === 'error' && (
            <button
              onClick={() => setFacilityReload((count) => count + 1)}
              className="mt-3 min-h-[44px] rounded-xl bg-[#075985] px-4 text-sm font-bold text-white"
            >
              सुविधाएँ फिर से लोड करें
            </button>
          )}
        </section>
      )}

      {/* ℹ️ POI Details Modal */}
      {infoModalOpen && selectedPOI && (
        <div className="fixed inset-0 z-[1050] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl animate-fade-in border-2 border-amber-300">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h4 className="text-base font-black text-stone-900 flex items-center gap-1.5 truncate">
                <span>{POIService.getCategoryIcon(selectedPOI.category)}</span>
                <span className="truncate">{selectedPOI.name}</span>
              </h4>
              <button
                onClick={() => setInfoModalOpen(false)}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-700 space-y-2">
              <p>
                <strong>श्रेणी:</strong> {POIService.getCategoryHindiLabel(selectedPOI.category)}
              </p>
              <p>
                <strong>लैंडमार्क:</strong> {selectedPOI.landmark}
              </p>
              <p><strong>सत्यापन स्रोत:</strong> {selectedPOI.source}</p>
              <p><strong>अंतिम अपडेट:</strong> {selectedPOI.lastUpdated}</p>
              <p>
                <strong>सीधी दूरी:</strong> {distanceText}
              </p>
              <p className="bg-stone-50 p-2 rounded-lg border border-stone-200 text-stone-600">
                {selectedPOI.description}
              </p>
              {selectedPOI.accessibilityInfo && (
                <p className="text-emerald-700 font-bold">
                  {selectedPOI.accessibilityInfo}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setInfoModalOpen(false);
                handleNavigateClick();
              }}
              className="w-full min-h-[44px] bg-gradient-to-r from-[#F47B20] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              🧭 यहाँ का रास्ता दिखाएँ
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
