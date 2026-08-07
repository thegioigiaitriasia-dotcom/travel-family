import React from 'react';
import { Plus } from 'lucide-react';

interface WelcomeSectionProps {
  onCreateTrip: () => void;
  userName?: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  onCreateTrip,
  userName,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
      <div className="space-y-1">
        <h1 className="text-[28px] sm:text-[30px] leading-[38px] font-semibold text-[#1D211F] tracking-tight">
          {userName ? `Chào buổi sáng, ${userName}!` : 'Chào buổi sáng!'}
        </h1>
        <p className="text-[#606864] text-sm sm:text-base font-normal">
          Gia đình mình sắp có một hành trình đáng nhớ.
        </p>
      </div>

      <button
        onClick={onCreateTrip}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#183B35] hover:bg-[#28584E] active:bg-[#122c28] text-white font-semibold text-sm transition-colors shrink-0 cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[2.2]" />
        <span>Tạo chuyến đi mới</span>
      </button>
    </div>
  );
};

