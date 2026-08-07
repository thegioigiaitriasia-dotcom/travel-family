import React from 'react';
import { TravelActivity } from '../../types';
import { ActivityEditorDrawer } from './ActivityEditorDrawer';

interface EditActivityDrawerProps {
  activity: TravelActivity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: TravelActivity) => void;
  onDelete?: (activityId: string) => void;
  onShiftUp?: (activityId: string) => void;
  onShiftDown?: (activityId: string) => void;
}

export const EditActivityDrawer: React.FC<EditActivityDrawerProps> = (props) => {
  return (
    <ActivityEditorDrawer
      activity={props.activity}
      isOpen={props.isOpen}
      onClose={props.onClose}
      onSave={props.onSave}
      onDelete={props.onDelete}
      onShiftUp={props.onShiftUp}
      onShiftDown={props.onShiftDown}
    />
  );
};
