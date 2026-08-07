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
              ? 'bg-[#DC2626] text-white shadow-md scale-[1.02]'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
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
              ? 'bg-[#DC2626] text-white shadow-md scale-[1.02]'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Checklist chuẩn bị</span>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-8 bg-slate-200 shrink-0" />

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
                  ? 'bg-[#DC2626] text-white shadow-md shadow-red-600/20 scale-[1.02]'
                  : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  Ngày {day.dayNumber}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    isSelected ? 'text-red-100' : 'text-slate-400'
                  }`}
                >
                  {day.dateStr}
                </span>
              </div>

              <span
                className={`text-[11px] font-medium truncate max-w-[110px] mt-0.5 ${
                  isSelected ? 'text-red-100 font-semibold' : 'text-slate-500'
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
