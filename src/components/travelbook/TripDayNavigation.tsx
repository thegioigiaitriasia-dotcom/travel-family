import React from 'react';
import { Calendar, LayoutDashboard, CheckSquare } from 'lucide-react';
import { TravelBookDay } from '../../types';

interface TripDayNavigationProps {
  days: TravelBookDay[];
  selectedTab: 'overview' | 'checklist' | number;
  onSelectTab: (tab: 'overview' | 'checklist' | number) => void;
}

export const TripDayNavigation: React.FC<TripDayNavigationProps> = ({
  days,
  selectedTab,
  onSelectTab,
}) => {
  return (
    <div className="bg-white p-2 rounded-[20px] border border-[#E3E6E2] shadow-xs overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex items-center gap-2 min-w-max">
        {/* Tab 0: Tổng quan */}
        <button
          type="button"
          onClick={() => onSelectTab('overview')}
          className={`px-4 py-3 rounded-[16px] text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            selectedTab === 'overview'
              ? 'bg-[#183B35] text-white shadow-md scale-[1.02]'
              : 'bg-[#F7F6F0] text-[#1D211F] hover:bg-[#E9F0ED]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tổng quan</span>
        </button>

        {/* Tab 1: Checklist chuẩn bị */}
        <button
          type="button"
          onClick={() => onSelectTab('checklist')}
          className={`px-4 py-3 rounded-[16px] text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            selectedTab === 'checklist'
              ? 'bg-[#183B35] text-white shadow-md scale-[1.02]'
              : 'bg-[#F7F6F0] text-[#1D211F] hover:bg-[#E9F0ED]'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Checklist chuẩn bị</span>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-8 bg-[#E2E3DE] shrink-0" />

        {/* Days Tabs */}
        {days.map((day) => {
          const isSelected = selectedTab === day.dayNumber;
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectTab(day.dayNumber)}
              className={`px-4 py-2.5 rounded-[16px] text-left transition-all cursor-pointer shrink-0 min-w-[120px] flex flex-col ${
                isSelected
                  ? 'bg-[#183B35] text-white shadow-md scale-[1.02]'
                  : 'bg-white border border-[#E2E3DE] text-[#1D211F] hover:bg-[#F7F6F0]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-[#1D211F]'}`}>
                  Ngày {day.dayNumber}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    isSelected ? 'text-[#E9F0ED]' : 'text-[#5D6B63]'
                  }`}
                >
                  {day.dateStr}
                </span>
              </div>

              <span
                className={`text-[11px] font-medium truncate max-w-[110px] mt-0.5 ${
                  isSelected ? 'text-[#E9F0ED] font-semibold' : 'text-[#5D6B63]'
                }`}
              >
                {day.destinationName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
