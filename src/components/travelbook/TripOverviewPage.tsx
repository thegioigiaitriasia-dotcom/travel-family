import React, { useState, useMemo } from 'react';
import { TravelBook, TravelBookDay, UserAuthSession, FamilyMember } from '../../types';
import { MemberItem } from './TripMembersCard';
import { TripHero } from './TripHero';
import { TripDayNavigation } from './TripDayNavigation';
import { TripStatGrid } from './TripStatGrid';
import { TripRouteCard } from './TripRouteCard';
import { AccommodationSection, AccommodationItem } from './AccommodationSection';
import { RecommendedFoodSection } from './RecommendedFoodSection';
import { RecommendedAttractionsSection } from './RecommendedAttractionsSection';
import { PreparationStatusCard, PreparationRowItem } from './PreparationStatusCard';
import { PreparationChecklistModal } from './PreparationChecklistModal';
import { PreparationChecklistTab } from './PreparationChecklistTab';
import { BudgetSummaryCard } from './BudgetSummaryCard';
import { TripMembersCard } from './TripMembersCard';
import { ImportantNotesCard } from './ImportantNotesCard';
import { MobileTripActions } from './MobileTripActions';
import { ShareTripDialog } from './ShareTripDialog';
import { InviteMemberDialog } from './InviteMemberDialog';
import { DeleteTripDialog } from './DeleteTripDialog';
import { AccommodationModal } from './AccommodationModal';
import { MapModal } from './MapModal';
import { PdfPreviewModal } from './PdfPreviewModal';
import { TripOverviewSkeleton } from './TripOverviewSkeleton';
import { TripOverviewError } from './TripOverviewError';
import { TripDayPage } from './TripDayPage';
import { EditActivityDrawer } from './EditActivityDrawer';
import { ReplaceActivityDrawer } from './ReplaceActivityDrawer';
import { BookingVaultModal } from './BookingVaultModal';
import { RouteStopItem } from './TripRouteCard';
import { TravelActivity, DayExpenseItem } from '../../types';

interface TripOverviewPageProps {
  trip?: TravelBook;
  session?: UserAuthSession;
  onNavigateHome?: () => void;
  onNavigateToPlanner?: () => void;
  onNavigateToPlaces?: () => void;
  onNavigateToDiary?: () => void;
  onUpdateTrip?: (updatedFields: Partial<TravelBook>) => void;
  onDeleteTrip?: (tripId: string) => void;
}

export const TripOverviewPage: React.FC<TripOverviewPageProps> = ({
  trip: initialTrip,
  session,
  onNavigateHome = () => {},
  onNavigateToPlanner = () => {},
  onNavigateToPlaces = () => {},
  onNavigateToDiary = () => {},
  onUpdateTrip,
  onDeleteTrip,
}) => {
  const [trip, setTrip] = useState<TravelBook | undefined>(initialTrip);

  const handleSetTrip = (updater: React.SetStateAction<TravelBook | undefined>) => {
    setTrip((prev) => {
      const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
      if (next && onUpdateTrip) {
        // Send the entire updated state to parent
        onUpdateTrip(next);
      }
      return next;
    });
  };

  React.useEffect(() => {
    setTrip(initialTrip);
  }, [initialTrip]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'checklist' | number>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  if (!trip) {
    return <TripOverviewError onRetry={() => {}} onGoHome={onNavigateHome} />;
  }

  // --- Computed values từ dữ liệu THẬT ---

  // Đếm số món ăn thật từ activities (type: dining/food/restaurant)
  const realFoodCount = trip.days.reduce((acc, d) => {
    return acc + d.activities.filter(a =>
      a.type === 'dining' || a.type === 'food' || a.type === 'restaurant' ||
      (a.type as string) === 'eating'
    ).length;
  }, 0);

  // Ngân sách người dùng thật (lấy từ budgetEstimatedMax hoặc 0 nếu chưa có)
  const realUserBudget = trip.budgetEstimatedMax || 0;

  // Thành viên thật từ session.familyAccount
  const realMembers: MemberItem[] = (() => {
    const members = session?.familyAccount?.members;
    if (!members || members.length === 0) return [];
    return members.map((m: FamilyMember) => ({
      id: m.id,
      name: m.name,
      role: m.isAdmin ? 'owner' : (m.role === 'Trưởng nhóm' ? 'editor' : 'viewer'),
      avatarUrl: m.avatar,
    }));
  })();

  // Hạng mục chuẩn bị thật từ trip.prepItems hoặc tính từ accommodations
  const realPrepItems = (() => {
    // Nếu trip có prepItems thật từ AI
    if (trip.prepItems && trip.prepItems.length > 0) {
      return trip.prepItems.map((item: any, idx: number) => ({
        id: item.id || `prep-${idx}`,
        label: item.label || item.title || 'Hạng mục',
        status: (item.status as 'completed' | 'attention' | 'pending') || 'pending',
        value: item.value || item.note || 'Chưa hoàn thành',
        routeKey: item.routeKey,
      }));
    }
    // Nếu không có prepItems, tạo từ accommodations + days
    const items = [];
    if (trip.accommodations && trip.accommodations.length > 0) {
      items.push({ id: 'prep-hotel', label: 'Khách sạn / Lưu trú', status: 'attention' as const, value: `${trip.accommodations.length} nơi`, routeKey: 'hotel' });
    }
    if (trip.days && trip.days.length > 0) {
      const totalActivities = trip.days.reduce((acc, d) => acc + d.activities.length, 0);
      if (totalActivities > 0) {
        items.push({ id: 'prep-itinerary', label: 'Lịch trình hoạt động', status: 'completed' as const, value: `${totalActivities} hoạt động`, routeKey: 'checklist' });
      }
    }
    return items;
  })();


  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isBookingVaultOpen, setIsBookingVaultOpen] = useState(false);
  const [bookingVaultFilter, setBookingVaultFilter] = useState('all');
  const [editingAcc, setEditingAcc] = useState<AccommodationItem | null>(null);

  const handleOpenBookingVault = (filter = 'all') => {
    setBookingVaultFilter(filter);
    setIsBookingVaultOpen(true);
  };

  // Day View editing drawers
  const [editingActivity, setEditingActivity] = useState<TravelActivity | null>(null);
  const [replacingActivity, setReplacingActivity] = useState<TravelActivity | null>(null);

  // Update Trip Callback
  const handleUpdateTrip = (updatedFields: Partial<TravelBook>) => {
    handleSetTrip((prev) => prev ? { ...prev, ...updatedFields } : prev);
  };

  // Add Activity to specified Day from Recommended Section
  const handleAddActivityToDay = (dayNum: number, activityData: Partial<TravelActivity>) => {
    handleSetTrip((prev) => {
      if (!prev) return prev;
      const updatedDays = prev.days.map((d) => {
        if (d.dayNumber === dayNum) {
          const fullActivity: TravelActivity = {
            id: activityData.id || `act-${Date.now()}`,
            title: activityData.title || 'Hoạt động mới',
            type: activityData.type || 'sightseeing',
            startTime: activityData.startTime || '10:00',
            endTime: activityData.endTime || '12:00',
            status: 'upcoming',
            description: activityData.description || '',
            estimatedCost: activityData.estimatedCost || 0,
            notes: activityData.notes || '',
            place: activityData.place,
          };
          return {
            ...d,
            activities: [...d.activities, fullActivity],
          };
        }
        return d;
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleSaveAccommodation = (acc: AccommodationItem) => {
    handleSetTrip((prev) => {
      if (!prev) return prev;
      const existing = prev.accommodations.find((a) => a.name === acc.name || a.period === acc.period);
      if (existing) {
        return {
          ...prev,
          accommodations: prev.accommodations.map((a) =>
            a.name === acc.name || a.period === acc.period
              ? {
                  period: acc.period,
                  name: acc.name,
                  address: acc.address,
                  bookingCode: a.bookingCode,
                }
              : a
          ),
        };
      } else {
        return {
          ...prev,
          accommodations: [
            ...prev.accommodations,
            {
              period: acc.period,
              name: acc.name,
              address: acc.address,
            },
          ],
        };
      }
    });
  };

  const handlePrepRowClick = (item: PreparationRowItem) => {
    if (item.routeKey === 'share') {
      setIsShareOpen(true);
    } else if (item.routeKey === 'hotel') {
      const element = document.getElementById('accommodation-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (item.routeKey === 'transport') {
      const element = document.getElementById('route-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (item.routeKey === 'checklist') {
      setSelectedTab('checklist');
    }
  };

  const handleConfirmDelete = () => {
    setIsDeleteOpen(false);
    if (onDeleteTrip && trip) {
      onDeleteTrip(trip.id);
    }
    onNavigateHome();
  };

  const activeDay = typeof selectedTab === 'number'
    ? trip.days.find((d) => d.dayNumber === selectedTab) || trip.days[0]
    : null;

  if (loading) return <TripOverviewSkeleton />;
  if (error)
    return (
      <TripOverviewError
        onRetry={() => setError(false)}
        onGoHome={onNavigateHome}
      />
    );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col justify-between pb-20 sm:pb-12">
      <div>
        <main className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 space-y-6">
          <TripHero
            trip={trip}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenEdit={() => {
              if (trip.days[0]?.activities[0]) {
                setEditingActivity(trip.days[0].activities[0]);
              }
            }}
            onOpenPdf={() => setIsPdfOpen(true)}
            onGoToToday={() => setSelectedTab(1)}
            onUpdateTrip={handleUpdateTrip}
            onOpenBookingVault={handleOpenBookingVault}
          />

          <div className="sticky top-[72px] z-30 bg-slate-50/95 backdrop-blur-md pt-2 pb-1">
            <TripDayNavigation
              days={trip.days}
              selectedTab={selectedTab}
              onSelectTab={setSelectedTab}
            />
          </div>

          {selectedTab === 'overview' ? (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
              <div className="space-y-6 min-w-0">
                <TripStatGrid
                  durationText={`${trip.durationDays} ngày ${trip.durationNights} đêm`}
                  destinationCount={trip.destinations.length}
                  placeCount={trip.days.reduce((acc, d) => acc + d.activities.length, 0)}
                  foodCount={realFoodCount}
                  accommodationCount={trip.accommodations.length}
                  onSelectStat={(type) => {
                    if (type === 'duration' || type === 'places') {
                      setSelectedTab(1);
                    } else if (type === 'destinations') {
                      setIsMapOpen(true);
                    } else if (type === 'accommodations') {
                      const el = document.getElementById('accommodation-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />

                <div id="route-section">
                  <TripRouteCard
                    stops={(trip as any).routeStops as RouteStopItem[] | undefined}
                    onOpenMap={() => setIsMapOpen(true)}
                  />
                </div>

                <div id="accommodation-section">
                  <AccommodationSection
                    accommodations={(trip.accommodations || []).map((a: any, idx: number) => ({
                      id: a.id || `acc-${idx}`,
                      period: a.period || `Đêm ${idx + 1}`,
                      name: a.name || a.hotel || 'Khách sạn',
                      dates: a.dates || a.checkInDate || '',
                      status: a.status || 'not_booked',
                      checkInTime: a.checkInTime || '14:00',
                      checkOutTime: a.checkOutTime || '12:00',
                      address: a.address || '',
                    }))}
                    onAddAccommodation={() => {
                      setEditingAcc(null);
                      setIsAccModalOpen(true);
                    }}
                    onEditAccommodation={(acc) => {
                      setEditingAcc(acc);
                      setIsAccModalOpen(true);
                    }}
                    onOpenMap={(placeName) => {
                      setIsMapOpen(true);
                    }}
                  />
                </div>

                <RecommendedAttractionsSection
                  daysCount={trip.days.length}
                  onAddActivityToDay={handleAddActivityToDay}
                />

                <RecommendedFoodSection
                  onViewAllFoods={() => onNavigateToPlaces()}
                />
              </div>

              <div className="space-y-6 lg:sticky lg:top-[96px] lg:self-start">
                <PreparationStatusCard
                  items={realPrepItems}
                  onSelectRow={handlePrepRowClick}
                  onOpenChecklistModal={() => setSelectedTab('checklist')}
                />

                <BudgetSummaryCard
                  userBudget={realUserBudget}
                  estimatedMin={trip.budgetEstimatedMin}
                  estimatedMax={trip.budgetEstimatedMax}
                  onViewBudgetDetail={() => setSelectedTab(1)}
                />

                <TripMembersCard
                  members={realMembers}
                  onInviteMember={() => setIsInviteOpen(true)}
                />

                <ImportantNotesCard
                  notes={trip.importantNotes}
                />
              </div>
            </div>
          ) : selectedTab === 'checklist' ? (
            <PreparationChecklistTab tripTitle={trip.title} />
          ) : (
            activeDay && (
              <TripDayPage
                trip={trip}
                dayNumber={activeDay.dayNumber}
                onSelectTab={setSelectedTab}
                onOpenShare={() => setIsShareOpen(true)}
                onOpenBookingVault={handleOpenBookingVault}
                onUpdateTripDay={(updatedDay) => {
                  handleSetTrip((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      days: prev.days.map((d) =>
                        d.dayNumber === updatedDay.dayNumber ? updatedDay : d
                      ),
                    };
                  });
                }}
              />
            )
          )}
        </main>
      </div>

      <MobileTripActions
        isOngoing={trip.status === 'ongoing'}
        onViewDay={() => setSelectedTab(1)}
        onShare={() => setIsShareOpen(true)}
        onAddActivity={() => setSelectedTab(1)}
        onAddExpense={() => setSelectedTab(1)}
        onAddNote={() => setSelectedTab(1)}
        onAddAccommodation={() => {
          setEditingAcc(null);
          setIsAccModalOpen(true);
        }}
      />

      <ShareTripDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        tripTitle={trip.title}
      />

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        tripTitle={trip.title}
        inviteCode={trip.inviteCode}
        familyName={trip.familyName}
      />

      <DeleteTripDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirmDelete={handleConfirmDelete}
        tripTitle={trip.title}
      />

      <AccommodationModal
        isOpen={isAccModalOpen}
        onClose={() => setIsAccModalOpen(false)}
        onSave={handleSaveAccommodation}
        initialData={editingAcc}
      />

      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        tripTitle={trip.title}
        trip={trip}
      />

      <PreparationChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        tripTitle={trip.title}
      />

      <PdfPreviewModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        trip={trip}
      />

      <BookingVaultModal
        isOpen={isBookingVaultOpen}
        onClose={() => setIsBookingVaultOpen(false)}
        trip={trip}
        onUpdateTrip={handleUpdateTrip}
        initialTypeFilter={bookingVaultFilter}
      />

      <EditActivityDrawer
        activity={editingActivity}
        isOpen={!!editingActivity}
        onClose={() => setEditingActivity(null)}
        onSave={(updated) => {
          handleSetTrip((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              days: prev.days.map((day) => ({
                ...day,
                activities: day.activities.map((act) => (act.id === updated.id ? updated : act)),
              })),
            };
          });
        }}
        onDelete={(actId) => {
          handleSetTrip((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              days: prev.days.map((day) => ({
                ...day,
                activities: day.activities.filter((act) => act.id !== actId),
              })),
            };
          });
        }}
      />

      <ReplaceActivityDrawer
        activity={replacingActivity}
        isOpen={!!replacingActivity}
        onClose={() => setReplacingActivity(null)}
        onConfirmReplace={(actId, newTitle, newPlace) => {
          handleSetTrip((prev) => ({
            ...prev,
            days: prev.days.map((day) => ({
              ...day,
              activities: day.activities.map((act) =>
                act.id === actId
                  ? { ...act, title: newTitle, place: { ...act.place, name: newPlace } }
                  : act
              ),
            })),
          }));
        }}
      />
    </div>
  );
};
