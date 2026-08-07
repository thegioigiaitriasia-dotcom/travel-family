import React from 'react';
import { ModuleType } from '../types';
import { Compass, Sparkles, BookOpen, MapPin, Bookmark, User } from 'lucide-react';

interface MobileBottomNavigationProps {
  currentModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  currentModule,
  onSelectModule,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E2E3DE] z-50 py-1 shadow-lg pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-1">
        {/* Module 1: Chuyến đi */}
        <button
          type="button"
          onClick={() => onSelectModule('my-trips')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1 py-1 cursor-pointer transition-colors ${
            currentModule === 'my-trips'
              ? 'text-[#183B35] font-bold'
              : 'text-[#606864] hover:text-[#1D211F]'
          }`}
        >
          <Compass className="w-5 h-5" strokeWidth={1.75} />
          <span className="text-[10px] leading-tight mt-0.5">Chuyến đi</span>
        </button>

        {/* Module 3: Lịch trình */}
        <button
          type="button"
          onClick={() => onSelectModule('travel-book')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1 py-1 cursor-pointer transition-colors ${
            currentModule === 'travel-book'
              ? 'text-[#183B35] font-bold'
              : 'text-[#606864] hover:text-[#1D211F]'
          }`}
        >
          <BookOpen className="w-5 h-5" strokeWidth={1.75} />
          <span className="text-[10px] leading-tight mt-0.5">Lịch trình</span>
        </button>

        {/* Center Floating AI Button */}
        <button
          type="button"
          onClick={() => onSelectModule('ai-planner')}
          className="w-11 h-11 rounded-full bg-[#183B35] text-white flex flex-col items-center justify-center shadow-md shadow-[#183B35]/30 hover:bg-[#28584E] transition-all cursor-pointer -mt-4 border-2 border-white shrink-0"
          aria-label="Tạo lịch trình AI mới"
          title="Tạo lịch trình AI"
        >
          <Sparkles className="w-5 h-5 text-amber-200" strokeWidth={2} />
        </button>

        {/* Module 4: Địa điểm */}
        <button
          type="button"
          onClick={() => onSelectModule('my-places')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1 py-1 cursor-pointer transition-colors ${
            currentModule === 'my-places'
              ? 'text-[#183B35] font-bold'
              : 'text-[#606864] hover:text-[#1D211F]'
          }`}
        >
          <MapPin className="w-5 h-5" strokeWidth={1.75} />
          <span className="text-[10px] leading-tight mt-0.5">Địa điểm</span>
        </button>

        {/* Module 5: Nhật ký */}
        <button
          type="button"
          onClick={() => onSelectModule('travel-diary')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1 py-1 cursor-pointer transition-colors ${
            currentModule === 'travel-diary'
              ? 'text-[#183B35] font-bold'
              : 'text-[#606864] hover:text-[#1D211F]'
          }`}
        >
          <Bookmark className="w-5 h-5" strokeWidth={1.75} />
          <span className="text-[10px] leading-tight mt-0.5">Nhật ký</span>
        </button>

        {/* Account / Family */}
        <button
          type="button"
          onClick={() => onSelectModule('account')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1 py-1 cursor-pointer transition-colors ${
            currentModule === 'account'
              ? 'text-[#183B35] font-bold'
              : 'text-[#606864] hover:text-[#1D211F]'
          }`}
        >
          <User className="w-5 h-5" strokeWidth={1.75} />
          <span className="text-[10px] leading-tight mt-0.5">Gia đình</span>
        </button>
      </div>
    </div>
  );
};

