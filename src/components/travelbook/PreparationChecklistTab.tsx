import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square, RefreshCw } from 'lucide-react';

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

const initialChecklistItems: ChecklistItem[] = [
  // Giấy tờ
  {
    id: 'ck-1',
    category: 'giay_to',
    title: 'Căn cước công dân / Hộ chiếu (Tất cả thành viên)',
    note: 'Bắt buộc làm thủ tục sân bay và check-in khách sạn',
    checked: true,
    assignedTo: 'Phúc',
  },
  {
    id: 'ck-2',
    category: 'giay_to',
    title: 'Mã đặt chỗ vé máy bay (Khứ hồi)',
    note: 'Lưu bản PDF offline trên điện thoại',
    checked: true,
    assignedTo: 'Phúc',
  },
  {
    id: 'ck-3',
    category: 'giay_to',
    title: 'Xác nhận đặt phòng khách sạn',
    note: 'Melia Vinpearl Danang & Resort Hội An',
    checked: true,
    assignedTo: 'Mẹ',
  },
  {
    id: 'ck-4',
    category: 'giay_to',
    title: 'Tiền mặt chi tiêu lẻ & Thẻ ngân hàng',
    note: 'Dùng mua quà lưu niệm và ăn uống đặc sản',
    checked: false,
    assignedTo: 'Chung',
  },

  // Đồ dùng cá nhân
  {
    id: 'ck-5',
    category: 'do_ca_nhan',
    title: 'Quần áo du lịch (4 ngày 3 đêm)',
    note: 'Trang phục thoải mái, chụp hình đẹp',
    checked: true,
    assignedTo: 'Mẹ',
  },
  {
    id: 'ck-6',
    category: 'do_ca_nhan',
    title: 'Đồ bơi & Khăn tắm biển',
    note: 'Dùng cho ngày tắm biển Mỹ Khê',
    checked: true,
    assignedTo: 'Chung',
  },
  {
    id: 'ck-7',
    category: 'do_ca_nhan',
    title: 'Nón rộng vành & Kính mát',
    checked: false,
    assignedTo: 'Chung',
  },
  {
    id: 'ck-8',
    category: 'do_ca_nhan',
    title: 'Giày thể thao nhẹ & Dép đi biển',
    checked: true,
    assignedTo: 'Chung',
  },
  {
    id: 'ck-9',
    category: 'do_ca_nhan',
    title: 'Sạc dự phòng & Dây sạc điện thoại',
    checked: true,
    assignedTo: 'Phúc',
  },

  // Y tế
  {
    id: 'ck-10',
    category: 'y_te',
    title: 'Thuốc say xe & Say đèo',
    note: 'Uống trước 30 phút khi di chuyển',
    checked: true,
    assignedTo: 'Mẹ',
  },
  {
    id: 'ck-11',
    category: 'y_te',
    title: 'Thuốc hạ sốt & Thuốc tiêu hóa gia đình',
    checked: true,
    assignedTo: 'Mẹ',
  },
  {
    id: 'ck-12',
    category: 'y_te',
    title: 'Kem chống nắng SPF 50+ & Xịt chống muỗi',
    checked: false,
    assignedTo: 'Phúc',
  },
  {
    id: 'ck-13',
    category: 'y_te',
    title: 'Băng gạc cá nhân & Nước rửa tay khô',
    checked: true,
    assignedTo: 'Chung',
  },
];

interface PreparationChecklistTabProps {
  tripTitle?: string;
}

export const PreparationChecklistTab: React.FC<PreparationChecklistTabProps> = ({
  tripTitle = 'Đà Nẵng – Hội An',
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(initialChecklistItems);
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
              className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
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
            <span className="text-[#DC2626] font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-[#E4E4E7]">
            <div
              className="h-full bg-[#DC2626] transition-all duration-300 rounded-full"
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
                ? 'bg-[#DC2626] text-white'
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
                    ? 'bg-[#DC2626] text-white'
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
            className="rounded border-[#E4E4E7] text-[#DC2626] focus:ring-[#DC2626]"
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
              className="px-4 py-2 bg-[#DC2626] text-white rounded-xl font-bold text-xs hover:bg-[#B91C1C] disabled:opacity-50 cursor-pointer transition-colors"
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
                          ? 'bg-slate-50/70 border-[#E3E6E2] text-slate-500'
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
                            <CheckSquare className="w-4 h-4 text-[#DC2626]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 group-hover:text-[#DC2626] transition-colors" />
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
      <div className="p-3 bg-slate-50 rounded-xl border border-[#E3E6E2] text-center text-xs text-slate-500">
        Danh sách chuẩn bị được tự động lưu và đồng bộ sẵn sàng cho chuyến đi.
      </div>
    </div>
  );
};
