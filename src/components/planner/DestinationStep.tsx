import React, { useState } from 'react';
import { MapPin, Calendar, Plus, X, ArrowRight, AlertCircle, Compass, Route } from 'lucide-react';
import { TripPlannerInput } from '../../types';

interface DestinationStepProps {
  data: TripPlannerInput;
  onUpdate: (updated: Partial<TripPlannerInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

const popularDestinations = [
  'Đà Nẵng',
  'Hội An',
  'Đà Lạt',
  'Phú Quốc',
  'Nha Trang',
  'Hà Nội',
  'Sapa',
  'Hạ Long',
];

export const DestinationStep: React.FC<DestinationStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [destInput, setDestInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddDestination = (nameToAdd: string) => {
    const trimmed = nameToAdd.trim();
    if (!trimmed) return;
    if (data.destinations.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
      setDestInput('');
      return;
    }
    onUpdate({
      destinations: [...data.destinations, { name: trimmed }],
    });
    setDestInput('');
    setErrorMsg(null);
  };

  const handleRemoveDestination = (index: number) => {
    onUpdate({
      destinations: data.destinations.filter((_, i) => i !== index),
    });
  };

  let calculatedDays = data.expectedDays || 4;
  let calculatedNights = Math.max(0, calculatedDays - 1);

  if (data.dateMode === 'fixed' && data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime >= 0) {
      calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      calculatedNights = Math.max(0, calculatedDays - 1);
    }
  }

  const validateAndNext = () => {
    if (data.destinations.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất một điểm đến.');
      return;
    }
    if (!data.origin.name.trim()) {
      setErrorMsg('Vui lòng nhập nơi khởi hành.');
      return;
    }
    if (data.dateMode === 'fixed') {
      if (!data.startDate || !data.endDate) {
        setErrorMsg('Vui lòng chọn đủ ngày đi và ngày về.');
        return;
      }
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end < start) {
        setErrorMsg('Ngày về không được trước ngày đi.');
        return;
      }
    }
    setErrorMsg(null);
    onNext();
  };

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">Bước 1 / 5</span>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Gia đình muốn đi đâu?
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Nhập một hoặc nhiều điểm đến để AI kết nối tuyến đường linh hoạt.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl p-3.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selected Route Flow Display */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#DC2626]" />
          Điểm đến của bạn <span className="text-red-500">*</span>
        </label>

        {/* Route Flow Card with Arrow Connection Icons */}
        <div className="p-4 rounded-[20px] bg-slate-50 border border-slate-200 space-y-3">
          {data.destinations.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Chưa chọn điểm đến nào...</span>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                <Route className="w-4 h-4 text-[#DC2626]" />
                <span>Lộ trình dự kiến:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {data.destinations.map((dest, idx) => (
                  <React.Fragment key={idx}>
                    <div className="inline-flex items-center gap-1.5 bg-[#DC2626] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm">
                      <span>{dest.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDestination(idx)}
                        className="hover:bg-[#B91C1C] rounded-full p-0.5 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {idx < data.destinations.length - 1 && (
                      <span className="text-[#FFB545] font-extrabold text-base px-1">➔</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Input & Auto Complete Suggestions */}
        <div className="flex gap-2">
          <input
            type="text"
            value={destInput}
            onChange={(e) => setDestInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddDestination(destInput);
              }
            }}
            placeholder="Nhập địa điểm... (VD: Đà Nẵng, Hội An, Phú Quốc)"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#DC2626] text-xs font-medium"
          />
          <button
            type="button"
            onClick={() => handleAddDestination(destInput)}
            className="px-5 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm</span>
          </button>
        </div>

        {/* Popular Autocomplete suggestions */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400">Gợi ý địa điểm:</span>
          <div className="flex flex-wrap gap-1.5">
            {popularDestinations.map((city) => {
              const isSelected = data.destinations.some(
                (d) => d.name.toLowerCase() === city.toLowerCase()
              );
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() =>
                    isSelected
                      ? onUpdate({
                          destinations: data.destinations.filter(
                            (d) => d.name.toLowerCase() !== city.toLowerCase()
                          ),
                        })
                      : handleAddDestination(city)
                  }
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-semibold ${
                    isSelected
                      ? 'bg-[#DC2626]/10 border-[#DC2626] text-[#DC2626] font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isSelected ? `✓ ${city}` : `+ ${city}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Point of Origin */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#2E8B57]" />
          Nơi khởi hành <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.origin.name}
          onChange={(e) => onUpdate({ origin: { name: e.target.value } })}
          placeholder="Ví dụ: TP. Hồ Chí Minh"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#DC2626] text-xs font-medium"
        />
      </div>

      {/* Calendar & Departure / Arrival Time Schedule */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#DC2626]" />
          Thời gian & Giờ khởi hành cụ thể
        </label>

        <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Ngày đi:</label>
              <input
                type="date"
                value={data.startDate || '2026-08-08'}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Ngày về:</label>
              <input
                type="date"
                value={data.endDate || '2026-08-11'}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                ⏱ Giờ bay / xe khởi hành chặng đi:
              </label>
              <input
                type="time"
                value={data.departureTime || '06:30'}
                onChange={(e) => onUpdate({ departureTime: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Ví dụ: 06:30 sáng</span>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                🛬 Giờ dự kiến đến điểm đến:
              </label>
              <input
                type="time"
                value={data.estimatedArrivalTime || '10:30'}
                onChange={(e) => onUpdate({ estimatedArrivalTime: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Ví dụ: 10:30 sáng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Province Inter-city Transit Legs Survey */}
      {data.destinations.length > 1 && (
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#DC2626] flex items-center gap-1.5">
              <Route className="w-4 h-4 text-[#DC2626]" />
              Khảo sát di chuyển liên tỉnh ({data.destinations.length - 1} chặng di chuyển)
            </label>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-[20px] p-4 space-y-3">
            <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
              Gia đình đi qua <strong>{data.destinations.map(d => d.name).join(' ➔ ')}</strong>. Vui lòng cho biết chi tiết phương tiện & thời gian di chuyển giữa các tỉnh:
            </p>

            {data.destinations.slice(0, -1).map((fromDest, idx) => {
              const toDest = data.destinations[idx + 1];
              const leg = data.interProvinceLegs?.[idx] || {
                from: fromDest.name,
                to: toDest.name,
                transportMethod: 'Xe riêng 7 chỗ / Limousine',
                estimatedHours: 4.5,
                note: 'Dừng chân nghỉ ngơi, chụp ảnh đèo',
              };

              return (
                <div key={idx} className="bg-white rounded-xl p-3.5 border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-extrabold text-amber-950">
                    <span>Chặng {idx + 1}: {fromDest.name} ➔ {toDest.name}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Phương tiện:</label>
                      <input
                        type="text"
                        value={leg.transportMethod}
                        onChange={(e) => {
                          const updatedLegs = [...(data.interProvinceLegs || [])];
                          updatedLegs[idx] = { ...leg, transportMethod: e.target.value };
                          onUpdate({ interProvinceLegs: updatedLegs });
                        }}
                        placeholder="VD: Xe riêng, Xe khách"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Thời gian di chuyển (giờ):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={leg.estimatedHours || 4}
                        onChange={(e) => {
                          const updatedLegs = [...(data.interProvinceLegs || [])];
                          updatedLegs[idx] = { ...leg, estimatedHours: parseFloat(e.target.value) || 0 };
                          onUpdate({ interProvinceLegs: updatedLegs });
                        }}
                        placeholder="VD: 4.5"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Điểm dừng chân / Lưu ý:</label>
                      <input
                        type="text"
                        value={leg.note || ''}
                        onChange={(e) => {
                          const updatedLegs = [...(data.interProvinceLegs || [])];
                          updatedLegs[idx] = { ...leg, note: e.target.value };
                          onUpdate({ interProvinceLegs: updatedLegs });
                        }}
                        placeholder="VD: Ngắm đèo Khánh Lê"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
        >
          Quay lại
        </button>

        <button
          type="button"
          onClick={validateAndNext}
          className="px-6 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs transition-colors shadow-md shadow-[#DC2626]/20 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
