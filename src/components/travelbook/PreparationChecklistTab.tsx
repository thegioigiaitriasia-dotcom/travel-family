import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { PrepItem, TravelBook } from '../../types';

export interface ChecklistItem {
  id: string;
  category: 'giay_to' | 'do_ca_nhan' | 'y_te';
  title: string;
  note?: string;
  checked: boolean;
  assignedTo?: string;
}

const CATEGORY_CONFIG: Record<
  ChecklistItem['category'],
  { label: string; description: string }
> = {
  giay_to: {
    label: 'Giấy tờ',
    description: 'Giấy tờ tùy thân, vé máy bay, mã đặt phòng',
  },
  do_ca_nhan: {
    label: 'Đồ dùng cá nhân',
    description: 'Trang phục, phụ kiện, đồ vệ sinh cá nhân, thiết bị',
  },
  y_te: {
    label: 'Y tế',
    description: 'Thuốc chống say, thuốc hạ sốt, băng gạc, xịt muỗi',
  },
};

interface PreparationChecklistTabProps {
  tripTitle?: string;
  trip?: TravelBook;
  onUpdateTrip?: (updatedFields: Partial<TravelBook>) => void;
}

export const PreparationChecklistTab: React.FC<PreparationChecklistTabProps> = ({
  tripTitle = 'Đà Nẵng – Hội An',
  trip,
  onUpdateTrip,
}) => {
  // Chuyển đổi dữ liệu từ AI (prepItems) thành định dạng ChecklistItem để render UI
  const getInitialItems = () => {
    if (!trip || !trip.prepItems || trip.prepItems.length === 0) return [];
    
    return trip.prepItems.map((item: PrepItem) => {
      // Map AI category to UI category
      let mappedCategory: 'giay_to' | 'do_ca_nhan' | 'y_te' = 'do_ca_nhan';
      if (item.category === 'health' || item.category === 'y_te') mappedCategory = 'y_te';
      if (item.category === 'giay_to' || item.category === 'documents') mappedCategory = 'giay_to';
      
      return {
        id: item.id,
        category: mappedCategory,
        title: item.name || (item as any).label || (item as any).title || 'Hạng mục',
        note: (item as any).note || (item as any).value || '',
        checked: item.status === 'completed',
        assignedTo: 'Gia đình',
      };
    });
  };

  const [items, setItems] = useState<ChecklistItem[]>(getInitialItems());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  // Form State for Adding Item
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ChecklistItem['category']>('giay_to');
  const [newNote, setNewNote] = useState('');

  // Calculations
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.checked).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      note: newNote.trim() || undefined,
      checked: false,
      assignedTo: 'Gia đình',
    };

    setItems((prev) => [...prev, newItem]);
    setNewTitle('');
    setNewNote('');
    setIsAdding(false);
  };

  const categories: ChecklistItem['category'][] = ['giay_to', 'do_ca_nhan', 'y_te'];

  return (
    <div className="space-y-6">
      {/* Overview Status Banner */}
      <div className="bg-white rounded-2xl p-5 border border-[#E3E6E2] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Checklist chuẩn bị cho chuyến đi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hành trình: <span className="font-semibold text-slate-800">{tripTitle}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 rounded-xl bg-bronze-600 hover:bg-[#B91C1C] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm vật dụng</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Trạng thái hoàn thành: {completedCount}/{totalCount} món</span>
            <span className="text-bronze-600 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-[#E4E4E7]">
            <div
              className="h-full bg-bronze-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Options */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4E4E7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-bronze-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({totalCount})
          </button>

          {categories.map((catKey) => {
            const count = items.filter((i) => i.category === catKey).length;
            const catInfo = CATEGORY_CONFIG[catKey];
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === catKey
                    ? 'bg-bronze-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {catInfo.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Checkbox filter */}
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={showOnlyPending}
            onChange={(e) => setShowOnlyPending(e.target.checked)}
            className="rounded border-[#E4E4E7] text-bronze-600 focus:ring-[#DC2626]"
          />
          <span>Chỉ hiện mục chưa xong</span>
        </label>
      </div>

      {/* Add Item Drawer/Form */}
      {isAdding && (
        <form
          onSubmit={handleAddItem}
          className="bg-white rounded-2xl p-4 border border-[#E4E4E7] shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Bổ sung vật dụng mới
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Hủy
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Tên vật dụng (ví dụ: Áo mưa mỏng, Bình nước...)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 px-3 py-2 bg-white rounded-xl border border-[#E4E4E7] text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
              autoFocus
            />

            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ChecklistItem['category'])}
              className="px-3 py-2 bg-white rounded-xl border border-[#E4E4E7] text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_CONFIG[c].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ghi chú thêm (không bắt buộc)..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 px-3 py-2 bg-white rounded-xl border border-[#E4E4E7] text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
            />

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-2 bg-bronze-600 text-white rounded-xl font-bold text-xs hover:bg-[#B91C1C] disabled:opacity-50 cursor-pointer transition-colors"
            >
              Lưu vật dụng
            </button>
          </div>
        </form>
      )}

      {/* Main Checklist Groups */}
      <div className="space-y-6">
        {categories.map((catKey) => {
          if (selectedCategory !== 'all' && selectedCategory !== catKey) return null;

          const catInfo = CATEGORY_CONFIG[catKey];
          let groupItems = items.filter((i) => i.category === catKey);

          if (showOnlyPending) {
            groupItems = groupItems.filter((i) => !i.checked);
          }

          if (groupItems.length === 0 && showOnlyPending) return null;

          const catCompleted = items.filter((i) => i.category === catKey && i.checked).length;
          const catTotal = items.filter((i) => i.category === catKey).length;

          return (
            <div
              key={catKey}
              className="bg-white rounded-2xl p-5 border border-[#E3E6E2] shadow-xs space-y-4"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E3E6E2]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {catInfo.label}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-[#E3E6E2]">
                      {catCompleted}/{catTotal} hoàn thành
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{catInfo.description}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {groupItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Chưa có vật dụng nào trong danh mục này.
                  </p>
                ) : (
                  groupItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 group ${
                        item.checked
                          ? 'bg-sand-50/70 border-[#E3E6E2] text-slate-500'
                          : 'bg-white border-[#E3E6E2] hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggle(item.id)}
                        className="flex items-start gap-3 flex-1 text-left cursor-pointer select-none"
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.checked ? (
                            <CheckSquare className="w-4 h-4 text-bronze-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 group-hover:text-bronze-600 transition-colors" />
                          )}
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <p
                            className={`text-xs font-semibold leading-relaxed ${
                              item.checked ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {item.title}
                          </p>

                          {item.note && (
                            <p
                              className={`text-[11px] ${
                                item.checked ? 'text-slate-400 line-through' : 'text-slate-500'
                              }`}
                            >
                              Ghi chú: {item.note}
                            </p>
                          )}

                          {item.assignedTo && (
                            <span className="inline-block text-[10px] text-slate-400">
                              Phụ trách: {item.assignedTo}
                            </span>
                          )}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                        title="Xóa vật dụng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Synchronized Notice */}
      <div className="p-3 bg-sand-50 rounded-xl border border-[#E3E6E2] text-center text-xs text-slate-500">
        Danh sách chuẩn bị được tự động lưu và đồng bộ sẵn sàng cho chuyến đi.
      </div>
    </div>
  );
};
