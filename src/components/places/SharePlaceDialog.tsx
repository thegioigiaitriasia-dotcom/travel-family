import React, { useState } from 'react';
import { X, Share2, Copy, Check, ShieldCheck, Lock } from 'lucide-react';

interface SharePlaceDialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SharePlaceDialog: React.FC<SharePlaceDialogProps> = ({
  title,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [includePersonalNotes, setIncludePersonalNotes] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/places/share?item=${encodeURIComponent(
    title
  )}&includeNotes=${includePersonalNotes}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-fadeIn text-xs font-bold text-slate-700">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-bronze-600" />
            <h3 className="text-base font-black text-slate-900">Chia sẻ địa điểm</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 font-medium">
          Chia sẻ đường dẫn xem địa điểm <span className="font-extrabold text-slate-900">"{title}"</span> với bạn bè hoặc người thân.
        </p>

        {/* Privacy Option Toggle */}
        <div className="bg-sand-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
          <label className="text-xs font-extrabold text-slate-800 block flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Quyền riêng tư ghi chú cá nhân</span>
          </label>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
              <input
                type="radio"
                name="privacy"
                checked={!includePersonalNotes}
                onChange={() => setIncludePersonalNotes(false)}
                className="text-bronze-600"
              />
              <span>Không bao gồm ghi chú cá nhân (Mặc định)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
              <input
                type="radio"
                name="privacy"
                checked={includePersonalNotes}
                onChange={() => setIncludePersonalNotes(true)}
                className="text-bronze-600"
              />
              <span>Bao gồm ghi chú cá nhân</span>
            </label>
          </div>
        </div>

        {/* Link Output Box */}
        <div className="relative">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 pr-10"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-2 top-2 p-1 text-slate-500 hover:text-bronze-600 cursor-pointer"
            title="Sao chép liên kết"
          >
            {copied ? <Check className="w-4 h-4 text-bronze-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 rounded-xl bg-bronze-600 text-white font-extrabold text-xs shadow-md shadow-[#DC2626]/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Đã sao chép liên kết!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Sao chép đường dẫn chia sẻ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
