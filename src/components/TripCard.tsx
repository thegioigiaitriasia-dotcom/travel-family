import React, { useState, useRef, useEffect } from 'react';
import { TripSummary, TripStatus } from '../types';
import { Calendar, Users, MapPin, ArrowRight, MoreHorizontal, Edit3, Share2, Copy, Trash2 } from 'lucide-react';

interface TripCardProps {
  trip: TripSummary;
  onAction: (trip: TripSummary) => void;
  onEdit?: (tripId: string) => void;
  onClone?: (tripId: string) => void;
  onDelete?: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onAction,
  onEdit,
  onClone,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const getStatusConfig = (status: TripStatus) => {
    switch (status) {
      case 'planning':
        return {
          label: 'Đang lên kế hoạch',
          btnText: 'Tiếp tục lên kế hoạch',
        };
      case 'upcoming':
        return {
          label: 'Sắp tới',
          btnText: 'Xem lịch trình',
        };
      case 'ongoing':
        return {
          label: 'Đang diễn ra',
          btnText: 'Xem hôm nay',
        };
      case 'completed':
        return {
          label: 'Đã hoàn thành',
          btnText: 'Xem nhật ký',
        };
    }
  };

  const statusConfig = getStatusConfig(trip.status);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setShowMenu(false);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E2E3DE] overflow-hidden hover:border-[#183B35]/40 transition-colors flex flex-col justify-between group h-full relative">
        {/* Top 16:9 Image Container (Editorial Ratio) */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#F7F5F0] shrink-0">
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1D211F]/60 via-transparent to-black/20" />

          {/* Top Left: Minimalist Status Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-[#183B35] border border-[#183B35]/15 backdrop-blur-md">
              {statusConfig.label}
            </span>
          </div>

          {/* Top Right: Three-Dot Menu Button */}
          <div className="absolute top-3 right-3 z-20" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1D211F] backdrop-blur-md flex items-center justify-center transition-colors border border-[#E2E3DE] cursor-pointer"
              title="Tùy chọn"
            >
              <MoreHorizontal className="w-4 h-4 text-[#1D211F]" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white text-[#1D211F] rounded-xl border border-[#E2E3DE] py-1.5 z-30 text-xs font-medium shadow-md animate-fadeIn">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    if (onEdit) onEdit(trip.id);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#F7F5F0] flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#606864]" />
                  <span>Chỉnh sửa chuyến đi</span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#F7F5F0] flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#606864]" />
                  <span>Chia sẻ chuyến đi</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    if (onClone) onClone(trip.id);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#F7F5F0] flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#606864]" />
                  <span>Nhân bản chuyến đi</span>
                </button>
                <div className="my-1 border-t border-[#E2E3DE]" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-bronze-600 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa chuyến đi</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Overlay: Saved Places Count */}
          <div className="absolute bottom-2.5 right-3 text-white">
            <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
              <MapPin className="w-3 h-3 text-[#E9F0ED]" />
              <span>{trip.placeCount} địa điểm</span>
            </span>
          </div>
        </div>

        {/* Card Body - Editorial Typography & Spacing */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-[#1D211F] line-clamp-2 leading-snug group-hover:text-[#183B35] transition-colors">
              {trip.title}
            </h3>

            <div className="space-y-1 text-xs text-[#606864]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8D9490] shrink-0" />
                <span>
                  {trip.startDate} – {trip.endDate}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#E2E3DE]/60">
                <Users className="w-3.5 h-3.5 text-[#8D9490] shrink-0" />
                <span>
                  {trip.durationDays} ngày {trip.durationNights} đêm &bull; {trip.memberCount} thành viên
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Button (Forest Green, No Heavy Shadows) */}
          <button
            type="button"
            onClick={() => onAction(trip)}
            className="w-full h-10 rounded-xl font-semibold text-xs bg-[#183B35] hover:bg-[#28584E] text-white flex items-center justify-center gap-2 transition-colors cursor-pointer mt-1"
          >
            <span>{statusConfig.btnText}</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Share Notification Toast */}
      {showShareToast && (
        <div className="fixed bottom-20 right-4 sm:right-8 bg-[#1D211F] text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#E2E3DE] z-50">
          ✓ Đã sao chép liên kết chuyến đi!
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[#1D211F]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-[#E2E3DE]">
            <h3 className="text-base font-semibold text-[#1D211F]">Xác nhận xóa chuyến đi?</h3>
            <p className="text-xs text-[#606864] leading-relaxed">
              Bạn có chắc chắn muốn xóa chuyến đi <span className="font-semibold text-[#1D211F]">{trip.title}</span>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl border border-[#E2E3DE] text-[#1D211F] text-xs font-semibold hover:bg-[#F7F5F0] cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  if (onDelete) onDelete(trip.id);
                }}
                className="px-4 py-2 rounded-xl bg-bronze-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Xóa chuyến đi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
