import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, AlertCircle, ChevronRight, ClipboardList } from 'lucide-react';

export interface PreparationRowItem {
  id: string;
  label: string;
  status: 'completed' | 'attention' | 'pending';
  value: string;
  routeKey?: string;
}

interface PreparationStatusCardProps {
  items?: PreparationRowItem[];
  progressPercent?: number;
  onSelectRow?: (item: PreparationRowItem) => void;
  onOpenChecklistModal?: () => void;
}

export const PreparationStatusCard: React.FC<PreparationStatusCardProps> = ({
  items = [],
  progressPercent,
  onSelectRow,
  onOpenChecklistModal,
}) => {
  const computedProgress = progressPercent !== undefined
    ? progressPercent
    : items.length === 0
      ? 0
      : Math.round((items.filter(i => i.status === 'completed').length / items.length) * 100);

  const getStatusStyle = (status: PreparationRowItem['status']) => {
    switch (status) {
      case 'completed':
        return { text: 'text-[#2E8B57]', bg: 'bg-forest-50', border: 'border-forest-100', icon: <CheckCircle2 className="w-4 h-4 text-[#2E8B57]" /> };
      case 'attention':
        return { text: 'text-bronze-700', bg: 'bg-bronze-50', border: 'border-bronze-100', icon: <AlertCircle className="w-4 h-4 text-bronze-600" /> };
      default:
        return { text: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200', icon: <Clock className="w-4 h-4 text-slate-400" /> };
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-forest-50 text-[#2E8B57] flex items-center justify-center border border-forest-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">Chuẩn bị cho chuyến đi</h3>
        </div>
      </div>

      <div className="space-y-1.5 bg-sand-50 p-3 rounded-2xl border border-slate-200/60">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700">Tiến độ chuẩn bị</span>
          <span className="text-[#2E8B57] font-extrabold">Hoàn thành {computedProgress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#2E8B57] transition-all duration-500 rounded-full" style={{ width: `${computedProgress}%` }} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Chua co hang muc chuan bi nao</p>
          <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">Sau khi tao lich trinh, cac muc se tu dong xuat hien tai day.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const style = getStatusStyle(item.status);
            return (
              <button key={item.id} type="button" onClick={() => { if (item.routeKey === 'checklist' && onOpenChecklistModal) { onOpenChecklistModal(); } else { onSelectRow?.(item); } }} className="w-full p-3 rounded-2xl bg-white hover:bg-sand-50 border border-slate-200/80 transition-all flex items-center justify-between group text-left cursor-pointer">
                <div className="flex items-center gap-2.5">{style.icon}<span className="text-xs font-extrabold text-slate-800 group-hover:text-bronze-600 transition-colors">{item.label}</span></div>
                <div className="flex items-center gap-1.5"><span className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${style.bg} ${style.text} border ${style.border}`}>{item.value}</span><ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all" /></div>
              </button>
            );
          })}
        </div>
      )}

      {onOpenChecklistModal && (
        <button type="button" onClick={onOpenChecklistModal} className="w-full py-2.5 px-3 rounded-2xl bg-[#FEF2F2] hover:bg-[#d8e8e3] text-bronze-600 border border-[#FECACA] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer">
          <CheckCircle2 className="w-4 h-4 text-bronze-600" />
          <span>Mo chi tiet Danh sach chuan bi</span>
        </button>
      )}
    </div>
  );
};
