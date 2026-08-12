import React, { useState, useRef } from 'react';
import {
  Calendar,
  Users,
  Share2,
  Edit3,
  FileText,
  MoreVertical,
  Clock,
  MapPin,
  Sparkles,
  Copy,
  Image,
  Archive,
  Trash2,
  Check,
  Upload,
} from 'lucide-react';
import { TravelBook } from '../../types';

interface TripHeroProps {
  trip: TravelBook;
  onOpenShare: () => void;
  onOpenEdit: () => void;
  onOpenPdf: () => void;
  onGoToToday: () => void;
  onUpdateTrip: (updated: Partial<TravelBook>) => void;
  onOpenBookingVault?: () => void;
}

export const TripHero: React.FC<TripHeroProps> = ({
  trip,
  onOpenShare,
  onOpenEdit,
  onOpenPdf,
  onGoToToday,
  onUpdateTrip,
  onOpenBookingVault,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onUpdateTrip({ coverImage: ev.target.result as string });
          triggerToast('Đã tải ảnh bìa mới từ thiết bị!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = () => {
    switch (trip.status) {
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#183B35] text-white shadow-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#E9F0ED]"></span>
            Đang diễn ra
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E9F0ED] text-[#183B35] shadow-md border border-[#183B35]/20">
            <Clock className="w-3.5 h-3.5" />
            Sắp khởi hành {trip.countdownDays !== undefined ? `· Còn ${trip.countdownDays} ngày` : ''}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F7F6F0] text-[#5D6B63] border border-[#E2E3DE]">
            <Check className="w-3.5 h-3.5" />
            Đã hoàn thành
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DC2626] text-white">
            Đang lên kế hoạch
          </span>
        );
    }
  };

  const handleDuplicate = () => {
    setShowMoreMenu(false);
    triggerToast('Đã nhân bản chuyến đi thành công!');
  };

  const handleChangeCover = () => {
    setShowMoreMenu(false);
    const newCovers = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    ];
    const randomCover = newCovers[Math.floor(Math.random() * newCovers.length)];
    onUpdateTrip({ coverImage: randomCover });
    triggerToast('Đã đổi ảnh bìa chuyến đi!');
  };

  const handleArchive = () => {
    setShowMoreMenu(false);
    triggerToast('Đã chuyển chuyến đi vào Lưu trữ.');
  };

  return (
    <div className="relative rounded-[24px] overflow-hidden bg-slate-950 text-white shadow-xl border border-slate-800">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#FFB545]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Large Cover Image with Gradient Overlay */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="w-full h-full object-cover scale-105 transition-transform duration-700"
        />
        {/* Subtle dark gradient overlay (#000000 to transparent ~60%) for white title visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">{getStatusBadge()}</div>

          {/* Top Actions: Share, Edit, PDF, More */}
          <div className="flex items-center gap-2 relative">
            <button
              type="button"
              onClick={onOpenShare}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>

            <button
              type="button"
              onClick={onOpenEdit}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chỉnh sửa</span>
            </button>

            {onOpenBookingVault && (
              <button
                type="button"
                onClick={onOpenBookingVault}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer relative"
                title="Kho vé máy bay & booking khách sạn xác nhận"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Vé & Booking</span>
                {trip.bookingDocuments && trip.bookingDocuments.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-emerald-800 text-[10px] font-black flex items-center justify-center -mr-1 shadow-xs">
                    {trip.bookingDocuments.length}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onOpenPdf}
              className="px-3.5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tải PDF</span>
            </button>

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs font-bold animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-[#DC2626] flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh bìa từ thiết bị</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleChangeCover}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Image className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đổi ảnh bìa ngẫu nhiên</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDuplicate}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nhân bản chuyến đi</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleArchive}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lưu trữ</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      triggerToast('Đã chọn xóa chuyến đi.');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa chuyến đi</span>
                  </button>
                </div>
              )}

              {/* Hidden File Input for Device Cover Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDeviceUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Bottom Header Info */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl sm:text-red-500xl font-semibold text-white tracking-tight drop-shadow-sm">
              {trip.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-[#FFB545]" />
                {trip.startDate} – {trip.endDate}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
                {trip.durationDays} ngày {trip.durationNights} đêm · {trip.memberCount} thành viên
              </span>
            </div>
          </div>

          {/* Action button when active trip */}
          {trip.status === 'ongoing' && (
            <div>
              <button
                type="button"
                onClick={onGoToToday}
                className="px-5 py-2.5 rounded-xl bg-[#2E8B57] hover:bg-[#246e45] text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Xem lịch hôm nay</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
