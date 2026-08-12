import React, { useState } from 'react';
import { Utensils, Coffee, ChevronRight, Check } from 'lucide-react';

interface DayFoodSummaryProps {
  mustTryFoods?: string[];
}

export const DayFoodSummary: React.FC<DayFoodSummaryProps> = ({ mustTryFoods }) => {
  const [showAllModal, setShowAllModal] = useState(false);

  const defaultFoods = mustTryFoods || [];

  return (
    <div className="bg-white rounded-[22px] p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-[#FFB545]" />
          <h4 className="text-sm font-extrabold text-slate-900">Ẩm thực gợi ý hôm nay</h4>
        </div>

        <button
          type="button"
          onClick={() => setShowAllModal(true)}
          className="text-xs font-bold text-bronze-600 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>Xem tất cả gợi ý</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {defaultFoods.map((food, idx) => (
          <div
            key={idx}
            className="bg-sand-50 p-3 rounded-xl border border-slate-200/80 flex items-center gap-2 text-xs"
          >
            <span className="w-6 h-6 rounded-lg bg-bronze-100 text-bronze-700 font-extrabold flex items-center justify-center text-[11px] shrink-0">
              {idx + 1}
            </span>
            <span className="font-extrabold text-slate-900 truncate">{food}</span>
          </div>
        ))}
      </div>

      {showAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 text-left">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#FFB545]" />
                Danh sách món ăn & Quán ngon
              </h3>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto">
              {defaultFoods.length > 0 ? (
                defaultFoods.map((food, idx) => (
                  <div key={idx} className="bg-bronze-50 p-3 rounded-xl border border-bronze-200 flex gap-2 items-center">
                    <span className="font-extrabold text-bronze-900 bg-bronze-200 w-6 h-6 flex items-center justify-center rounded-full shrink-0">{idx + 1}</span>
                    <p className="text-bronze-900 font-medium">{food}</p>
                  </div>
                ))
              ) : (
                <div className="bg-sand-50 p-4 rounded-xl border border-slate-200 text-center text-slate-500">
                  Chưa có gợi ý ẩm thực nào cho ngày hôm nay.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAllModal(false)}
              className="w-full py-2.5 rounded-xl bg-bronze-600 text-white font-bold text-xs hover:bg-[#B91C1C]"
            >
              Đóng danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
