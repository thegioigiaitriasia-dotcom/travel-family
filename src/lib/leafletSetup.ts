import L from 'leaflet';

// Safe guard against Leaflet accessing _leaflet_pos on undefined/null DOM elements during re-renders or unmounts
if (typeof window !== 'undefined' && L && L.DomUtil && !(L.DomUtil as any)._posPatched) {
  (L.DomUtil as any)._posPatched = true;

  L.DomUtil.getPosition = function (el: any) {
    if (!el) return new L.Point(0, 0);
    try {
      return el._leaflet_pos || new L.Point(0, 0);
    } catch {
      return new L.Point(0, 0);
    }
  };

  L.DomUtil.setPosition = function (el: any, point: L.Point) {
    if (!el) return;
    try {
      el._leaflet_pos = point;
      if (L.Browser.any3d) {
        L.DomUtil.setTransform(el, point);
      } else {
        el.style.left = point.x + 'px';
        el.style.top = point.y + 'px';
      }
    } catch {
      // ignore
    }
  };

  if (L.PosAnimation) {
    const origPosAnimStep = (L.PosAnimation.prototype as any)._onLoop;
    if (origPosAnimStep) {
      (L.PosAnimation.prototype as any)._onLoop = function (...args: any[]) {
        if (!this._el) return;
        try {
          return origPosAnimStep.apply(this, args);
        } catch {
          // ignore
        }
      };
    }
  }

  if (L.Map) {
    const origGetMapPanePos = (L.Map.prototype as any)._getMapPanePos;
    if (origGetMapPanePos) {
      (L.Map.prototype as any)._getMapPanePos = function () {
        if (!this._mapPane) return new L.Point(0, 0);
        try {
          return origGetMapPanePos.call(this);
        } catch {
          return new L.Point(0, 0);
        }
      };
    }
  }
}

// Fix missing default icon URLs in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default L;
