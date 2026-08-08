import React from 'react';
import { TravelBook, UserAuthSession } from '../types';
import { TripOverviewPage } from './travelbook/TripOverviewPage';

interface TravelBookModuleProps {
  trip?: TravelBook;
  initialTrip?: TravelBook;
  session?: UserAuthSession;
  onNavigateHome?: () => void;
  onNavigateToPlanner?: () => void;
  onNavigateToPlaces?: () => void;
  onNavigateToDiary?: () => void;
  onUpdateTrip?: (updatedFields: Partial<TravelBook>) => void;
}

export const TravelBookModule: React.FC<TravelBookModuleProps> = ({
  trip,
  session,
  onNavigateHome,
  onNavigateToPlanner,
  onNavigateToPlaces,
  onNavigateToDiary,
  onUpdateTrip,
}) => {
  return (
    <TripOverviewPage
      trip={trip!}
      session={session}
      onNavigateHome={onNavigateHome}
      onNavigateToPlanner={onNavigateToPlanner}
      onNavigateToPlaces={onNavigateToPlaces}
      onNavigateToDiary={onNavigateToDiary}
      onUpdateTrip={onUpdateTrip}
    />
  );
};
