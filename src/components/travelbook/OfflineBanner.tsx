import React from 'react';
import { WifiOff, RefreshCcw, Check } from 'lucide-react';

interface OfflineBannerProps {
  isOffline: boolean;
  hasUnsavedChanges: boolean;
  onSaveNow: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  hasUnsavedChanges,
  onSaveNow,
}) => {
  if (!isOffline && !hasUnsavedChanges) return null;

  return (
    <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-lg border border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs font-bold mb-4 animate-fadeIn">
      <div className="flex items-center gap-2">
        {isOffline ? (
          <>
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span>Chế độ ngoại tuyến: Dữ liệu đang được lưu tạm trên thiết bị.</span>
          </>
        ) : (
          <>
            <RefreshCcw className="w-4 h-4 text-[#FFB545] animate-spin" />
            <span>Có thay đổi chưa lưu trên máy tính/điện thoại.</span>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onSaveNow}
        className="px-3 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
      >
        <Check className="w-3.5 h-3.5 stroke-[3]" />
        <span>Lưu ngay</span>
      </button>
    </div>
  );
};
