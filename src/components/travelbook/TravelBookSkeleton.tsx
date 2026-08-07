import React from 'react';

export const TravelBookSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse p-4">
      {/* Hero Skeleton */}
      <div className="h-64 sm:h-80 bg-slate-200 rounded-[24px] w-full" />

      {/* Tabs Skeleton */}
      <div className="h-14 bg-slate-200 rounded-[20px] w-full" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="h-20 bg-slate-200 rounded-2xl" />
        <div className="h-20 bg-slate-200 rounded-2xl" />
        <div className="h-20 bg-slate-200 rounded-2xl" />
        <div className="h-20 bg-slate-200 rounded-2xl" />
      </div>

      {/* Timeline Card Skeleton */}
      <div className="space-y-4">
        <div className="h-32 bg-slate-200 rounded-[22px]" />
        <div className="h-32 bg-slate-200 rounded-[22px]" />
        <div className="h-32 bg-slate-200 rounded-[22px]" />
      </div>
    </div>
  );
};
