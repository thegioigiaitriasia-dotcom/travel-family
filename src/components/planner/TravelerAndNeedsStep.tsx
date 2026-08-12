import React from 'react';
import { Users, Plus, Trash2, HeartHandshake, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { MultiCityTripPlannerInput } from '../../types';

interface TravelerAndNeedsStepProps {
  data: MultiCityTripPlannerInput;
  onUpdate: (updated: Partial<MultiCityTripPlannerInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

const specialNeedsOptions = [
  'Có người dễ say xe',
  'Có trẻ cần ghế riêng',
  'Có người không thể ngồi xe quá lâu',
  'Cần nghỉ giữa chặng',
  'Cần ăn đúng giờ (trẻ nhỏ / người cao tuổi)',
  'Có nhiều hành lý',
  'Mang xe đẩy trẻ em',
  'Cần phòng có lối đi xe lăn / không có cầu thang cao',
];

export const TravelerAndNeedsStep: React.FC<TravelerAndNeedsStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const travelers = data.travelers;
  const needs = data.mobilityAndComfortNeeds || [];

  const handleUpdateTravelers = (fields: Partial<typeof travelers>) => {
    onUpdate({
      travelers: {
        ...travelers,
        ...fields,
      },
    });
  };

  const handleAddChild = () => {
    handleUpdateTravelers({
      children: [...travelers.children, { age: 5 }],
    });
  };

  const handleRemoveChild = (index: number) => {
    const updated = travelers.children.filter((_, i) => i !== index);
    handleUpdateTravelers({ children: updated });
  };

  const handleChildAgeChange = (index: number, age: number) => {
    const updated = [...travelers.children];
    updated[index] = { age };
    handleUpdateTravelers({ children: updated });
  };

  const handleToggleNeed = (option: string) => {
    if (needs.includes(option)) {
      onUpdate({
        mobilityAndComfortNeeds: needs.filter((n) => n !== option),
      });
    } else {
      onUpdate({
        mobilityAndComfortNeeds: [...needs, option],
      });
    }
  };

  const isMotionSick = needs.includes('Có người dễ say xe');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F0ED] text-[#183B35] text-xs font-bold mb-2">
          <Users className="w-3.5 h-3.5" />
          <span>Bước 4 / 6 — Thành viên và nhu cầu gia đình</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Ai sẽ tham gia chuyến đi này?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Khai báo độ tuổi các thành viên và sức khỏe di chuyển để AI tùy chỉnh tốc độ, chèn trạm dừng nghỉ và lưu ý an toàn.
        </p>
      </div>

      {/* Family Members Count */}
      <div className="bg-sand-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
          Số lượng thành viên trong đoàn
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Adults */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-700">Người lớn</span>
              <span className="text-[11px] text-slate-500">18 - 59 tuổi</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleUpdateTravelers({ adults: Math.max(1, travelers.adults - 1) })
                }
                className="w-8 h-8 rounded-lg border border-slate-300 font-extrabold text-slate-700 hover:bg-slate-100"
              >
                -
              </button>
              <span className="font-extrabold text-base w-6 text-center text-slate-900">
                {travelers.adults}
              </span>
              <button
                type="button"
                onClick={() =>
                  handleUpdateTravelers({ adults: travelers.adults + 1 })
                }
                className="w-8 h-8 rounded-lg border border-slate-300 font-extrabold text-slate-700 hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Seniors */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-700">Người cao tuổi</span>
              <span className="text-[11px] text-slate-500">Từ 60 tuổi trở lên</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleUpdateTravelers({ seniors: Math.max(0, travelers.seniors - 1) })
                }
                className="w-8 h-8 rounded-lg border border-slate-300 font-extrabold text-slate-700 hover:bg-slate-100"
              >
                -
              </button>
              <span className="font-extrabold text-base w-6 text-center text-slate-900">
                {travelers.seniors}
              </span>
              <button
                type="button"
                onClick={() =>
                  handleUpdateTravelers({ seniors: travelers.seniors + 1 })
                }
                className="w-8 h-8 rounded-lg border border-slate-300 font-extrabold text-slate-700 hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Children Add */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-700">Trẻ em</span>
              <span className="text-[11px] text-slate-500">Dưới 18 tuổi</span>
            </div>
            <button
              type="button"
              onClick={handleAddChild}
              className="px-3 py-1.5 rounded-lg bg-[#2E8B57] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#236c43]"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm bé
            </button>
          </div>
        </div>

        {/* Children List with Ages */}
        {travelers.children.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">
              Độ tuổi từng bé (giúp AI chọn địa điểm vui chơi phù hợp)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {travelers.children.map((child, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-sand-50 border border-slate-200"
                >
                  <span className="text-xs font-bold text-slate-700">
                    Bé thứ {idx + 1}:
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={child.age}
                      onChange={(e) =>
                        handleChildAgeChange(idx, parseInt(e.target.value))
                      }
                      className="px-2.5 py-1 rounded-md border border-slate-300 bg-white text-xs font-bold"
                    >
                      {Array.from({ length: 18 }).map((_, age) => (
                        <option key={age} value={age}>
                          {age === 0 ? 'Dưới 1 tuổi' : `${age} tuổi`}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(idx)}
                      className="p-1 rounded text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobility & Special Needs Checklist */}
      <div className="bg-sand-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-[#2E8B57]" />
          Nhu cầu đặc biệt về sức khỏe & di chuyển
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {specialNeedsOptions.map((opt) => {
            const isChecked = needs.includes(opt);
            return (
              <label
                key={opt}
                onClick={() => handleToggleNeed(opt)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-[#E9F0ED] border-[#2E8B57] text-[#183B35] font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="w-4 h-4 text-[#2E8B57] rounded border-slate-300 focus:ring-[#2E8B57]"
                />
                <span className="text-xs">{opt}</span>
              </label>
            );
          })}
        </div>

        {/* Auto Motion Sickness Special Prompt Notice */}
        {isMotionSick && (
          <div className="bg-bronze-50 border border-bronze-300 rounded-xl p-3 text-xs text-bronze-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-bronze-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Kích hoạt chế độ hỗ trợ say xe:</strong>
              <span>
                AI sẽ tự động ưu tiên chặng di chuyển ngắn hơn, tự động chèn điểm dừng nghỉ giữa chặng, không xếp hoạt động nặng ngay khi vừa kết thúc di chuyển dài, và đưa thuốc say xe vào danh sách chuẩn bị đồ.
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Ghi chú riêng khác cho chuyến đi
          </label>
          <textarea
            value={data.specialNote || ''}
            onChange={(e) => onUpdate({ specialNote: e.target.value })}
            placeholder="Ví dụ: Bà nội dị ứng hải sản, bé lớn cần chỗ yên tĩnh để tự học 1 tiếng buổi tối..."
            rows={3}
            className="w-full p-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-sand-50 transition-all"
        >
          Quay lại
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-[#2E8B57] text-white font-extrabold text-sm hover:bg-[#236c43] transition-all shadow-md shadow-[#2E8B57]/20 flex items-center gap-2"
        >
          <span>Tiếp tục: Lưu trú & Ngân sách</span>
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
