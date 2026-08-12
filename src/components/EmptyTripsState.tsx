import React from 'react';
import { Compass, Plus, Sparkles, Wallet, BookOpen } from 'lucide-react';

interface EmptyTripsStateProps {
  onCreateTrip: () => void;
}

export const EmptyTripsState: React.FC<EmptyTripsStateProps> = ({ onCreateTrip }) => {
  return (
    <div className="bg-white rounded-[24px] border border-[#E3E6E2] p-8 sm:p-16 text-center max-w-2xl mx-auto my-8 sm:my-12 shadow-sm relative overflow-hidden">
      {/* Subtle background ambient highlight */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-50/60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Luxury Icon Badge */}
        <div className="w-16 h-16 rounded-[16px] bg-[#FEF2F2] text-bronze-600 border border-[#FECACA] flex items-center justify-center mx-auto shadow-xs">
          <Compass className="w-8 h-8 text-bronze-600" strokeWidth={1.5} />
        </div>

        {/* Header Text Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-bronze-600 bg-[#FEF2F2] px-3.5 py-1 rounded-full border border-[#FECACA]">
            <span>Hành trình gia đình</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-semibold text-[#18181B] tracking-tight">
            Chưa có hành trình nào được lên lịch
          </h3>

          <p className="text-sm sm:text-base text-[#71717A] max-w-lg mx-auto leading-relaxed font-normal">
            Sẵn sàng cho kỳ nghỉ gia đình trọn vẹn. Hãy tạo lịch trình đầu tiên để cùng người thân hoạch định điểm đến, hoạt động và dự toán chi phí minh bạch.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18181B] bg-[#FAF9F9] border border-[#E4E4E7] px-3 py-1.5 rounded-[10px]">
            <Sparkles className="w-3.5 h-3.5 text-bronze-600" strokeWidth={1.75} />
            <span>Gợi ý AI thông minh</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18181B] bg-[#FAF9F9] border border-[#E4E4E7] px-3 py-1.5 rounded-[10px]">
            <Wallet className="w-3.5 h-3.5 text-[#EA580C]" strokeWidth={1.75} />
            <span>Dự toán ngân sách</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18181B] bg-[#FAF9F9] border border-[#E4E4E7] px-3 py-1.5 rounded-[10px]">
            <BookOpen className="w-3.5 h-3.5 text-bronze-600" strokeWidth={1.75} />
            <span>Lưu giữ kỷ niệm</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-4">
          <button
            onClick={onCreateTrip}
            className="btn-primary h-[48px] px-8 text-sm font-semibold rounded-[12px] shadow-sm hover:bg-[#B91C1C] transition-all cursor-pointer inline-flex items-center gap-2.5"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Tạo lịch trình đầu tiên</span>
          </button>
        </div>
      </div>
    </div>
  );
};

