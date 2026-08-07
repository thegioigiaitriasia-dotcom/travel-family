import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { TravelActivity } from '../../types';

interface ReplaceActivityDrawerProps {
  activity: TravelActivity | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReplace: (activityId: string, newTitle: string, newPlaceName: string, newCost?: number) => void;
}

const reasons = [
  'Quá xa',
  'Không phù hợp trẻ em',
  'Không muốn đi bộ nhiều',
  'Trời mưa',
  'Muốn chỗ ăn khác',
  'Muốn tiết kiệm hơn',
  'Lý do khác',
];

const mockAIOptions = [
  {
    id: 'ai-opt-1',
    title: 'Gợi ý Điểm tham quan lân cận',
    placeName: 'Đang cập nhật từ hệ thống AI',
    distance: 'Cách đây vài phút di chuyển',
    reason: 'Gợi ý thay thế tối ưu dựa trên sở thích gia đình và vị trí hiện tại.',
    cost: 150000,
  },
  {
    id: 'ai-opt-2',
    title: 'Gợi ý Nhà hàng / Quán ăn gần đó',
    placeName: 'Đang cập nhật từ hệ thống AI',
    distance: 'Khoảng cách gần',
    reason: 'Đảm bảo tiêu chí sạch sẽ, phù hợp cho trẻ em.',
    cost: 250000,
  },
];

export const ReplaceActivityDrawer: React.FC<ReplaceActivityDrawerProps> = ({
  activity,
  isOpen,
  onClose,
  onConfirmReplace,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('Trời mưa');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('ai-opt-1');

  if (!isOpen || !activity) return null;

  const handleReasonClick = (r: string) => {
    setSelectedReason(r);
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  const handleApply = () => {
    const chosen = mockAIOptions.find((o) => o.id === selectedOptionId) || mockAIOptions[0];
    onConfirmReplace(activity.id, chosen.title, chosen.placeName, chosen.cost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto flex flex-col justify-between p-6 animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">AI Thay địa điểm</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                Đang thay: {activity.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 py-4 flex-1 text-xs">
          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-800 block">
              1. Cho AI biết lý do bạn muốn thay đổi:
            </label>
            <div className="flex flex-wrap gap-2">
              {reasons.map((r) => {
                const isSelected = selectedReason === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleReasonClick(r)}
                    className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Output Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                2. Gợi ý hàng đầu từ AI:
              </label>

              {isGenerating && (
                <span className="text-[11px] text-purple-600 font-bold flex items-center gap-1 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Đang tính toán...
                </span>
              )}
            </div>

            {isGenerating ? (
              <div className="p-8 text-center text-slate-400 font-bold">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                <span>AI đang tìm phương án tối ưu...</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {mockAIOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`p-4 rounded-[20px] border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-purple-50/70 border-purple-600 ring-2 ring-purple-600/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {opt.title}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] font-bold text-purple-700">{opt.distance}</p>
                      <p className="text-slate-600 font-medium leading-relaxed">{opt.reason}</p>

                      <div className="pt-1 text-[11px] font-bold text-slate-500">
                        Chi phí dự kiến: {new Intl.NumberFormat('vi-VN').format(opt.cost)} đ
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Thay vào lịch trình</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
