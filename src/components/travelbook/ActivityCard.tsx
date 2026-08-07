import React from 'react';
import {
  Clock,
  MapPin,
  Utensils,
  Compass,
  Coffee,
  Plane,
  BedDouble,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  X,
  Phone,
} from 'lucide-react';
import { TravelActivity, ActivityStatus } from '../../types';

interface ActivityCardProps {
  activity: TravelActivity;
  onToggleStatus: (activityId: string) => void;
  onEdit: (activity: TravelActivity) => void;
  onAIReplace: (activity: TravelActivity) => void;
  onOpenMap: (placeName: string) => void;
  onOpenBookingVault?: (typeFilter?: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onToggleStatus,
  onEdit,
  onAIReplace,
  onOpenMap,
  onOpenBookingVault,
}) => {
  const getTypeBadge = () => {
    switch (activity.type) {
      case 'transport':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Plane className="w-3 h-3" />
            Di chuyển
          </span>
        );
      case 'food':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            <Utensils className="w-3 h-3" />
            Ăn uống
          </span>
        );
      case 'sightseeing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Compass className="w-3 h-3" />
            Tham quan
          </span>
        );
      case 'accommodation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <BedDouble className="w-3 h-3" />
            Lưu trú
          </span>
        );
      case 'rest':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Coffee className="w-3 h-3" />
            Nghỉ ngơi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Trải nghiệm
          </span>
        );
    }
  };

  const getStatusBadge = () => {
    switch (activity.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3 stroke-[3]" />
            Đã hoàn thành
          </span>
        );
      case 'current':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DC2626] text-white animate-pulse">
            Đang diễn ra
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 line-through">
            Đã bỏ qua
          </span>
        );
      case 'changed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
            Đã thay đổi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
            Sắp tới
          </span>
        );
    }
  };

  const isDone = activity.status === 'completed';

  return (
    <div
      className={`bg-white rounded-[22px] border p-5 shadow-sm space-y-3.5 transition-all duration-200 ${
        isDone
          ? 'border-emerald-200 bg-emerald-50/20 opacity-90'
          : activity.status === 'current'
          ? 'border-[#DC2626] ring-2 ring-[#DC2626]/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Header: Time, Badges, Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl flex items-center gap-1.5 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-[#DC2626]" />
            {activity.startTime} {activity.endTime ? `– ${activity.endTime}` : ''}
          </span>
          {getTypeBadge()}
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}

          {/* Complete Toggle Checkbox/Button */}
          <button
            type="button"
            onClick={() => onToggleStatus(activity.id)}
            className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
              isDone
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Đánh dấu hoàn thành"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">{isDone ? 'Xong' : 'Hoàn thành'}</span>
          </button>
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className={`text-base font-extrabold text-slate-900 ${isDone ? 'line-through text-slate-600' : ''}`}>
            {activity.title}
          </h4>

          {/* Booking Confirmation Status Badge */}
          {(activity.bookingStatus === 'confirmed' || activity.bookingCode) ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl text-[11px] font-extrabold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã có vé/booking</span>
              {activity.bookingCode && (
                <span className="bg-white text-slate-900 px-1.5 py-0.2 rounded font-mono text-[10px] border border-emerald-200">
                  {activity.bookingCode}
                </span>
              )}
            </div>
          ) : (
            activity.type !== 'rest' && (
              <button
                type="button"
                onClick={() => onOpenBookingVault?.('all')}
                className="text-[10px] font-extrabold text-slate-500 hover:text-[#DC2626] bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                + Tải lên vé/booking
              </button>
            )
          )}
        </div>

        {activity.description && (
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {activity.description}
          </p>
        )}

        {/* Present Ticket Action if confirmed */}
        {(activity.bookingStatus === 'confirmed' || activity.bookingCode) && onOpenBookingVault && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() =>
                onOpenBookingVault(
                  activity.type === 'transport'
                    ? 'flight'
                    : activity.type === 'accommodation'
                    ? 'hotel'
                    : 'ticket'
                )
              }
              className="w-full py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mở kho vé xuất trình tại quầy</span>
            </button>
          </div>
        )}
      </div>

      {/* Place & Location Info */}
      {activity.place && (
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-slate-900">{activity.place.name}</p>
                {activity.place.address && (
                  <p className="text-[11px] text-slate-500">{activity.place.address}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenMap(activity.place?.name || activity.title)}
              className="text-[11px] font-bold text-[#DC2626] hover:underline shrink-0 flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-200"
            >
              <span>Bản đồ</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Booking Code or Phone if present */}
          {(activity.place.bookingCode || activity.place.phone) && (
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/60 text-[11px]">
              {activity.place.bookingCode && (
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Mã đặt phòng: {activity.place.bookingCode}
                </span>
              )}
              {activity.place.phone && (
                <a
                  href={`tel:${activity.place.phone}`}
                  className="font-bold text-slate-700 hover:text-[#DC2626] flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{activity.place.phone}</span>
                </a>
              )}
            </div>
          )}

          {/* Suitability tags */}
          {activity.place.suitableFor && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activity.place.suitableFor.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cost Badge */}
      {(activity.estimatedCost !== undefined || activity.actualCost !== undefined) && (
        <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
          <span className="bg-amber-50 text-amber-900 px-3 py-1 rounded-xl border border-amber-200">
            Dự kiến:{' '}
            {new Intl.NumberFormat('vi-VN').format(activity.estimatedCost || 0)} đ
          </span>
          {activity.actualCost !== undefined && (
            <span className="bg-emerald-50 text-emerald-900 px-3 py-1 rounded-xl border border-emerald-200">
              Đã chi: {new Intl.NumberFormat('vi-VN').format(activity.actualCost)} đ
            </span>
          )}
        </div>
      )}

      {/* Family Tips / Notes Yellow Card */}
      {(activity.familyTips?.length || activity.notes) && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Lưu ý cho gia đình:</span>
          </div>
          {activity.notes && <p className="font-medium">{activity.notes}</p>}
          {activity.familyTips?.map((tip, idx) => (
            <p key={idx} className="font-medium">• {tip}</p>
          ))}
        </div>
      )}

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <button
          type="button"
          onClick={() => onAIReplace(activity)}
          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer border border-purple-200"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>✨ AI Thay địa điểm</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(activity)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Sửa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
