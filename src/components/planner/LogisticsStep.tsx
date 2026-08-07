import React from 'react';
import { DollarSign, BedDouble, Plane, ArrowRight, Check } from 'lucide-react';
import { TripPlannerInput } from '../../types';

const HOURS_24 = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});
const TimeSelect24h: React.FC<{ value: string; onChange: (v: string) => void; className?: string }> = ({ value, onChange, className }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
    {HOURS_24.map((t) => <option key={t} value={t}>{t}</option>)}
  </select>
);

interface LogisticsStepProps {
  data: TripPlannerInput;
  onUpdate: (updated: Partial<TripPlannerInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

const accommodationTypes = [
  { id: 'Khách sạn', label: 'Khách sạn', icon: '🏨' },
  { id: 'Homestay', label: 'Homestay', icon: '🏡' },
  { id: 'Resort', label: 'Resort', icon: '🌴' },
  { id: 'Condotel', label: 'Condotel', icon: '🏢' },
];

const transportOptions = [
  { id: 'Máy bay', label: 'Máy bay', icon: '✈️' },
  { id: 'Xe khách', label: 'Xe khách', icon: '🚌' },
  { id: 'Limousine', label: 'Limousine', icon: '🚐' },
  { id: 'Xe riêng', label: 'Xe riêng', icon: '🚗' },
  { id: 'Grab', label: 'Grab / Taxi', icon: '🚖' },
];

export const LogisticsStep: React.FC<LogisticsStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const currentBudget = data.budget.total || 15000000;

  const handleBudgetChange = (val: number) => {
    onUpdate({
      budget: {
        ...data.budget,
        total: val,
      },
    });
  };

  const toggleAccommodation = (typeId: string) => {
    let types = [...(data.accommodation.preferredTypes || ['Khách sạn'])];
    if (types.includes(typeId)) {
      types = types.filter((t) => t !== typeId);
    } else {
      types.push(typeId);
    }
    if (types.length === 0) types = ['Khách sạn'];
    onUpdate({
      accommodation: {
        ...data.accommodation,
        preferredTypes: types,
      },
    });
  };

  const toggleTransport = (transId: string) => {
    onUpdate({ mainTransport: transId });
  };

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">Bước 4 / 5</span>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Ngân sách & Hậu cần
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Điều chỉnh mức ngân sách bằng thanh trượt và chọn phương tiện, nơi ở mong muốn.
        </p>
      </div>

      {/* 1. Ngân sách - Slider */}
      <div className="space-y-4 bg-slate-50 p-5 rounded-[20px] border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#2E8B57]" />
            Ngân sách dự kiến
          </label>
          <span className="text-lg font-black text-[#2E8B57]">
            {new Intl.NumberFormat('vi-VN').format(currentBudget)} VNĐ
          </span>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={5000000}
            max={50000000}
            step={1000000}
            value={currentBudget}
            onChange={(e) => handleBudgetChange(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2E8B57]"
          />
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span>5 triệu</span>
            <span>20 triệu</span>
            <span>35 triệu</span>
            <span>50 triệu</span>
          </div>
        </div>
      </div>

      {/* 2. Lưu trú Cards & Check-in / Check-out Times */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <BedDouble className="w-4 h-4 text-[#DC2626]" />
          Loại hình lưu trú & Khung giờ nhận/trả phòng
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {accommodationTypes.map((acc) => {
            const isSelected = (data.accommodation.preferredTypes || []).includes(acc.id);
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => toggleAccommodation(acc.id)}
                className={`p-3.5 rounded-[18px] border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-md shadow-[#DC2626]/20 scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">{acc.icon}</span>
                <span className="text-xs font-extrabold">{acc.label}</span>
              </button>
            );
          })}
        </div>

        {/* Check-in & Check-out Specific Times */}
        <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              🔑 Giờ Check-in nhận phòng (dự kiến):
            </label>
            <TimeSelect24h
              value={data.hotelCheckInTime || '14:00'}
              onChange={(v) => onUpdate({ hotelCheckInTime: v })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Tiêu chuẩn thường là 14:00</span>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              🗝 Giờ Check-out trả phòng (dự kiến):
            </label>
            <TimeSelect24h
              value={data.hotelCheckOutTime || '12:00'}
              onChange={(v) => onUpdate({ hotelCheckOutTime: v })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Tiêu chuẩn thường là 12:00</span>
          </div>
        </div>
      </div>

      {/* 3. Phương tiện Di chuyển Cards & Return Schedule */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Plane className="w-4 h-4 text-[#DC2626]" />
          Phương tiện di chuyển & Lịch di chuyển khứ hồi lượt về
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {transportOptions.map((trans) => {
            const isSelected = data.mainTransport === trans.id;
            return (
              <button
                key={trans.id}
                type="button"
                onClick={() => toggleTransport(trans.id)}
                className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-md shadow-[#DC2626]/20 scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{trans.icon}</span>
                  <span className="text-xs font-extrabold">{trans.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Return Trip Specific Times */}
        <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              🛫 Giờ khởi hành chặng VỀ (bay/xe):
            </label>
            <TimeSelect24h
              value={data.returnDepartureTime || '15:30'}
              onChange={(v) => onUpdate({ returnDepartureTime: v })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Ví dụ: 15:30 chiều ngày cuối</span>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              🏠 Giờ dự kiến về tới nhà:
            </label>
            <TimeSelect24h
              value={data.returnArrivalTime || '19:30'}
              onChange={(v) => onUpdate({ returnArrivalTime: v })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Ví dụ: 19:30 tối</span>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
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
          onClick={onNext}
          className="px-6 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs transition-colors shadow-md shadow-[#DC2626]/20 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
