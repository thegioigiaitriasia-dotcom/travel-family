import React, { useState } from 'react';
import { CheckCircle2, Calendar, MapPin, Utensils, BedDouble, DollarSign, ArrowRight, Edit3, RefreshCw, AlertTriangle, BookOpen } from 'lucide-react';
import { GeneratedTripPlan } from '../../types';

interface GenerationSuccessStateProps {
  plan?: GeneratedTripPlan;
  onViewItinerary: () => void;
  onEditPreferences: () => void;
  onRegenerate: () => void;
}

export const GenerationSuccessState: React.FC<GenerationSuccessStateProps> = ({
  onViewItinerary,
  onEditPreferences,
  onRegenerate,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-2xl max-w-xl mx-auto my-6 text-center space-y-6 relative overflow-hidden">
      {/* Top Inspiring Banner */}
      <div className="relative rounded-[20px] overflow-hidden h-36 bg-slate-900 text-white shadow-md">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
          alt="Vacation success banner"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 rounded-full bg-[#2E8B57] text-white flex items-center justify-center shadow-lg mb-1">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            🎉 Lịch trình đã sẵn sàng!
          </h3>
        </div>
      </div>

      <p className="text-xs text-slate-600 font-medium">
        AI đã hoàn thành thiết kế lịch trình cá nhân hóa hoàn chỉnh cho chuyến đi của gia đình bạn.
      </p>

      {/* 4 Cards Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-sand-50 p-4 rounded-[20px] border border-slate-200 text-center">
        <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <Calendar className="w-5 h-5 text-bronze-600 mx-auto" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Thời gian</p>
          <p className="text-xs font-black text-slate-900">4 ngày 3 đêm</p>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <MapPin className="w-5 h-5 text-bronze-600 mx-auto" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Điểm đến</p>
          <p className="text-xs font-black text-slate-900">12 tham quan</p>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <Utensils className="w-5 h-5 text-bronze-600 mx-auto" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Ẩm thực</p>
          <p className="text-xs font-black text-slate-900">9 món ăn</p>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <BedDouble className="w-5 h-5 text-bronze-600 mx-auto" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Lưu trú</p>
          <p className="text-xs font-black text-slate-900">2 khách sạn</p>
        </div>
      </div>

      {/* Main Action Button: Xem Travel Book */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onViewItinerary}
          className="w-full py-4 px-6 rounded-[20px] bg-bronze-600 hover:bg-[#B91C1C] text-white font-extrabold text-base transition-all shadow-xl shadow-[#DC2626]/30 flex items-center justify-center gap-2 cursor-pointer group"
        >
          <BookOpen className="w-5 h-5" />
          <span>Xem Travel Book</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onEditPreferences}
            className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-sand-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Chỉnh sửa yêu cầu</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-sand-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Tạo lại lịch trình</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Regenerate */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-2xl text-left border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-bronze-100 text-bronze-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Xác nhận tạo lại lịch trình?</h4>
              <p className="text-xs text-slate-500">
                Lịch trình vừa tạo hiện tại sẽ được cập nhật bằng phương án mới của AI.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-sand-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  onRegenerate();
                }}
                className="flex-1 py-2.5 rounded-xl bg-bronze-600 text-white text-xs font-bold hover:bg-[#B91C1C]"
              >
                Đồng ý tạo lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
