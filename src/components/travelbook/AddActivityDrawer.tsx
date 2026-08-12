import React, { useState } from 'react';
import {
  X,
  Compass,
  Utensils,
  Plane,
  Coffee,
  BedDouble,
  Sparkles,
  FileText,
  Clock,
  MapPin,
  DollarSign,
  Check,
} from 'lucide-react';
import { TravelActivity, TravelActivityType } from '../../types';

interface AddActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: TravelActivity) => void;
}

export const AddActivityDrawer: React.FC<AddActivityDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TravelActivityType>('sightseeing');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [placeName, setPlaceName] = useState('');
  const [address, setAddress] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const categories: { id: TravelActivityType; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'sightseeing',
      label: 'Tham quan',
      icon: <Compass className="w-4 h-4 text-bronze-600" />,
      color: 'bg-forest-50 border-forest-200 text-forest-900',
    },
    {
      id: 'food',
      label: 'Ăn uống',
      icon: <Utensils className="w-4 h-4 text-bronze-600" />,
      color: 'bg-bronze-50 border-bronze-200 text-bronze-900',
    },
    {
      id: 'transport',
      label: 'Di chuyển',
      icon: <Plane className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    {
      id: 'rest',
      label: 'Nghỉ ngơi',
      icon: <Coffee className="w-4 h-4 text-slate-600" />,
      color: 'bg-slate-100 border-slate-200 text-slate-900',
    },
    {
      id: 'accommodation',
      label: 'Lưu trú',
      icon: <BedDouble className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 text-purple-900',
    },
    {
      id: 'experience',
      label: 'Trải nghiệm',
      icon: <Sparkles className="w-4 h-4 text-bronze-600" />,
      color: 'bg-bronze-50 border-bronze-200 text-bronze-900',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newActivity: TravelActivity = {
      id: 'act-' + Date.now(),
      title,
      type,
      startTime,
      endTime,
      status: 'upcoming',
      description,
      estimatedCost: Number(cost) || 0,
      notes,
      place: placeName
        ? {
            name: placeName,
            address,
          }
        : undefined,
    };

    onSave(newActivity);
    // Reset form
    setTitle('');
    setPlaceName('');
    setAddress('');
    setCost(0);
    setDescription('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl p-6 space-y-6 flex flex-col justify-between animate-fadeIn text-left">
        <div className="space-y-5">
          {/* Top Title Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Thêm hoạt động mới
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Chọn loại hoạt động và điền thông tin lịch trình.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-2 bg-[#FEF2F2] p-3 rounded-2xl border border-[#FECACA]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-bronze-600">
              <Sparkles className="w-4 h-4 text-[#C98745]" />
              <span>Gợi ý nhanh điểm tham quan, Tour & Vui chơi:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                {
                  label: 'Bảo tàng Cà phê',
                  type: 'sightseeing' as const,
                  title: 'Tham quan Bảo tàng Thế giới Cà phê',
                  place: 'Bảo tàng Thế giới Cà phê',
                  cost: 150000,
                  desc: 'Kiến trúc nhà dài Tây Nguyên, trưng bày văn hóa cà phê.',
                  notes: 'Nên chụp ảnh lưu niệm buổi sáng không khí mát mẻ.',
                },
                {
                  label: 'Tour Thác Dray Nur',
                  type: 'experience' as const,
                  title: 'Tour Thác Dray Nur & Chèo SUP',
                  place: 'Thác Dray Nur',
                  cost: 650000,
                  desc: 'Khám phá thác nước hùng vĩ, chèo SUP nhẹ nhàng.',
                  notes: 'Có áo phao an toàn cho trẻ em.',
                },
                {
                  label: 'Vui chơi Công viên nước',
                  type: 'experience' as const,
                  title: 'Vui chơi Công viên nước Mikazuki',
                  place: 'Da Nang Mikazuki Japanese Resort',
                  cost: 350000,
                  desc: 'Hồ bơi công viên nước trong nhà & ngoài trời kiểu Nhật.',
                  notes: 'Nhớ mang đồ bơi cho các bé.',
                },
                {
                  label: 'Tour Cù Lao Chàm',
                  type: 'experience' as const,
                  title: 'Tour Cano Cù Lao Chàm & Ngắm San Hô',
                  place: 'Cù Lao Chàm - Hội An',
                  cost: 650000,
                  desc: 'Đi cano cao tốc, tắm bãi vắng, ăn hải sản tươi.',
                  notes: 'Mang theo kính râm và kem chống nắng.',
                },
                {
                  label: 'Cầu Treo Buôn Đôn',
                  type: 'sightseeing' as const,
                  title: 'Khám phá Cầu Treo & Nhà Cổ Amakông',
                  place: 'Buôn Đôn',
                  cost: 80000,
                  desc: 'Trải nghiệm cầu treo qua sông Sêrêpôk, tìm hiểu văn hóa voi.',
                  notes: 'Nên mang giày thể thao đế bằng.',
                },
              ].map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setType(sug.type);
                    setTitle(sug.title);
                    setPlaceName(sug.place);
                    setCost(sug.cost);
                    setDescription(sug.desc);
                    setNotes(sug.notes);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-bronze-600 hover:text-white text-bronze-600 text-[11px] font-semibold transition-all border border-[#FECACA] cursor-pointer shadow-2xs"
                >
                  + {sug.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type Selector Grid */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 block">
              Loại hoạt động
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = type === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setType(cat.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? `${cat.color} font-black shadow-xs ring-2 ring-[#DC2626]/20`
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-sand-50 font-bold'
                    }`}
                  >
                    {cat.icon}
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form inputs */}
          <form id="add-act-form" onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block mb-1">Tên hoạt động *</label>
              <input
                type="text"
                required
                placeholder="VD: Tham quan Bảo tàng Thế giới Cà phê"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-sand-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Giờ bắt đầu</label>
                <div className="relative">
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-slate-300 text-xs font-bold text-slate-900 pl-8"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block mb-1">Giờ kết thúc</label>
                <div className="relative">
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-slate-300 text-xs font-bold text-slate-900 pl-8"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1">Tên địa điểm (Tùy chọn)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="VD: Bảo tàng Cà phê"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-sand-50 border border-slate-300 text-xs font-bold text-slate-900 pl-9"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block mb-1">Địa chỉ (Tùy chọn)</label>
              <input
                type="text"
                placeholder="VD: 341 Trần Hưng Đạo, Sơn Trà, TP. Đà Nẵng"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-sand-50 border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block mb-1">Chi phí dự kiến (VNĐ)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={cost || ''}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-sand-50 border border-slate-300 text-xs font-bold text-slate-900 pl-9"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block mb-1">Mô tả hoạt động</label>
              <textarea
                rows={2}
                placeholder="VD: Tìm hiểu quy trình sản xuất cà phê, chụp ảnh lưu niệm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-sand-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            <div>
              <label className="block mb-1">Ghi chú / Mẹo cho gia đình</label>
              <input
                type="text"
                placeholder="VD: Nên đi buổi sáng không khí mát mẻ"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-sand-50 border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>
          </form>
        </div>

        {/* Footer buttons */}
        <div className="pt-4 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="submit"
            form="add-act-form"
            className="flex-1 py-3 rounded-xl bg-bronze-600 text-white font-extrabold text-xs hover:bg-[#B91C1C] shadow-md shadow-[#DC2626]/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Thêm hoạt động</span>
          </button>
        </div>
      </div>
    </div>
  );
};
