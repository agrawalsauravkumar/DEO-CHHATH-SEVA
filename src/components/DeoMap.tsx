import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { POIService, POIItem, POICategory, DEO_DEFAULT_CENTER } from '../services/POIService';
import { LocationService } from '../services/LocationService';
import { MapService } from '../services/MapService';
import { AnnouncementService } from '../services/AnnouncementService';
import { LocationItem, RouteAlert } from '../types';
import {
  ZoomIn,
  ZoomOut,
  Navigation,
  Check,
  Filter,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  WifiOff,
  Info as InfoIcon,
  ShieldCheck,
  AlertTriangle,
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
    requestDeviceLocation,
    offlineMapDownloaded,
    isOnline,
    navigate,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeAlertsLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [tileError, setTileError] = useState<boolean>(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [selectedRouteAlert, setSelectedRouteAlert] = useState<RouteAlert | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

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
  const [selectedPOI, setSelectedPOI] = useState<POIItem>(() => {
    if (selectedMapItem) {
      // Find matching POI by ID or coordinates
      const match = POIService.getAllPOIs().find(
        (p) => p.id === selectedMapItem.id || p.name === selectedMapItem.name
      );
      if (match) return match;
    }
    return POIService.getAllPOIs()[0];
  });

  // Sync selectedMapItem changes from outside (e.g., Destination Search selection)
  useEffect(() => {
    if (selectedMapItem) {
      const match = POIService.getAllPOIs().find(
        (p) => p.id === selectedMapItem.id || p.name === selectedMapItem.name
      );
      if (match) {
        setSelectedPOI(match);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([match.latitude, match.longitude], 16, {
            duration: 0.8,
          });
        }
      }
    }
  }, [selectedMapItem]);

  // 1. Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

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

    // Add standard OpenStreetMap Tile Layer
    const tileLayer = L.tileLayer(MapService.OSM_TILE_URL, {
      maxZoom: 19,
      attribution: MapService.OSM_ATTRIBUTION,
    });

    tileLayer.on('tileerror', () => {
      if (!navigator.onLine) {
        setTileError(true);
      }
    });

    tileLayer.on('load', () => {
      setMapLoaded(true);
      setTileError(false);
    });

    tileLayer.addTo(map);

    // Layer group for POI markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Layer group for Route Alert & Closure markers (Step 16)
    const routeAlertsLayer = L.layerGroup().addTo(map);
    routeAlertsLayerRef.current = routeAlertsLayer;

    mapInstanceRef.current = map;

    // Invalidate size after container settles
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 1b. Render Active Route Alerts (Road Closures, Diversions, Restrictions - Step 16)
  useEffect(() => {
    if (!mapInstanceRef.current || !routeAlertsLayerRef.current) return;
    const layer = routeAlertsLayerRef.current;
    layer.clearLayers();

    const activeAlerts = AnnouncementService.getActiveRouteAlerts();

    activeAlerts.forEach((alert) => {
      const icon = MapService.createRouteAlertIcon(alert.type);
      const marker = L.marker([alert.latitude, alert.longitude], {
        icon,
        title: `${alert.title} - ${alert.roadName}`,
        zIndexOffset: 1500,
      });

      // Zone restriction circle if radius is specified
      if (alert.radiusMeters) {
        L.circle([alert.latitude, alert.longitude], {
          radius: alert.radiusMeters,
          color: alert.type === 'ROAD_CLOSURE' ? '#dc2626' : '#d97706',
          fillColor: alert.type === 'ROAD_CLOSURE' ? '#f87171' : '#fde68a',
          fillOpacity: 0.18,
          weight: 2,
          dashArray: '6, 6',
        }).addTo(layer);
      }

      marker.on('click', () => {
        setSelectedRouteAlert(alert);
        mapInstanceRef.current?.panTo([alert.latitude, alert.longitude], {
          animate: true,
          duration: 0.5,
        });
      });

      marker.addTo(layer);
    });
  }, [mapLoaded]);

  // 2. Render and Update POI Markers based on active category filters
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    const filteredPOIs = POIService.getPOIsByCategories(enabledCategories);

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
          distance: 'दूरी उपलब्ध',
          walkingTime: 'पैदल मार्ग',
          description: poi.description,
          landmark: poi.landmark,
          latitude: poi.latitude,
          longitude: poi.longitude,
          status: poi.status,
          isDemo: poi.isDemo,
          x: 50,
          y: 50,
          isWheelchairAccessible: poi.isWheelchairAccessible,
        });

        // Pan map smoothly to marker
        mapInstanceRef.current?.panTo([poi.latitude, poi.longitude], {
          animate: true,
          duration: 0.5,
        });
      });

      marker.addTo(markersLayer);
    });
  }, [enabledCategories, selectedPOI]);

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

    if (deviceLocation) {
      const userLatLng: [number, number] = [deviceLocation.latitude, deviceLocation.longitude];

      // Accuracy radius circle
      const accuracyCircle = L.circle(userLatLng, {
        radius: Math.min(1000, Math.max(15, deviceLocation.accuracy)),
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(map);

      // User Icon Marker
      const userMarker = L.marker(userLatLng, {
        icon: MapService.createUserLocationIcon(),
        title: 'आप यहाँ हैं (User Location)',
        zIndexOffset: 2000,
      }).addTo(map);

      userMarkerRef.current = userMarker;
      userAccuracyCircleRef.current = accuracyCircle;
    }
  }, [deviceLocation]);

  // 4. Render Route Preview Line (straight-line coordinate connector)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (routeGeometry && routeGeometry.length > 1) {
      const polyline = L.polyline(routeGeometry, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routeLineRef.current = polyline;

      const bounds = L.latLngBounds(routeGeometry);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    } else if (showRouteLine && selectedPOI) {
      const startLatLng: [number, number] = deviceLocation
        ? [deviceLocation.latitude, deviceLocation.longitude]
        : [DEO_DEFAULT_CENTER.latitude, DEO_DEFAULT_CENTER.longitude];

      const destLatLng: [number, number] = [selectedPOI.latitude, selectedPOI.longitude];

      const polyline = L.polyline([startLatLng, destLatLng], {
        color: '#d97706',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.85,
      }).addTo(map);

      routeLineRef.current = polyline;

      // Fit map bounds to encompass both points
      const bounds = L.latLngBounds([startLatLng, destLatLng]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [routeGeometry, showRouteLine, selectedPOI, deviceLocation]);

  // Handlers for Map Controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // “📍 मेरा स्थान” Handler
  const handleMyLocationPress = async () => {
    setStatusToast('आपका स्थान खोजा जा रहा है…');

    const success = await requestDeviceLocation();
    if (success && deviceLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [deviceLocation.latitude, deviceLocation.longitude],
        16,
        { duration: 0.8 }
      );
      setStatusToast('आपका स्थान मिल गया।');
      setTimeout(() => setStatusToast(null), 3000);
    } else {
      setTimeout(() => setStatusToast(null), 4000);
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
    if (!deviceLocation) {
      return 'GPS उपलब्ध होने पर दूरी दिखाई जाएगी।';
    }
    return LocationService.formatDistanceHindi(
      { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
      { latitude: selectedPOI.latitude, longitude: selectedPOI.longitude }
    );
  }, [deviceLocation, selectedPOI]);

  const handleNavigateClick = () => {
    const locationItem: LocationItem = {
      id: selectedPOI.id,
      name: selectedPOI.name,
      nameEn: selectedPOI.nameEn,
      category:
        selectedPOI.category === 'RELIGIOUS'
          ? 'temple'
          : (selectedPOI.category.toLowerCase() as any),
      distance: distanceText,
      walkingTime: LocationService.formatWalkingTimeHindi(
        deviceLocation ? { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude } : null,
        { latitude: selectedPOI.latitude, longitude: selectedPOI.longitude }
      ),
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
        {/* Real Internet / Offline Map Status Indicator */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-300 shadow-sm text-xs font-black flex items-center gap-1.5">
          {isOnline ? (
            <span className="text-emerald-800 flex items-center gap-1">
              <span className="text-sm">🟢</span>
              <span>Online Map</span>
            </span>
          ) : offlineMapDownloaded ? (
            <span className="text-emerald-800 flex items-center gap-1">
              <span className="text-sm">🟢</span>
              <span>Offline Map (सहेजा गया)</span>
            </span>
          ) : (
            <span className="text-stone-700 flex items-center gap-1">
              <span className="text-sm">⚪</span>
              <span>Internet उपलब्ध नहीं है</span>
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

        {/* Offline / No Package Overlay when offline and not downloaded */}
        {!isOnline && !offlineMapDownloaded && (
          <div className="absolute inset-0 z-20 bg-stone-900/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-3 animate-fade-in">
            <WifiOff className="w-12 h-12 text-amber-400" />
            <h4 className="text-lg font-black text-amber-100">
              ऑफलाइन मैप डेटा अभी उपलब्ध नहीं है।
            </h4>
            <p className="text-xs text-stone-300 max-w-xs leading-relaxed">
              इंटरनेट नेटवर्क उपलब्ध नहीं है। बिना इंटरनेट भी देव का पूरा नक्शा और सुविधाएं देखने के लिए ऑफलाइन पैकेज डाउनलोड करें।
            </p>
            <button
              onClick={() => navigate('offline-map')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <span>ऑफलाइन डेटा डाउनलोड करें</span>
            </button>
          </div>
        )}

        {/* Tile Error Overlay when online but network request fails */}
        {tileError && isOnline && (
          <div className="absolute inset-0 z-20 bg-stone-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
            <WifiOff className="w-10 h-10 text-amber-400" />
            <h4 className="text-base font-black">मैप लोड नहीं हो पाया।</h4>
            <p className="text-xs text-stone-300 max-w-xs">
              इंटरनेट कनेक्टिविटी धीमी है या अस्थायी रूप से अनुपलब्ध है।
            </p>
            <button
              onClick={() => {
                setTileError(false);
                mapInstanceRef.current?.invalidateSize();
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>फिर से प्रयास करें</span>
            </button>
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
            className="min-h-[46px] px-3.5 rounded-2xl bg-white shadow-lg flex items-center justify-center gap-1.5 text-blue-700 hover:bg-stone-50 active:scale-95 border border-stone-300 text-xs font-black transition-all"
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
              className="flex-1 min-h-[48px] bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Navigation className="w-4 h-4 fill-white" />
              <span>🧭 रास्ता दिखाएँ</span>
            </button>

            <button
              onClick={() => setInfoModalOpen(true)}
              className="min-h-[48px] px-4 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 flex items-center gap-1 transition-colors"
            >
              <InfoIcon className="w-3.5 h-3.5 text-stone-600" />
              <span>जानकारी</span>
            </button>
          </div>
        </div>
      )}

      {/* ℹ️ POI Details Modal */}
      {infoModalOpen && selectedPOI && (
        <div className="fixed inset-0 z-[1050] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl animate-fade-in">
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
              <p>
                <strong>स्थिति:</strong> {selectedPOI.status} (डेमो डेटा)
              </p>
              <p>
                <strong>सीधी दूरी:</strong> {distanceText}
              </p>
              <p className="bg-stone-50 p-2 rounded-lg border border-stone-200 text-stone-600">
                {selectedPOI.description}
              </p>
              {selectedPOI.isWheelchairAccessible && (
                <p className="text-emerald-700 font-bold">
                  ✓ वरिष्ठ नागरिक एवं दिव्यांग अनुकूल प्रवेश
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setInfoModalOpen(false);
                handleNavigateClick();
              }}
              className="w-full min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              🧭 यहाँ का रास्ता दिखाएँ
            </button>
          </div>
        </div>
      )}

      {/* ⚠️ Route Alert / Road Closure Details Modal (Requirement 6) */}
      {selectedRouteAlert && (
        <div className="fixed inset-0 z-[1060] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3.5 shadow-2xl border-2 border-amber-400">
            <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <span className="text-lg">
                    {selectedRouteAlert.type === 'ROAD_CLOSURE' ? '🚧' : '⚠️'}
                  </span>
                  <span
                    className={`uppercase px-2 py-0.5 rounded-full text-[10px] ${
                      selectedRouteAlert.type === 'ROAD_CLOSURE'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {selectedRouteAlert.type === 'ROAD_CLOSURE'
                      ? 'सड़क बंद (Road Closure)'
                      : 'मार्ग डायवर्जन (Route Diversion)'}
                  </span>
                </div>
                <h4 className="text-base font-black text-stone-900 leading-snug">
                  {selectedRouteAlert.title}
                </h4>
              </div>
              <button
                onClick={() => setSelectedRouteAlert(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verified Official Badge */}
            {selectedRouteAlert.isVerified && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✅ VERIFIED OFFICIAL • जिला प्रशासन आदेश</span>
              </div>
            )}

            <div className="text-xs text-stone-700 space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-100">
              <p>
                <strong className="text-stone-900">मार्ग का नाम:</strong> {selectedRouteAlert.roadName}
              </p>
              <p>
                <strong className="text-stone-900">प्रभावित क्षेत्र:</strong> {selectedRouteAlert.affectedArea}
              </p>
              <p>
                <strong className="text-stone-900">कारण:</strong> {selectedRouteAlert.reason}
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                <span>समय: {selectedRouteAlert.startTime} - {selectedRouteAlert.endTime || 'आदेश तक'}</span>
                <span>अपडेट: {selectedRouteAlert.lastUpdated}</span>
              </div>
            </div>

            {/* Alternative Route advice */}
            {selectedRouteAlert.alternativeRouteAvailable && selectedRouteAlert.alternativeRouteAdvice && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-950 space-y-1">
                <span className="font-bold flex items-center gap-1 text-emerald-900">
                  <span>↪️</span>
                  <span>वैकल्पिक मार्ग सुझाव:</span>
                </span>
                <p className="text-[11px] font-medium leading-relaxed">
                  {selectedRouteAlert.alternativeRouteAdvice}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {selectedRouteAlert.alternativeRouteAvailable && (
                <button
                  onClick={() => {
                    const alert = selectedRouteAlert;
                    setSelectedRouteAlert(null);
                    // Point map to bypass / alternative route
                    mapInstanceRef.current?.flyTo([alert.latitude + 0.003, alert.longitude + 0.003], 16, {
                      duration: 0.8,
                    });
                    setStatusToast('वैकल्पिक बाईपास मार्ग पर फोकस किया गया।');
                  }}
                  className="w-full min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>↪️</span>
                  <span>वैकल्पिक रास्ता देखें</span>
                </button>
              )}

              <button
                onClick={() => setSelectedRouteAlert(null)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-200"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
