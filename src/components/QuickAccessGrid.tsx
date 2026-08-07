import React from 'react';
import { QuickAccessCard, QuickAccessType } from './QuickAccessCard';

interface QuickAccessGridProps {
  onNavigateToPlaces: () => void;
  onNavigateToDiary: () => void;
  onNavigateToBudget: () => void;
  onNavigateToChecklist: () => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
  onNavigateToPlaces,
  onNavigateToDiary,
  onNavigateToBudget,
  onNavigateToChecklist,
}) => {
  const items: {
    type: QuickAccessType;
    title: string;
    description: string;
    onClick: () => void;
  }[] = [
    {
      type: 'places',
      title: 'Địa điểm đã lưu',
      description: 'Những nơi gia đình muốn quay lại',
      onClick: onNavigateToPlaces,
    },
    {
      type: 'diary',
      title: 'Nhật ký du lịch',
      description: 'Ảnh và câu chuyện từ các chuyến đi',
      onClick: onNavigateToDiary,
    },
    {
      type: 'budget',
      title: 'Chi phí chuyến đi',
      description: 'Theo dõi ngân sách và khoản đã chi',
      onClick: onNavigateToBudget,
    },
    {
      type: 'checklist',
      title: 'Danh sách chuẩn bị',
      description: 'Hành lý, giấy tờ và việc cần làm',
      onClick: onNavigateToChecklist,
    },
  ];

  return (
    <div className="space-y-3 pt-2">
      <h3 className="text-base font-semibold text-[#1D211F] tracking-tight">
        Truy cập nhanh
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {items.map((item) => (
          <QuickAccessCard
            key={item.type}
            type={item.type}
            title={item.title}
            description={item.description}
            onClick={item.onClick}
          />
        ))}
      </div>
    </div>
  );
};

