import React from 'react';
import { TripSummary } from '../types';
import { TripCard } from './TripCard';

interface TripGridProps {
  trips: TripSummary[];
  onAction: (trip: TripSummary) => void;
  onEdit?: (tripId: string) => void;
  onClone?: (tripId: string) => void;
  onDelete?: (tripId: string) => void;
}

export const TripGrid: React.FC<TripGridProps> = ({
  trips,
  onAction,
  onEdit,
  onClone,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onAction={onAction}
          onEdit={onEdit}
          onClone={onClone}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
