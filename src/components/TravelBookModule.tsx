import React from 'react';
import { TravelBook } from '../types';
import { TripOverviewPage } from './travelbook/TripOverviewPage';

interface TravelBookModuleProps {
  trip?: TravelBook;
  initialTrip?: TravelBook;
  onNavigateHome?: () => void;
  onNavigateToPlanner?: () => void;
  onNavigateToPlaces?: () => void;
  onNavigateToDiary?: () => void;
  onUpdateTrip?: (updatedFields: Partial<TravelBook>) => void;
}

export const TravelBookModule: React.FC<TravelBookModuleProps> = ({
  trip,
  onNavigateHome,
  onNavigateToPlanner,
  onNavigateToPlaces,
  onNavigateToDiary,
  onUpdateTrip,
}) => {
  return (
    <TripOverviewPage
      trip={trip!}
      onNavigateHome={onNavigateHome}
      onNavigateToPlanner={onNavigateToPlanner}
      onNavigateToPlaces={onNavigateToPlaces}
      onNavigateToDiary={onNavigateToDiary}
      onUpdateTrip={onUpdateTrip}
    />
  );
};
