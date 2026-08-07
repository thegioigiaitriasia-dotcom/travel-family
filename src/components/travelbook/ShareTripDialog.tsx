import React, { useState } from 'react';
import { X, Copy, QrCode, Check, Shield, Eye, Edit } from 'lucide-react';

interface ShareTripDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle: string;
}

export const ShareTripDialog: React.FC<ShareTripDialogProps> = ({
  isOpen,
  onClose,
  tripTitle,
}) => {
  const [copied, setCopied] = useState(false);
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://giadinhvivu.com';
  const shareUrl = `${appBaseUrl}/?trip=${tripTitle ? encodeURIComponent(tripTitle) : 'shared'}&permission=${permission}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 text-left animate-fadeIn relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Chia sẻ Lịch trình chuyến đi
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Tạo đường dẫn hoặc mã QR cho các thành viên gia đình cùng xem.
          </p>
        </div>

        {/* Access Permission Toggle */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-[20px] border border-slate-200 text-xs">
          <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#DC2626]" />
            Quyền truy cập:
          </label>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setPermission('view')}
              className={`p-2.5 rounded-xl border text-left font-bold flex items-center gap-2 cursor-pointer ${
                permission === 'view'
                  ? 'bg-[#DC2626] text-white border-[#DC2626]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-4 h-4 shrink-0" />
              <span>Chỉ xem (Mặc định)</span>
            </button>

            <button
              type="button"
              onClick={() => setPermission('edit')}
              className={`p-2.5 rounded-xl border text-left font-bold flex items-center gap-2 cursor-pointer ${
                permission === 'edit'
                  ? 'bg-[#DC2626] text-white border-[#DC2626]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Edit className="w-4 h-4 shrink-0" />
              <span>Được chỉnh sửa</span>
            </button>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Đường dẫn chia sẻ</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-[#DC2626] text-white text-xs font-bold hover:bg-[#B91C1C] flex items-center gap-1 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" /> Đã chép
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Sao chép
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code section */}
        <div className="text-center pt-2">
          {!showQr ? (
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="text-xs font-bold text-[#DC2626] hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Tạo mã QR cho chuyến đi</span>
            </button>
          ) : (
            <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-200 space-y-2 max-w-xs mx-auto animate-fadeIn">
              <div className="w-40 h-40 bg-white p-2 rounded-xl mx-auto border border-slate-200 flex items-center justify-center shadow-xs">
                {/* Real Scannable QR Code */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                  alt="QR Code Lịch Trình Chuyến Đi"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <p className="text-[11px] font-medium text-slate-600">
                Quét mã để mở Lịch trình chi tiết ngay trên điện thoại
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
