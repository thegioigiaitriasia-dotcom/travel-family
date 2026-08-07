import React from 'react';
import { MapPin, Utensils, Hotel, Wallet } from 'lucide-react';

interface TripSummaryPanelProps {
  placeCount: number;
  foodCount: number;
  accommodationCount: number;
  budgetRange: string;
}

export const TripSummaryPanel: React.FC<TripSummaryPanelProps> = ({
  placeCount,
  foodCount,
  accommodationCount,
  budgetRange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E3DE] flex flex-col justify-between space-y-4 h-full">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#183B35] border-b border-[#E2E3DE] pb-2.5">
        Tóm tắt hành trình
      </h4>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3.5">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-[#183B35] shrink-0" strokeWidth={1.75} />
          <div>
            <p className="text-sm font-semibold text-[#1D211F]">{placeCount} địa điểm</p>
            <p className="text-xs text-[#606864]">Lịch trình tham quan</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Utensils className="w-4 h-4 text-[#183B35] shrink-0" strokeWidth={1.75} />
          <div>
            <p className="text-sm font-semibold text-[#1D211F]">{foodCount} món nên thử</p>
            <p className="text-xs text-[#606864]">Ẩm thực & đặc sản</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Hotel className="w-4 h-4 text-[#183B35] shrink-0" strokeWidth={1.75} />
          <div>
            <p className="text-sm font-semibold text-[#1D211F]">{accommodationCount} nơi lưu trú</p>
            <p className="text-xs text-[#606864]">Điểm nghỉ chân</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Wallet className="w-4 h-4 text-[#A46F3D] shrink-0" strokeWidth={1.75} />
          <div>
            <p className="text-sm font-semibold text-[#1D211F]">{budgetRange}</p>
            <p className="text-xs text-[#606864]">Ngân sách dự kiến</p>
          </div>
        </div>
      </div>
    </div>
  );
};

