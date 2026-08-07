import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Map as MapIcon,
  MapPin,
  Navigation,
  Compass,
  Layers,
  Check,
  LocateFixed,
  Search,
  ExternalLink,
  Calendar,
  Utensils,
  Hotel,
  Camera,
} from 'lucide-react';
import L from '../../lib/leafletSetup';
import { TravelBook } from '../../types';

export interface RoutePoint {
  id: string;
  title: string;
  type: 'sightseeing' | 'dining' | 'accommodation' | 'transport' | 'start' | 'stop';
  categoryLabel: string;
  dayNumber?: number;
  timeText?: string;
  lat: number;
  lng: number;
  coordsText: string;
  address: string;
  description: string;
  estimatedCost?: number;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle?: string;
  placeName?: string;
  trip?: TravelBook;
  currentDayNumber?: number;
}

// Vietnam cities base coordinates lookup table
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'buôn ma thuột': { lat: 12.668, lng: 108.0383 },
  'đắk lắk': { lat: 12.668, lng: 108.0383 },
  'cam ranh': { lat: 11.9214, lng: 109.1591 },
  'khánh hòa': { lat: 12.2388, lng: 109.1967 },
  'nha trang': { lat: 12.2388, lng: 109.1967 },
  'tp. hồ chí minh': { lat: 10.8231, lng: 106.6297 },
  'sài gòn': { lat: 10.8231, lng: 106.6297 },
  'hà nội': { lat: 21.0285, lng: 105.8542 },
  'đà nẵng': { lat: 16.0544, lng: 108.2022 },
  'hội an': { lat: 15.8801, lng: 108.338 },
  'phú quốc': { lat: 10.2289, lng: 103.9572 },
  'đà lạt': { lat: 11.9404, lng: 108.4583 },
  'sa pa': { lat: 22.3364, lng: 103.8438 },
  'hạ long': { lat: 20.9599, lng: 107.0425 },
  'ninh bình': { lat: 20.2506, lng: 105.9745 },
  'huế': { lat: 16.4637, lng: 107.5909 },
  'quy nhơn': { lat: 13.782, lng: 109.2194 },
};

export const defaultRoutePoints: RoutePoint[] = [
  {
    id: 'p1',
    title: 'TP. Hồ Chí Minh (Sân bay Tân Sơn Nhất SGN)',
    type: 'start',
    categoryLabel: 'Điểm khởi hành',
    lat: 10.8231,
    lng: 106.6297,
    coordsText: '10.8231° N, 106.6297° E',
    address: 'Quận Tân Bình, TP. Hồ Chí Minh',
    description: 'Khởi hành chuyến bay tới Đà Nẵng',
  },
  {
    id: 'p2',
    title: 'Sân bay Quốc tế Đà Nẵng (DAD)',
    type: 'transport',
    categoryLabel: 'Điểm đến / Đi lại',
    lat: 16.0439,
    lng: 108.1994,
    coordsText: '16.0439° N, 108.1994° E',
    address: 'Hòa Thuận Tây, Hải Châu, TP. Đà Nẵng',
    description: 'Hạ cánh và di chuyển về khách sạn trung tâm',
  },
  {
    id: 'p3',
    title: 'Mì Quảng Bà Mua & Bãi biển Mỹ Khê',
    type: 'dining',
    categoryLabel: 'Ẩm thực & Biển',
    lat: 16.06,
    lng: 108.245,
    coordsText: '16.0600° N, 108.2450° E',
    address: 'Phường Phước Mỹ, Sơn Trà, TP. Đà Nẵng',
    description: 'Thưởng thức món đặc sản Mì Quảng và tắm biển chiều Mỹ Khê',
  },
  {
    id: 'p4',
    title: 'Sun World Bà Nà Hills & Cầu Vàng',
    type: 'sightseeing',
    categoryLabel: 'Điểm tham quan',
    lat: 15.9967,
    lng: 107.9875,
    coordsText: '15.9967° N, 107.9875° E',
    address: 'Xã Hòa Phú, Huyện Hòa Vang, TP. Đà Nẵng',
    description: 'Kiến trúc Làng Pháp, check-in Cầu Vàng nổi tiếng thế giới',
  },
  {
    id: 'p5',
    title: 'Melia Vinpearl Danang Riverfront',
    type: 'accommodation',
    categoryLabel: 'Khách sạn / Lưu trú',
    lat: 16.067,
    lng: 108.228,
    coordsText: '16.0670° N, 108.2280° E',
    address: '341 Trần Hưng Đạo, Sơn Trà, TP. Đà Nẵng',
    description: 'Nghỉ dưỡng đẳng cấp ven sông Hàn',
  },
  {
    id: 'p6',
    title: 'Phố cổ Hội An & Sông Hoài',
    type: 'stop',
    categoryLabel: 'Di sản UNESCO',
    lat: 15.8801,
    lng: 108.338,
    coordsText: '15.8801° N, 108.3380° E',
    address: 'TP. Hội An, Quảng Nam',
    description: 'Phố cổ đèn lồng rực rỡ, đi thuyền thả hoa đăng',
  },
];

// Helper to generate SVG strings for Lucide icons inside Leaflet DivIcon
function getLucideSvgIcon(type: string, strokeColor: string = '#FFFFFF') {
  switch (type) {
    case 'dining':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20"/><path d="M18 8h3a1 1 0 0 0 1-1V4a2 2 0 0 0-2-2h-2"/><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/></svg>`;
    case 'accommodation':
    case 'hotel':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`;
    case 'transport':
    case 'start':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`;
    case 'sightseeing':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`;
  }
}

export const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  tripTitle,
  placeName,
  trip,
  currentDayNumber,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPointId, setSelectedPointId] = useState<string>('');
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // 1. Build route points dynamically from trip if available
  const points: RoutePoint[] = React.useMemo(() => {
    if (!trip || !trip.days || trip.days.length === 0) {
      return defaultRoutePoints;
    }

    const extracted: RoutePoint[] = [];
    let globalIndex = 0;

    trip.days.forEach((d) => {
      d.activities.forEach((act) => {
        globalIndex++;
        let lat = act.place?.latitude;
        let lng = act.place?.longitude;

        // Fallback coordinates if missing
        if (!lat || !lng) {
          const lowerAddr = (
            (act.place?.address || '') +
            ' ' +
            d.destinationName +
            ' ' +
            trip.title
          ).toLowerCase();

          let matchedCity = Object.keys(CITY_COORDINATES).find((key) => lowerAddr.includes(key));
          let base = matchedCity ? CITY_COORDINATES[matchedCity] : { lat: 12.668, lng: 108.0383 };

          // Add subtle deterministic jitter so points don't overlap exactly
          const jitterLat = Math.sin(globalIndex * 1.7) * 0.015;
          const jitterLng = Math.cos(globalIndex * 1.7) * 0.015;

          lat = base.lat + jitterLat;
          lng = base.lng + jitterLng;
        }

        const categoryLabel =
          act.type === 'sightseeing'
            ? 'Tham quan'
            : act.type === 'dining'
            ? 'Ẩm thực'
            : act.type === 'accommodation'
            ? 'Lưu trú'
            : 'Di chuyển';

        extracted.push({
          id: act.id,
          title: act.title,
          type: act.type,
          categoryLabel: `Ngày ${d.dayNumber} · ${categoryLabel}`,
          dayNumber: d.dayNumber,
          timeText: act.startTime ? `${act.startTime} - ${act.endTime || ''}` : undefined,
          lat,
          lng,
          coordsText: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
          address: act.place?.address || d.destinationName || trip.title,
          description: act.description || act.notes || 'Điểm dừng trong hành trình',
          estimatedCost: act.estimatedCost,
        });
      });
    });

    // Also append trip accommodations if any
    if (trip.accommodations && trip.accommodations.length > 0) {
      trip.accommodations.forEach((acc, i) => {
        globalIndex++;
        let base = CITY_COORDINATES['đà nẵng'];
        extracted.push({
          id: `acc-${acc.id || i}`,
          title: acc.hotelName,
          type: 'accommodation',
          categoryLabel: 'Nơi lưu trú',
          lat: base.lat + (i + 1) * 0.008,
          lng: base.lng - (i + 1) * 0.008,
          coordsText: `${(base.lat + (i + 1) * 0.008).toFixed(4)}° N, ${(
            base.lng -
            (i + 1) * 0.008
          ).toFixed(4)}° E`,
          address: acc.address || acc.locationName,
          description: `Khách sạn nghỉ ngơi · ${acc.checkIn} đến ${acc.checkOut}`,
        });
      });
    }

    return extracted.length > 0 ? extracted : defaultRoutePoints;
  }, [trip]);

  // Filtered Points based on Search & Selectors
  const filteredPoints = points.filter((pt) => {
    if (filterType !== 'all' && pt.type !== filterType) return false;
    if (filterDay !== 'all' && pt.dayNumber !== filterDay) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        pt.title.toLowerCase().includes(q) ||
        pt.address.toLowerCase().includes(q) ||
        pt.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Set initial selected point when opening
  useEffect(() => {
    if (isOpen && points.length > 0) {
      if (placeName) {
        const found = points.find((p) => p.title.toLowerCase().includes(placeName.toLowerCase()));
        if (found) {
          setSelectedPointId(found.id);
          return;
        }
      }
      setSelectedPointId(points[0].id);
    }
  }, [isOpen, points, placeName]);

  // 2. Leaflet Map Initialization & Updates
  useEffect(() => {
    let isCancelled = false;
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing map instance to prevent duplicate canvases
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch {
        // ignore
      }
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = '';
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const defaultCenter: [number, number] =
      points.length > 0 ? [points[0].lat, points[0].lng] : [12.668, 108.0383];

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
    });
    mapInstanceRef.current = map;

    // CartoDB Voyager Tile Layer (High Definition, clean, 100% free with NO credit card watermark)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    // Create a smooth connected polyline for the journey route
    const latLngs = points.map((pt) => [pt.lat, pt.lng] as [number, number]);

    if (latLngs.length > 1) {
      // Outer glow line
      L.polyline(latLngs, {
        color: '#DC2626',
        weight: 6,
        opacity: 0.25,
      }).addTo(map);

      // Inner dashed route line
      const routePolyline = L.polyline(latLngs, {
        color: '#DC2626',
        weight: 3.5,
        dashArray: '7, 9',
        opacity: 0.9,
      }).addTo(map);

      // Auto fit bounds to display the whole route
      try {
        map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
      } catch {
        // ignore
      }
    }

    // Clear old markers ref
    markersRef.current = {};

    // Add Markers with Lucide Icons
    points.forEach((pt, index) => {
      if (isCancelled) return;
      let pinBgColor = '#DC2626'; // Primary Red

      if (pt.type === 'dining') {
        pinBgColor = '#EA580C'; // Orange
      } else if (pt.type === 'accommodation') {
        pinBgColor = '#059669'; // Emerald
      } else if (pt.type === 'transport' || pt.type === 'start') {
        pinBgColor = '#2563EB'; // Blue
      }

      const lucideSvg = getLucideSvgIcon(pt.type, '#FFFFFF');

      // Custom Leaflet HTML DivIcon with Lucide SVG + Step Number Badge
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; cursor: pointer; transition: transform 0.2s ease;">
            <div style="
              background-color: ${pinBgColor};
              color: white;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid white;
              box-shadow: 0 4px 12px rgba(220,38,38,0.35);
            ">
              ${lucideSvg}
            </div>
            <div style="
              position: absolute;
              top: -4px;
              right: -4px;
              background-color: #18181B;
              color: white;
              font-size: 9px;
              font-weight: 800;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1.5px solid white;
            ">
              ${index + 1}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: customIcon }).addTo(map);

      // Google Maps direction URL
      const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${pt.lat},${pt.lng}`;

      // Rich Popup HTML with Lucide visual badge
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 220px; color: #18181B;">
          <div style="display: flex; items-center; justify-content: space-between; gap: 4px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; color: #DC2626; background: #FEF2F2; padding: 2px 8px; border-radius: 6px; border: 1px solid #FECACA;">
              ${pt.categoryLabel}
            </span>
            ${
              pt.timeText
                ? `<span style="font-size: 10px; font-weight: 700; color: #71717A;">${pt.timeText}</span>`
                : ''
            }
          </div>

          <h4 style="font-size: 13px; font-weight: 800; color: #09090B; margin: 0 0 4px 0; line-height: 1.3;">
            ${pt.title}
          </h4>

          <p style="font-size: 11px; color: #52525B; margin: 0 0 6px 0; line-height: 1.3;">
            📍 ${pt.address}
          </p>

          <p style="font-size: 11px; color: #71717A; font-style: italic; margin: 0 0 8px 0; line-height: 1.3;">
            "${pt.description}"
          </p>

          <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            font-weight: 700;
            color: white;
            background-color: #DC2626;
            padding: 6px 10px;
            border-radius: 8px;
            text-decoration: none;
            width: 100%;
            box-sizing: border-box;
            justify-content: center;
          ">
            Mở chỉ đường Google Maps ↗
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedPointId(pt.id);
      });

      markersRef.current[pt.id] = marker;
    });

    // Resize invalidate fix
    const timer = setTimeout(() => {
      if (!isCancelled && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch {
          // ignore
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.eachLayer((layer) => {
            try {
              layer.off();
            } catch {}
          });
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, points]);

  // Pan to point on click
  const handleSelectPoint = (pt: RoutePoint) => {
    setSelectedPointId(pt.id);
    const map = mapInstanceRef.current;
    if (map) {
      try {
        map.flyTo([pt.lat, pt.lng], 14, { duration: 1.2 });
        const marker = markersRef.current[pt.id];
        if (marker) {
          marker.openPopup();
        }
      } catch {
        // ignore
      }
    }
  };

  // Reset full bounds view
  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (map && points.length > 0) {
      try {
        const latLngs = points.map((pt) => [pt.lat, pt.lng] as [number, number]);
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch {
        // ignore
      }
    }
  };

  // Locate user GPS
  const handleLocateUser = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        const map = mapInstanceRef.current;
        if (map) {
          try {
            map.flyTo(coords, 14);
            L.circleMarker(coords, {
              radius: 8,
              color: '#2563EB',
              fillColor: '#60A5FA',
              fillOpacity: 0.9,
            })
              .addTo(map)
              .bindPopup('<b>Vị trí hiện tại của bạn</b>')
              .openPopup();
          } catch {
            // ignore
          }
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
      }
    );
  };

  if (!isOpen) return null;

  const displayTitle = placeName
    ? `Địa điểm: ${placeName}`
    : tripTitle
    ? `Hành trình: ${tripTitle}`
    : 'Bản đồ tương tác hành trình';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-[28px] max-w-6xl w-full h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 relative">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center border border-[#FECACA] shrink-0">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {displayTitle}
                </h3>
                <span className="text-[10px] font-extrabold bg-[#FEF2F2] text-[#DC2626] px-2.5 py-0.5 rounded-full border border-[#FECACA] hidden sm:inline-flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-[#DC2626]" />
                  Leaflet.js & Lucide
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Xem bản đồ lộ trình chi tiết các địa điểm tham quan, ẩm thực & khách sạn đã lưu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 font-bold cursor-pointer transition-colors"
            title="Đóng bản đồ"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main View Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Leaflet Map Canvas Area */}
          <div className="flex-1 relative bg-slate-100 min-h-[350px]">
            {/* Map Element */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Filter Pill Controls Floating on Map */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Tất cả ({points.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterType('sightseeing')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'sightseeing'
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Tham quan</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('dining')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'dining'
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Ẩm thực</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('accommodation')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'accommodation'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Hotel className="w-3.5 h-3.5" />
                <span>Khách sạn</span>
              </button>

              <div className="h-5 w-[1px] bg-slate-200 my-auto hidden sm:block" />

              <button
                type="button"
                onClick={handleResetView}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer flex items-center gap-1 border border-slate-200"
                title="Thu phóng toàn bộ lộ trình"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Toàn cảnh</span>
              </button>

              <button
                type="button"
                onClick={handleLocateUser}
                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer flex items-center gap-1 border border-blue-200"
                title="Vị trí hiện tại của tôi"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vị trí tôi</span>
              </button>
            </div>
          </div>

          {/* Right Sidebar - Points List */}
          <div className="w-full md:w-80 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-4 space-y-3 overflow-y-auto shrink-0 flex flex-col">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm địa điểm trong bản đồ..."
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#DC2626] font-medium"
              />
            </div>

            {/* Header info */}
            <div className="flex items-center justify-between pt-1">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Các điểm dừng ({filteredPoints.length})
              </h4>
              <span className="text-[11px] font-bold text-[#DC2626]">
                Nối lộ trình
              </span>
            </div>

            {/* List */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
              {filteredPoints.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-medium">
                  Không tìm thấy điểm phù hợp
                </div>
              ) : (
                filteredPoints.map((pt, idx) => {
                  const isSel = selectedPointId === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => handleSelectPoint(pt)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                        isSel
                          ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-md scale-[1.01]'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            isSel ? 'bg-white/20 text-white' : 'bg-[#FEF2F2] text-[#DC2626]'
                          }`}
                        >
                          #{idx + 1} · {pt.categoryLabel}
                        </span>
                        {isSel && <Check className="w-4 h-4 text-emerald-300 shrink-0" />}
                      </div>

                      <h5 className="font-extrabold text-xs leading-snug line-clamp-1">
                        {pt.title}
                      </h5>

                      <p
                        className={`text-[11px] line-clamp-1 ${
                          isSel ? 'text-red-100' : 'text-slate-500'
                        }`}
                      >
                        📍 {pt.address}
                      </p>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`font-mono ${isSel ? 'text-red-200' : 'text-slate-400'}`}>
                          {pt.coordsText}
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${pt.lat},${pt.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`font-bold hover:underline flex items-center gap-0.5 ${
                            isSel ? 'text-white' : 'text-[#DC2626]'
                          }`}
                        >
                          Chỉ đường <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2 text-[#DC2626] font-extrabold">
            <Compass className="w-4 h-4 text-[#DC2626]" />
            <span>Leaflet.js + OpenStreetMap Vector Tiles & Icon Lucide</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold cursor-pointer transition-colors"
          >
            Đóng bản đồ
          </button>
        </div>
      </div>
    </div>
  );
};
