import React, { useState } from 'react';
import {
  MapPin,
  ArrowDown,
  Plus,
  Trash2,
  ArrowUp,
  Building2,
  Navigation,
  Compass,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  Home,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MultiCityTripPlannerInput, RouteStopInput, RouteStopType } from '../../types';

interface MultiStopRouteBuilderProps {
  data: MultiCityTripPlannerInput;
  onUpdate: (updated: Partial<MultiCityTripPlannerInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const MultiStopRouteBuilder: React.FC<MultiStopRouteBuilderProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const stops = data.routeStops;
  const [editingStopId, setEditingStopId] = useState<string | null>(null);

  const handleUpdateStops = (newStops: RouteStopInput[]) => {
    // Re-assign sequence orders
    const orderedStops = newStops.map((stop, idx) => ({
      ...stop,
      order: idx + 1,
      type:
        idx === 0
          ? ('origin' as RouteStopType)
          : idx === newStops.length - 1
          ? ('destination' as RouteStopType)
          : stop.type === 'origin' || stop.type === 'destination'
          ? ('stay' as RouteStopType)
          : stop.type,
    }));

    // Auto-update journey legs to match new stop pairs
    const updatedLegs = [];
    for (let i = 0; i < orderedStops.length - 1; i++) {
      const fromStop = orderedStops[i];
      const toStop = orderedStops[i + 1];
      const existingLeg = data.journeyLegs.find(
        (leg) => leg.fromStopId === fromStop.id && leg.toStopId === toStop.id
      );

      if (existingLeg) {
        updatedLegs.push(existingLeg);
      } else {
        updatedLegs.push({
          id: `leg-${fromStop.id}-${toStop.id}`,
          fromStopId: fromStop.id,
          toStopId: toStop.id,
          transportMode: 'flight' as const,
          bookingStatus: 'not_booked' as const,
          departure: {
            date: fromStop.departureDate || data.tripWindow.startDate,
            timeStatus: 'preferred' as const,
          },
          arrival: {
            date: toStop.arrivalDate || data.tripWindow.startDate,
            timeStatus: 'estimated' as const,
          },
        });
      }
    }

    onUpdate({
      routeStops: orderedStops,
      journeyLegs: updatedLegs,
    });
  };

  const handleAddStop = () => {
    if (stops.length >= 8) {
      alert('Tối đa 8 điểm dừng trong một hành trình.');
      return;
    }

    const newStop: RouteStopInput = {
      id: `stop-${Date.now()}`,
      order: stops.length,
      type: 'stay',
      name: 'Điểm dừng mới',
      arrivalDate: data.tripWindow.startDate,
      departureDate: data.tripWindow.endDate,
      nights: 1,
      purposes: ['Tham quan', 'Nghỉ dưỡng'],
    };

    // Insert right before destination
    const updated = [...stops];
    const destinationIndex = updated.length - 1;
    updated.splice(destinationIndex, 0, newStop);

    handleUpdateStops(updated);
    setEditingStopId(newStop.id);
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length <= 2) {
      alert('Hành trình cần ít nhất 1 điểm xuất phát và 1 điểm kết thúc.');
      return;
    }
    const updated = stops.filter((s) => s.id !== id);
    handleUpdateStops(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 1 || index >= stops.length - 1) return;
    const updated = [...stops];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    handleUpdateStops(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index <= 0 || index >= stops.length - 2) return;
    const updated = [...stops];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    handleUpdateStops(updated);
  };

  const handleUpdateStopDetail = (id: string, fields: Partial<RouteStopInput>) => {
    const updated = stops.map((s) => (s.id === id ? { ...s, ...fields } : s));
    handleUpdateStops(updated);
  };

  const getTypeBadge = (type: RouteStopType) => {
    switch (type) {
      case 'origin':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
            <Home className="w-3 h-3" /> Điểm xuất phát
          </span>
        );
      case 'stay':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Ở lại / Tham quan
          </span>
        );
      case 'transit':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
            <Navigation className="w-3 h-3" /> Quá cảnh / Transit
          </span>
        );
      case 'destination':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1">
            <Compass className="w-3 h-3" /> Điểm kết thúc
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F0ED] text-[#183B35] text-xs font-bold mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>Bước 2 / 6 — Tuyến hành trình (Route Builder)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Gia đình sẽ đi qua những đâu?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Xây dựng tuyến hành trình có thứ tự các điểm dừng, phân biệt tỉnh ở lại nghỉ đêm và điểm ghé nhanh (transit).
        </p>
      </div>

      {/* Route Stops Flow */}
      <div className="space-y-4">
        {stops.map((stop, idx) => {
          const isOrigin = idx === 0;
          const isDestination = idx === stops.length - 1;
          const isEditing = editingStopId === stop.id;

          return (
            <React.Fragment key={stop.id}>
              {/* Connector arrow between stops */}
              {idx > 0 && (
                <div className="flex items-center justify-center my-1">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-500 text-xs font-bold">
                    <ArrowDown className="w-3.5 h-3.5 text-[#2E8B57]" />
                    <span>Chặng {idx}: {stops[idx - 1].name} → {stop.name}</span>
                  </div>
                </div>
              )}

              <div
                className={`rounded-2xl border transition-all p-4 sm:p-5 ${
                  isOrigin
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : isDestination
                    ? 'border-purple-300 bg-purple-50/40'
                    : stop.type === 'transit'
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-300 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#183B35] text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {stop.name}
                        </h4>
                        {getTypeBadge(stop.type)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isOrigin && 'Nơi cả nhà khởi hành'}
                        {isDestination && 'Điểm kết thúc hành trình'}
                        {stop.type === 'stay' && `${stop.nights || 1} đêm ở lại • ${stop.purposes?.join(', ') || 'Du lịch'}`}
                        {stop.type === 'transit' && 'Dừng chân nghỉ / đổi xe ngắn (AI không xếp tham quan dài)'}
                      </p>
                    </div>
                  </div>

                  {/* Move & Delete Action Controls */}
                  <div className="flex items-center gap-1">
                    {!isOrigin && !isDestination && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx <= 1}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx >= stops.length - 2}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(stop.id)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          title="Xóa điểm này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingStopId(isEditing ? null : stop.id)}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 ml-1"
                    >
                      {isEditing ? 'Đóng' : 'Chỉnh sửa'}
                    </button>
                  </div>
                </div>

                {/* Expanded Edit Form for stop */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tên Tỉnh / Thành phố / Địa danh
                      </label>
                      <input
                        type="text"
                        value={stop.name}
                        onChange={(e) =>
                          handleUpdateStopDetail(stop.id, { name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
                        placeholder="Ví dụ: Buôn Ma Thuột"
                      />
                    </div>

                    {!isOrigin && !isDestination && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Loại hình điểm dừng
                        </label>
                        <select
                          value={stop.type}
                          onChange={(e) =>
                            handleUpdateStopDetail(stop.id, {
                              type: e.target.value as RouteStopType,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
                        >
                          <option value="stay">🏨 Ở lại nghỉ qua đêm / Tham quan</option>
                          <option value="transit">🚗 Ghé qua / Transit / Đổi xe</option>
                        </select>
                      </div>
                    )}

                    {stop.type === 'stay' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Số đêm dự kiến ở lại
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={stop.nights || 1}
                          onChange={(e) =>
                            handleUpdateStopDetail(stop.id, {
                              nights: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mục đích chính tại điểm này
                      </label>
                      <input
                        type="text"
                        value={stop.purposes?.join(', ') || ''}
                        onChange={(e) =>
                          handleUpdateStopDetail(stop.id, {
                            purposes: e.target.value.split(',').map((p) => p.trim()),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
                        placeholder="Ví dụ: Khám phá cà phê, ăn đặc sản, checkin"
                      />
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Add Stop Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleAddStop}
          className="px-5 py-2.5 rounded-2xl border-2 border-dashed border-[#2E8B57] text-[#2E8B57] font-extrabold text-sm hover:bg-[#E9F0ED] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm chặng / điểm dừng tiếp theo</span>
        </button>
      </div>

      {/* Info Tip */}
      <div className="bg-[#E9F0ED]/70 border border-[#183B35]/20 rounded-xl p-3.5 text-xs text-[#183B35] flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-[#183B35] shrink-0 mt-0.5" />
        <span>
          <strong>Lưu ý đa chặng:</strong> Nếu gia đình kết thúc chuyến đi tại một thành phố khác điểm xuất phát (ví dụ: TP.HCM → Đà Lạt → Nha Trang), hệ thống hoàn toàn hỗ trợ xuất lịch trình đa điểm tối ưu!
        </span>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
        >
          Quay lại
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-[#2E8B57] text-white font-extrabold text-sm hover:bg-[#236c43] transition-all shadow-md shadow-[#2E8B57]/20 flex items-center gap-2"
        >
          <span>Tiếp tục: Phương tiện từng chặng</span>
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
