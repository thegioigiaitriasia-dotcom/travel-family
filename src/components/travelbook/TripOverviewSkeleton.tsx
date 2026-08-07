import React from 'react';

export const TripOverviewSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-64 sm:h-80 w-full bg-slate-200 rounded-[24px]" />

      {/* Day Nav Skeleton */}
      <div className="h-14 w-full bg-slate-200 rounded-[20px]" />

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-[20px]" />
            ))}
          </div>

          {/* Route Card */}
          <div className="h-64 bg-slate-200 rounded-[24px]" />

          {/* Accommodation */}
          <div className="h-48 bg-slate-200 rounded-[24px]" />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-56 bg-slate-200 rounded-[24px]" />
          <div className="h-48 bg-slate-200 rounded-[24px]" />
          <div className="h-40 bg-slate-200 rounded-[24px]" />
        </div>
      </div>
    </div>
  );
};
