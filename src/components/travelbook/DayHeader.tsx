import React, { useState } from 'react';
import {
  Plus,
  MoreVertical,
  Gauge,
  Navigation,
  Activity,
  MapPin,
  Edit2,
  ArrowUpDown,
  Copy,
  ArrowRightLeft,
  Trash2,
  Calendar,
  Sun,
} from 'lucide-react';

interface DayHeaderProps {
  dayNumber: number;
  dateStr: string;
  title: string;
  summary?: string;
  pace?: 'relaxed' | 'balanced' | 'active';
  mainTransport?: string;
  activityCount: number;
  totalDistanceKm?: number;
  weatherForecast?: string;
  onAddActivity: () => void;
  onRenameDay?: () => void;
  onSortActivities?: () => void;
  onCopyDay?: () => void;
  onMoveActivities?: () => void;
  onDeleteAllActivities?: () => void;
}

export const DayHeader: React.FC<DayHeaderProps> = ({
  dayNumber,
  dateStr,
  title,
  summary,
  pace = 'balanced',
  mainTransport = 'Grab/Taxi',
  activityCount,
  totalDistanceKm,
  weatherForecast,
  onAddActivity,
  onRenameDay,
  onSortActivities,
  onCopyDay,
  onMoveActivities,
  onDeleteAllActivities,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getPaceText = (p?: string) => {
    switch (p) {
      case 'relaxed':
        return 'Thư giãn';
      case 'active':
        return 'Sôi nổi';
      case 'balanced':
      default:
        return 'Cân bằng';
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-bronze-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
              NGÀY {dayNumber} · {dateStr}
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>

          {summary && (
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {summary}
            </p>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onAddActivity}
            className="px-4 py-2.5 rounded-xl bg-bronze-600 hover:bg-[#B91C1C] text-white font-extrabold text-xs transition-all shadow-md shadow-[#DC2626]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm hoạt động</span>
          </button>

          {/* Day Actions Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Menu thao tác ngày"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs font-bold space-y-1 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onRenameDay?.();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-sand-50 flex items-center gap-2 text-slate-800 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Đổi tên ngày</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onSortActivities?.();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-sand-50 flex items-center gap-2 text-slate-800 cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sắp xếp hoạt động</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onCopyDay?.();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-sand-50 flex items-center gap-2 text-slate-800 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sao chép ngày</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onMoveActivities?.();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-sand-50 flex items-center gap-2 text-slate-800 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chuyển HĐ sang ngày khác</span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteAllActivities?.();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer font-extrabold"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Xóa toàn bộ hoạt động</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meta Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
        {weatherForecast && (
          <div className="flex items-center gap-1.5 bg-bronze-50 text-bronze-900 px-3 py-1.5 rounded-xl border border-bronze-200">
            <Sun className="w-3.5 h-3.5 text-bronze-600" />
            <span>Thời tiết: {weatherForecast}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-sand-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Gauge className="w-3.5 h-3.5 text-[#2E8B57]" />
          <span>Nhịp độ: {getPaceText(pace)}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-sand-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Navigation className="w-3.5 h-3.5 text-bronze-600" />
          <span>Di chuyển chính: {mainTransport}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-sand-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Activity className="w-3.5 h-3.5 text-bronze-600" />
          <span>{activityCount} hoạt động</span>
        </div>

        {totalDistanceKm && (
          <div className="flex items-center gap-1.5 bg-sand-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-purple-600" />
            <span>Khoảng {totalDistanceKm} km</span>
          </div>
        )}
      </div>
    </div>
  );
};
