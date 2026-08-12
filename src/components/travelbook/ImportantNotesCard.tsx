import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface ImportantNotesCardProps {
  notes?: string[];
  onViewAllNotes?: () => void;
}

const defaultNotes: string[] = [
  'Vé cáp treo Bà Nà Hills nên đặt trực tuyến trước.',
  'Bãi biển Mỹ Khê đẹp nhất lúc bình minh và khoảng 16:30–18:00.',
  'Phố cổ Hội An cấm xe máy từ 15:00 hàng ngày.',
  'Kiểm tra giờ hoạt động trước khi đến các quán ăn nổi tiếng.',
];

export const ImportantNotesCard: React.FC<ImportantNotesCardProps> = ({
  notes = defaultNotes,
  onViewAllNotes,
}) => {
  const [expanded, setExpanded] = useState(false);
  const displayedNotes = expanded ? notes : notes.slice(0, 4);

  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-bronze-50 text-bronze-600 flex items-center justify-center border border-bronze-100">
            <AlertCircle className="w-4 h-4" />
          </div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Lưu ý quan trọng
          </h3>
        </div>
      </div>

      {/* Bullet Notes List */}
      <div className="space-y-2.5 text-xs text-slate-700 font-medium">
        {displayedNotes.map((note, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 bg-bronze-50/50 p-2.5 rounded-xl border border-bronze-100/80"
          >
            <span className="text-bronze-600 font-black text-sm leading-none mt-0.5">•</span>
            <p className="leading-relaxed text-slate-800">{note}</p>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {notes.length > 4 && (
        <button
          type="button"
          onClick={() => {
            setExpanded(!expanded);
            onViewAllNotes?.();
          }}
          className="w-full py-2.5 rounded-xl bg-sand-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
        >
          <span>{expanded ? 'Thu gọn' : 'Xem tất cả lưu ý'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};
