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

const defaultAccommodations: AccommodationItem[] = [];

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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#183B35]/10 text-[#183B35] border border-[#183B35]/20">
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
    <div className="bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E2E3DE] shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E3DE] pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#1D211F] tracking-tight flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-[#183B35]" />
            Nơi lưu trú
          </h3>
          <p className="text-xs text-[#5D6B63] font-medium mt-0.5">
            Danh sách khách sạn & resort đã chuẩn bị cho cả gia đình.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddAccommodation}
          className="px-3.5 py-2 rounded-xl bg-[#E9F0ED] hover:bg-[#cde2db] text-[#183B35] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-[#E9F0ED]"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nơi lưu trú</span>
        </button>
      </div>

      {/* Accommodations Cards Grid */}
      {accommodations.length === 0 ? (
        <div className="p-8 text-center bg-[#F7F6F0] rounded-[20px] border border-dashed border-[#E2E3DE] space-y-3">
          <BedDouble className="w-10 h-10 text-slate-400 mx-auto" />
          <div>
            <p className="font-extrabold text-[#1D211F] text-sm">Chưa có nơi lưu trú</p>
            <p className="text-xs text-[#5D6B63] mt-0.5">
              Thêm thông tin khách sạn để quản lý giờ nhận & trả phòng.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddAccommodation}
            className="px-4 py-2 rounded-xl bg-[#183B35] text-white font-bold text-xs hover:bg-[#132d28] inline-flex items-center gap-1.5 cursor-pointer"
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
              className="p-5 rounded-[20px] bg-[#F7F6F0]/80 border border-[#E2E3DE] hover:border-[#183B35]/30 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#183B35] bg-[#E9F0ED] px-2.5 py-1 rounded-lg border border-[#E9F0ED]">
                    {acc.period}
                  </span>
                  {getStatusBadge(acc.status)}
                </div>

                <div className="pt-1">
                  <h4 className="font-black text-[#1D211F] text-sm sm:text-base leading-snug">
                    {acc.name}
                  </h4>
                  <p className="text-xs font-bold text-[#5D6B63] mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {acc.dates}
                  </p>
                  {acc.address && (
                    <p className="text-xs text-[#5D6B63] mt-1 line-clamp-2">
                      {acc.address}
                    </p>
                  )}
                </div>

                {/* Check in / Check out times */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs bg-white p-3 rounded-xl border border-[#E2E3DE]">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Nhận phòng
                    </span>
                    <span className="font-extrabold text-[#1D211F]">
                      {acc.checkInTime || '14:00'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Trả phòng
                    </span>
                    <span className="font-extrabold text-[#1D211F]">
                      {acc.checkOutTime || '12:00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#E2E3DE]">
                <button
                  type="button"
                  onClick={() => onOpenMap(acc.name)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F7F6F0] text-[#1D211F] font-bold text-xs border border-[#E2E3DE] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#183B35]" />
                  <span>Bản đồ</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEditAccommodation(acc)}
                  className="p-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F7F6F0] text-[#5D6B63] border border-[#E2E3DE] transition-colors cursor-pointer"
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
