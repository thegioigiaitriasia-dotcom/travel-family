import React, { useState } from 'react';
import { Share2, Edit3, MoreHorizontal, Calendar, MapPin } from 'lucide-react';
import { TravelBook } from '../../types';

interface CompactTripHeroProps {
  trip: TravelBook;
  currentDayNumber?: number;
  currentDateStr?: string;
  onOpenShare: () => void;
  onOpenEdit: () => void;
}

export const CompactTripHero: React.FC<CompactTripHeroProps> = ({
  trip,
  currentDayNumber = 1,
  currentDateStr = '08/08/2026',
  onOpenShare,
  onOpenEdit,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative w-full h-[140px] sm:h-[160px] rounded-b-[20px] sm:rounded-[20px] overflow-hidden shadow-md bg-slate-900 border border-slate-800 text-white flex flex-col justify-between p-4 sm:p-6 transition-all">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transition-transform duration-700"
        style={{ backgroundImage: `url(${trip.heroImageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-slate-900/30" />

      {/* Content Container */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        {/* Destination & Day Tag */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold text-sky-200 border border-white/20">
            <MapPin className="w-3 h-3 text-sky-300" />
            <span>
              {trip.destinations.join(' – ')}
            </span>
          </div>

          <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight line-clamp-1">
            {trip.title}
          </h1>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenShare}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>

          <button
            type="button"
            onClick={onOpenEdit}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chỉnh sửa</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 text-xs font-bold space-y-1 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenEdit();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sửa thông tin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenShare();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Xuất bản PDF / In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Metadata Line */}
      <div className="relative z-10 flex items-center gap-3 text-xs font-extrabold text-slate-200">
        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-xl backdrop-blur-xs border border-white/10">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Ngày {currentDayNumber} / {trip.days.length}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-white">{currentDateStr}</span>
        </div>
      </div>
    </div>
  );
};
