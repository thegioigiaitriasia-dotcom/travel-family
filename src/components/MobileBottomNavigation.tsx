import React from 'react';
import { ModuleType } from '../types';
import { Compass, Sparkles, BookOpen, MapPin, Bookmark, User } from 'lucide-react';

interface MobileBottomNavigationProps {
  currentModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = React.memo(({
  currentModule,
  onSelectModule,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E2E3DE] z-50 py-2 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 relative">
        {/* Module 1: Chuyến đi */}
        <button
          type="button"
          onClick={() => onSelectModule('my-trips')}
          className={`flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full transition-all duration-300 ${
            currentModule === 'my-trips'
              ? 'text-[#183B35] bg-[#E9F0ED]'
              : 'text-[#8D9490] hover:text-[#1D211F] hover:bg-sand-50'
          }`}
          aria-label="Chuyến đi"
        >
          <Compass className="w-6 h-6" strokeWidth={currentModule === 'my-trips' ? 2.5 : 1.75} />
        </button>

        {/* Module 2: Tạo kế hoạch bằng AI */}
        <button
          type="button"
          onClick={() => onSelectModule('ai-planner')}
          className={`flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full transition-all duration-300 ${
            currentModule === 'ai-planner'
              ? 'text-[#183B35] bg-[#E9F0ED]'
              : 'text-[#8D9490] hover:text-[#1D211F] hover:bg-sand-50'
          }`}
          aria-label="Tạo kế hoạch AI"
        >
          <Sparkles className="w-6 h-6" strokeWidth={currentModule === 'ai-planner' ? 2.5 : 1.75} />
        </button>

        {/* Center Floating Lịch Trình Button */}
        <button
          type="button"
          onClick={() => onSelectModule('travel-book')}
          className={`w-[52px] h-[52px] rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer -mt-6 border-4 border-white shrink-0 shadow-lg ${
            currentModule === 'travel-book'
              ? 'bg-[#183B35] text-white shadow-[#183B35]/40 scale-105'
              : 'bg-[#2E8B57] text-white shadow-[#2E8B57]/30 hover:bg-[#183B35]'
          }`}
          aria-label="Lịch trình"
          title="Lịch trình"
        >
          <BookOpen className="w-[22px] h-[22px]" strokeWidth={2.5} />
        </button>

        {/* Module 4: Địa điểm */}
        <button
          type="button"
          onClick={() => onSelectModule('my-places')}
          className={`flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full transition-all duration-300 ${
            currentModule === 'my-places'
              ? 'text-[#183B35] bg-[#E9F0ED]'
              : 'text-[#8D9490] hover:text-[#1D211F] hover:bg-sand-50'
          }`}
          aria-label="Địa điểm"
        >
          <MapPin className="w-6 h-6" strokeWidth={currentModule === 'my-places' ? 2.5 : 1.75} />
        </button>

        {/* Module 5: Nhật ký */}
        <button
          type="button"
          onClick={() => onSelectModule('travel-diary')}
          className={`flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full transition-all duration-300 ${
            currentModule === 'travel-diary'
              ? 'text-[#183B35] bg-[#E9F0ED]'
              : 'text-[#8D9490] hover:text-[#1D211F] hover:bg-sand-50'
          }`}
          aria-label="Nhật ký"
        >
          <Bookmark className="w-6 h-6" strokeWidth={currentModule === 'travel-diary' ? 2.5 : 1.75} />
        </button>
      </div>
    </div>
  );
});

