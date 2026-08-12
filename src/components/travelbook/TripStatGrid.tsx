import React from 'react';
import { Calendar, MapPin, Compass, Utensils, BedDouble } from 'lucide-react';

interface TripStatGridProps {
  durationText: string; // e.g. "4 ngày 3 đêm"
  destinationCount: number; // e.g. 2
  placeCount: number; // e.g. 12
  foodCount: number; // e.g. 9
  accommodationCount: number; // e.g. 2
  onSelectStat?: (type: 'duration' | 'destinations' | 'places' | 'foods' | 'accommodations') => void;
}

export const TripStatGrid: React.FC<TripStatGridProps> = ({
  durationText,
  destinationCount,
  placeCount,
  foodCount,
  accommodationCount,
  onSelectStat,
}) => {
  const stats = [
    {
      id: 'duration' as const,
      icon: Calendar,
      color: 'text-[#183B35] bg-[#E9F0ED] border-[#183B35]/20',
      iconColor: 'text-[#183B35]',
      value: durationText,
      label: 'Thời gian chuyến đi',
    },
    {
      id: 'destinations' as const,
      icon: MapPin,
      color: 'text-[#183B35] bg-[#E9F0ED] border-[#183B35]/20',
      iconColor: 'text-[#183B35]',
      value: `${destinationCount} điểm đến`,
      label: 'Tuyến hành trình',
    },
    {
      id: 'places' as const,
      icon: Compass,
      color: 'text-[#183B35] bg-[#E9F0ED] border-[#183B35]/20',
      iconColor: 'text-[#183B35]',
      value: `${placeCount} địa điểm`,
      label: 'Lịch trình tham quan',
    },
    {
      id: 'foods' as const,
      icon: Utensils,
      color: 'text-[#183B35] bg-[#E9F0ED] border-[#183B35]/20',
      iconColor: 'text-[#183B35]',
      value: `${foodCount} món nên thử`,
      label: 'Ẩm thực đặc sản',
    },
    {
      id: 'accommodations' as const,
      icon: BedDouble,
      color: 'text-[#183B35] bg-[#E9F0ED] border-[#183B35]/20',
      iconColor: 'text-[#183B35]',
      value: `${accommodationCount} nơi lưu trú`,
      label: 'Khách sạn & Resort',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#1D211F] tracking-tight">
          Tổng quan chuyến đi
        </h2>
        <span className="text-xs text-[#5D6B63] font-medium hidden sm:inline">
          Bấm vào thẻ để xem chi tiết
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const isLastAndOdd = idx === stats.length - 1; // 5th item on mobile col-span-2
          return (
            <button
              key={stat.id}
              type="button"
              onClick={() => onSelectStat?.(stat.id)}
              className={`p-4 rounded-[20px] bg-white border border-[#E2E3DE] hover:border-[#183B35]/30 shadow-sm hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between space-y-3 ${
                isLastAndOdd ? 'col-span-2 sm:col-span-1' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color} transition-transform group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>

              <div>
                <p className="text-base sm:text-lg font-black text-[#1D211F] tracking-tight group-hover:text-[#183B35] transition-colors">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold text-[#5D6B63] mt-0.5">
                  {stat.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
