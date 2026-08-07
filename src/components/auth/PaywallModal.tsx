import React from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { SubscriptionPricing } from '../account/SubscriptionPricing';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden relative my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6 bg-rose-50 text-rose-700 px-4 py-3 rounded-2xl border border-rose-100">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">
              Bạn cần <strong>Đăng nhập</strong> và <strong>Nâng cấp Gói Thành Viên</strong> để mở khóa tính năng AI lên lịch trình.
            </p>
          </div>

          <SubscriptionPricing onSelectPlan={() => {}} userId={userId} />
        </div>
      </div>
    </div>
  );
};
