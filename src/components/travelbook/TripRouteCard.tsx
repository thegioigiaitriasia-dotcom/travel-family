import React from 'react';
import { MapPin, Plane, Bus, Navigation, Map, Route } from 'lucide-react';

export interface RouteStopItem {
  id: string;
  name: string;
  dateRange?: string; // e.g. "08/08 · 07:00" or "08/08 – 09/08"
  nights?: number;
  nextTransport?: {
    method: string; // e.g. "Máy bay", "Limousine"
    estimatedMinutes?: number; // e.g. 80, 360
    estimatedText?: string; // e.g. "1 giờ 20 phút", "khoảng 6 giờ"
  };
}

interface TripRouteCardProps {
  stops?: RouteStopItem[];
  onOpenMap: () => void;
}

export const TripRouteCard: React.FC<TripRouteCardProps> = ({
  stops,
  onOpenMap,
}) => {
  const getTransportIcon = (method: string) => {
    if (method.toLowerCase().includes('bay')) return <Plane className="w-3.5 h-3.5 text-bronze-600" />;
    if (method.toLowerCase().includes('limousine') || method.toLowerCase().includes('xe'))
      return <Bus className="w-3.5 h-3.5 text-bronze-600" />;
    return <Navigation className="w-3.5 h-3.5 text-bronze-600" />;
  };

  return (
    <div className="bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E2E3DE] shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E3DE] pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#1D211F] tracking-tight flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#183B35]" />
            Tuyến hành trình
          </h3>
          <p className="text-xs text-[#5D6B63] font-medium mt-0.5">
            Các chặng di chuyển chính trong chuyến đi.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenMap}
          className="px-3.5 py-2 rounded-xl bg-[#E9F0ED] hover:bg-[#cde2db] text-[#183B35] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-transparent"
        >
          <Map className="w-4 h-4" />
          <span className="hidden sm:inline">Xem trên bản đồ</span>
        </button>
      </div>

      {/* Vertical Route Stepper */}
      {(!stops || stops.length === 0) ? (
        <div className="p-8 text-center bg-[#F7F6F0] rounded-[20px] border border-dashed border-[#E2E3DE] space-y-3">
          <Route className="w-10 h-10 text-slate-400 mx-auto" />
          <div>
            <p className="font-extrabold text-[#1D211F] text-sm">Chưa có tuyến hành trình</p>
            <p className="text-xs text-[#5D6B63] mt-0.5">
              Tuyến đường sẽ hiển thị sau khi bạn tạo lịch trình bằng AI.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative pl-3 space-y-6">
          {stops.map((stop, index) => {
            const isLast = index === stops.length - 1;

            return (
              <div key={stop.id} className="relative flex items-start gap-4 group">
                {/* Vertical Connector Line */}
                {!isLast && (
                  <div className="absolute left-[15px] top-[28px] bottom-[-24px] w-[2px] bg-[#E2E3DE] group-hover:bg-[#183B35]/40 transition-colors" />
                )}

                {/* Stop Marker Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-transform ${
                    index === 0 || isLast
                      ? 'bg-[#183B35] text-white border-[#E9F0ED] shadow-md shadow-[#183B35]/20'
                      : 'bg-white text-[#183B35] border-[#183B35]'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>

                {/* Stop Info & Connector Details */}
                <div className="flex-1 pt-0.5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-black text-[#1D211F] text-sm sm:text-base tracking-tight">
                        {stop.name}
                      </h4>
                      {stop.dateRange && (
                        <p className="text-xs font-semibold text-[#5D6B63] mt-0.5">
                          {stop.dateRange}
                          {stop.nights !== undefined && (
                            <span className="ml-2 px-2 py-0.5 rounded-md bg-[#E9F0ED] text-[#183B35] font-bold text-[10px] border border-[#E9F0ED]">
                              {stop.nights} đêm
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Next Transport Connector Banner */}
                  {stop.nextTransport && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F6F0] border border-[#E2E3DE] text-xs font-bold text-[#1D211F]">
                      <span className="text-slate-400 font-extrabold">↓</span>
                      {getTransportIcon(stop.nextTransport.method)}
                      <span>{stop.nextTransport.method}</span>
                      {stop.nextTransport.estimatedText && (
                        <span className="text-slate-400 font-normal">
                          · {stop.nextTransport.estimatedText}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Map Button */}
      <div className="pt-2 border-t border-[#E2E3DE]">
        <button
          type="button"
          onClick={onOpenMap}
          className="w-full py-3 rounded-xl bg-[#F7F6F0] hover:bg-[#E9F0ED] text-[#183B35] font-extrabold text-xs transition-colors flex items-center justify-center gap-2 border border-[#E2E3DE] cursor-pointer"
        >
          <Map className="w-4 h-4" />
          <span>Xem toàn bộ tuyến đường trên bản đồ</span>
        </button>
      </div>
    </div>
  );
};
