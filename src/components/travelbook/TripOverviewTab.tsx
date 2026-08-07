import React from 'react';
import {
  Calendar,
  MapPin,
  Utensils,
  BedDouble,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  Plane,
  ArrowRight,
  ShieldCheck,
  Check,
  Ticket,
  Eye,
  Upload,
} from 'lucide-react';
import { TravelBook } from '../../types';
import { TripWeatherWidget } from './TripWeatherWidget';

interface TripOverviewTabProps {
  trip: TravelBook;
  onGoToDay: (dayNum: number) => void;
  onUpdatePrepStatus: (itemId: string, newStatus: 'confirmed' | 'booked' | 'pending') => void;
  onOpenBookingVault?: (typeFilter?: string) => void;
}

export const TripOverviewTab: React.FC<TripOverviewTabProps> = ({
  trip,
  onGoToDay,
  onUpdatePrepStatus,
  onOpenBookingVault,
}) => {
  const totalPlaces = trip.days.reduce((acc, d) => acc + d.activities.length, 0);
  const docs = trip.bookingDocuments || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 0. Banner Kho Vé & Booking Xác Nhận */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-[24px] p-5 shadow-lg border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-md shadow-red-900/40">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">
                Kho Vé Máy Bay & Xác Nhận Booking Gia Đình
              </h3>
              <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                ✓ {docs.length} Vé & Booking đã lưu
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Lưu trữ vé máy bay khứ hồi, bill khách sạn, mã QR vé tham quan để cả nhà dễ dàng xuất trình
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenBookingVault?.('all')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
        >
          <Eye className="w-4 h-4" />
          <span>Mở kho vé & booking ({docs.length})</span>
        </button>
      </div>

      {/* 1. Thẻ tổng quan metric grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm text-center space-y-1">
          <Calendar className="w-5 h-5 text-[#DC2626] mx-auto" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Thời gian</p>
          <p className="text-sm font-black text-slate-900">
            {trip.durationDays} ngày {trip.durationNights} đêm
          </p>
        </div>

        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm text-center space-y-1">
          <MapPin className="w-5 h-5 text-[#DC2626] mx-auto" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Điểm đến</p>
          <p className="text-sm font-black text-slate-900">{trip.destinations.length} thành phố</p>
        </div>

        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm text-center space-y-1">
          <ShieldCheck className="w-5 h-5 text-[#2E8B57] mx-auto" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Địa điểm</p>
          <p className="text-sm font-black text-slate-900">{totalPlaces} trải nghiệm</p>
        </div>

        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm text-center space-y-1">
          <Utensils className="w-5 h-5 text-[#FFB545] mx-auto" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Ẩm thực</p>
          <p className="text-sm font-black text-slate-900">9 món nên thử</p>
        </div>

        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm text-center space-y-1 col-span-2 sm:col-span-1">
          <BedDouble className="w-5 h-5 text-indigo-600 mx-auto" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Nơi lưu trú</p>
          <p className="text-sm font-black text-slate-900">{trip.accommodations.length} nơi nghỉ</p>
        </div>
      </div>

      {/* Weather Forecast & Family Prep Widget */}
      <TripWeatherWidget trip={trip} onSelectDay={onGoToDay} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Tuyến hành trình */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#DC2626]" />
              <h3 className="text-base font-extrabold text-slate-900">Tuyến hành trình</h3>
            </div>
            <button
              type="button"
              onClick={() => onOpenBookingVault?.('flight')}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer flex items-center gap-1"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Xem vé máy bay</span>
            </button>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-[20px] border border-slate-200">
            {trip.routeFlow.map((step, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">{step.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-extrabold text-slate-900">{step.to}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#DC2626] bg-[#DC2626]/10 px-2.5 py-1 rounded-lg">
                    {step.transport}
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Đã có vé
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Nơi lưu trú */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-[#2E8B57]" />
              <h3 className="text-base font-extrabold text-slate-900">Nơi lưu trú</h3>
            </div>
            <button
              type="button"
              onClick={() => onOpenBookingVault?.('hotel')}
              className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer flex items-center gap-1"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Xem bill booking</span>
            </button>
          </div>

          <div className="space-y-3">
            {trip.accommodations.map((acc, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-4 rounded-[20px] border border-slate-200 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#2E8B57]">
                    {acc.period}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Đã xác nhận booking
                    </span>
                    {acc.bookingCode && (
                      <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                        Mã: {acc.bookingCode}
                      </span>
                    )}
                  </div>
                </div>
                <p className="font-extrabold text-slate-900 text-sm">{acc.name}</p>
                {acc.address && <p className="text-slate-500 text-[11px]">{acc.address}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Ngân sách dự kiến */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign className="w-5 h-5 text-[#FFB545]" />
            <h3 className="text-base font-extrabold text-slate-900">Ngân sách dự kiến</h3>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-[20px] border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">Tổng ngân sách ước tính:</span>
              <span className="text-lg font-black text-[#2E8B57]">
                {(trip.budgetEstimatedMin / 1000000).toLocaleString('vi-VN')} –{' '}
                {(trip.budgetEstimatedMax / 1000000).toLocaleString('vi-VN')} triệu VNĐ
              </span>
            </div>

            <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-800 space-y-1">
              <p className="font-bold">Chưa bao gồm trong ngân sách này:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-900">
                {trip.budgetExcluded.map((ex, idx) => (
                  <li key={idx}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 5. Thành viên tham gia */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="w-5 h-5 text-[#DC2626]" />
            <h3 className="text-base font-extrabold text-slate-900">Thành viên tham gia</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-extrabold text-slate-900">
                  {trip.members.adults} Người lớn, {trip.members.children} Trẻ em
                </p>
                <p className="text-[11px] text-slate-500">Chuyến đi gia đình</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#DC2626]/10 text-[#DC2626] font-bold text-xs">
                {trip.memberCount} thành viên
              </span>
            </div>

            {trip.members.list && (
              <div className="flex flex-wrap gap-2 pt-1">
                {trip.members.list.map((m, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Trạng thái chuẩn bị */}
      <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2E8B57]" />
            <h3 className="text-base font-extrabold text-slate-900">Trạng thái chuẩn bị</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Bấm để cập nhật trạng thái</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {trip.prepItems.map((item) => {
            const isConfirmed = item.status === 'confirmed' || item.status === 'booked';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onUpdatePrepStatus(
                    item.id,
                    item.status === 'confirmed'
                      ? 'pending'
                      : item.status === 'booked'
                      ? 'confirmed'
                      : 'booked'
                  )
                }
                className={`p-4 rounded-[20px] border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isConfirmed
                    ? 'bg-[#2E8B57]/10 border-[#2E8B57] text-[#2E8B57]'
                    : 'bg-amber-50/60 border-amber-200 text-amber-800'
                }`}
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold">{item.name}</p>
                  <p className="text-[10px] font-bold uppercase">
                    {item.status === 'confirmed'
                      ? 'Đã xác nhận'
                      : item.status === 'booked'
                      ? 'Đã đặt'
                      : 'Chưa đặt'}
                  </p>
                </div>
                {isConfirmed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#2E8B57] shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action to Jump to Day 1 */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => onGoToDay(1)}
          className="px-6 py-3.5 rounded-[18px] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-xs transition-all shadow-lg shadow-[#DC2626]/20 inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Xem chi tiết lịch trình Ngày 1</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
