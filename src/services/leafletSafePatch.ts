import L from 'leaflet';

/**
 * Global Leaflet Safety Patch
 *
 * Prevents:
 * "TypeError: Cannot read properties of undefined (reading '_leaflet_pos')"
 * which occurs in Leaflet 1.9.x when:
 * 1. Scroll-wheel zoom timer (_performZoom) fires after a map instance or pane is unmounted/removed.
 * 2. Rapid screen navigation / tab changes detach map DOM before asynchronous zoom/pan completes.
 * 3. DomUtil.getPosition is invoked with an undefined or detached pane element.
 */
if (typeof window !== 'undefined' && L) {
  // 1. Guard DomUtil.getPosition against null/undefined elements
  if (L.DomUtil && L.DomUtil.getPosition) {
    const originalGetPosition = L.DomUtil.getPosition;
    L.DomUtil.getPosition = function (el: any) {
      if (!el || typeof el !== 'object') {
        return new L.Point(0, 0);
      }
      try {
        const pos = originalGetPosition.call(L.DomUtil, el);
        return pos || new L.Point(0, 0);
      } catch {
        return (el && el._leaflet_pos) || new L.Point(0, 0);
      }
    };
  }

  // 2. Guard Map.prototype._getMapPanePos
  if (L.Map && (L.Map.prototype as any)._getMapPanePos) {
    const originalGetMapPanePos = (L.Map.prototype as any)._getMapPanePos;
    (L.Map.prototype as any)._getMapPanePos = function () {
      if (!this || !this._mapPane) {
        return new L.Point(0, 0);
      }
      try {
        return originalGetMapPanePos.call(this) || new L.Point(0, 0);
      } catch {
        return new L.Point(0, 0);
      }
    };
  }

  // 3. Guard Map.prototype.setZoomAround
  if (L.Map && (L.Map.prototype as any).setZoomAround) {
    const originalSetZoomAround = (L.Map.prototype as any).setZoomAround;
    (L.Map.prototype as any).setZoomAround = function (latlng: any, zoom: any, options: any) {
      if (!this || !this._mapPane || !this._container) {
        return this;
      }
      try {
        return originalSetZoomAround.call(this, latlng, zoom, options);
      } catch (err) {
        return this;
      }
    };
  }

  // 4. Guard Map.ScrollWheelZoom._performZoom
  const ScrollWheelZoomClass = (L as any).Map?.ScrollWheelZoom;
  if (ScrollWheelZoomClass && ScrollWheelZoomClass.prototype?._performZoom) {
    const originalPerformZoom = ScrollWheelZoomClass.prototype._performZoom;
    ScrollWheelZoomClass.prototype._performZoom = function () {
      if (!this || !this._map || !this._map._mapPane || !this._map._container) {
        return;
      }
      try {
        originalPerformZoom.call(this);
      } catch (err) {
        // Suppress unmounted scroll wheel errors cleanly
      }
    };
  }
}

export default L;
