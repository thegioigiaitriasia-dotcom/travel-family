import React from 'react';
import { TravelDiariesPage } from './diaries/TravelDiariesPage';
import { UserAuthSession } from '../types';

interface TravelDiaryModuleProps {
  session: UserAuthSession;
}

export const TravelDiaryModule: React.FC<TravelDiaryModuleProps> = ({ session }) => {
  return <TravelDiariesPage session={session} />;
};
