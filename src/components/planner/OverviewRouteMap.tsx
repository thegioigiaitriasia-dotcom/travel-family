import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Map as MapIcon,
  MapPin,
  Navigation,
  Compass,
  Maximize2,
  Calendar,
  Clock,
  Utensils,
  Camera,
  Hotel,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import L from '../../lib/leafletSetup';
import { TravelBook } from '../../types';
import { defaultRoutePoints, RoutePoint } from '../travelbook/MapModal';

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

interface OverviewRouteMapProps {
  trip?: TravelBook;
  tripTitle?: string;
  onOpenFullMap?: () => void;
}

export const OverviewRouteMap: React.FC<OverviewRouteMapProps> = ({
  trip,
  tripTitle = 'Đà Nẵng – Hội An',
  onOpenFullMap,
}) => {
  const [activeDay, setActiveDay] = useState<number | 'all'>('all');
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // 1. Build route points dynamically from trip or use defaults
  const points: RoutePoint[] = useMemo(() => {
    if (!trip || !trip.days || trip.days.length === 0) {
      return defaultRoutePoints;
    }

    const extracted: RoutePoint[] = [];
    const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
      'đà nẵng': { lat: 16.0544, lng: 108.2022 },
      'hội an': { lat: 15.8801, lng: 108.338 },
      'mỹ khê': { lat: 16.06, lng: 108.245 },
      'bà nà': { lat: 15.9967, lng: 107.9875 },
    };

    let globalIndex = 0;
    trip.days.forEach((d) => {
      d.activities.forEach((act) => {
        globalIndex++;
        let lat = act.place?.latitude;
        let lng = act.place?.longitude;

        if (!lat || !lng) {
          const lowerAddr = (
            (act.place?.address || '') +
            ' ' +
            d.destinationName +
            ' ' +
            trip.title
          ).toLowerCase();

          let matchedKey = Object.keys(CITY_COORDINATES).find((key) => lowerAddr.includes(key));
          let base = matchedKey ? CITY_COORDINATES[matchedKey] : { lat: 16.0544, lng: 108.2022 };

          const jitterLat = Math.sin(globalIndex * 1.7) * 0.012;
          const jitterLng = Math.cos(globalIndex * 1.7) * 0.012;

          lat = base.lat + jitterLat;
          lng = base.lng + jitterLng;
        }

        extracted.push({
          id: act.id,
          title: act.title,
          type: act.type,
          categoryLabel: `Ngày ${d.dayNumber} · ${
            act.type === 'sightseeing'
              ? 'Tham quan'
              : act.type === 'dining'
              ? 'Ẩm thực'
              : act.type === 'accommodation'
              ? 'Lưu trú'
              : 'Di chuyển'
          }`,
          dayNumber: d.dayNumber,
          timeText: act.startTime ? `${act.startTime} - ${act.endTime || ''}` : undefined,
          lat,
          lng,
          coordsText: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
          address: act.place?.address || d.destinationName || trip.title,
          description: act.description || act.notes || 'Điểm dừng trong hành trình gia đình',
          estimatedCost: act.estimatedCost,
        });
      });
    });

    return extracted.length > 0 ? extracted : defaultRoutePoints;
  }, [trip]);

  // Filter points based on active day
  const filteredPoints = useMemo(() => {
    if (activeDay === 'all') return points;
    return points.filter((p) => p.dayNumber === activeDay);
  }, [points, activeDay]);

  // Available day numbers
  const dayNumbers = useMemo(() => {
    if (trip && trip.days && trip.days.length > 0) {
      return trip.days.map((d) => d.dayNumber);
    }
    return [1, 2, 3, 4];
  }, [trip]);

  // Initialize and update map
  useEffect(() => {
    let isCancelled = false;
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch (err) {
        // ignore map removal errors
      }
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = '';
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const defaultCenter: [number, number] =
      filteredPoints.length > 0
        ? [filteredPoints[0].lat, filteredPoints[0].lng]
        : [16.0544, 108.2022];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // CartoDB Voyager High Definition Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Create polyline route connecting points
    const latLngs = filteredPoints.map((pt) => [pt.lat, pt.lng] as [number, number]);

    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: '#183B35',
        weight: 5,
        opacity: 0.15,
      }).addTo(map);

      const routePolyline = L.polyline(latLngs, {
        color: '#183B35',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.85,
      }).addTo(map);

      try {
        map.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
      } catch {
        // ignore bounds calculation error
      }
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 13);
    }

    markersRef.current = {};

    filteredPoints.forEach((pt, index) => {
      if (isCancelled) return;
      const pinBgColor = '#183B35';
      const lucideSvg = getLucideSvgIcon(pt.type, '#FFFFFF');

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; cursor: pointer; transition: transform 0.2s ease;">
            <div style="
              background-color: ${pinBgColor};
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            ">
              ${lucideSvg}
            </div>
            <div style="
              position: absolute;
              top: -3px;
              right: -3px;
              background-color: #A46F3D;
              color: white;
              font-size: 9px;
              font-weight: 700;
              width: 15px;
              height: 15px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid white;
            ">
              ${index + 1}
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: customIcon }).addTo(map);

      const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${pt.lat},${pt.lng}`;

      const popupHtml = `
        <div style="font-family: 'Be Vietnam Pro', sans-serif; padding: 4px; max-width: 200px; color: #1D211F;">
          <div style="display: flex; items-center; justify-content: space-between; gap: 4px; margin-bottom: 4px;">
            <span style="font-size: 9px; font-weight: 700; color: #183B35; background: #E9F0ED; padding: 2px 6px; border-radius: 4px;">
              ${pt.categoryLabel}
            </span>
          </div>
          <h4 style="font-size: 12px; font-weight: 700; color: #1D211F; margin: 0 0 4px 0;">
            ${pt.title}
          </h4>
          <p style="font-size: 10px; color: #606864; margin: 0 0 6px 0;">
            📍 ${pt.address}
          </p>
          <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="
            display: inline-block;
            font-size: 10px;
            font-weight: 600;
            color: white;
            background-color: #183B35;
            padding: 4px 8px;
            border-radius: 6px;
            text-decoration: none;
            width: 100%;
            text-align: center;
            box-sizing: border-box;
          ">🔍 Mở Google Maps</a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedPoint(pt);
      });

      markersRef.current[pt.id] = marker;
    });

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
  }, [filteredPoints]);

  const handlePointClick = (pt: RoutePoint) => {
    setSelectedPoint(pt);
    if (mapInstanceRef.current && markersRef.current[pt.id]) {
      try {
        mapInstanceRef.current.panTo([pt.lat, pt.lng], { animate: true });
        markersRef.current[pt.id].openPopup();
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E3DE] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E3DE] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-[#1D211F] tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#183B35]" />
              <span>Bản đồ chuyến đi sắp tới: {tripTitle || 'Đà Nẵng – Hội An'}</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E9F0ED] text-[#183B35] font-semibold text-xs border border-[#183B35]/20">
              Lịch trình sắp tới
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F7F5F0] text-[#606864] font-medium text-xs border border-[#E2E3DE]">
              {filteredPoints.length} địa điểm
            </span>
          </div>
          <p className="text-xs text-[#606864] font-normal mt-1">
            Sơ đồ di chuyển thực tế và điểm dừng theo từng ngày cho chuyến đi gần nhất.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onOpenFullMap && (
            <button
              type="button"
              onClick={onOpenFullMap}
              className="px-3.5 py-2 rounded-xl bg-[#183B35] hover:bg-[#28584E] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Phóng to bản đồ</span>
            </button>
          )}
        </div>
      </div>

      {/* Day Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-medium text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveDay('all');
            setSelectedPoint(null);
          }}
          className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
            activeDay === 'all'
              ? 'bg-[#183B35] text-white font-semibold'
              : 'bg-[#F7F5F0] text-[#606864] hover:bg-[#EFEAE1]'
          }`}
        >
          Tất cả các ngày ({points.length})
        </button>
        {dayNumbers.map((dayNum) => {
          const count = points.filter((p) => p.dayNumber === dayNum).length;
          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => {
                setActiveDay(dayNum);
                setSelectedPoint(null);
              }}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeDay === dayNum
                  ? 'bg-[#183B35] text-white font-semibold'
                  : 'bg-[#F7F5F0] text-[#606864] hover:bg-[#EFEAE1]'
              }`}
            >
              <span>Ngày {dayNum}</span>
              <span className="opacity-75 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Map Canvas - Height 300px-340px */}
      <div className="relative rounded-xl overflow-hidden border border-[#E2E3DE] group">
        <div ref={mapContainerRef} className="w-full h-[300px] sm:h-[320px] z-0" />

        {/* Selected Point Floating Card inside Map */}
        {selectedPoint && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-[#E2E3DE] shadow-md z-20 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E9F0ED] text-[#183B35] border border-[#183B35]/15">
                {selectedPoint.categoryLabel}
              </span>
              {selectedPoint.timeText && (
                <span className="text-[10px] font-medium text-[#606864] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#A46F3D]" />
                  {selectedPoint.timeText}
                </span>
              )}
            </div>
            <h4 className="font-semibold text-xs sm:text-sm text-[#1D211F] line-clamp-1">
              {selectedPoint.title}
            </h4>
            <p className="text-[11px] text-[#606864] line-clamp-1">📍 {selectedPoint.address}</p>
            <p className="text-[11px] text-[#8D9490] italic line-clamp-2">
              "{selectedPoint.description}"
            </p>
          </div>
        )}
      </div>

      {/* Horizontal Carousel of Stop Cards */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#1D211F] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#183B35]" />
            <span>Chọn địa điểm để định vị nhanh:</span>
          </p>
          {onOpenFullMap && (
            <button
              type="button"
              onClick={onOpenFullMap}
              className="text-[11px] text-[#183B35] font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Xem chi tiết lộ trình</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filteredPoints.map((pt, idx) => {
            const isSelected = selectedPoint?.id === pt.id;
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => handlePointClick(pt)}
                className={`p-2.5 rounded-xl border text-left shrink-0 transition-colors cursor-pointer min-w-[170px] max-w-[200px] ${
                  isSelected
                    ? 'bg-[#E9F0ED] border-[#183B35]'
                    : 'bg-[#F7F5F0] hover:bg-[#EFEAE1] border-[#E2E3DE]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#183B35] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-[9px] font-semibold text-[#183B35] uppercase">
                    N{pt.dayNumber || 1}
                  </span>
                </div>
                <p className="font-semibold text-xs text-[#1D211F] truncate">{pt.title}</p>
                <p className="text-[10px] text-[#606864] truncate mt-0.5">{pt.address}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

