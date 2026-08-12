import React, { useState } from 'react';
import { TripSummary } from '../types';
import { TripSummaryPanel } from './TripSummaryPanel';
import { Calendar, Users, Edit3, Share2, Copy, Trash2, ArrowRight, MoreHorizontal } from 'lucide-react';

interface UpcomingTripCardProps {
  trip: TripSummary;
  onViewItinerary: (tripId: string) => void;
  onEditTrip: (tripId: string) => void;
  onCloneTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const UpcomingTripCard: React.FC<UpcomingTripCardProps> = ({
  trip,
  onViewItinerary,
  onEditTrip,
  onCloneTrip,
  onDeleteTrip,
}) => {
  const [showShareToast, setShowShareToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const budgetText =
    trip.budgetMin && trip.budgetMax
      ? `${(trip.budgetMin / 1000000).toLocaleString('vi-VN')}–${(trip.budgetMax / 1000000).toLocaleString('vi-VN')} triệu đồng`
      : '8–12 triệu đồng';

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setShowMenu(false);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <div className="space-y-3">
      {/* 2-Column Responsive Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Hero Card (2 columns on lg) */}
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-[#E2E3DE] bg-[#1D211F] min-h-[300px] sm:min-h-[340px] flex flex-col justify-between p-6 sm:p-8 text-white group">
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 opacity-90"
          />
          {/* Subtle magazine-style dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1D211F]/90 via-[#1D211F]/40 to-transparent pointer-events-none" />

          {/* Top Badge Tag */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="bg-[#183B35] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              SẮP KHỞI HÀNH &bull; CÒN {trip.countdownDays ?? 5} NGÀY
            </span>

            {/* Three Dots Menu Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                title="Tùy chọn"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-[#1D211F] rounded-xl shadow-lg border border-[#E2E3DE] py-1.5 z-30 text-xs font-medium animate-fadeIn">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEditTrip(trip.id);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F7F5F0] flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#606864]" />
                    <span>Chỉnh sửa chuyến đi</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full text-left px-4 py-2 hover:bg-[#F7F5F0] flex items-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#606864]" />
                    <span>Chia sẻ chuyến đi</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onCloneTrip(trip.id);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F7F5F0] flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#606864]" />
                    <span>Nhân bản chuyến đi</span>
                  </button>
                  <div className="my-1 border-t border-[#E2E3DE]" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-bronze-600 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa chuyến đi</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Information (1/3 position) */}
          <div className="relative z-10 space-y-4 mt-12">
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">
                {trip.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200/90 font-normal mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  {trip.startDate} – {trip.endDate}
                </span>
                <span>&bull;</span>
                <span>
                  {trip.durationDays} ngày {trip.durationNights} đêm
                </span>
                <span>&bull;</span>
                <span>{trip.memberCount} thành viên</span>
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                onClick={() => onViewItinerary(trip.id)}
                className="px-6 py-3 rounded-xl bg-[#183B35] hover:bg-[#28584E] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Xem lịch trình chi tiết</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Summary Panel */}
        <div className="lg:col-span-1">
          <TripSummaryPanel
            placeCount={trip.placeCount}
            foodCount={trip.foodCount}
            accommodationCount={trip.accommodationCount}
            budgetRange={budgetText}
          />
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-20 right-4 sm:right-8 bg-[#1D211F] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl z-50">
          ✓ Đã sao chép liên kết chuyến đi vào khay nhớ tạm!
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[#1D211F]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-[#E2E3DE]">
            <h3 className="text-base font-semibold text-[#1D211F]">Xác nhận xóa chuyến đi?</h3>
            <p className="text-xs text-[#606864] leading-relaxed">
              Bạn có chắc chắn muốn xóa chuyến đi <span className="font-semibold text-[#1D211F]">{trip.title}</span>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl border border-[#E2E3DE] text-[#1D211F] text-xs font-semibold hover:bg-[#F7F5F0] cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteTrip(trip.id);
                }}
                className="px-4 py-2 rounded-xl bg-bronze-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Xóa chuyến đi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

