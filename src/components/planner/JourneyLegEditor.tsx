import React from 'react';
import {
  Plane,
  Train,
  Bus,
  Car,
  Ship,
  Clock,
  Ticket,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  MultiCityTripPlannerInput,
  JourneyLegInput,
  TransportMode,
} from '../../types';

const HOURS_24 = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});
const TimeSelect24h: React.FC<{ value: string; onChange: (v: string) => void; className?: string }> = ({ value, onChange, className }) => (
  <input
    type="text"
    placeholder="HH:MM"
    value={value || '07:00'}
    onChange={(e) => {
      let v = e.target.value.replace(/[^0-9:]/g, '');
      if (v.length === 2 && !v.includes(':') && (e.nativeEvent as any).inputType !== 'deleteContentBackward') {
        v += ':';
      }
      onChange(v.slice(0, 5));
    }}
    onBlur={(e) => {
      let v = e.target.value;
      if (!v) return;
      if (/^\d{1,2}$/.test(v)) v = v.padStart(2, '0') + ':00';
      else if (/^\d{1,2}:\d{1,2}$/.test(v)) {
        const [h, m] = v.split(':');
        v = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
      }
      let [h, m] = v.split(':').map(Number);
      if (isNaN(h)) h = 7; if (isNaN(m)) m = 0;
      h = Math.min(23, Math.max(0, h));
      m = Math.min(59, Math.max(0, m));
      onChange(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }}
    className={className}
    maxLength={5}
  />
);

interface JourneyLegEditorProps {
  data: MultiCityTripPlannerInput;
  onUpdate: (updated: Partial<MultiCityTripPlannerInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const JourneyLegEditor: React.FC<JourneyLegEditorProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const legs = data.journeyLegs;
  const stops = data.routeStops;

  const handleUpdateLeg = (legId: string, fields: Partial<JourneyLegInput>) => {
    const updated = legs.map((leg) => {
      if (leg.id === legId) {
        const next = { ...leg, ...fields };

        // Auto buffer time defaults based on transport mode
        if (fields.transportMode && !fields.bufferMinutes) {
          if (fields.transportMode === 'flight') next.bufferMinutes = 90;
          else if (fields.transportMode === 'train') next.bufferMinutes = 30;
          else if (['coach', 'limousine'].includes(fields.transportMode))
            next.bufferMinutes = 20;
          else next.bufferMinutes = 15;
        }

        return next;
      }
      return leg;
    });

    onUpdate({ journeyLegs: updated });
  };

  const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'flight':
        return <Plane className="w-4 h-4 text-sky-600" />;
      case 'train':
        return <Train className="w-4 h-4 text-amber-600" />;
      case 'coach':
      case 'limousine':
        return <Bus className="w-4 h-4 text-[#2E8B57]" />;
      case 'private_car':
      case 'rental_with_driver':
        return <Car className="w-4 h-4 text-indigo-600" />;
      case 'ferry':
        return <Ship className="w-4 h-4 text-cyan-600" />;
      default:
        return <Car className="w-4 h-4 text-slate-600" />;
    }
  };

  // Helper to calculate suggested departure from hotel/home
  const calculateLeaveHotelTime = (departureTime?: string, bufferMins: number = 30) => {
    if (!departureTime || !departureTime.includes(':')) return 'Chưa có giờ';
    const [h, m] = departureTime.split(':').map(Number);
    let totalMins = h * 60 + m - bufferMins - 30; // 30m transfer to terminal
    if (totalMins < 0) totalMins += 24 * 60;
    const leaveH = Math.floor(totalMins / 60)
      .toString()
      .padStart(2, '0');
    const leaveM = (totalMins % 60).toString().padStart(2, '0');
    return `${leaveH}:${leaveM}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F0ED] text-[#183B35] text-xs font-bold mb-2">
          <Ticket className="w-3.5 h-3.5" />
          <span>Bước 3 / 6 — Phương tiện và thời gian từng chặng</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Phương tiện di chuyển giữa các điểm
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Khai báo thông tin từng chặng di chuyển (vé máy bay, tàu hỏa, xe limousine) để AI tính chính xác giờ rời khách sạn và thời gian đệm bắt buộc.
        </p>
      </div>

      {/* Leg Cards */}
      <div className="space-y-6">
        {legs.map((leg, idx) => {
          const fromStop = stops.find((s) => s.id === leg.fromStopId);
          const toStop = stops.find((s) => s.id === leg.toStopId);
          const fromName = fromStop?.name || 'Điểm xuất phát';
          const toName = toStop?.name || 'Điểm đến';
          const isConfirmed = leg.bookingStatus === 'confirmed';

          const bufferMinutes =
            leg.bufferMinutes ||
            (leg.transportMode === 'flight'
              ? 90
              : leg.transportMode === 'train'
              ? 30
              : leg.transportMode === 'coach' || leg.transportMode === 'limousine'
              ? 20
              : 15);

          const suggestedLeaveTime = calculateLeaveHotelTime(
            leg.departure.time,
            bufferMinutes
          );

          return (
            <div
              key={leg.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm"
            >
              {/* Leg Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#183B35] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm sm:text-base">
                    <span>{fromName}</span>
                    <span className="text-[#2E8B57]">→</span>
                    <span>{toName}</span>
                  </div>
                </div>

                {/* Booking Status Selector */}
                <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateLeg(leg.id, {
                        bookingStatus: 'confirmed',
                        departure: { ...leg.departure, timeStatus: 'confirmed' },
                      })
                    }
                    className={`px-3 py-1 rounded-lg transition-all ${
                      isConfirmed
                        ? 'bg-[#183B35] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ✓ Đã có vé / xe
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateLeg(leg.id, {
                        bookingStatus: 'not_booked',
                        departure: { ...leg.departure, timeStatus: 'preferred' },
                      })
                    }
                    className={`px-3 py-1 rounded-lg transition-all ${
                      leg.bookingStatus === 'not_booked'
                        ? 'bg-[#183B35] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Chưa đặt
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateLeg(leg.id, { bookingStatus: 'not_needed' })
                    }
                    className={`px-3 py-1 rounded-lg transition-all ${
                      leg.bookingStatus === 'not_needed'
                        ? 'bg-[#183B35] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Xe nhà / Tự đi
                  </button>
                </div>
              </div>

              {/* Transport Mode & Details Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phương tiện chặng này
                  </label>
                  <div className="relative">
                    <select
                      value={leg.transportMode}
                      onChange={(e) =>
                        handleUpdateLeg(leg.id, {
                          transportMode: e.target.value as TransportMode,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
                    >
                      <option value="flight">✈️ Máy bay</option>
                      <option value="train">🚂 Tàu hỏa</option>
                      <option value="limousine">🚐 Xe Limousine</option>
                      <option value="coach">🚌 Xe khách giường nằm</option>
                      <option value="private_car">🚗 Xe ô tô riêng / Tự lái</option>
                      <option value="rental_with_driver">🚘 Thuê ô tô có tài xế</option>
                      <option value="ferry">⛴️ Phà / Tàu cao tốc</option>
                      <option value="other">Phương tiện khác</option>
                      <option value="unknown">Chưa quyết định</option>
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {getTransportIcon(leg.transportMode)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày khởi hành chặng
                  </label>
                  <input
                    type="date"
                    value={leg.departure.date}
                    onChange={(e) =>
                      handleUpdateLeg(leg.id, {
                        departure: { ...leg.departure, date: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isConfirmed ? 'Giờ xuất phát chính xác' : 'Khung giờ mong muốn'}
                  </label>
                  <TimeSelect24h
                    value={leg.departure.time || '07:00'}
                    onChange={(v) => handleUpdateLeg(leg.id, { departure: { ...leg.departure, time: v } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
                  />
                </div>
              </div>

              {/* Confirmed Ticket Extra Details */}
              {isConfirmed && (
                <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Số hiệu chuyến bay / Xe / Tàu
                      </label>
                      <input
                        type="text"
                        value={leg.providerName || ''}
                        onChange={(e) =>
                          handleUpdateLeg(leg.id, { providerName: e.target.value })
                        }
                        placeholder="Ví dụ: VN1412 / Vexere 79A"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Tên Sân bay / Ga / Bến đón
                      </label>
                      <input
                        type="text"
                        value={leg.departure.stationOrTerminal || ''}
                        onChange={(e) =>
                          handleUpdateLeg(leg.id, {
                            departure: {
                              ...leg.departure,
                              stationOrTerminal: e.target.value,
                            },
                          })
                        }
                        placeholder="Ví dụ: Tân Sơn Nhất / Ga Sài Gòn"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Giờ đến dự kiến
                      </label>
                      <TimeSelect24h
                        value={leg.arrival.time || '08:30'}
                        onChange={(v) => handleUpdateLeg(leg.id, { arrival: { ...leg.arrival, time: v } })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Buffer Time & Hotel Leave Time Calculation */}
                  <div className="bg-[#E9F0ED]/70 rounded-xl p-3 border border-[#183B35]/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2 text-[#183B35] font-bold">
                      <Clock className="w-4 h-4 text-[#2E8B57]" />
                      <span>
                        Thời gian có mặt trước:{' '}
                        <strong className="text-slate-900">{bufferMinutes} phút</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[#183B35]">
                      <Sparkles className="w-4 h-4 text-[#2E8B57]" />
                      <span>
                        AI tự tính giờ nên rời KS:{' '}
                        <strong className="text-red-600 font-extrabold text-sm">
                          ~{suggestedLeaveTime}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
          <span>Tiếp tục: Thành viên & Nhu cầu</span>
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
