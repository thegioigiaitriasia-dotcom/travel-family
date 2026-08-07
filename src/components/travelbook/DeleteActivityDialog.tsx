import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  isAll?: boolean;
}

export const DeleteActivityDialog: React.FC<DeleteActivityDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'hoạt động này',
  isAll = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-6 max-w-sm w-full space-y-5 shadow-2xl border border-rose-100 text-left animate-fadeIn relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {isAll ? 'Xóa toàn bộ hoạt động?' : 'Xóa hoạt động?'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Xác nhận thao tác xóa
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100 font-medium">
          {isAll ? (
            <span>
              Bạn có chắc chắn muốn xóa <strong>tất cả hoạt động trong ngày</strong>? Thao tác này sẽ xóa sạch danh sách lịch trình ngày hôm nay.
            </span>
          ) : (
            <span>
              Bạn có chắc chắn muốn xóa <strong className="text-rose-900">{title}</strong>? Thao tác này không thể hoàn tác.
            </span>
          )}
        </p>

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
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
