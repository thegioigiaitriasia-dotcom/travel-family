import React from 'react';
import { Compass, Gauge, ArrowRight, Check, MapPin, Ticket, Sparkles } from 'lucide-react';
import { TripPlannerInput } from '../../types';

interface PreferenceStepProps {
  data: TripPlannerInput;
  onUpdate: (updated: Partial<TripPlannerInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

const styleCards = [
  { id: 'Nghỉ dưỡng', label: 'Nghỉ dưỡng', icon: '🏖' },
  { id: 'Ẩm thực', label: 'Ẩm thực', icon: '🍜' },
  { id: 'Văn hóa', label: 'Văn hóa', icon: '🏛' },
  { id: 'Thiên nhiên', label: 'Thiên nhiên', icon: '🌲' },
  { id: 'Checkin', label: 'Checkin', icon: '📸' },
  { id: 'Du lịch biển', label: 'Du lịch biển', icon: '🌊' },
  { id: 'Vui chơi trẻ em', label: 'Vui chơi trẻ em', icon: '🎠' },
  { id: 'Mua sắm', label: 'Mua sắm & Đặc sản', icon: '🛒' },
];

const paceOptions = [
  {
    id: 'relaxed',
    label: 'Thư giãn',
    desc: 'Di chuyển thong thả, nghỉ trưa đầy đủ',
  },
  {
    id: 'balanced',
    label: 'Cân bằng',
    desc: 'Kết hợp tham quan & nghỉ ngơi hợp lý',
  },
  {
    id: 'active',
    label: 'Khám phá nhiều',
    desc: 'Trải nghiệm tối đa các điểm đến',
  },
];

const recommendedAttractionsList = [
  {
    id: 'attr-1',
    name: 'Bảo tàng Thế giới Cà phê',
    category: 'Tham quan',
    badge: 'Must Visit',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'attr-2',
    name: 'Tour Thác Dray Nur & Chèo SUP',
    category: 'Tour 1/2 ngày',
    badge: 'Gia đình',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'attr-3',
    name: 'Chùa Sắc Tứ Khải Đoan',
    category: 'Văn hóa',
    badge: 'Miễn phí',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'attr-4',
    name: 'Công viên nước VinWonders & Thủy cung',
    category: 'Vui chơi giải trí',
    badge: 'Bé thích',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'attr-5',
    name: 'Tour Cano lặn ngắm san hô Cù Lao Chàm',
    category: 'Tour trọn gói',
    badge: 'Lặn san hô',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'attr-6',
    name: 'Sun World Bà Nà Hills & Cầu Vàng',
    category: 'Trải nghiệm',
    badge: 'Check-in nổi tiếng',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&auto=format&fit=crop&q=80',
  },
];

export const PreferenceStep: React.FC<PreferenceStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const selectedAttractions = data.preferredAttractions || [
    'Bảo tàng Thế giới Cà phê',
    'Tour Thác Dray Nur & Chèo SUP',
    'Công viên nước & Nhạc nước Arena',
  ];

  const toggleStyle = (styleId: string) => {
    let list = [...data.travelStyles];
    if (list.includes(styleId)) {
      list = list.filter((s) => s !== styleId);
    } else {
      list.push(styleId);
    }
    if (list.length === 0) {
      list = ['Gia đình'];
    }
    onUpdate({ travelStyles: list });
  };

  const toggleAttraction = (name: string) => {
    let list = [...selectedAttractions];
    if (list.includes(name)) {
      list = list.filter((a) => a !== name);
    } else {
      list.push(name);
    }
    onUpdate({ preferredAttractions: list });
  };

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">Bước 3 / 5</span>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Phong cách & Điểm tham quan / Tour
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Chọn phong cách du lịch và các địa điểm tham quan, tour ưu tiên cho chuyến đi.
        </p>
      </div>

      {/* Grid 2 Cột với Card Lớn + Emoji */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#DC2626]" />
          1. Phong cách du lịch chính
        </label>

        <div className="grid grid-cols-2 gap-3">
          {styleCards.map((item) => {
            const isSelected = data.travelStyles.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleStyle(item.id)}
                className={`p-4 rounded-[20px] border text-left transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-lg shadow-[#DC2626]/20 scale-[1.02]'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-extrabold tracking-tight">{item.label}</span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-white text-[#DC2626] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Địa điểm Tham quan, Tour & Vui chơi ưu tiên */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-[#DC2626]" />
            2. Địa điểm tham quan & Tour chọn trước (AI ưu tiên xếp)
          </label>
          <span className="text-[11px] text-[#DC2626] font-semibold bg-[#FEF2F2] px-2.5 py-0.5 rounded-full border border-[#FECACA]">
            Đã chọn {selectedAttractions.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {recommendedAttractionsList.map((attr) => {
            const isChecked = selectedAttractions.includes(attr.name);
            return (
              <button
                key={attr.id}
                type="button"
                onClick={() => toggleAttraction(attr.name)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  isChecked
                    ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <img
                  src={attr.imageUrl}
                  alt={attr.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.2 rounded-full inline-block ${
                      isChecked ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {attr.category}
                  </span>
                  <h4 className="text-xs font-bold truncate">{attr.name}</h4>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isChecked ? 'border-white bg-white text-[#DC2626]' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Nhịp độ chuyến đi */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Gauge className="w-4 h-4 text-[#2E8B57]" />
          3. Nhịp độ di chuyển
        </label>

        <div className="space-y-2.5">
          {paceOptions.map((option) => {
            const isSelected = data.pace === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onUpdate({ pace: option.id as any })}
                className={`w-full p-4 rounded-[20px] border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#2E8B57]/10 border-[#2E8B57] ring-2 ring-[#2E8B57]/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-0.5">
                  <span className={`text-xs font-extrabold block ${isSelected ? 'text-[#2E8B57]' : 'text-slate-900'}`}>
                    {option.label}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {option.desc}
                  </span>
                </div>

                {/* Custom Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#2E8B57] bg-[#2E8B57]' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
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

