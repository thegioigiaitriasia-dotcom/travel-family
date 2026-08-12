import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Share2,
  Plus,
  Compass,
  Utensils,
  DollarSign,
  CheckSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { TravelBook, TravelBookDay, TravelActivity, DayExpenseItem } from '../../types';
import { TripDaySidebar } from './TripDaySidebar';
import { DayHeader } from './DayHeader';
import { TimelineConflictAlert } from './TimelineConflictAlert';
import { ActivityTimeline } from './ActivityTimeline';
import { AlternativePlanCard } from './AlternativePlanCard';
import { AlternativePlanPreviewDialog } from './AlternativePlanPreviewDialog';
import { DayBudgetSummary } from './DayBudgetSummary';
import { DayFoodSummary } from './DayFoodSummary';
import { DayPackingList } from './DayPackingList';
import { PreparationChecklistModal } from './PreparationChecklistModal';
import { FamilyNoteCard } from './FamilyNoteCard';
import { AddActivityDrawer } from './AddActivityDrawer';
import { ActivityEditorDrawer } from './ActivityEditorDrawer';
import { DeleteActivityDialog } from './DeleteActivityDialog';
import { OfflineBanner } from './OfflineBanner';
import { MapModal } from './MapModal';

interface TripDayPageProps {
  trip: TravelBook;
  dayNumber: number;
  onSelectTab: (tab: 'overview' | 'checklist' | number) => void;
  onEditTrip?: () => void;
  onOpenShare?: () => void;
  onUpdateTripDay?: (updatedDay: TravelBookDay) => void;
  onOpenBookingVault?: (typeFilter?: string) => void;
}

export const TripDayPage: React.FC<TripDayPageProps> = ({
  trip,
  dayNumber,
  onSelectTab,
  onEditTrip = () => {},
  onOpenShare = () => {},
  onUpdateTripDay,
  onOpenBookingVault,
}) => {
  // Find current day
  const rawDay = trip.days.find((d) => d.dayNumber === dayNumber) || trip.days[0];
  
  // Sửa lỗi các trip cũ bị dính 2 khoảng giá siêu to (ví dụ: > 50 triệu)
  const fixedActivities = (rawDay.activities || []).map((act) => {
    let cost = act.estimatedCost || 0;
    if (cost > 50000000) {
      const strCost = String(cost);
      cost = parseInt(strCost.substring(0, Math.floor(strCost.length / 2))) || 0;
      if (cost > 50000000) cost = 500000;
    }
    return { ...act, estimatedCost: cost };
  });

  const day = { ...rawDay, activities: fixedActivities };

  // Local state for interactive features
  const [currentDayData, setCurrentDayData] = useState<TravelBookDay>({
    ...day,
    activities: day.activities || [],
    expenses: day.expenses || [],
    packingItems: day.packingItems || [],
    alternativePlans: day.alternativePlans || [],
  });

  const dayEstimatedTotal = currentDayData.activities.reduce(
    (sum, act) => sum + (act.estimatedCost || 0),
    0
  );

  // Sync state when day prop changes (user clicks on another Day tab)
  useEffect(() => {
    setCurrentDayData({
      ...day,
      activities: day.activities || [],
      expenses: day.expenses || [],
      packingItems: day.packingItems || [],
      alternativePlans: day.alternativePlans || [],
    });
    setMapLocationName(day.destinationName);
  }, [day]);

  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<TravelActivity | null>(null);
  const [isAltPlanPreviewOpen, setIsAltPlanPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  // Map Modal
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [mapLocationName, setMapLocationName] = useState(currentDayData.destinationName);

  // Mobile Accordion state for Right Sidebar
  const [mobileBudgetOpen, setMobileBudgetOpen] = useState(true);
  const [mobileFoodOpen, setMobileFoodOpen] = useState(false);
  const [mobilePackingOpen, setMobilePackingOpen] = useState(true);
  const [mobileNotesOpen, setMobileNotesOpen] = useState(false);

  // Offline / Sync status state
  const [isOffline, setIsOffline] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper to sync changes up
  const handleUpdateDay = (updated: TravelBookDay) => {
    setCurrentDayData(updated);
    setHasUnsavedChanges(true);
    if (onUpdateTripDay) {
      onUpdateTripDay(updated);
    }
  };

  // Activity Status Toggle
  const handleToggleActivityStatus = (activityId: string) => {
    const updatedActivities = currentDayData.activities.map((act) => {
      if (act.id === activityId) {
        const nextStatus =
          act.status === 'completed'
            ? 'upcoming'
            : act.status === 'upcoming'
            ? 'current'
            : 'completed';
        return { ...act, status: nextStatus };
      }
      return act;
    });

    handleUpdateDay({ ...currentDayData, activities: updatedActivities });
  };

  // Add Activity
  const handleAddActivity = (newAct: TravelActivity) => {
    const updatedActivities = [...currentDayData.activities, newAct];
    handleUpdateDay({ ...currentDayData, activities: updatedActivities });
  };

  // Edit / Save Activity
  const handleSaveEditedActivity = (updatedAct: TravelActivity) => {
    const updatedActivities = currentDayData.activities.map((a) =>
      a.id === updatedAct.id ? updatedAct : a
    );
    handleUpdateDay({ ...currentDayData, activities: updatedActivities });
  };

  // Duplicate Activity
  const handleDuplicateActivity = (act: TravelActivity) => {
    const duplicated: TravelActivity = {
      ...act,
      id: `act-dup-${Date.now()}`,
      title: `${act.title} (Bản sao)`,
    };
    const updatedActivities = [...currentDayData.activities, duplicated];
    handleUpdateDay({ ...currentDayData, activities: updatedActivities });
  };

  // Move Activity to Another Day
  const handleMoveActivityDay = (activityId: string, targetDayNumber: number) => {
    const updatedActivities = currentDayData.activities.filter((a) => a.id !== activityId);
    handleUpdateDay({ ...currentDayData, activities: updatedActivities });
    alert(`Đã chuyển hoạt động sang NGÀY ${targetDayNumber}`);
  };

  // Shift Activity Order Up/Down
  const handleShiftActivity = (activityId: string, direction: 'up' | 'down') => {
    const idx = currentDayData.activities.findIndex((a) => a.id === activityId);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentDayData.activities.length) return;

    const arr = [...currentDayData.activities];
    const temp = arr[idx];
    arr[idx] = arr[targetIdx];
    arr[targetIdx] = temp;

    handleUpdateDay({ ...currentDayData, activities: arr });
  };

  // Replace Activity by AI
  const handleReplaceActivityAI = (
    activityId: string,
    newTitle: string,
    newPlaceName: string,
    newCost?: number
  ) => {
    const updatedActivities = currentDayData.activities.map((a) => {
      if (a.id === activityId) {
        return {
          ...a,
          title: newTitle,
          status: 'changed' as const,
          estimatedCost: newCost ?? a.estimatedCost,
          place: a.place
            ? { ...a.place, name: newPlaceName }
            : { name: newPlaceName },
        };
      }
      return a;
    });
    handleUpdateDay({ ...currentDayData, activities: updatedActivities });
  };

  // Apply Alternative Plan
  const handleApplyAlternativePlan = () => {
    if (!currentDayData.alternativePlans?.[0]) return;
    const plan = currentDayData.alternativePlans[0];

    const newActivities: TravelActivity[] = plan.suggestions.map((sug, i) => ({
      id: `alt-act-${Date.now()}-${i}`,
      title: sug,
      type: 'experience',
      startTime: `${14 + i}:00`,
      endTime: `${15 + i}:30`,
      status: 'upcoming',
      description: 'Phương án dự phòng khi thời tiết xấu hoặc có thay đổi.',
    }));

    handleUpdateDay({
      ...currentDayData,
      activities: [...currentDayData.activities, ...newActivities],
    });
  };

  // Add Expense
  const handleAddExpense = (exp: DayExpenseItem) => {
    const updatedExpenses = [...(currentDayData.expenses || []), exp];
    handleUpdateDay({ ...currentDayData, expenses: updatedExpenses });
  };

  // Toggle Packing
  const handleTogglePacking = (itemId: string) => {
    const updatedItems = currentDayData.packingItems.map((item) =>
      item.id === itemId ? { ...item, isPacked: !item.isPacked } : item
    );
    handleUpdateDay({ ...currentDayData, packingItems: updatedItems });
  };

  // Update Family Note
  const handleUpdateFamilyNote = (noteText: string) => {
    handleUpdateDay({ ...currentDayData, familyNote: noteText });
  };

  // Open Map
  const handleOpenMap = (placeName: string) => {
    setMapLocationName(placeName);
    setIsMapOpen(true);
  };

  // Scroll to Next Activity on Mobile
  const handleScrollToNextActivity = () => {
    const nextAct = currentDayData.activities.find(
      (a) => a.status === 'current' || a.status === 'upcoming'
    );
    if (nextAct) {
      const el = document.getElementById(`activity-card-${nextAct.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="bg-[#F7F6F0] min-h-screen text-[#1D211F] font-sans pb-28 md:pb-12">
      {/* Container constraints */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-4 sm:py-6 space-y-6">
        {/* Offline & Sync Banner */}
        <OfflineBanner
          isOffline={isOffline}
          hasUnsavedChanges={hasUnsavedChanges}
          onSaveNow={() => setHasUnsavedChanges(false)}
        />

        {/* 3. Main Desktop 3-Column Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[180px_minmax(0,1fr)_320px] gap-6 items-start">
          {/* Left Sidebar (Desktop Day List) */}
          <TripDaySidebar
            days={trip.days}
            selectedDayNumber={currentDayData.dayNumber}
            onSelectDay={(num) => onSelectTab(num)}
          />

          {/* Center Column: Main Timeline & Day Content */}
          <main className="space-y-6 min-w-0">
            {/* Day Header */}
            <DayHeader
              dayNumber={currentDayData.dayNumber}
              dateStr={currentDayData.dateStr}
              title={currentDayData.title}
              summary={currentDayData.summary}
              pace={currentDayData.pace}
              mainTransport={currentDayData.mainTransport}
              activityCount={currentDayData.activities.length}
              weatherForecast={currentDayData.weatherForecast}
              onAddActivity={() => setIsAddActivityOpen(true)}
              onDeleteAllActivities={() => {
                setIsDeleteAll(true);
                setIsDeleteOpen(true);
              }}
            />

            {/* Empty State or Activity Timeline */}
            {currentDayData.activities.length === 0 ? (
              <div className="bg-white rounded-[24px] p-8 border border-slate-200 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-red-50 text-bronze-600 flex items-center justify-center mx-auto border border-red-100">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">
                    Ngày này chưa có hoạt động nào
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Hãy thêm lịch trình đầu tiên hoặc để AI hỗ trợ gợi ý nhanh.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddActivityOpen(true)}
                    className="px-4 py-2.5 bg-bronze-600 hover:bg-[#B91C1C] text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm hoạt động</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleAddActivity({
                        id: `ai-act-${Date.now()}`,
                        title: 'Ăn trưa đặc sản Mì Quảng & Bánh tráng thịt heo',
                        type: 'food',
                        startTime: '12:00',
                        endTime: '13:30',
                        status: 'upcoming',
                        description: 'Thưởng thức món ăn truyền thống nổi tiếng địa phương.',
                      });
                    }}
                    className="px-4 py-2.5 bg-bronze-50 hover:bg-bronze-100 text-bronze-900 border border-bronze-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-bronze-600" />
                    <span>AI Gợi ý lịch trình</span>
                  </button>
                </div>
              </div>
            ) : (
              <ActivityTimeline
                activities={currentDayData.activities}
                onToggleStatus={handleToggleActivityStatus}
                onEdit={(act) => setEditingActivity(act)}
                onAIReplace={(act) => setEditingActivity(act)}
                onOpenMap={handleOpenMap}
                onOpenBookingVault={onOpenBookingVault}
                onDelete={(id) => {
                  setDeleteTargetId(id);
                  setIsDeleteAll(false);
                  setIsDeleteOpen(true);
                }}
              />
            )}

            {/* Alternative Rain Plan Card */}
            {currentDayData.alternativePlans && currentDayData.alternativePlans.length > 0 && (
              <AlternativePlanCard
                plans={currentDayData.alternativePlans}
                onApplyPlan={() => setIsAltPlanPreviewOpen(true)}
              />
            )}
          </main>

          {/* Right Sidebar: Day Summary (Sticky Desktop, Accordions Mobile) */}
          <aside className="space-y-6 sticky top-[104px] align-self-start">
            {/* Desktop View: Full Cards */}
            <div className="hidden xl:block space-y-6">
              <DayBudgetSummary
                estimatedMin={currentDayData.estimatedCostMin || dayEstimatedTotal}
                estimatedMax={currentDayData.estimatedCostMax || dayEstimatedTotal}
                expenses={currentDayData.expenses}
                onAddExpense={handleAddExpense}
              />

              <DayFoodSummary mustTryFoods={currentDayData.mustTryFoods} />

              <DayPackingList
                items={currentDayData.packingItems}
                onToggleItem={handleTogglePacking}
                onOpenFullChecklist={() => onSelectTab('checklist')}
              />

              <FamilyNoteCard
                note={currentDayData.familyNote}
                onUpdateNote={handleUpdateFamilyNote}
              />
            </div>

            {/* Mobile View: Accordion Sections */}
            <div className="xl:hidden space-y-3">
              {/* Accordion 1: Chi phí */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setMobileBudgetOpen(!mobileBudgetOpen)}
                  className="w-full p-4 flex items-center justify-between font-black text-xs text-slate-900 bg-sand-50/50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-bronze-600" />
                    <span>Chi phí hôm nay</span>
                  </div>
                  {mobileBudgetOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {mobileBudgetOpen && (
                  <div className="p-4 border-t border-slate-100">
                    <DayBudgetSummary
                      estimatedMin={currentDayData.estimatedCostMin || dayEstimatedTotal}
                      estimatedMax={currentDayData.estimatedCostMax || dayEstimatedTotal}
                      expenses={currentDayData.expenses}
                      onAddExpense={handleAddExpense}
                    />
                  </div>
                )}
              </div>

              {/* Accordion 2: Ăn uống */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setMobileFoodOpen(!mobileFoodOpen)}
                  className="w-full p-4 flex items-center justify-between font-black text-xs text-slate-900 bg-sand-50/50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-bronze-500" />
                    <span>Gợi ý ăn uống</span>
                  </div>
                  {mobileFoodOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {mobileFoodOpen && (
                  <div className="p-4 border-t border-slate-100">
                    <DayFoodSummary mustTryFoods={currentDayData.mustTryFoods} />
                  </div>
                )}
              </div>

              {/* Accordion 3: Cần mang theo */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setMobilePackingOpen(!mobilePackingOpen)}
                  className="w-full p-4 flex items-center justify-between font-black text-xs text-slate-900 bg-sand-50/50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-bronze-600" />
                    <span>Cần chuẩn bị ({(currentDayData.packingItems || []).filter((i: any) => i.checked || i.isPacked).length}/{(currentDayData.packingItems || []).length})</span>
                  </div>
                  {mobilePackingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {mobilePackingOpen && (
                  <div className="p-4 border-t border-slate-100">
                    <DayPackingList
                      items={currentDayData.packingItems}
                      onToggleItem={handleTogglePacking}
                      onOpenFullChecklist={() => onSelectTab('checklist')}
                    />
                  </div>
                )}
              </div>

              {/* Accordion 4: Ghi chú */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setMobileNotesOpen(!mobileNotesOpen)}
                  className="w-full p-4 flex items-center justify-between font-black text-xs text-slate-900 bg-sand-50/50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-bronze-500" />
                    <span>Ghi chú gia đình</span>
                  </div>
                  {mobileNotesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {mobileNotesOpen && (
                  <div className="p-4 border-t border-slate-100">
                    <FamilyNoteCard
                      note={currentDayData.familyNote}
                      onUpdateNote={handleUpdateFamilyNote}
                    />
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-2xl xl:hidden flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsAddActivityOpen(true)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-bronze-600 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm HĐ</span>
        </button>

        <button
          type="button"
          onClick={() => handleOpenMap(currentDayData.destinationName)}
          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 border border-slate-200 cursor-pointer shrink-0"
        >
          <MapPin className="w-3.5 h-3.5 text-bronze-600" />
          <span>Bản đồ</span>
        </button>

        <button
          type="button"
          onClick={handleScrollToNextActivity}
          className="py-2.5 px-3 rounded-xl bg-bronze-500 hover:bg-bronze-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm cursor-pointer shrink-0"
        >
          <span>HĐ Tiếp theo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dialogs & Drawers */}
      <AddActivityDrawer
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        onSave={handleAddActivity}
      />

      <ActivityEditorDrawer
        activity={editingActivity}
        isOpen={!!editingActivity}
        totalDays={trip.days.length}
        currentDayNumber={currentDayData.dayNumber}
        onClose={() => setEditingActivity(null)}
        onSave={handleSaveEditedActivity}
        onDelete={(id) => {
          const updated = currentDayData.activities.filter((a) => a.id !== id);
          handleUpdateDay({ ...currentDayData, activities: updated });
        }}
        onDuplicate={handleDuplicateActivity}
        onMoveDay={handleMoveActivityDay}
        onShiftUp={(id) => handleShiftActivity(id, 'up')}
        onShiftDown={(id) => handleShiftActivity(id, 'down')}
        onReplaceAI={handleReplaceActivityAI}
      />

      <AlternativePlanPreviewDialog
        isOpen={isAltPlanPreviewOpen}
        onClose={() => setIsAltPlanPreviewOpen(false)}
        onConfirmApply={handleApplyAlternativePlan}
        plan={currentDayData.alternativePlans?.[0]}
      />

      <DeleteActivityDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        isAll={isDeleteAll}
        onConfirm={() => {
          if (isDeleteAll) {
            handleUpdateDay({ ...currentDayData, activities: [] });
          } else if (deleteTargetId) {
            const updated = currentDayData.activities.filter(
              (a) => a.id !== deleteTargetId
            );
            handleUpdateDay({ ...currentDayData, activities: updated });
          }
        }}
      />

      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        placeName={mapLocationName}
        trip={trip}
        currentDayNumber={dayNumber}
      />

      <PreparationChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        tripTitle={trip.title}
      />
    </div>
  );
};
