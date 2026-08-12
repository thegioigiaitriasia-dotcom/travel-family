import React from 'react';
import { TripSummary, TravelBook } from '../types';
import { MyTripsPage } from './MyTripsPage';

interface MyTripsModuleProps {
  trips?: TripSummary[];
  travelBook?: TravelBook;
  onSelectTrip: (tripId: string) => void;
  onNavigateToPlanner: () => void;
  onNavigateToPlaces: () => void;
  onNavigateToDiary: () => void;
  onOpenFullMap?: () => void;
  onCloneTrip?: (tripId: string) => void;
  onDeleteTrip?: (tripId: string) => void;
}

export const MyTripsModule: React.FC<MyTripsModuleProps> = ({
  trips = [],
  travelBook,
  onSelectTrip,
  onNavigateToPlanner,
  onNavigateToPlaces,
  onNavigateToDiary,
  onOpenFullMap,
  onCloneTrip,
  onDeleteTrip,
}) => {
  return (
    <MyTripsPage
      trips={trips}
      travelBook={travelBook}
      onSelectTrip={onSelectTrip}
      onCreateTrip={onNavigateToPlanner}
      onNavigateToPlaces={onNavigateToPlaces}
      onNavigateToDiary={onNavigateToDiary}
      onOpenFullMap={onOpenFullMap}
      onCloneTrip={onCloneTrip}
      onDeleteTrip={onDeleteTrip}
    />
  );
};

