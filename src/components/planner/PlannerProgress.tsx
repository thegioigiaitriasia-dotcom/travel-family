import React from 'react';
import { Check } from 'lucide-react';

interface PlannerProgressProps {
  currentStep: number;
  totalSteps: number;
  onSelectStep: (step: number) => void;
}

const stepLabels = [
  'Thời gian',
  'Tuyến đường',
  'Phương tiện',
  'Thành viên',
  'Lưu trú & Ngân sách',
  'Kiểm tra & Lập KH',
];

export const PlannerProgress: React.FC<PlannerProgressProps> = ({
  currentStep,
  totalSteps = 6,
  onSelectStep,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto py-2 px-2">
      {/* Header step text & visual indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-bronze-600 uppercase tracking-wider">
          Bước {currentStep} / {totalSteps}
        </span>
        <span className="text-xs font-semibold text-slate-500">
          {stepLabels[currentStep - 1]}
        </span>
      </div>

      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />

        {/* Active Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-bronze-600 -translate-y-1/2 z-0 transition-all duration-300 rounded-full"
          style={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
        />

        {/* Step Circles */}
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isClickable = stepNum <= currentStep;

          return (
            <div key={stepNum} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => isClickable && onSelectStep(stepNum)}
                disabled={!isClickable}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                  isCompleted
                    ? 'bg-[#2E8B57] text-white shadow-md shadow-[#2E8B57]/20 cursor-pointer hover:bg-[#236c43]'
                    : isActive
                    ? 'bg-bronze-600 text-white ring-4 ring-[#DC2626]/20 shadow-lg cursor-default scale-110'
                    : 'bg-white border-2 border-slate-300 text-slate-400 cursor-not-allowed'
                }`}
                title={stepLabels[index]}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
              </button>
              <span
                className={`text-[11px] font-semibold mt-1.5 hidden sm:block text-center max-w-[80px] leading-tight ${
                  isActive ? 'text-bronze-600 font-extrabold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {stepLabels[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
