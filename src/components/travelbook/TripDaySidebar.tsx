import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { TravelBookDay } from '../../types';

interface TripDaySidebarProps {
  days: TravelBookDay[];
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
}

export const TripDaySidebar: React.FC<TripDaySidebarProps> = ({
  days,
  selectedDayNumber,
  onSelectDay,
}) => {
  return (
    <aside className="hidden xl:block w-[180px] shrink-0 sticky top-[104px] align-self-start space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          Danh sách ngày
        </h3>
        <span className="text-[10px] font-extrabold text-[#DC2626] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
          {days.length} ngày
        </span>
      </div>

      <div className="space-y-2">
        {days.map((day) => {
          const isSelected = selectedDayNumber === day.dayNumber;
          const isPast = day.dayNumber < selectedDayNumber;

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day.dayNumber)}
              className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 relative group ${
                isSelected
                  ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-md shadow-[#DC2626]/20 scale-[1.02]'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  NGÀY {day.dayNumber}
                </span>

                {isPast ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-300' : 'text-red-600'}`} />
                ) : isSelected ? (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/20 text-white uppercase">
                    Đang xem
                  </span>
                ) : null}
              </div>

              <p
                className={`text-[11px] font-extrabold leading-tight line-clamp-1 ${
                  isSelected ? 'text-sky-100' : 'text-slate-700'
                }`}
              >
                {day.destinationName}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100/20 text-[10px] font-medium">
                <span className={isSelected ? 'text-sky-100' : 'text-slate-400'}>
                  {day.dateStr}
                </span>
                <span className={`font-bold ${isSelected ? 'text-white' : 'text-[#DC2626]'}`}>
                  {day.activities.length} HĐ
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
