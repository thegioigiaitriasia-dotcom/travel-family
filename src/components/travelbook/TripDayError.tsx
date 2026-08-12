import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface TripDayErrorProps {
  onRetry: () => void;
  onGoBack: () => void;
}

export const TripDayError: React.FC<TripDayErrorProps> = ({ onRetry, onGoBack }) => {
  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-[28px] border border-slate-200 shadow-xl text-center space-y-5 animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Chưa thể tải lịch trình ngày này
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Thông tin chuyến đi vẫn được giữ nguyên. Vui lòng thử lại.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="py-3 px-4 rounded-xl bg-bronze-600 hover:bg-[#B91C1C] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Thử lại</span>
        </button>

        <button
          type="button"
          onClick={onGoBack}
          className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay về Tổng quan</span>
        </button>
      </div>
    </div>
  );
};
