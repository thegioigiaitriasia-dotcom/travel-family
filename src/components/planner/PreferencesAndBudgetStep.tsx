import React from 'react';
import {
  Compass,
  Building2,
  Wallet,
  CheckCircle2,
  Utensils,
  Sparkles,
  Luggage,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { MultiCityTripPlannerInput, StopAccommodationInput } from '../../types';

interface PreferencesAndBudgetStepProps {
  data: MultiCityTripPlannerInput;
  onUpdate: (updated: Partial<MultiCityTripPlannerInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

const styleOptions = [
  'Gia đình & Trẻ em',
  'Nghỉ dưỡng & Relax',
  'Ẩm thực & Đặc sản',
  'Văn hóa & Di tích',
  'Khám phá Thiên nhiên',
  'Vui chơi Giải trí',
  'Check-in Sống ảo',
];

const avoidOptions = [
  'Không dậy quá sớm (trước 7:00)',
  'Tránh xếp lịch quá dày',
  'Hạn chế đi bộ liên tục',
  'Tránh xếp hoạt động trưa nắng',
  'Tránh địa điểm quá đông đúc',
];

const foodOptions = [
  'Đặc sản nổi tiếng địa phương',
  'Hải sản tươi sống',
  'Quán ăn gia đình rộng rãi',
  'Nhà hàng view đẹp / thơ mộng',
  'Cà phê sân vườn / yên tĩnh',
];

export const PreferencesAndBudgetStep: React.FC<PreferencesAndBudgetStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const stayStops = data.routeStops.filter((s) => s.type === 'stay');
  const accommodations = data.accommodations || [];
  const budget = data.budget;

  const handleUpdateAccommodation = (
    stopId: string,
    fields: Partial<StopAccommodationInput>
  ) => {
    const existingIndex = accommodations.findIndex((a) => a.stopId === stopId);
    let updatedAccs = [...accommodations];

    if (existingIndex >= 0) {
      updatedAccs[existingIndex] = { ...updatedAccs[existingIndex], ...fields };
    } else {
      updatedAccs.push({
        stopId,
        status: 'not_booked',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        ...fields,
      });
    }

    onUpdate({ accommodations: updatedAccs });
  };

  const handleUpdateBudget = (fields: Partial<typeof budget>) => {
    onUpdate({
      budget: {
        ...budget,
        ...fields,
      },
    });
  };

  const handleUpdateAlreadyPaid = (fields: Partial<typeof budget.alreadyPaid>) => {
    onUpdate({
      budget: {
        ...budget,
        alreadyPaid: {
          ...budget.alreadyPaid,
          ...fields,
        },
      },
    });
  };

  const totalPaid =
    (budget.alreadyPaid?.transport || 0) +
    (budget.alreadyPaid?.accommodation || 0) +
    (budget.alreadyPaid?.other || 0);

  const remainingBudget = Math.max(0, budget.total - totalPaid);

  const toggleArrayItem = (arr: string[], item: string) => {
    if (arr.includes(item)) return arr.filter((i) => i !== item);
    return [...arr, item];
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F0ED] text-[#183B35] text-xs font-bold mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>Bước 5 / 6 — Trải nghiệm, Lưu trú & Ngân sách</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Tùy chọn phong cách, nơi lưu trú & Ngân sách
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Khai báo nơi nghỉ từng điểm dừng và tách rõ chi phí đã mua để AI phân bổ chính xác ngân sách còn lại.
        </p>
      </div>

      {/* Part 1: Accommodations by Stop */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#2E8B57]" />
          Lưu trú theo từng điểm dừng
        </h3>

        {stayStops.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            Không có điểm dừng nghỉ qua đêm trong hành trình.
          </p>
        ) : (
          <div className="space-y-4">
            {stayStops.map((stop) => {
              const acc = accommodations.find((a) => a.stopId === stop.id) || {
                stopId: stop.id,
                status: 'not_booked' as const,
                checkInTime: '14:00',
                checkOutTime: '12:00',
              };

              const isBooked = acc.status === 'booked';

              return (
                <div
                  key={stop.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57]" />
                      Điểm ở lại: {stop.name} ({stop.nights || 1} đêm)
                    </span>

                    <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-bold">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateAccommodation(stop.id, { status: 'booked' })
                        }
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          isBooked ? 'bg-[#183B35] text-white' : 'text-slate-600'
                        }`}
                      >
                        ✓ Đã đặt chỗ
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateAccommodation(stop.id, { status: 'not_booked' })
                        }
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          acc.status === 'not_booked'
                            ? 'bg-[#183B35] text-white'
                            : 'text-slate-600'
                        }`}
                      >
                        Chưa đặt khách sạn
                      </button>
                    </div>
                  </div>

                  {isBooked ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tên Khách sạn / Resort đã đặt
                        </label>
                        <input
                          type="text"
                          value={acc.name || ''}
                          onChange={(e) =>
                            handleUpdateAccommodation(stop.id, {
                              name: e.target.value,
                            })
                          }
                          placeholder="Ví dụ: Melia Vinpearl Danang / The Arena Cam Ranh"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Địa chỉ / Khu vực
                        </label>
                        <input
                          type="text"
                          value={acc.address || ''}
                          onChange={(e) =>
                            handleUpdateAccommodation(stop.id, {
                              address: e.target.value,
                            })
                          }
                          placeholder="Ví dụ: Bãi Dài, Cam Ranh"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                        />
                      </div>

                      <div className="flex items-center gap-2 col-span-1 sm:col-span-2 pt-1">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={acc.luggageDropAvailable || false}
                            onChange={(e) =>
                              handleUpdateAccommodation(stop.id, {
                                luggageDropAvailable: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-[#2E8B57] rounded"
                          />
                          Khách sạn cho phép gửi hành lý trước giờ Check-in
                        </label>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      AI sẽ gợi ý vùng khách sạn tốt nhất trung tâm {stop.name} phù hợp gia đình.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Part 2: Styles, Pace & Avoid */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#2E8B57]" />
          Gu du lịch & Nhịp độ chuyến đi
        </h3>

        {/* Pace */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Nhịp độ tham quan mong muốn
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'relaxed', label: ' Thư thả', desc: '1-2 điểm/ngày, nhiều thời gian nghỉ' },
              { id: 'balanced', label: ' Cân bằng', desc: '2-3 điểm/ngày, vừa sức gia đình' },
              { id: 'active', label: ' Năng động', desc: 'Khám phá tối đa các điểm nổi tiếng' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onUpdate({ pace: p.id as any })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  data.pace === p.id
                    ? 'bg-[#183B35] text-white border-[#183B35] shadow-sm'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs">{p.label}</div>
                <div
                  className={`text-[11px] mt-0.5 ${
                    data.pace === p.id ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Styles */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Phong cách trải nghiệm yêu thích
          </label>
          <div className="flex flex-wrap gap-2">
            {styleOptions.map((st) => {
              const active = data.travelStyles.includes(st);
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() =>
                    onUpdate({
                      travelStyles: toggleArrayItem(data.travelStyles, st),
                    })
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    active
                      ? 'bg-[#2E8B57] text-white border-[#2E8B57]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Avoid */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Điều cả nhà muốn tránh
          </label>
          <div className="flex flex-wrap gap-2">
            {avoidOptions.map((av) => {
              const active = data.avoidPreferences.includes(av);
              return (
                <button
                  key={av}
                  type="button"
                  onClick={() =>
                    onUpdate({
                      avoidPreferences: toggleArrayItem(data.avoidPreferences, av),
                    })
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    active
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  ✕ {av}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Part 3: Budget Separation */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#2E8B57]" />
          Tách bạch Ngân sách toàn chuyến
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tổng ngân sách dự kiến (VND)
            </label>
            <input
              type="number"
              step={500000}
              value={budget.total}
              onChange={(e) =>
                handleUpdateBudget({ total: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
            />
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="block text-xs font-bold text-slate-700">
              Các khoản đã thanh toán trước (Vé xe, Khách sạn...):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-500">Vé di chuyển</span>
                <input
                  type="number"
                  value={budget.alreadyPaid?.transport || 0}
                  onChange={(e) =>
                    handleUpdateAlreadyPaid({
                      transport: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-2 py-1 rounded border border-slate-300 font-bold"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500">Tiền khách sạn</span>
                <input
                  type="number"
                  value={budget.alreadyPaid?.accommodation || 0}
                  onChange={(e) =>
                    handleUpdateAlreadyPaid({
                      accommodation: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-2 py-1 rounded border border-slate-300 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Banner */}
        <div className="bg-[#E9F0ED] border border-[#183B35]/20 rounded-xl p-3.5 text-xs flex items-center justify-between flex-wrap gap-2 text-[#183B35]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2E8B57]" />
            <span>
              Tổng đã trả: <strong>{totalPaid.toLocaleString('vi-VN')} đ</strong>
            </span>
          </div>

          <div className="font-extrabold text-sm text-[#183B35]">
            Ngân sách AI phân bổ ăn uống & vui chơi:{' '}
            <span className="text-[#2E8B57] text-base">
              {remainingBudget.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
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
          <span>Tiếp tục: Kiểm tra tuyến & Lập kế hoạch</span>
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
