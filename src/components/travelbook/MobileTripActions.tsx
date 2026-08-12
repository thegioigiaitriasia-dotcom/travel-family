import React, { useState } from 'react';
import { Calendar, Share2, Plus, Activity, DollarSign, FileText, BedDouble, ChevronUp } from 'lucide-react';

interface MobileTripActionsProps {
  isOngoing?: boolean;
  onViewDay: () => void;
  onShare: () => void;
  onAddActivity?: () => void;
  onAddExpense?: () => void;
  onAddNote?: () => void;
  onAddAccommodation?: () => void;
}

export const MobileTripActions: React.FC<MobileTripActionsProps> = ({
  isOngoing = false,
  onViewDay,
  onShare,
  onAddActivity,
  onAddExpense,
  onAddNote,
  onAddAccommodation,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 sm:hidden shadow-2xl">
      {/* Popover Menu for [Thêm] */}
      {showAddMenu && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-[20px] shadow-2xl border border-slate-200 p-2 space-y-1 animate-fadeIn z-50 text-xs font-bold">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-slate-900">Thêm mục mới</span>
            <ChevronDown
              className="w-4 h-4 text-slate-400 cursor-pointer"
              onClick={() => setShowAddMenu(false)}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setShowAddMenu(false);
              onAddActivity?.();
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-sand-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-red-50 text-bronze-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <span>Thêm hoạt động</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAddMenu(false);
              onAddExpense?.();
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-sand-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-bronze-50 text-bronze-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <span>Ghi khoản chi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAddMenu(false);
              onAddNote?.();
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-sand-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span>Thêm ghi chú</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAddMenu(false);
              onAddAccommodation?.();
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-sand-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-forest-50 text-[#2E8B57] flex items-center justify-center">
              <BedDouble className="w-4 h-4" />
            </div>
            <span>Thêm nơi lưu trú</span>
          </button>
        </div>
      )}

      {/* 3 Action Buttons Row */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onViewDay}
          className="py-2.5 px-3 rounded-xl bg-bronze-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>{isOngoing ? 'Xem hôm nay' : 'Xem Ngày 1'}</span>
        </button>

        <button
          type="button"
          onClick={onShare}
          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-slate-600" />
          <span>Chia sẻ</span>
        </button>

        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="py-2.5 px-3 rounded-xl bg-forest-50 text-[#2E8B57] border border-forest-200 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm</span>
          <ChevronUp className={`w-3.5 h-3.5 transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};

const ChevronDown: React.FC<{ className?: string; onClick?: () => void }> = ({ className, onClick }) => (
  <svg onClick={onClick} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
