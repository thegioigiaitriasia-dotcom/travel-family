import React from 'react';

export const TripCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E3DE] overflow-hidden animate-pulse space-y-3">
      <div className="aspect-video bg-[#EFEAE1] w-full" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-[#EFEAE1] rounded-md w-3/4" />
        <div className="h-3.5 bg-[#F7F5F0] rounded-md w-1/2" />
        <div className="h-3.5 bg-[#F7F5F0] rounded-md w-2/3" />
        <div className="h-10 bg-[#EFEAE1] rounded-xl w-full pt-2 mt-2" />
      </div>
    </div>
  );
};
