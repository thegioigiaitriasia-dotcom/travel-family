import React, { useState } from 'react';
import { X, Copy, Check, Download, QrCode, Lock, Globe, FileText, Eye, Shield } from 'lucide-react';
import { TravelDiary } from '../../types';

interface ShareDiaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  diary: TravelDiary;
  onUpdateShareSettings: (settings: TravelDiary['shareSettings'], visibility: TravelDiary['visibility']) => void;
}

export const ShareDiaryDialog: React.FC<ShareDiaryDialogProps> = ({
  isOpen,
  onClose,
  diary,
  onUpdateShareSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [visibility, setVisibility] = useState<TravelDiary['visibility']>(diary.visibility);
  const [settings, setSettings] = useState(diary.shareSettings);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/diaries/${diary.id}?shared=true`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSetting = (key: keyof TravelDiary['shareSettings']) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    onUpdateShareSettings(updated, visibility);
  };

  const handleVisibilityChange = (newVis: TravelDiary['visibility']) => {
    setVisibility(newVis);
    onUpdateShareSettings(settings, newVis);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E9F0ED] text-[#183B35] flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Chia sẻ nhật ký</h3>
              <p className="text-xs text-slate-500">{diary.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Privacy Visibility Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Quyền riêng tư
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleVisibilityChange('private')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  visibility === 'private'
                    ? 'border-[#183B35] bg-[#E9F0ED]/60 text-[#183B35]'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <Lock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-xs">Chỉ mình tôi</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Không ai có thể xem</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleVisibilityChange('shared_link')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  visibility === 'shared_link'
                    ? 'border-[#183B35] bg-[#E9F0ED]/60 text-[#183B35]'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <Globe className="w-4 h-4 text-[#183B35] mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-xs">Bất kỳ ai có link</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Dễ dàng gửi người thân</div>
                </div>
              </button>
            </div>
          </div>

          {visibility === 'shared_link' && (
            <>
              {/* Copy URL section */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Đường dẫn chia sẻ
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#183B35] text-white rounded-xl text-xs font-semibold hover:bg-[#28584E] transition-colors shrink-0 shadow-sm cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Security Customizations */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#183B35]" />
                  <span>Tuỳ chỉnh dữ liệu hiển thị</span>
                </label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                    <span className="text-slate-700 font-medium">Hiển thị tên các thành viên</span>
                    <input
                      type="checkbox"
                      checked={settings.showMemberNames}
                      onChange={() => handleToggleSetting('showMemberNames')}
                      className="rounded text-[#183B35] focus:ring-[#183B35]"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                    <span className="text-slate-700 font-medium">Hiển thị chi phí thực tế</span>
                    <input
                      type="checkbox"
                      checked={settings.showExpenses}
                      onChange={() => handleToggleSetting('showExpenses')}
                      className="rounded text-[#183B35] focus:ring-[#183B35]"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                    <span className="text-slate-700 font-medium">Hiển thị ghi chú cá nhân</span>
                    <input
                      type="checkbox"
                      checked={settings.showPersonalNotes}
                      onChange={() => handleToggleSetting('showPersonalNotes')}
                      className="rounded text-[#183B35] focus:ring-[#183B35]"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                    <span className="text-slate-700 font-medium">Cho phép người xem tải ảnh gốc</span>
                    <input
                      type="checkbox"
                      checked={settings.allowPhotoDownload}
                      onChange={() => handleToggleSetting('allowPhotoDownload')}
                      className="rounded text-[#183B35] focus:ring-[#183B35]"
                    />
                  </label>
                </div>
              </div>

              {/* QR Code section toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center gap-2 text-[#183B35] hover:text-[#28584E] font-medium cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{showQR ? 'Ẩn Mã QR' : 'Tạo Mã QR xem nhật ký'}</span>
                </button>
              </div>

              {showQR && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center flex flex-col items-center">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                    <div className="w-full h-full border-2 border-dashed border-slate-400 rounded-lg flex items-center justify-center text-slate-400 font-mono text-[10px]">
                      [ QR CODE ]
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Quét mã bằng camera điện thoại để mở nhật ký</p>
                </div>
              )}
            </>
          )}

          {/* PDF Export Action Mock */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => alert('Đang khởi tạo album PDF Kỷ niệm chuyến đi...')}
              className="w-full flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#183B35]" />
              <span>Xem trước bản In Album PDF</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#183B35] hover:bg-[#28584E] rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
