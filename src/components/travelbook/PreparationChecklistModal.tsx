import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Filter,
  Sparkles,
  FileText,
  Shirt,
  Pill,
  Smartphone,
  Baby,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export interface ChecklistItem {
  id: string;
  category: 'giay_to' | 'trang_phuc' | 'y_te' | 'cong_nghe' | 'do_be' | 'khac';
  title: string;
  note?: string;
  checked: boolean;
  assignedTo?: string; // e.g., "Phúc (Bố)", "Mẹ", "Chung"
}

const CATEGORY_MAP: Record<
  ChecklistItem['category'],
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  giay_to: {
    label: 'Giấy tờ & Tiền tệ',
    icon: <FileText className="w-4 h-4 text-blue-600" />,
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  trang_phuc: {
    label: 'Trang phục & Phụ kiện',
    icon: <Shirt className="w-4 h-4 text-red-600" />,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  y_te: {
    label: 'Y tế & Tủ thuốc',
    icon: <Pill className="w-4 h-4 text-rose-600" />,
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
  },
  cong_nghe: {
    label: 'Công nghệ & Sạc',
    icon: <Smartphone className="w-4 h-4 text-amber-600" />,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  do_be: {
    label: 'Đồ dùng Trẻ em / Người lớn',
    icon: <Baby className="w-4 h-4 text-purple-600" />,
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
  },
  khac: {
    label: 'Vật dụng khác',
    icon: <CheckSquare className="w-4 h-4 text-slate-600" />,
    color: 'text-slate-700',
    bg: 'bg-slate-50 border-slate-200',
  },
};

const initialChecklist: ChecklistItem[] = [
  // Giấy tờ
  {
    id: 'ck-1',
    category: 'giay_to',
    title: 'Căn cước công dân / Hộ chiếu bản chính (4 người)',
    note: 'Bắt buộc check-in sân bay',
    checked: true,
    assignedTo: 'Phúc (Trưởng nhóm)',
  },
  {
    id: 'ck-2',
    category: 'giay_to',
    title: 'Mã đặt chỗ vé máy bay Vietjet & Bamboo Air',
    note: 'Lưu điện thoại offline & in PDF',
    checked: true,
    assignedTo: 'Phúc (Trưởng nhóm)',
  },
  {
    id: 'ck-3',
    category: 'giay_to',
    title: 'Xác nhận đặt phòng Melia Vinpearl Danang & Resort Hội An',
    checked: true,
    assignedTo: 'Mẹ',
  },
  {
    id: 'ck-4',
    category: 'giay_to',
    title: 'Tiền mặt khoảng 3.000.000 VNĐ & Thẻ ngân hàng ATM',
    note: 'Chi tiêu mua đặc sản mì Quảng, quà lưu niệm',
    checked: false,
    assignedTo: 'Chung',
  },

  // Trang phục
  {
    id: 'ck-5',
    category: 'trang_phuc',
    title: 'Quần áo mát mẻ 4 ngày 3 đêm cho từng người',
    checked: true,
    assignedTo: 'Mẹ',
  },
  {
    id: 'ck-6',
    category: 'trang_phuc',
    title: 'Đồ bơi & Khăn tắm biển Mỹ Khê',
    checked: true,
    assignedTo: 'Chung',
  },
  {
    id: 'ck-7',
    category: 'trang_phuc',
    title: 'Nón rộng vành, kính mát & áo chống nắng',
    checked: false,
    assignedTo: 'Chung',
  },
  {
    id: 'ck-8',
    category: 'trang_phuc',
    title: 'Giày thể thao nhẹ đi Bà Nà Hills & Dép xỏ ngón',
    checked: true,
    assignedTo: 'Chung',
  },

  // Y tế
  {
    id: 'ck-9',
    category: 'y_te',
    title: 'Thuốc say xe / Say tàu cho chuyến bay & di chuyển',
    note: 'Uống trước 30 phút khởi hành',
    checked: true,
    assignedTo: 'Mẹ',
  },
  {
    id: 'ck-10',
    category: 'y_te',
    title: 'Thuốc hạ sốt, tiêu hóa & Băng gạc cá nhân',
    checked: true,
    assignedTo: 'Mẹ',
  },
  {
    id: 'ck-11',
    category: 'y_te',
    title: 'Xịt chống muỗi Tây Nguyên & Kem chống nắng SPF 50+',
    checked: false,
    assignedTo: 'Phúc (Trưởng nhóm)',
  },
  {
    id: 'ck-12',
    category: 'y_te',
    title: 'Nước rửa tay khô & Khăn giấy ướt sát khuẩn',
    checked: true,
    assignedTo: 'Chung',
  },

  // Công nghệ
  {
    id: 'ck-13',
    category: 'cong_nghe',
    title: 'Sạc dự phòng 20.000mAh đã sạc đầy 100%',
    checked: true,
    assignedTo: 'Phúc (Trưởng nhóm)',
  },
  {
    id: 'ck-14',
    category: 'cong_nghe',
    title: 'Củ sạc nhanh đa cổng & Dây sạc iPhone/Android',
    checked: true,
    assignedTo: 'Phúc (Trưởng nhóm)',
  },
  {
    id: 'ck-15',
    category: 'cong_nghe',
    title: 'Gậy chụp ảnh selfie & Máy ảnh du lịch',
    checked: false,
    assignedTo: 'Phúc (Trưởng nhóm)',
  },

  // Đồ dùng bé
  {
    id: 'ck-16',
    category: 'do_be',
    title: 'Bình nước cá nhân cho bé & Đồ chơi nhỏ cầm tay',
    checked: false,
    assignedTo: 'Mẹ',
  },
  {
    id: 'ck-17',
    category: 'do_be',
    title: 'Sữa hộp pha sẵn & Bánh ăn nhẹ dọc đường',
    checked: true,
    assignedTo: 'Mẹ',
  },
];

interface PreparationChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle?: string;
}

export const PreparationChecklistModal: React.FC<PreparationChecklistModalProps> = ({
  isOpen,
  onClose,
  tripTitle = 'Đà Nẵng – Hội An',
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(initialChecklist);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  // New Item State
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ChecklistItem['category']>('giay_to');
  const [newItemNote, setNewItemNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  // Progress Calculation
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.checked).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter Items
  const filteredItems = items.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (showOnlyPending && item.checked) return false;
    return true;
  });

  const handleToggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const newItem: ChecklistItem = {
      id: `ck-${Date.now()}`,
      category: newItemCategory,
      title: newItemTitle.trim(),
      note: newItemNote.trim() || undefined,
      checked: false,
      assignedTo: 'Gia đình',
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemTitle('');
    setNewItemNote('');
    setIsAdding(false);
  };

  const handleSelectAll = (check: boolean) => {
    setItems((prev) => prev.map((i) => ({ ...i, checked: check })));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#DC2626] flex items-center justify-center border border-emerald-200">
              <CheckSquare className="w-5 h-5 text-[#DC2626]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Danh sách chuẩn bị đồ dùng gia đình
                </h3>
                <span className="text-[10px] font-semibold bg-[#FEF2F2] text-[#DC2626] px-2 py-0.5 rounded-full border border-[#FECACA] hidden sm:inline-block">
                  {completedCount}/{totalCount} mục xong
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5 line-clamp-1">
                Chuyến đi: <span className="font-semibold text-slate-800">{tripTitle}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 font-bold cursor-pointer transition-colors"
            title="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Overview Banner */}
        <div className="bg-[#FEF2F2]/60 p-4 sm:px-6 border-b border-emerald-100 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C98745]" />
              <span className="text-slate-800">
                Tiến độ xếp hành lý:{' '}
                <span className="text-[#DC2626] font-extrabold">{completedCount} mục đã chuẩn bị</span>
              </span>
            </div>
            <span className="text-[#DC2626] font-black text-sm">{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-emerald-200/80 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
            <span>
              {totalCount - completedCount > 0 ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 inline" />
                  Còn {totalCount - completedCount} mục chưa xếp vào vali
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 inline" />
                  Tuyệt vời! Đã chuẩn bị đầy đủ 100%
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-[11px] text-[#DC2626] font-bold hover:underline cursor-pointer"
              >
                Chọn tất cả
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-[11px] text-slate-500 font-medium hover:underline cursor-pointer"
              >
                Bỏ chọn hết
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar & Controls */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất cả ({totalCount})
            </button>
            {Object.entries(CATEGORY_MAP).map(([catKey, catMeta]) => {
              const catCount = items.filter((i) => i.category === catKey).length;
              if (catCount === 0 && activeCategory !== catKey) return null;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === catKey
                      ? 'bg-[#DC2626] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {catMeta.icon}
                  <span>{catMeta.label}</span>
                  <span className="opacity-75 font-mono">({catCount})</span>
                </button>
              );
            })}
          </div>

          {/* Action toggle + Add Item */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnlyPending}
                onChange={(e) => setShowOnlyPending(e.target.checked)}
                className="rounded text-[#DC2626] focus:ring-[#DC2626]"
              />
              <span>Chưa xong</span>
            </label>

            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm đồ</span>
            </button>
          </div>
        </div>

        {/* Add Item Drawer Form */}
        {isAdding && (
          <form
            onSubmit={handleAddItem}
            className="p-4 bg-emerald-50/70 border-b border-emerald-200 space-y-3 animate-fadeIn shrink-0"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#DC2626] uppercase tracking-wider">
                Thêm món đồ cần chuẩn bị mới
              </h4>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Tên món đồ (ví dụ: Sạc tai nghe, Áo khoác mỏng...)"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                className="sm:col-span-2 px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                autoFocus
              />

              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              >
                {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ghi chú thêm (không bắt buộc)..."
                value={newItemNote}
                onChange={(e) => setNewItemNote(e.target.value)}
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              />
              <button
                type="submit"
                disabled={!newItemTitle.trim()}
                className="px-4 py-2 bg-[#DC2626] text-white rounded-xl font-bold text-xs hover:bg-[#B91C1C] disabled:opacity-50 cursor-pointer transition-colors"
              >
                Lưu món đồ
              </button>
            </div>
          </form>
        )}

        {/* Item List Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                Không tìm thấy đồ dùng trong mục này
              </p>
              <p className="text-[11px] text-slate-400">
                Hãy nhấn nút "Thêm đồ" ở trên để bổ sung đồ đạc cho chuyến đi.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const catMeta = CATEGORY_MAP[item.category];

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 group ${
                    item.checked
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : 'bg-white border-slate-200/90 hover:border-emerald-300 text-slate-800 shadow-xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleCheck(item.id)}
                    className="flex items-start gap-3 flex-1 text-left cursor-pointer group-hover:opacity-95"
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.checked ? (
                        <CheckSquare className="w-5 h-5 text-red-600 stroke-[2.5]" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-bold text-xs sm:text-sm leading-snug ${
                            item.checked ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {item.title}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catMeta.bg} ${catMeta.color}`}
                        >
                          {catMeta.label}
                        </span>
                      </div>

                      {item.note && (
                        <p
                          className={`text-[11px] ${
                            item.checked ? 'text-slate-400 line-through' : 'text-slate-500'
                          }`}
                        >
                          💡 {item.note}
                        </p>
                      )}

                      {item.assignedTo && (
                        <span className="inline-block text-[10px] text-slate-400 font-medium">
                          Phụ trách: {item.assignedTo}
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                    title="Xóa món đồ này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Tự động đồng bộ offline & sẵn sàng tải về điện thoại</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Hoàn tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
