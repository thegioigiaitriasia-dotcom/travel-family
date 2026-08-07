import React, { useState } from 'react';
import { TripSummary, TripStatus, TravelBook } from '../types';
import { WelcomeSection } from './WelcomeSection';
import { UpcomingTripCard } from './UpcomingTripCard';
import { OverviewRouteMap } from './planner/OverviewRouteMap';
import { TripStatusTabs, FilterStatus } from './TripStatusTabs';
import { TripGrid } from './TripGrid';
import { QuickAccessGrid } from './QuickAccessGrid';
import { EmptyTripsState } from './EmptyTripsState';
import { TripCardSkeleton } from './TripCardSkeleton';
import { ErrorState } from './ErrorState';

interface MyTripsPageProps {
  trips: TripSummary[];
  travelBook?: TravelBook;
  onSelectTrip: (tripId: string) => void;
  onCreateTrip: () => void;
  onNavigateToPlaces: () => void;
  onNavigateToDiary: () => void;
  onNavigateToBudget?: (tripId: string) => void;
  onNavigateToChecklist?: (tripId: string) => void;
  onEditTrip?: (tripId: string) => void;
  onCloneTrip?: (tripId: string) => void;
  onDeleteTrip?: (tripId: string) => void;
  onOpenFullMap?: () => void;
}

export const MyTripsPage: React.FC<MyTripsPageProps> = ({
  trips: initialTrips,
  travelBook,
  onSelectTrip,
  onCreateTrip,
  onNavigateToPlaces,
  onNavigateToDiary,
  onNavigateToBudget,
  onNavigateToChecklist,
  onEditTrip,
  onCloneTrip,
  onDeleteTrip,
  onOpenFullMap,
}) => {
  const [tripsList, setTripsList] = useState<TripSummary[]>(initialTrips);
  const [activeStatus, setActiveStatus] = useState<FilterStatus>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Find upcoming trip for the top highlight card
  const upcomingTrip =
    tripsList.find((t) => t.status === 'upcoming') ||
    tripsList[0];

  // Filter trips based on active status tab
  const filteredTrips = tripsList.filter((trip) => {
    if (activeStatus === 'all') return true;
    return trip.status === activeStatus;
  });

  // Calculate counts for each status tab
  const statusCounts: Record<FilterStatus, number> = {
    all: tripsList.length,
    planning: tripsList.filter((t) => t.status === 'planning').length,
    upcoming: tripsList.filter((t) => t.status === 'upcoming').length,
    ongoing: tripsList.filter((t) => t.status === 'ongoing').length,
    completed: tripsList.filter((t) => t.status === 'completed').length,
  };

  // Handle trip action button clicks based on status
  const handleTripCardAction = (trip: TripSummary) => {
    switch (trip.status) {
      case 'planning':
      case 'upcoming':
        onSelectTrip(trip.id);
        break;
      case 'ongoing':
        onSelectTrip(trip.id);
        break;
      case 'completed':
        onNavigateToDiary();
        break;
      default:
        onSelectTrip(trip.id);
    }
  };

  const handleEdit = (id: string) => {
    if (onEditTrip) onEditTrip(id);
    else onSelectTrip(id);
  };

  const handleClone = (id: string) => {
    const target = tripsList.find((t) => t.id === id);
    if (target) {
      const cloned: TripSummary = {
        ...target,
        id: `trip-cloned-${Date.now()}`,
        title: `${target.title} (Bản sao)`,
        status: 'planning',
      };
      setTripsList([cloned, ...tripsList]);
    }
  };

  const handleDelete = (id: string) => {
    if (onDeleteTrip) onDeleteTrip(id);
    setTripsList(tripsList.filter((t) => t.id !== id));
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 2. Welcome Section */}
      <WelcomeSection onCreateTrip={onCreateTrip} />

        {/* Handling Error State */}
        {hasError ? (
          <ErrorState onRetry={handleRetry} />
        ) : tripsList.length === 0 ? (
          /* 7. Empty Trips State */
          <EmptyTripsState onCreateTrip={onCreateTrip} />
        ) : (
          <>
            {/* 3. Combined Frame: Upcoming Trip & Route Map */}
            {upcomingTrip && (
              <section className="bg-[#F7F6F0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E2E3DE] shadow-xs space-y-5">
                {/* Unified Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E3DE] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#183B35] animate-pulse" />
                    <h2 className="text-base sm:text-lg font-bold text-[#1D211F] tracking-tight">
                      Chuyến đi sắp tới gần nhất
                    </h2>
                  </div>
                  <span className="text-xs text-[#183B35] font-semibold bg-[#E9F0ED] px-3 py-1 rounded-full border border-[#183B35]/20 self-start sm:self-auto">
                    Lịch trình ưu tiên
                  </span>
                </div>

                {/* Unified Body: Card + Map */}
                <div className="space-y-5">
                  <UpcomingTripCard
                    trip={upcomingTrip}
                    onViewItinerary={onSelectTrip}
                    onEditTrip={handleEdit}
                    onCloneTrip={handleClone}
                    onDeleteTrip={handleDelete}
                  />

                  {/* Visual Itinerary Route Map directly connected to the upcoming trip */}
                  <OverviewRouteMap
                    trip={travelBook}
                    tripTitle={upcomingTrip?.title}
                    onOpenFullMap={onOpenFullMap || (() => onSelectTrip(upcomingTrip?.id || ''))}
                  />
                </div>
              </section>
            )}

            {/* 4. Trips Section with Filter Tabs */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E3DE] pb-3">
                <h3 className="text-lg font-semibold text-[#1D211F] tracking-tight">
                  Danh sách chuyến đi ({tripsList.length})
                </h3>
                <TripStatusTabs
                  activeStatus={activeStatus}
                  onChangeStatus={setActiveStatus}
                  counts={statusCounts}
                />
              </div>

              {/* Trip Grid or Loading Skeleton or No Results */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <TripCardSkeleton />
                  <TripCardSkeleton />
                  <TripCardSkeleton />
                </div>
              ) : filteredTrips.length === 0 ? (
                /* Filter No Result State */
                <div className="bg-white rounded-2xl border border-[#E2E3DE] p-8 text-center my-6 space-y-2">
                  <p className="text-[#1D211F] font-semibold text-base">
                    Không có chuyến đi phù hợp với trạng thái này.
                  </p>
                  <p className="text-xs text-[#606864]">
                    Hãy thử chuyển sang tab bộ lọc khác hoặc tạo một chuyến đi mới.
                  </p>
                </div>
              ) : (
                <TripGrid
                  trips={filteredTrips}
                  onAction={handleTripCardAction}
                  onEdit={handleEdit}
                  onClone={handleClone}
                  onDelete={handleDelete}
                />
              )}
            </div>

            {/* 5. Quick Access Grid */}
            <QuickAccessGrid
              onNavigateToPlaces={onNavigateToPlaces}
              onNavigateToDiary={onNavigateToDiary}
              onNavigateToBudget={() => {
                if (upcomingTrip && onNavigateToBudget) onNavigateToBudget(upcomingTrip.id);
                else onSelectTrip(upcomingTrip?.id || '');
              }}
              onNavigateToChecklist={() => {
                if (upcomingTrip && onNavigateToChecklist) onNavigateToChecklist(upcomingTrip.id);
                else onSelectTrip(upcomingTrip?.id || '');
              }}
            />
          </>
        )}
    </div>
  );
};
