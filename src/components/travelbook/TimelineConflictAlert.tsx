import React from 'react';
import { AlertTriangle, Sparkles, SlidersHorizontal } from 'lucide-react';

interface TimelineConflictAlertProps {
  conflictMessage?: string;
  onAutoFix?: () => void;
  onManualFix?: () => void;
}

export const TimelineConflictAlert: React.FC<TimelineConflictAlertProps> = ({
  conflictMessage = 'Hai hoạt động đang trùng thời gian hoặc không đủ thời gian di chuyển.',
  onAutoFix,
  onManualFix,
}) => {
  return (
    <div className="bg-bronze-50 border border-bronze-300 rounded-[20px] p-4 shadow-xs space-y-3 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-bronze-100 text-bronze-700 flex items-center justify-center shrink-0 border border-bronze-200 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>

        <div className="flex-1">
          <h4 className="text-xs font-black text-bronze-950 uppercase tracking-wide">
            Cảnh báo xung đột thời gian
          </h4>
          <p className="text-xs text-bronze-900 font-bold mt-0.5 leading-snug">
            {conflictMessage}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-bronze-200/60">
        <button
          type="button"
          onClick={onAutoFix}
          className="px-3.5 py-2 rounded-xl bg-bronze-600 hover:bg-bronze-700 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Điều chỉnh tự động (AI)</span>
        </button>

        <button
          type="button"
          onClick={onManualFix}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-bronze-100/50 text-bronze-900 font-bold text-xs transition-colors border border-bronze-300 flex items-center gap-1.5 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-bronze-700" />
          <span>Chỉnh thủ công</span>
        </button>
      </div>
    </div>
  );
};
