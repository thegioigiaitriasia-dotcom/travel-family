import React, { useState } from 'react';
import { HeartHandshake, Edit3, Check } from 'lucide-react';

interface FamilyNoteCardProps {
  note?: string;
  onUpdateNote: (newNote: string) => void;
}

export const FamilyNoteCard: React.FC<FamilyNoteCardProps> = ({ note, onUpdateNote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(note || '');

  const handleSave = () => {
    onUpdateNote(val);
    setIsEditing(false);
  };

  return (
    <div className="bg-red-50/80 rounded-[22px] p-5 border border-sky-200/80 shadow-sm space-y-2 text-sky-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-bronze-600" />
          <h4 className="text-sm font-extrabold text-slate-900">Ghi chú cho cả nhà</h4>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-bronze-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Chỉnh
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="text-xs font-extrabold text-[#2E8B57] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" /> Lưu
          </button>
        )}
      </div>

      {!isEditing ? (
        <p className="text-xs font-medium leading-relaxed text-slate-800 bg-white/70 p-3 rounded-xl border border-sky-200/50">
          {note || 'Chưa có ghi chú đặc biệt nào cho ngày hôm nay.'}
        </p>
      ) : (
        <textarea
          rows={3}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full text-xs p-3 rounded-xl border border-sky-300 font-medium bg-white text-slate-900 focus:outline-none"
          placeholder="Nhập ghi chú cho cả gia đình..."
        />
      )}
    </div>
  );
};
