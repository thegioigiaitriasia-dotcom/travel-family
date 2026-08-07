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
      color: 'text-[#DC2626] bg-red-50 border-red-100',
      iconColor: 'text-[#DC2626]',
      value: durationText,
      label: 'Thời gian chuyến đi',
    },
    {
      id: 'destinations' as const,
      icon: MapPin,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      iconColor: 'text-indigo-600',
      value: `${destinationCount} điểm đến`,
      label: 'Tuyến hành trình',
    },
    {
      id: 'places' as const,
      icon: Compass,
      color: 'text-red-600 bg-emerald-50 border-emerald-100',
      iconColor: 'text-red-600',
      value: `${placeCount} địa điểm`,
      label: 'Lịch trình tham quan',
    },
    {
      id: 'foods' as const,
      icon: Utensils,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      iconColor: 'text-amber-600',
      value: `${foodCount} món nên thử`,
      label: 'Ẩm thực đặc sản',
    },
    {
      id: 'accommodations' as const,
      icon: BedDouble,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      iconColor: 'text-purple-600',
      value: `${accommodationCount} nơi lưu trú`,
      label: 'Khách sạn & Resort',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          Tổng quan chuyến đi
        </h2>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
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
              className={`p-4 rounded-[20px] bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between space-y-3 ${
                isLastAndOdd ? 'col-span-2 sm:col-span-1' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color} transition-transform group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>

              <div>
                <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight group-hover:text-[#DC2626] transition-colors">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
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
