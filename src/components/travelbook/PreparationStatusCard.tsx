import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react';

export interface PreparationRowItem {
  id: string;
  label: string; // e.g. "Vé máy bay", "Khách sạn", "Xe limousine", "Danh sách chuẩn bị", "Chia sẻ với gia đình"
  status: 'completed' | 'attention' | 'pending';
  value: string; // e.g. "Đã xác nhận", "Đã đặt", "Chưa đặt", "8/12 mục", "3/4 người"
  routeKey?: string;
}

interface PreparationStatusCardProps {
  items?: PreparationRowItem[];
  progressPercent?: number; // default calculated or 68
  onSelectRow?: (item: PreparationRowItem) => void;
  onOpenChecklistModal?: () => void;
}

const defaultPrepItems: PreparationRowItem[] = [
  {
    id: 'prep-flight',
    label: 'Vé máy bay',
    status: 'completed',
    value: 'Đã xác nhận',
    routeKey: 'flight',
  },
  {
    id: 'prep-hotel',
    label: 'Khách sạn',
    status: 'completed',
    value: 'Đã đặt',
    routeKey: 'hotel',
  },
  {
    id: 'prep-limo',
    label: 'Xe limousine',
    status: 'attention',
    value: 'Chưa đặt',
    routeKey: 'transport',
  },
  {
    id: 'prep-checklist',
    label: 'Danh sách chuẩn bị',
    status: 'attention',
    value: '8/12 mục',
    routeKey: 'checklist',
  },
  {
    id: 'prep-share',
    label: 'Chia sẻ với gia đình',
    status: 'attention',
    value: '3/4 người',
    routeKey: 'share',
  },
];

export const PreparationStatusCard: React.FC<PreparationStatusCardProps> = ({
  items = defaultPrepItems,
  progressPercent = 68,
  onSelectRow,
  onOpenChecklistModal,
}) => {
  const getStatusStyle = (status: PreparationRowItem['status']) => {
    switch (status) {
      case 'completed':
        return {
          text: 'text-[#2E8B57]',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          icon: <CheckCircle2 className="w-4 h-4 text-[#2E8B57]" />,
        };
      case 'attention':
        return {
          text: 'text-amber-700',
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
        };
      case 'pending':
      default:
        return {
          text: 'text-slate-500',
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          icon: <Clock className="w-4 h-4 text-slate-400" />,
        };
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2E8B57] flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Chuẩn bị cho chuyến đi
          </h3>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700">Tiến độ chuẩn bị</span>
          <span className="text-[#2E8B57] font-extrabold">Hoàn thành {progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2E8B57] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* List of items */}
      <div className="space-y-2">
        {items.map((item) => {
          const style = getStatusStyle(item.status);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.routeKey === 'checklist' && onOpenChecklistModal) {
                  onOpenChecklistModal();
                } else {
                  onSelectRow?.(item);
                }
              }}
              className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 transition-all flex items-center justify-between group text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {style.icon}
                <span className="text-xs font-extrabold text-slate-800 group-hover:text-[#DC2626] transition-colors">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${style.bg} ${style.text} border ${style.border}`}>
                  {item.value}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Button to open full Preparation Checklist modal */}
      {onOpenChecklistModal && (
        <button
          type="button"
          onClick={onOpenChecklistModal}
          className="w-full py-2.5 px-3 rounded-2xl bg-[#FEF2F2] hover:bg-[#d8e8e3] text-[#DC2626] border border-[#FECACA] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-[#DC2626]" />
          <span>Mở chi tiết Danh sách chuẩn bị</span>
        </button>
      )}
    </div>
  );
};
