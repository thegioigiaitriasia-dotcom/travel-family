import React from 'react';
import { TripStatus } from '../types';

export type FilterStatus = 'all' | TripStatus;

interface TripStatusTabsProps {
  activeStatus: FilterStatus;
  onChangeStatus: (status: FilterStatus) => void;
  counts: Record<FilterStatus, number>;
}

export const TripStatusTabs: React.FC<TripStatusTabsProps> = ({
  activeStatus,
  onChangeStatus,
  counts,
}) => {
  const tabs: { id: FilterStatus; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'planning', label: 'Đang lập kế hoạch' },
    { id: 'upcoming', label: 'Sắp khởi hành' },
    { id: 'ongoing', label: 'Đang diễn ra' },
    { id: 'completed', label: 'Đã hoàn thành' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeStatus === tab.id;
        const count = counts[tab.id] ?? 0;

        return (
          <button
            key={tab.id}
            onClick={() => onChangeStatus(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              isActive
                ? 'bg-[#183B35] text-white border border-[#183B35]'
                : 'bg-white text-[#606864] border border-[#E2E3DE] hover:bg-[#F7F5F0] hover:text-[#1D211F]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                isActive
                  ? 'bg-[#E9F0ED] text-[#183B35]'
                  : 'bg-[#EFEAE1] text-[#606864]'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};


