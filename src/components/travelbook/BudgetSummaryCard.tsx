import React from 'react';
import { DollarSign, AlertTriangle, ArrowRight, PieChart } from 'lucide-react';

interface CategoryCost {
  label: string; // e.g. "Di chuyển"
  amount: number; // e.g. 4500000
}

interface BudgetSummaryCardProps {
  userBudget?: number; // e.g. 15000000
  estimatedMin?: number; // e.g. 13000000
  estimatedMax?: number; // e.g. 16000000
  breakdown?: CategoryCost[];
  onViewBudgetDetail?: () => void;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  userBudget = 0,
  estimatedMin = 0,
  estimatedMax = 0,
  breakdown = [],
  onViewBudgetDetail,
}) => {
  const formatMoney = (val: number) => {
    return val.toLocaleString('vi-VN') + 'đ';
  };

  const isExceeded = estimatedMax > userBudget;
  const exceedAmount = estimatedMax - userBudget;

  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <DollarSign className="w-4 h-4" />
          </div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Ngân sách dự kiến
          </h3>
        </div>
      </div>

      {/* Main Budget Range Display */}
      <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase block">
            Dự toán khoảng
          </span>
          <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {formatMoney(estimatedMin)} – {formatMoney(estimatedMax)}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Ngân sách gia đình đặt ra</span>
          <span className="font-extrabold text-[#DC2626]">{formatMoney(userBudget)}</span>
        </div>
      </div>

      {/* Budget Warning if Exceeded */}
      {isExceeded && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="font-bold leading-snug">
            Dự toán cao nhất đang vượt ngân sách {formatMoney(exceedAmount)}.
          </p>
        </div>
      )}

      {/* Category Breakdown list — chỉ hiện khi có dữ liệu */}
      {breakdown.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-slate-400" />
            Phân bổ dự kiến
          </span>

          <div className="space-y-1.5 text-xs">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <span className="font-medium text-slate-600">{item.label}</span>
                <span className="font-extrabold text-slate-900">{formatMoney(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explicit Price Reference & Non-Commercial Disclaimer */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900/90 leading-relaxed space-y-1">
        <p className="font-bold flex items-center gap-1.5 text-amber-950">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Ghi chú quan trọng về chi phí & giá vé:</span>
        </p>
        <p className="text-[10.5px]">
          Tất cả thông tin giá cả, chi phí dịch vụ, vé tham quan được liệt kê mang tính <strong>THAM KHẢO</strong> (có thể thay đổi tùy thời điểm, chính sách địa điểm hoặc mùa du lịch).
        </p>
        <p className="text-[10.5px] italic font-medium text-amber-900/80">
          * GiaĐìnhViVu hỗ trợ lên kế hoạch lịch trình tự do cho gia đình, <strong>KHÔNG</strong> bán dịch vụ hay thu phí trực tiếp từ các cơ sở này.
        </p>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onViewBudgetDetail}
        className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#DC2626] font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
      >
        <span>Xem chi tiết chi phí</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
