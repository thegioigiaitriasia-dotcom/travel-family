import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, Info, MapPin } from 'lucide-react';

interface GenerationErrorStateProps {
  errorType: 'connection' | 'missing_info' | 'limited_destination';
  onRetry: () => void;
  onReturnHome: () => void;
  onGoToMissingStep?: () => void;
  onChangeDestination?: () => void;
  onContinueBasic?: () => void;
}

export const GenerationErrorState: React.FC<GenerationErrorStateProps> = ({
  errorType,
  onRetry,
  onReturnHome,
  onGoToMissingStep,
  onChangeDestination,
  onContinueBasic,
}) => {
  if (errorType === 'missing_info') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            Chúng tôi cần thêm một vài thông tin
          </h3>
          <p className="text-xs text-slate-600">
            Vui lòng bổ sung đầy đủ các trường bắt buộc để AI có thể tạo lịch trình chính xác.
          </p>
        </div>
        <button
          onClick={onGoToMissingStep || onRetry}
          className="w-full py-3 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          Bổ sung thông tin còn thiếu
        </button>
      </div>
    );
  }

  if (errorType === 'limited_destination') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mx-auto">
          <MapPin className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            Thông tin về điểm đến này hiện còn hạn chế
          </h3>
          <p className="text-xs text-slate-600">
            Dữ liệu địa điểm tại đây đang được cập nhật. Bạn muốn tiếp tục tạo lịch trình cơ bản hay đổi điểm đến khác?
          </p>
        </div>
        <div className="space-y-2 pt-2">
          <button
            onClick={onContinueBasic || onRetry}
            className="w-full py-3 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Tiếp tục với lịch trình cơ bản
          </button>
          <button
            onClick={onChangeDestination || onReturnHome}
            className="w-full py-2.5 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer"
          >
            Thay đổi điểm đến
          </button>
        </div>
      </div>
    );
  }

  // Connection Error (Default)
  return (
    <div className="bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">
          Chưa thể tạo lịch trình lúc này.
        </h3>
        <p className="text-xs text-slate-600">
          Thông tin chuyến đi của bạn vẫn được lưu an toàn. Vui lòng thử lại sau ít phút.
        </p>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={onReturnHome}
          className="flex-1 py-2.5 px-4 rounded-xl border border-red-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về chuyến đi</span>
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Thử lại</span>
        </button>
      </div>
    </div>
  );
};
