import React from 'react';
import { X, Printer, Download, BookOpen, MapPin, Calendar, Check, DollarSign, Utensils, BedDouble } from 'lucide-react';
import { TravelBook } from '../../types';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TravelBook;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-3xl w-full h-[90vh] shadow-2xl overflow-hidden flex flex-col justify-between border border-slate-200">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FFB545]" />
            <h3 className="text-base font-extrabold">Xem trước PDF Cẩm Nang Du Lịch</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In / Tải về PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Book Pages View Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 space-y-8 font-sans">
          {/* Cover Page */}
          <div className="bg-white p-8 rounded-[20px] shadow-md border border-slate-200 min-h-[500px] flex flex-col justify-between relative overflow-hidden text-left">
            <div className="absolute inset-0 bg-gradient-to-b from-[#DC2626]/10 via-transparent to-transparent opacity-60" />
            <div className="relative z-10 space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#DC2626] bg-[#DC2626]/10 px-3 py-1 rounded-full">
                TRAVEL BOOK · CẨM NANG GIA ĐÌNH
              </span>
              <h1 className="text-red-500xl font-black text-slate-900 tracking-tight leading-tight">
                {trip.title}
              </h1>
              <p className="text-sm font-extrabold text-slate-600">
                Lịch trình chi tiết thiết kế riêng cho chuyến đi {trip.durationDays} ngày {trip.durationNights} đêm
              </p>
            </div>

            <div className="relative z-10 border-t-2 border-slate-900 pt-6 flex justify-between items-end text-xs font-bold text-slate-700">
              <div className="space-y-1">
                <p>Thời gian: {trip.startDate} – {trip.endDate}</p>
                <p>Thành viên: {trip.memberCount} người ({trip.members.adults} người lớn, {trip.members.children} trẻ em)</p>
                <p>Điểm đến: {trip.destinations.join(' ➔ ')}</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase">ĐƠN VỊ PHÁT HÀNH</p>
                <p className="font-black text-[#DC2626] text-sm">TravelBook AI 2026</p>
              </div>
            </div>
          </div>

          {/* Section: Overview Page */}
          <div className="bg-white p-8 rounded-[20px] shadow-md border border-slate-200 space-y-6 text-left">
            <h2 className="text-xl font-black text-slate-900 border-b pb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#DC2626]" />
              Tổng quan chuyến đi
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 uppercase text-[10px]">Tuyến di chuyển</span>
                <p className="text-slate-900 font-extrabold">{trip.destinations.join(' ➔ ')}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 uppercase text-[10px]">Ngân sách dự kiến</span>
                <p className="text-[#2E8B57] font-black">
                  {(trip.budgetEstimatedMin / 1000000).toFixed(1)} – {(trip.budgetEstimatedMax / 1000000).toFixed(1)} triệu VNĐ
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-[#2E8B57]" /> Danh sách khách sạn
              </h3>
              {trip.accommodations.map((acc, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <p className="font-extrabold text-slate-900">{acc.name}</p>
                  <p className="text-slate-500">{acc.period} · {acc.address}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Day by Day Itinerary Pages */}
          {trip.days.map((day) => (
            <div key={day.id} className="bg-white p-8 rounded-[20px] shadow-md border border-slate-200 space-y-4 text-left">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <span className="text-xs font-black uppercase text-[#DC2626]">NGÀY {day.dayNumber} · {day.dateStr}</span>
                  <h3 className="text-lg font-black text-slate-900">{day.title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-500">{day.destinationName}</span>
              </div>

              <div className="space-y-3">
                {day.activities.map((act) => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between font-extrabold text-slate-900">
                      <span>{act.startTime} - {act.title}</span>
                      <span className="text-[#DC2626]">{act.type}</span>
                    </div>
                    {act.place && <p className="text-slate-500">{act.place.name} ({act.place.address})</p>}
                    {act.notes && <p className="text-amber-700 italic">Lưu ý: {act.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
