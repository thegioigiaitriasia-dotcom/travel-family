import React from 'react';
import { X, CloudRain, Check, AlertCircle, Sparkles } from 'lucide-react';
import { AlternativePlan } from '../../types';

interface AlternativePlanPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmApply: () => void;
  plan?: AlternativePlan | null;
}

export const AlternativePlanPreviewDialog: React.FC<AlternativePlanPreviewDialogProps> = ({
  isOpen,
  onClose,
  onConfirmApply,
  plan,
}) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 text-left animate-fadeIn relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Phương án dự phòng
            </span>
            <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
              {plan.title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {plan.description || 'Xem trước các hoạt động thay thế khi điều kiện thời tiết xấu hoặc có sự thay đổi.'}
        </p>

        {/* Preview of items */}
        <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800">
          <span className="text-slate-500 font-extrabold uppercase text-[10px] block">
            Hoạt động thay thế đề xuất:
          </span>
          <div className="space-y-1.5">
            {plan.suggestions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-2 text-xs text-sky-900 font-medium">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
          <span>Lịch trình cũ sẽ được lưu lại trong lịch sử để bạn có thể hoàn tác bất kỳ lúc nào.</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmApply();
              onClose();
            }}
            className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Áp dụng phương án này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
