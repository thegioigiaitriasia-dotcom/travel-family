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
  initialTab?: 'overview' | 'checklist' | number;
  scrollToBudget?: boolean;
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
  initialTab = 'overview',
  scrollToBudget = false,
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

  React.useEffect(() => {
    if (scrollToBudget && selectedTab === 'overview') {
      setTimeout(() => {
        const el = document.getElementById('budget-summary-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [scrollToBudget, selectedTab]);

  const [selectedTab, setSelectedTab] = useState<'overview' | 'checklist' | number>(initialTab);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  if (!trip) {
    return <TripOverviewError onRetry={() => {}} onGoHome={onNavigateHome} />;
  }

  // --- Computed values từ dữ liệu THẬT ---

  // Đếm số món ăn thật từ activities (type: dining/food/restaurant)
  const realFoodCount = trip.days.reduce((acc, d) => {
    return acc + (d.activities || []).filter(a =>
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

  // Tính toán dữ liệu thực tế (Fallback từ activities nếu AI không trả về mảng rời)
  const computedAccommodations = useMemo(() => {
    if (trip.accommodations && trip.accommodations.length > 0) return trip.accommodations;
    const accs: any[] = [];
    trip.days.forEach(day => {
      day.activities?.forEach(act => {
        if (act.type === 'accommodation' || act.category?.toLowerCase().includes('khách sạn') || act.category?.toLowerCase().includes('resort') || act.category?.toLowerCase().includes('lưu trú')) {
           if (!accs.find(a => a.name === act.title)) {
              accs.push({
                 id: act.id || `acc-${Math.random()}`,
                 name: act.title,
                 address: act.locationName || '',
                 period: `Ngày ${day.dayNumber}`,
                 status: 'not_booked'
              });
           }
        }
      })
    })
    return accs;
  }, [trip]);

  const computedBudgetTotal = useMemo(() => {
    let total = 0;
    trip.days.forEach(day => {
       day.activities?.forEach(act => {
           let cost = act.estimatedCost || 0;
           if (cost > 50000000) {
              const strCost = String(cost);
              cost = parseInt(strCost.substring(0, Math.floor(strCost.length / 2))) || 0;
              if (cost > 50000000) cost = 500000;
           }
           total += cost;
       });
    });
    return total;
  }, [trip]);

  const computedRouteStops = useMemo(() => {
    if ((trip as any).routeStops && (trip as any).routeStops.length > 0) return (trip as any).routeStops;
    const stops: any[] = [];
    trip.days.forEach((day, index) => {
       const cityName = day.cityName || day.title;
       if (cityName && !stops.find(s => s.name === cityName)) {
          stops.push({
             id: `stop-${index}`,
             name: cityName,
             dateRange: `Ngày ${day.dayNumber}`,
             type: 'destination'
          });
       }
    });
    if (stops.length === 0) {
       stops.push({ id: 'stop-0', name: trip.title, dateRange: `${trip.days.length} ngày`, type: 'destination' });
    }
    return stops;
  }, [trip]);

  const computedFoods = useMemo(() => {
    const foods: any[] = [];
    trip.days.forEach(day => {
      day.activities?.forEach(act => {
        if (act.type === 'dining' || act.type === 'food' || act.type === 'restaurant' || (act.type as string) === 'eating') {
          if (!foods.find(f => f.name === act.title)) {
            foods.push({
              id: act.id || `food-${Math.random()}`,
              name: act.title,
              destination: act.locationName || day.cityName || 'Chưa rõ',
              badge: 'Đặc sản',
              imageUrl: act.imageUrl || '',
            });
          }
        }
      });
    });
    return foods;
  }, [trip]);

  const computedAttractions = useMemo(() => {
    const attractions: any[] = [];
    trip.days.forEach(day => {
      day.activities?.forEach(act => {
        if (act.type === 'sightseeing' || act.type === 'entertainment' || act.type === 'experience' || act.type === 'activity') {
          if (!attractions.find(a => a.name === act.title)) {
            attractions.push({
              id: act.id || `attr-${Math.random()}`,
              name: act.title,
              category: act.type === 'experience' ? 'tour' : (act.type === 'entertainment' ? 'entertainment' : 'sightseeing'),
              categoryLabel: act.type === 'experience' ? 'Trải nghiệm' : 'Tham quan',
              destination: act.locationName || day.cityName || 'Chưa rõ',
              badge: 'Điểm nhấn',
              rating: 4.8,
              reviewCount: 120,
              durationText: act.duration || '2 giờ',
              pricePerPerson: act.estimatedCost || 0,
              priceText: act.estimatedCost ? `${act.estimatedCost.toLocaleString('vi-VN')} đ` : 'Miễn phí',
              imageUrl: act.imageUrl || '',
              description: act.description || act.notes || 'Điểm đến thú vị cho cả gia đình',
              familyTips: act.notes || 'Phù hợp cho cả gia đình',
              suitabilityTags: ['Gia đình', 'Trẻ em', 'Người lớn tuổi'].slice(0, Math.floor(Math.random() * 3) + 1),
            });
          }
        }
      });
    });
    return attractions;
  }, [trip]);

  // Hạng mục chuẩn bị thật từ trip.prepItems hoặc tính từ accommodations
  const realPrepItems = (() => {
    // Nếu trip có prepItems thật từ AI
    if (trip.prepItems && trip.prepItems.length > 0) {
      return trip.prepItems.map((item: any, idx: number) => {
        const itemStatus = (item.status as 'completed' | 'attention' | 'pending') || 'pending';
        let statusText = 'Cần chuẩn bị';
        if (itemStatus === 'completed') statusText = 'Đã xong';
        if (itemStatus === 'attention') statusText = 'Đang tiến hành';

        return {
          id: item.id || `prep-${idx}`,
          label: item.name || item.label || item.title || 'Hạng mục',
          status: itemStatus,
          value: item.value || item.note || statusText,
          routeKey: item.routeKey || 'checklist',
        };
      });
    }
    // Nếu không có prepItems, tạo từ computedAccommodations + days
    const items = [];
    if (computedAccommodations && computedAccommodations.length > 0) {
      items.push({ id: 'prep-hotel', label: 'Khách sạn / Lưu trú', status: 'attention' as const, value: `${computedAccommodations.length} nơi`, routeKey: 'hotel' });
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
    <div className="min-h-screen bg-[#F7F6F0] text-[#1D211F] font-sans flex flex-col justify-between pb-20 sm:pb-12">
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

          <div className="sticky top-[72px] z-30 bg-[#F7F6F0]/95 backdrop-blur-md pt-2 pb-1">
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
                  destinationCount={computedRouteStops.length}
                  placeCount={trip.days.reduce((acc, d) => acc + (d.activities || []).length, 0)}
                  foodCount={realFoodCount}
                  accommodationCount={computedAccommodations.length}
                  onSelectStat={(type) => {
                    if (type === 'duration') {
                      setSelectedTab(1);
                    } else if (type === 'places') {
                      const el = document.getElementById('attractions-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    } else if (type === 'foods') {
                      const el = document.getElementById('foods-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
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
                    stops={computedRouteStops}
                    onOpenMap={() => setIsMapOpen(true)}
                  />
                </div>

                <div id="accommodation-section">
                  <AccommodationSection
                    accommodations={computedAccommodations}
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

                <div id="attractions-section">
                  <RecommendedAttractionsSection
                    attractions={computedAttractions}
                    daysCount={trip.days.length}
                    onAddActivityToDay={handleAddActivityToDay}
                  />
                </div>

                <div id="foods-section">
                  <RecommendedFoodSection
                    foods={computedFoods}
                    onViewAllFoods={() => onNavigateToPlaces()}
                  />
                </div>
              </div>

              <div className="space-y-6 lg:sticky lg:top-[96px] lg:self-start">
                <PreparationStatusCard
                  items={realPrepItems}
                  onSelectRow={handlePrepRowClick}
                  onOpenChecklistModal={() => setSelectedTab('checklist')}
                />

                <div id="budget-summary-section">
                  <BudgetSummaryCard
                  userBudget={realUserBudget}
                  estimatedMin={computedBudgetTotal || trip.budgetEstimatedMin}
                  estimatedMax={computedBudgetTotal || trip.budgetEstimatedMax}
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
            <PreparationChecklistTab tripTitle={trip.title} trip={trip} onUpdateTrip={handleUpdateTrip} />
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
        tripId={trip.id}
      />

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        tripTitle={trip.title}
        inviteCode={session?.familyAccount?.inviteCode}
        familyName={session?.familyAccount?.name || session?.familyAccount?.familyName}
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
                activities: (day.activities || []).filter((act) => act.id !== actId),
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
