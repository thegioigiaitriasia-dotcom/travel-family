import React, { useState } from 'react';
import { X, UserPlus, Mail, Link, Copy, Check, Shield, Eye, Edit } from 'lucide-react';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle: string;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  isOpen,
  onClose,
  tripTitle,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [invitedList, setInvitedList] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setInvitedList((prev) => [...prev, `${email} (${role === 'editor' ? 'Có thể sửa' : 'Chỉ xem'})`]);
    setEmail('');
  };

  const inviteLink = `https://travelbook.ai/invite?trip=bmt-camranh-2026&role=${role}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#DC2626]" />
            Mời người thân tham gia
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Gửi lời mời tham gia chuyến đi <strong className="text-slate-800">{tripTitle}</strong>.
          </p>
        </div>

        {/* Form Invite by Email */}
        <form onSubmit={handleSendInvite} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <label className="text-xs font-bold text-slate-800 block">
            Mời qua Email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="nhap.email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#DC2626]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#DC2626] text-white text-xs font-bold hover:bg-[#B91C1C] cursor-pointer"
            >
              Gửi lời mời
            </button>
          </div>

          {/* Role selection */}
          <div className="flex items-center gap-4 text-xs pt-1 font-bold">
            <span className="text-slate-500">Quyền:</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="role"
                checked={role === 'editor'}
                onChange={() => setRole('editor')}
              />
              <span>Có thể chỉnh sửa</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="role"
                checked={role === 'viewer'}
                onChange={() => setRole('viewer')}
              />
              <span>Chỉ xem</span>
            </label>
          </div>
        </form>

        {/* Copy Invite Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Hoặc chép liên kết mời</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-red-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>
          </div>
        </div>

        {/* Invited List Status */}
        {invitedList.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-extrabold text-slate-700">Đã gửi lời mời:</span>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {invitedList.map((item, idx) => (
                <div key={idx} className="text-xs font-semibold text-slate-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-red-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
        >
          Hoàn tất
        </button>
      </div>
    </div>
  );
};
