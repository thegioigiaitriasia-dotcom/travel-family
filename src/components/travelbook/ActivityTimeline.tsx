import React from 'react';
import { TravelActivity } from '../../types';
import { ActivityCard } from './ActivityCard';
import { TransportConnector } from './TransportConnector';

interface ActivityTimelineProps {
  activities: TravelActivity[];
  onToggleStatus: (activityId: string) => void;
  onEdit: (activity: TravelActivity) => void;
  onAIReplace: (activity: TravelActivity) => void;
  onOpenMap: (placeName: string) => void;
  onMoveUp?: (activityId: string) => void;
  onMoveDown?: (activityId: string) => void;
  onDelete?: (activityId: string) => void;
  onOpenBookingVault?: (typeFilter?: string) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  onToggleStatus,
  onEdit,
  onAIReplace,
  onOpenMap,
  onMoveUp,
  onMoveDown,
  onDelete,
  onOpenBookingVault,
}) => {
  return (
    <div className="relative space-y-3">
      {activities.map((act, idx) => {
        const isCurrent = act.status === 'current';
        const isCompleted = act.status === 'completed';

        return (
          <div key={act.id} className="relative group">
            {/* Main Activity Card */}
            <div id={`activity-card-${act.id}`}>
              <ActivityCard
                activity={act}
                onToggleStatus={onToggleStatus}
                onEdit={onEdit}
                onAIReplace={onAIReplace}
                onOpenMap={onOpenMap}
                onOpenBookingVault={onOpenBookingVault}
              />
            </div>

            {/* Transport Connector to next activity */}
            {idx < activities.length - 1 && (
              <div className="my-2">
                <TransportConnector
                  transport={act.transportFromPrevious || {
                    method: 'Grab/Taxi',
                    estimatedMinutes: 15,
                    distanceKm: 4,
                  }}
                  onOpenRoute={() => onOpenMap(act.place?.name || act.title)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
