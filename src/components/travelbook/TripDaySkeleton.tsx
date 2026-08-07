import React from 'react';

export const TripDaySkeleton: React.FC = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6 animate-pulse">
      {/* Compact Hero Skeleton */}
      <div className="h-[140px] sm:h-[160px] bg-slate-200 rounded-[20px]" />

      {/* Day Nav Skeleton */}
      <div className="h-12 bg-slate-200 rounded-[20px]" />

      {/* Grid Layout Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-[180px_minmax(0,1fr)_320px] gap-6">
        {/* Left Sidebar */}
        <div className="hidden xl:block space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl" />
          ))}
        </div>

        {/* Center Main Timeline */}
        <div className="space-y-4">
          <div className="h-32 bg-slate-200 rounded-[24px]" />
          <div className="h-44 bg-slate-200 rounded-[22px]" />
          <div className="h-12 bg-slate-200 rounded-xl w-2/3 mx-auto" />
          <div className="h-44 bg-slate-200 rounded-[22px]" />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <div className="h-40 bg-slate-200 rounded-[24px]" />
          <div className="h-36 bg-slate-200 rounded-[24px]" />
          <div className="h-36 bg-slate-200 rounded-[24px]" />
        </div>
      </div>
    </div>
  );
};
