import './leafletSafePatch';
import L from 'leaflet';
import { POICategory, POIItem } from './POIService';

export const MapService = {
  // Tile server URL for standard OpenStreetMap
  OSM_TILE_URL: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  OSM_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',

  // Create customized high-contrast HTML icons for Leaflet markers
  createPOIIcon: (category: POICategory, isSelected: boolean = false): L.DivIcon => {
    let iconEmoji = '📍';
    let bgColor = '#d97706';
    let ringColor = '#fde68a';

    switch (category) {
      case 'RELIGIOUS':
        iconEmoji = '☀️';
        bgColor = '#b45309';
        ringColor = '#fde68a';
        break;
      case 'PARKING':
        iconEmoji = '🅿️';
        bgColor = '#4338ca';
        ringColor = '#c7d2fe';
        break;
      case 'SHUTTLE':
        iconEmoji = '🛺';
        bgColor = '#c2410c';
        ringColor = '#fed7aa';
        break;
      case 'MEDICAL':
        iconEmoji = '🚑';
        bgColor = '#be123c';
        ringColor = '#fecdd3';
        break;
      case 'TOILET':
        iconEmoji = '🚻';
        bgColor = '#047857';
        ringColor = '#a7f3d0';
        break;
      case 'WATER':
        iconEmoji = '💧';
        bgColor = '#0e7490';
        ringColor = '#a5f3fc';
        break;
      case 'HELP':
        iconEmoji = '🆘';
        bgColor = '#b91c1c';
        ringColor = '#fecaca';
        break;
    }

    const size = isSelected ? 42 : 36;
    const border = isSelected ? '3px solid #f59e0b' : '2px solid #ffffff';
    const shadow = isSelected ? '0 8px 16px rgba(0,0,0,0.35)' : '0 4px 8px rgba(0,0,0,0.2)';

    const html = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${bgColor};
        border: ${border};
        box-shadow: ${shadow};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? 20 : 18}px;
        color: #ffffff;
        cursor: pointer;
        transition: transform 0.15s ease-in-out;
        transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
      ">
        <span>${iconEmoji}</span>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'deo-custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  },

  // Create User Location Marker Icon with pulse effect
  createUserLocationIcon: (lowAccuracy = false): L.DivIcon => {
    const pulse = lowAccuracy ? 'rgba(245, 124, 0, 0.16)' : 'rgba(245, 124, 0, 0.35)';
    const animation = lowAccuracy ? 'none' : 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite';
    const html = `
      <div style="position: relative; width: 28px; height: 28px;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${pulse};
          animation: ${animation};
        "></div>
        <div style="
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: #F57C00;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'deo-user-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  },

  // Create Route Alert Marker Icon (Road Closure, Diversion, Route Alert)
  createRouteAlertIcon: (type: 'ROAD_CLOSURE' | 'DIVERSION' | 'ROUTE_ALERT'): L.DivIcon => {
    let emoji = '⚠️';
    let bgColor = '#ea580c';
    let borderColor = '#fed7aa';

    if (type === 'ROAD_CLOSURE') {
      emoji = '🚧';
      bgColor = '#dc2626';
      borderColor = '#fecaca';
    } else if (type === 'DIVERSION') {
      emoji = '↪️';
      bgColor = '#d97706';
      borderColor = '#fde68a';
    }

    const html = `
      <div style="position: relative; width: 38px; height: 38px;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${bgColor};
          opacity: 0.35;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: ${bgColor};
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
        ">
          <span>${emoji}</span>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'deo-route-alert-marker',
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });
  },
};
