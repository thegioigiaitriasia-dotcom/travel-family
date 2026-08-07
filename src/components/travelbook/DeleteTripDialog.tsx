import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteTripDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  tripTitle: string;
}

export const DeleteTripDialog: React.FC<DeleteTripDialogProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  tripTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-6 max-w-sm w-full space-y-5 shadow-2xl border border-red-100 text-left animate-fadeIn relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Xóa chuyến đi?
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Cảnh báo hành động nguy hiểm
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100">
          Bạn có chắc chắn muốn xóa chuyến đi <strong className="text-rose-900">{tripTitle}</strong>?
          Tất cả lịch trình, chi phí và ghi chú đã tạo sẽ bị xóa vĩnh viễn và không thể khôi phục.
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={onConfirmDelete}
            className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa chuyến đi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
