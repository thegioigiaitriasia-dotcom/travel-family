import React from 'react';
import { Lock, Sparkles, X, ShieldAlert, UserPlus, LogIn, ArrowRight } from 'lucide-react';

interface DemoRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  actionName?: string;
}

export const DemoRestrictionModal: React.FC<DemoRestrictionModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  actionName = 'Thao tác này',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Chế độ Trải nghiệm Mẫu (Demo)</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Dữ liệu mẫu chỉ hỗ trợ xem thử
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed max-w-sm mx-auto">
              <span className="font-semibold text-slate-800">{actionName}</span> bị giới hạn ở dữ liệu mẫu để bảo đảm trải nghiệm cho người dùng dùng thử. Hãy Đăng nhập hoặc Đăng ký tài khoản gia đình để tạo, sửa, và quản lý các chuyến đi thực tế của bạn!
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left text-xs space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Khi đăng nhập tài khoản gia đình:</span>
            </p>
            <ul className="space-y-1 text-slate-600 font-medium pl-6 list-disc">
              <li>Tự do tạo chuyến đi riêng & lịch trình thực tế</li>
              <li>Thêm thành viên gia đình (Vợ, con, ông bà...) không cần email</li>
              <li>Chỉnh sửa & đồng bộ tức thì cho cả gia đình cùng xem</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth('login');
              }}
              className="w-full bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập ngay</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth('register');
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng ký gia đình</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
