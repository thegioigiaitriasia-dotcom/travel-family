import React from 'react';
import { Bookmark, BookOpen, Wallet, ListChecks, ChevronRight } from 'lucide-react';

export type QuickAccessType = 'places' | 'diary' | 'budget' | 'checklist';

interface QuickAccessCardProps {
  type: QuickAccessType;
  title: string;
  description: string;
  onClick: () => void;
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  type,
  title,
  description,
  onClick,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'places':
        return <Bookmark className="w-5 h-5 text-[#183B35]" strokeWidth={1.75} />;
      case 'diary':
        return <BookOpen className="w-5 h-5 text-[#183B35]" strokeWidth={1.75} />;
      case 'budget':
        return <Wallet className="w-5 h-5 text-[#A46F3D]" strokeWidth={1.75} />;
      case 'checklist':
        return <ListChecks className="w-5 h-5 text-[#183B35]" strokeWidth={1.75} />;
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 border border-[#E2E3DE] hover:border-[#183B35]/40 transition-colors cursor-pointer flex items-center justify-between group"
    >
      <div className="flex items-center gap-3.5">
        <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-[#F7F5F0]">
          {getIcon()}
        </div>
        <div>
          <h4 className="font-semibold text-[#1D211F] text-sm">{title}</h4>
          <p className="text-xs text-[#606864] mt-0.5">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[#8D9490] group-hover:text-[#183B35] transition-colors shrink-0" strokeWidth={1.5} />
    </div>
  );
};

