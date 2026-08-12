import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-red-100 text-bronze-600 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">
          Chưa thể tải danh sách chuyến đi.
        </h3>
        <p className="text-xs text-slate-600">Vui lòng kiểm tra kết nối mạng và thử lại.</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bronze-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Vui lòng thử lại</span>
      </button>
    </div>
  );
};
