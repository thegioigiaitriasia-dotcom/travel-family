import React from 'react';
import { Sparkles, Check, Compass, Users, MapPin, Calendar, Utensils, BedDouble, DollarSign, ArrowRight } from 'lucide-react';

interface PlannerIntroProps {
  onStartAI: () => void;
}

export const PlannerIntro: React.FC<PlannerIntroProps> = ({ onStartAI }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* SCREEN 1: Intro Card with Inspiration Background */}
      <div className="relative rounded-[24px] overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-800">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
            alt="Family vacation beach background"
            className="w-[#100%] h-[#100%] object-cover opacity-35 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-10 space-y-8 text-center max-w-xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bronze-600/30 backdrop-blur-md text-[#64B5F6] text-xs font-bold border border-[#DC2626]/50 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#FFB545]" />
            <span>AI Travel Planner 2.0</span>
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-red-500xl font-black text-white tracking-tight leading-tight">
              Tạo chuyến đi mới
            </h1>
            <p className="text-sm sm:text-base text-slate-200 font-medium">
              Chỉ mất khoảng <span className="text-[#FFB545] font-bold">2 phút</span>. AI sẽ giúp gia đình bạn:
            </p>
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left bg-slate-900/80 backdrop-blur-md p-5 rounded-[20px] border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <div className="w-5 h-5 rounded-full bg-[#2E8B57] text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Đi đâu</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <div className="w-5 h-5 rounded-full bg-[#2E8B57] text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Ăn gì</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <div className="w-5 h-5 rounded-full bg-[#2E8B57] text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Ở đâu</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <div className="w-5 h-5 rounded-full bg-[#2E8B57] text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Di chuyển thế nào</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <div className="w-5 h-5 rounded-full bg-[#2E8B57] text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Chi phí dự kiến</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <div className="w-5 h-5 rounded-full bg-[#2E8B57] text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Lịch trình từng ngày</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onStartAI}
            className="w-full py-4 px-8 rounded-[20px] bg-bronze-600 hover:bg-[#B91C1C] text-white font-extrabold text-base transition-all duration-200 shadow-xl shadow-[#DC2626]/30 flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.01]"
          >
            <span>Bắt đầu ngay</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Bottom Social Proof */}
          <div className="pt-2 text-center border-t border-white/10">
            <span className="text-xs font-semibold text-slate-300">
              🔥 Đã có <span className="text-[#FFB545] font-bold">245+ chuyến đi</span> được tạo cho các gia đình
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
