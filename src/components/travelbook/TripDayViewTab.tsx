import React, { useState } from 'react';
import {
  Calendar,
  Gauge,
  CloudSun,
  Plane,
  DollarSign,
  Plus,
  MapPin,
  Share2,
  Sparkles,
} from 'lucide-react';
import { TravelBookDay, TravelActivity, DayExpenseItem } from '../../types';
import { ActivityCard } from './ActivityCard';
import { TransportConnector } from './TransportConnector';
import { AlternativePlanCard } from './AlternativePlanCard';
import { DayFoodSummary } from './DayFoodSummary';
import { DayBudgetSummary } from './DayBudgetSummary';
import { DayPackingList } from './DayPackingList';
import { FamilyNoteCard } from './FamilyNoteCard';

interface TripDayViewTabProps {
  day: TravelBookDay;
  onToggleActivityStatus: (activityId: string) => void;
  onEditActivity: (act: TravelActivity) => void;
  onAIReplaceActivity: (act: TravelActivity) => void;
  onAddActivity: () => void;
  onAddExpense: (exp: DayExpenseItem) => void;
  onTogglePackingItem: (itemId: string) => void;
  onUpdateFamilyNote: (note: string) => void;
  onApplyAlternativePlan: (planId: string) => void;
  onOpenMap: (placeName: string) => void;
  onOpenShare: () => void;
}

export const TripDayViewTab: React.FC<TripDayViewTabProps> = ({
  day,
  onToggleActivityStatus,
  onEditActivity,
  onAIReplaceActivity,
  onAddActivity,
  onAddExpense,
  onTogglePackingItem,
  onUpdateFamilyNote,
  onApplyAlternativePlan,
  onOpenMap,
  onOpenShare,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-24 md:pb-6">
      {/* 1. Tiêu đề & Tóm tắt ngày Header */}
      <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#DC2626]">
              NGÀY {day.dayNumber} · {day.dateStr}
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {day.title}
            </h2>
            {day.summary && (
              <p className="text-xs text-slate-500 font-medium mt-1">{day.summary}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onAddActivity}
            className="px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-xs transition-all shadow-md shadow-[#DC2626]/20 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm hoạt động</span>
          </button>
        </div>

        {/* Metadata Chips: Nhịp độ, Thời tiết, Di chuyển, Chi phí */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Gauge className="w-3.5 h-3.5 text-[#2E8B57]" />
            <span>
              Nhịp độ:{' '}
              {day.pace === 'relaxed'
                ? 'Thư giãn'
                : day.pace === 'active'
                ? 'Khám phá nhiều'
                : 'Cân bằng'}
            </span>
          </div>

          {day.weatherForecast && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <CloudSun className="w-3.5 h-3.5 text-amber-500" />
              <span>{day.weatherForecast}</span>
            </div>
          )}

          {day.mainTransport && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Plane className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Di chuyển: {day.mainTransport}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-900">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>
              Dự kiến: {(day.estimatedCostMin / 1000000).toFixed(1)}–
              {(day.estimatedCostMax / 1000000).toFixed(1)} tr VNĐ
            </span>
          </div>
        </div>
      </div>

      {/* 2. Timeline hoạt động */}
      <div className="space-y-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 px-1">
          LỊCH TRÌNH TIẾN TRÌNH ({day.activities.length} HOẠT ĐỘNG)
        </h3>

        {day.activities.length === 0 ? (
          <div className="bg-white rounded-[24px] p-8 border border-slate-200 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">Ngày này chưa có hoạt động nào.</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={onAddActivity}
                className="px-4 py-2 bg-[#DC2626] text-white rounded-xl text-xs font-bold"
              >
                + Thêm hoạt động
              </button>
            </div>
          </div>
        ) : (
          <div>
            {day.activities.map((act, idx) => (
              <React.Fragment key={act.id}>
                <ActivityCard
                  activity={act}
                  onToggleStatus={onToggleActivityStatus}
                  onEdit={onEditActivity}
                  onAIReplace={onAIReplaceActivity}
                  onOpenMap={onOpenMap}
                />

                {/* Transport connector between activities */}
                {idx < day.activities.length - 1 && (
                  <TransportConnector transport={act.transportFromPrevious} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* 3. Alternative Rain Plan Card */}
      <AlternativePlanCard
        plans={day.alternativePlans}
        onApplyPlan={onApplyAlternativePlan}
      />

      {/* 4. Food & Budget Summary Cards (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DayFoodSummary mustTryFoods={day.mustTryFoods} />
        <DayBudgetSummary
          estimatedMin={day.estimatedCostMin}
          estimatedMax={day.estimatedCostMax}
          expenses={day.expenses}
          onAddExpense={onAddExpense}
        />
      </div>

      {/* 5. Packing List & Family Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DayPackingList items={day.packingItems} onToggleItem={onTogglePackingItem} />
        <FamilyNoteCard note={day.familyNote} onUpdateNote={onUpdateFamilyNote} />
      </div>

      {/* Sticky Bottom Quick Action Bar on Mobile */}
      <div className="fixed bottom-14 left-0 right-0 z-40 p-3 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-2xl md:hidden flex items-center justify-around gap-2">
        <button
          type="button"
          onClick={onAddActivity}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#DC2626] text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm hoạt động</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenMap(day.destinationName)}
          className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 border border-slate-200"
        >
          <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Bản đồ</span>
        </button>

        <button
          type="button"
          onClick={onOpenShare}
          className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 border border-slate-200"
        >
          <Share2 className="w-3.5 h-3.5 text-[#2E8B57]" />
          <span>Chia sẻ</span>
        </button>
      </div>
    </div>
  );
};
