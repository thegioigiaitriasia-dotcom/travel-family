import React, { useState } from 'react';
import { X, FolderHeart, Check } from 'lucide-react';

interface CreateCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

export const CreateCollectionDialog: React.FC<CreateCollectionDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate(name.trim(), description.trim() || undefined);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-fadeIn text-xs font-bold text-slate-700">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-black text-slate-900">Tạo bộ sưu tập mới</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-slate-900 font-extrabold">Tên bộ sưu tập *</label>
              <span className="text-[10px] text-slate-400 font-normal">{name.length}/80</span>
            </div>
            <input
              type="text"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Quán ăn gia đình thích, Đi Đà Lạt..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-900 font-extrabold">Mô tả bộ sưu tập</label>
            <textarea
              rows={2}
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn mục đích..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={!name.trim()}
              className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Tạo bộ sưu tập</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
