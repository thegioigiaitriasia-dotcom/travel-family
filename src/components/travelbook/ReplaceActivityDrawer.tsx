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

// Đã xóa mockAIOptions

export const ReplaceActivityDrawer: React.FC<ReplaceActivityDrawerProps> = ({
  activity,
  isOpen,
  onClose,
  onConfirmReplace,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('Trời mưa');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOptions, setAiOptions] = useState<any[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !activity) return null;

  const handleReasonClick = async (r: string) => {
    setSelectedReason(r);
    setIsGenerating(true);
    setErrorMsg('');
    setAiOptions([]);
    try {
      const res = await fetch(`/api/suggest-alternative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: activity.title,
          reason: r,
          city: activity.locationName || '',
        })
      });
      const data = await res.json();
      if (data.success && data.options) {
        setAiOptions(data.options);
        if (data.options.length > 0) {
          setSelectedOptionId(data.options[0].id);
        }
      } else {
        setErrorMsg('Không thể lấy gợi ý từ AI.');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    const chosen = aiOptions.find((o) => o.id === selectedOptionId);
    if (chosen) {
      onConfirmReplace(activity.id, chosen.title, chosen.placeName, chosen.cost);
    }
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
                        : 'bg-sand-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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

            <div className="space-y-2.5">
              {isGenerating ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
                  <p>AI đang phân tích và tìm địa điểm thay thế...</p>
                </div>
              ) : errorMsg ? (
                <div className="py-4 text-center text-red-500 bg-red-50 rounded-xl">
                  {errorMsg}
                </div>
              ) : aiOptions.length > 0 ? (
                aiOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 shadow-sm'
                          : 'border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">{opt.title}</h4>
                        {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                      <p className="text-purple-600 font-medium text-xs mb-2">{opt.placeName}</p>
                      <p className="text-slate-500 text-xs mb-2">{opt.reason}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>{opt.distance}</span>
                        <span>Dự kiến: {opt.cost.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-slate-400 italic">
                  Chọn lý do ở trên để AI gợi ý.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-sand-50 cursor-pointer"
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
