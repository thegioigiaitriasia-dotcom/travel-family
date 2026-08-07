import React, { useState } from 'react';
import { Users, Baby, HeartHandshake, Minus, Plus, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { TripPlannerInput } from '../../types';

interface TravelerStepProps {
  data: TripPlannerInput;
  onUpdate: (updated: Partial<TripPlannerInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

const specialCardOptions = [
  'Có trẻ nhỏ',
  'Có người lớn tuổi',
  'Có người đi lại khó',
  'Không',
];

export const TravelerStep: React.FC<TravelerStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { adults, children, seniors } = data.travelers;

  const handleUpdateCount = (type: 'adults' | 'children' | 'seniors', delta: number) => {
    const currentVal = type === 'adults' ? adults : type === 'children' ? children.length : seniors;
    const newVal = Math.max(0, currentVal + delta);

    if (type === 'adults' && newVal < 1) return; // At least 1 adult required

    if (type === 'children') {
      let newChildren = [...children];
      if (delta > 0) {
        // Add default child age 13 for first, 16 for second
        const defaultAge = newChildren.length === 0 ? 13 : 16;
        newChildren.push({ age: defaultAge });
      } else if (delta < 0) {
        newChildren.pop();
      }
      onUpdate({
        travelers: { ...data.travelers, children: newChildren },
      });
    } else {
      onUpdate({
        travelers: { ...data.travelers, [type]: newVal },
      });
    }
  };

  const handleUpdateChildAge = (index: number, age: number) => {
    const newChildren = [...children];
    newChildren[index] = { age: Math.max(0, Math.min(17, age)) };
    onUpdate({
      travelers: { ...data.travelers, children: newChildren },
    });
  };

  const selectNeedCard = (option: string) => {
    if (option === 'Không') {
      onUpdate({ specialNeeds: ['Không'] });
      return;
    }

    let list = data.specialNeeds.filter((item) => item !== 'Không');
    if (list.includes(option)) {
      list = list.filter((item) => item !== option);
    } else {
      list.push(option);
    }

    if (list.length === 0) {
      list = ['Không'];
    }

    onUpdate({ specialNeeds: list });
  };

  const validateAndNext = () => {
    if (adults < 1) {
      setErrorMsg('Vui lòng chọn ít nhất 1 người lớn.');
      return;
    }
    setErrorMsg(null);
    onNext();
  };

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">Bước 2 / 5</span>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Gia đình tham gia
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Dùng nút Stepper bên dưới để chọn số lượng thành viên chuyến đi.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Steppers for Adults, Children, Seniors */}
      <div className="space-y-3 bg-slate-50 p-5 rounded-[20px] border border-slate-200">
        {/* Người lớn */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-900">Người lớn</p>
            <p className="text-[11px] text-slate-500">Từ 18 tuổi trở lên</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => handleUpdateCount('adults', -1)}
              disabled={adults <= 1}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-black text-slate-900 w-6 text-center">
              {adults}
            </span>
            <button
              type="button"
              onClick={() => handleUpdateCount('adults', 1)}
              className="w-8 h-8 rounded-xl bg-[#DC2626] text-white font-bold flex items-center justify-center hover:bg-[#B91C1C] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trẻ em */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
          <div>
            <p className="text-sm font-extrabold text-slate-900">Trẻ em</p>
            <p className="text-[11px] text-slate-500">Dưới 18 tuổi</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => handleUpdateCount('children', -1)}
              disabled={children.length <= 0}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-black text-slate-900 w-6 text-center">
              {children.length}
            </span>
            <button
              type="button"
              onClick={() => handleUpdateCount('children', 1)}
              className="w-8 h-8 rounded-xl bg-[#DC2626] text-white font-bold flex items-center justify-center hover:bg-[#B91C1C] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Người lớn tuổi */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
          <div>
            <p className="text-sm font-extrabold text-slate-900">Người lớn tuổi</p>
            <p className="text-[11px] text-slate-500">Từ 60 tuổi trở lên</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => handleUpdateCount('seniors', -1)}
              disabled={seniors <= 0}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-black text-slate-900 w-6 text-center">
              {seniors}
            </span>
            <button
              type="button"
              onClick={() => handleUpdateCount('seniors', 1)}
              className="w-8 h-8 rounded-xl bg-[#DC2626] text-white font-bold flex items-center justify-center hover:bg-[#B91C1C] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Children Age Display */}
      {children.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Baby className="w-4 h-4 text-[#DC2626]" />
            Độ tuổi trẻ em
          </label>
          <div className="flex flex-wrap gap-2">
            {children.map((child, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-[#DC2626]/10 text-[#DC2626] px-3.5 py-2 rounded-xl border border-[#DC2626]/30 font-extrabold text-xs"
              >
                <span>Trẻ {idx + 1}:</span>
                <input
                  type="number"
                  min="0"
                  max="17"
                  value={child.age}
                  onChange={(e) => handleUpdateChildAge(idx, Number(e.target.value))}
                  className="w-12 px-1 py-0.5 rounded bg-white text-center font-bold text-slate-900 border border-slate-200"
                />
                <span>tuổi</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Selection for Special Needs - No Checkboxes */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 text-[#2E8B57]" />
          Lưu ý sức khỏe / Di chuyển
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
          {specialCardOptions.map((opt) => {
            const isSelected = data.specialNeeds.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => selectNeedCard(opt)}
                className={`p-4 rounded-[18px] border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-md shadow-[#DC2626]/20 scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            );
          })}
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
