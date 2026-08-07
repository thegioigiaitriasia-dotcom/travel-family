import React, { useState, useEffect } from 'react';
import { X, BedDouble, Plus, Check } from 'lucide-react';
import { AccommodationItem, BookingStatusType } from './AccommodationSection';

interface AccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accommodation: AccommodationItem) => void;
  initialData?: AccommodationItem | null;
}

export const AccommodationModal: React.FC<AccommodationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [period, setPeriod] = useState('Đêm 1');
  const [name, setName] = useState('');
  const [dates, setDates] = useState('08/08 – 09/08');
  const [status, setStatus] = useState<BookingStatusType>('confirmed');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('12:00');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (initialData) {
      setPeriod(initialData.period || 'Đêm 1');
      setName(initialData.name || '');
      setDates(initialData.dates || '08/08 – 09/08');
      setStatus(initialData.status || 'confirmed');
      setCheckInTime(initialData.checkInTime || '14:00');
      setCheckOutTime(initialData.checkOutTime || '12:00');
      setAddress(initialData.address || '');
    } else {
      setPeriod('Đêm 1');
      setName('');
      setDates('08/08 – 09/08');
      setStatus('confirmed');
      setCheckInTime('14:00');
      setCheckOutTime('12:00');
      setAddress('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData?.id || 'acc-' + Date.now(),
      period,
      name,
      dates,
      status,
      checkInTime,
      checkOutTime,
      address,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 text-left animate-fadeIn relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-[#2E8B57]" />
            {initialData ? 'Chỉnh sửa nơi lưu trú' : 'Thêm nơi lưu trú'}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý thông tin khách sạn và thời gian nhận/trả phòng.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
          <div>
            <label className="block mb-1">Tên khách sạn / Resort *</label>
            <input
              type="text"
              required
              placeholder="VD: Melia Vinpearl Danang Riverfront"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2E8B57]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1">Khoảng thời gian (Đêm)</label>
              <input
                type="text"
                placeholder="VD: Đêm 1 hoặc Đêm 2–3"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block mb-1">Ngày ở</label>
              <input
                type="text"
                placeholder="VD: 08/08 – 09/08"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1">Giờ nhận phòng</label>
              <input
                type="text"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block mb-1">Giờ trả phòng</label>
              <input
                type="text"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">Trạng thái đặt phòng</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatusType)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2E8B57]"
            >
              <option value="confirmed">Đã đặt (Confirmed)</option>
              <option value="pending">Chờ xác nhận (Pending)</option>
              <option value="not_booked">Chưa đặt (Not Booked)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Địa chỉ (Tùy chọn)</label>
            <input
              type="text"
              placeholder="VD: 341 Trần Hưng Đạo, Sơn Trà, TP. Đà Nẵng"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#2E8B57] text-white font-extrabold text-xs hover:bg-[#246e45] shadow-md cursor-pointer flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Lưu thay đổi' : 'Thêm lưu trú'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
