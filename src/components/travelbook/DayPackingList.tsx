import React from 'react';
import { Briefcase, CheckSquare, Square } from 'lucide-react';
import { DayPackingItem } from '../../types';

interface DayPackingListProps {
  items?: DayPackingItem[];
  onToggleItem: (itemId: string) => void;
  onOpenFullChecklist?: () => void;
}

export const DayPackingList: React.FC<DayPackingListProps> = ({
  items = [],
  onToggleItem,
  onOpenFullChecklist,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-[22px] p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
        <Briefcase className="w-4 h-4 text-[#DC2626]" />
        <h4 className="text-sm font-extrabold text-slate-900">Danh sách cần mang hôm nay</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggleItem(item.id)}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              item.checked
                ? 'bg-emerald-50/60 border-emerald-200 text-slate-500 line-through'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 font-extrabold'
            }`}
          >
            <span>{item.name}</span>
            {item.checked ? (
              <CheckSquare className="w-4 h-4 text-red-600 shrink-0 stroke-[2.5]" />
            ) : (
              <Square className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {onOpenFullChecklist && (
        <button
          type="button"
          onClick={onOpenFullChecklist}
          className="w-full pt-2 border-t border-slate-100 text-[11px] font-bold text-[#DC2626] hover:underline cursor-pointer flex items-center justify-center gap-1"
        >
          <span>Xem toàn bộ Checklist chuẩn bị gia đình</span>
        </button>
      )}
    </div>
  );
};
