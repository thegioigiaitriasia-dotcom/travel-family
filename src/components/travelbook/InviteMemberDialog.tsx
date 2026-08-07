import React, { useState } from 'react';
import { X, UserPlus, Link, Copy, Check, Key, Users, Info } from 'lucide-react';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle: string;
  /** Mã mời thật từ family_accounts.invite_code */
  inviteCode?: string;
  /** Tên gia đình */
  familyName?: string;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  isOpen,
  onClose,
  tripTitle,
  inviteCode,
  familyName,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const code = inviteCode || 'VIVU-XXXX';
  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://giadinhvivu.com';
  // Link dẫn thẳng tới tab "Mã mời" trong app
  const inviteLink = `${appBaseUrl}/?invite=${encodeURIComponent(code)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 text-left animate-fadeIn relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Mời người thân tham gia
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Chia sẻ mã mời hoặc đường dẫn để thành viên gia nhập{' '}
            <strong className="text-slate-800">{familyName || tripTitle}</strong>.
          </p>
        </div>

        {/* Hướng dẫn sử dụng */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5">
          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Cách người thân tham gia:
          </p>
          <ol className="text-[11px] text-emerald-900 space-y-1 pl-4 list-decimal">
            <li>Truy cập đường dẫn mời hoặc mở app</li>
            <li>Bấm tab <strong>Mã mời</strong> trong màn hình đăng nhập</li>
            <li>Nhập Mã mời + Tên của mình + Tạo mật khẩu</li>
            <li>Bấm <strong>Gia nhập nhóm gia đình</strong> — xong!</li>
          </ol>
        </div>

        {/* Mã mời nổi bật */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            Mã mời gia đình
          </label>
          <div className="flex gap-2 items-center">
            <div className="flex-1 px-4 py-3 rounded-2xl bg-amber-50 border-2 border-amber-300 font-mono font-black text-lg text-amber-800 tracking-widest text-center">
              {code}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                copiedCode
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Đã sao chép!' : 'Sao chép'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Người được mời nhập mã này khi đăng ký
          </p>
        </div>

        {/* Link mời */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-blue-500" />
            Hoặc chia sẻ đường dẫn mời trực tiếp
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                copiedLink
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Đã sao chép!' : 'Sao chép'}</span>
            </button>
          </div>
        </div>

        {/* Thông tin tổng kết */}
        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5 border border-slate-200">
          <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <p className="text-[11px] text-slate-500">
            Mỗi thành viên tạo tài khoản riêng bằng mã mời và sẽ thấy toàn bộ lịch trình gia đình sau khi gia nhập.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#183B35] hover:bg-[#28584E] text-white font-bold text-xs cursor-pointer transition-colors"
        >
          Hoàn tất
        </button>
      </div>
    </div>
  );
};
