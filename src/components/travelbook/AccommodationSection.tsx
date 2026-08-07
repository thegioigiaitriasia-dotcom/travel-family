import React from 'react';
import { BedDouble, CheckCircle2, Clock, AlertTriangle, MapPin, Edit, Plus, ExternalLink } from 'lucide-react';

export type BookingStatusType = 'confirmed' | 'pending' | 'not_booked';

export interface AccommodationItem {
  id: string;
  period: string; // e.g. "Đêm 1" or "Đêm 2–3"
  name: string; // e.g. "Melia Vinpearl Danang Riverfront"
  dates: string; // e.g. "08/08 – 09/08"
  status: BookingStatusType;
  checkInTime?: string; // e.g. "14:00"
  checkOutTime?: string; // e.g. "11:00"
  address?: string; // e.g. "341 Trần Hưng Đạo, Sơn Trà, TP. Đà Nẵng"
}

interface AccommodationSectionProps {
  accommodations?: AccommodationItem[];
  onAddAccommodation: () => void;
  onEditAccommodation: (acc: AccommodationItem) => void;
  onOpenMap: (placeName: string) => void;
}

const defaultAccommodations: AccommodationItem[] = [
  {
    id: 'acc-1',
    period: 'Đêm 1–2',
    name: 'Khách sạn Melia Vinpearl Danang Riverfront',
    dates: '08/08 – 10/08',
    status: 'confirmed',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    address: '341 Trần Hưng Đạo, Sơn Trà, Đà Nẵng',
  },
  {
    id: 'acc-2',
    period: 'Đêm 3',
    name: 'Silkotel Hoi An Resort',
    dates: '10/08 – 11/08',
    status: 'confirmed',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    address: '01 Hùng Vương, Phường Cẩm Phô, Hội An',
  },
];

export const AccommodationSection: React.FC<AccommodationSectionProps> = ({
  accommodations = defaultAccommodations,
  onAddAccommodation,
  onEditAccommodation,
  onOpenMap,
}) => {
  const getStatusBadge = (status: BookingStatusType) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#2E8B57]/10 text-[#2E8B57] border border-[#2E8B57]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã đặt
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Chờ xác nhận
          </span>
        );
      case 'not_booked':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Chưa đặt
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-[#2E8B57]" />
            Nơi lưu trú
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Danh sách khách sạn & resort đã chuẩn bị cho cả gia đình.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddAccommodation}
          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2E8B57] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-100"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nơi lưu trú</span>
        </button>
      </div>

      {/* Accommodations Cards Grid */}
      {accommodations.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-[20px] border border-dashed border-slate-200 space-y-3">
          <BedDouble className="w-10 h-10 text-slate-400 mx-auto" />
          <div>
            <p className="font-extrabold text-slate-800 text-sm">Chưa có nơi lưu trú</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Thêm thông tin khách sạn để quản lý giờ nhận & trả phòng.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddAccommodation}
            className="px-4 py-2 rounded-xl bg-[#2E8B57] text-white font-bold text-xs hover:bg-[#246e45] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm nơi lưu trú</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accommodations.map((acc) => (
            <div
              key={acc.id}
              className="p-5 rounded-[20px] bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#2E8B57] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    {acc.period}
                  </span>
                  {getStatusBadge(acc.status)}
                </div>

                <div className="pt-1">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                    {acc.name}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {acc.dates}
                  </p>
                  {acc.address && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {acc.address}
                    </p>
                  )}
                </div>

                {/* Check in / Check out times */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs bg-white p-3 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Nhận phòng
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {acc.checkInTime || '14:00'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Trả phòng
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {acc.checkOutTime || '12:00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => onOpenMap(acc.name)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Bản đồ</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEditAccommodation(acc)}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
