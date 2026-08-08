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
    if (method.toLowerCase().includes('bay')) return <Plane className="w-3.5 h-3.5 text-[#DC2626]" />;
    if (method.toLowerCase().includes('limousine') || method.toLowerCase().includes('xe'))
      return <Bus className="w-3.5 h-3.5 text-amber-600" />;
    return <Navigation className="w-3.5 h-3.5 text-red-600" />;
  };

  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#DC2626]" />
            Tuyến hành trình
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Các chặng di chuyển chính trong chuyến đi.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenMap}
          className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-sky-100 text-[#DC2626] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-red-100"
        >
          <Map className="w-4 h-4" />
          <span className="hidden sm:inline">Xem trên bản đồ</span>
        </button>
      </div>

      {/* Vertical Route Stepper */}
      {(!stops || stops.length === 0) ? (
        <div className="p-8 text-center bg-slate-50 rounded-[20px] border border-dashed border-slate-200 space-y-3">
          <Route className="w-10 h-10 text-slate-400 mx-auto" />
          <div>
            <p className="font-extrabold text-slate-800 text-sm">Chưa có tuyến hành trình</p>
            <p className="text-xs text-slate-500 mt-0.5">
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
                  <div className="absolute left-[15px] top-[28px] bottom-[-24px] w-[2px] bg-slate-200 group-hover:bg-[#DC2626]/40 transition-colors" />
                )}

                {/* Stop Marker Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-transform ${
                    index === 0 || isLast
                      ? 'bg-[#DC2626] text-white border-sky-200 shadow-md shadow-[#DC2626]/20'
                      : 'bg-white text-[#DC2626] border-[#DC2626]'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>

                {/* Stop Info & Connector Details */}
                <div className="flex-1 pt-0.5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                        {stop.name}
                      </h4>
                      {stop.dateRange && (
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          {stop.dateRange}
                          {stop.nights !== undefined && (
                            <span className="ml-2 px-2 py-0.5 rounded-md bg-emerald-50 text-[#2E8B57] font-bold text-[10px] border border-emerald-100">
                              {stop.nights} đêm
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Next Transport Connector Banner */}
                  {stop.nextTransport && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
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
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onOpenMap}
          className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#DC2626] font-extrabold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
        >
          <Map className="w-4 h-4" />
          <span>Xem toàn bộ tuyến đường trên bản đồ</span>
        </button>
      </div>
    </div>
  );
};
