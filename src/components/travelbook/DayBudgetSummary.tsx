import React, { useState } from 'react';
import { DollarSign, Plus, Check } from 'lucide-react';
import { DayExpenseItem } from '../../types';

interface DayBudgetSummaryProps {
  estimatedMin: number;
  estimatedMax: number;
  expenses?: DayExpenseItem[];
  onAddExpense: (newExpense: DayExpenseItem) => void;
}

export const DayBudgetSummary: React.FC<DayBudgetSummaryProps> = ({
  estimatedMin,
  estimatedMax,
  expenses = [],
  onAddExpense,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'di_chuyen' | 'an_uong' | 'tham_quan' | 'luu_tru' | 'khac'>('an_uong');

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSave = () => {
    if (!title || !amount) return;
    onAddExpense({
      id: 'exp-' + Date.now(),
      title,
      amount: Number(amount),
      category,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    });
    setTitle('');
    setAmount('');
    setShowAddModal(false);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'di_chuyen':
        return 'Di chuyển';
      case 'an_uong':
        return 'Ăn uống';
      case 'tham_quan':
        return 'Tham quan';
      case 'luu_tru':
        return 'Lưu trú';
      default:
        return 'Khác';
    }
  };

  return (
    <div className="bg-white rounded-[22px] p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#2E8B57]" />
          <h4 className="text-sm font-extrabold text-slate-900">Chi phí trong ngày</h4>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-xl bg-[#2E8B57] hover:bg-[#246e45] text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ghi khoản chi</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Dự kiến hôm nay</span>
          <p className="text-sm font-black text-slate-900">
            {(estimatedMin / 1000000).toFixed(1)} – {(estimatedMax / 1000000).toFixed(1)} tr VNĐ
          </p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Đã thực chi</span>
          <p className="text-sm font-black text-[#2E8B57]">
            {new Intl.NumberFormat('vi-VN').format(totalSpent)} đ
          </p>
        </div>
      </div>

      {/* Expenses Logged List */}
      {expenses.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            CÁC KHOẢN ĐÃ GHI ({expenses.length})
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white rounded border text-slate-600">
                    {getCategoryLabel(exp.category)}
                  </span>
                  <span className="font-bold text-slate-900">{exp.title}</span>
                </div>
                <span className="font-black text-slate-900">
                  {new Intl.NumberFormat('vi-VN').format(exp.amount)} đ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-left">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#2E8B57]" />
              Ghi nhận khoản chi mới
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên khoản chi</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ăn bún chìa, Taxi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số tiền (VNĐ)</label>
                <input
                  type="number"
                  placeholder="250000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phân loại</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  <option value="an_uong">Ăn uống</option>
                  <option value="di_chuyen">Di chuyển</option>
                  <option value="tham_quan">Vé tham quan</option>
                  <option value="luu_tru">Lưu trú</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-[#2E8B57] text-white text-xs font-bold hover:bg-[#246e45]"
              >
                Lưu khoản chi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
