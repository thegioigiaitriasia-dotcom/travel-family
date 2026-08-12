import React from 'react';
import { MapPin, Calendar, Users, Compass, DollarSign, Edit3, Sparkles, BookmarkCheck, Plane } from 'lucide-react';
import { TripPlannerInput } from '../../types';

interface ReviewStepProps {
  data: TripPlannerInput;
  onGoToStep: (step: number) => void;
  onConfirmGenerate: () => void;
  onSaveDraft: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  onGoToStep,
  onConfirmGenerate,
  onSaveDraft,
}) => {
  const destinationText = data.destinations.map((d) => d.name).join(' ➔ ') || 'Đà Nẵng ➔ Hội An';

  let durationText = '4 ngày 3 đêm';
  if (data.dateMode === 'fixed' && data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime >= 0) {
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const nights = Math.max(0, days - 1);
      durationText = `${days} ngày ${nights} đêm`;
    }
  } else {
    durationText = `${data.expectedDays || 4} ngày dự kiến`;
  }

  const { adults, children, seniors } = data.travelers;
  let totalPeople = adults + children.length + seniors;
  let membersText = `${totalPeople} người (${adults} người lớn, ${children.length} trẻ em${seniors > 0 ? `, ${seniors} người cao tuổi` : ''})`;

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 max-w-xl mx-auto relative overflow-hidden">
      {/* Top Banner Tag */}
      <div className="text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-bronze-600">Bước 5 / 5</span>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Xác nhận chuyến đi
        </h3>
        <p className="text-xs text-slate-500">
          Tờ giấy tổng kết thông tin trước khi AI xây dựng Travel Book cá nhân hóa.
        </p>
      </div>

      {/* "Tờ Giấy Tổng Kết" Card Design with Dashed Ticket Line */}
      <div className="bg-sand-50 rounded-[20px] p-6 border-2 border-slate-200 shadow-inner relative space-y-4">
        {/* Decorative Ticket Notches */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200" />

        {/* Row 1: Gia đình */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bronze-600/10 text-bronze-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GIA ĐÌNH</span>
              <p className="text-sm font-extrabold text-slate-900">{membersText}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="text-xs font-bold text-bronze-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Chỉnh
          </button>
        </div>

        {/* Row 2: Điểm đến */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bronze-600/10 text-bronze-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ĐIỂM ĐẾN</span>
              <p className="text-sm font-extrabold text-slate-900">{destinationText}</p>
              <p className="text-[11px] text-slate-500">Từ: {data.origin.name || 'TP. Hồ Chí Minh'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="text-xs font-bold text-bronze-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Chỉnh
          </button>
        </div>

        {/* Row 3: Thời gian & Lịch di chuyển */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bronze-600/10 text-bronze-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">THỜI GIAN & KHUNG GIỜ CỤ THỂ</span>
              <p className="text-sm font-extrabold text-slate-900">{durationText}</p>
              <p className="text-[11px] text-slate-600 font-medium">
                ⏱ Chặng đi: <strong className="text-slate-900">{data.departureTime || '06:30'}</strong> ➔ Đến: <strong className="text-slate-900">{data.estimatedArrivalTime || '10:30'}</strong>
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                🔑 Check-in: <strong className="text-bronze-600">{data.hotelCheckInTime || '14:00'}</strong> | 🗝 Check-out: <strong className="text-bronze-600">{data.hotelCheckOutTime || '12:00'}</strong>
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                🛫 Chặng về: <strong className="text-slate-900">{data.returnDepartureTime || '15:30'}</strong> ➔ Về nhà: <strong className="text-slate-900">{data.returnArrivalTime || '19:30'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="text-xs font-bold text-bronze-600 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" /> Chỉnh
          </button>
        </div>

        {/* Inter-Province Legs Summary */}
        {data.destinations.length > 1 && (
          <div className="flex items-start justify-between pb-3 border-b border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-bronze-100 text-bronze-700 flex items-center justify-center shrink-0 mt-0.5">
                <Plane className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DI CHUYỂN LIÊN TỈNH ({data.destinations.length - 1} CHẶNG)</span>
                {data.destinations.slice(0, -1).map((fromDest, idx) => {
                  const toDest = data.destinations[idx + 1];
                  const leg = data.interProvinceLegs?.[idx] || {
                    transportMethod: 'Xe riêng 7 chỗ',
                    estimatedHours: 4.5,
                  };
                  return (
                    <p key={idx} className="text-[11px] font-semibold text-bronze-950">
                      • {fromDest.name} ➔ {toDest.name}: {leg.transportMethod} ({leg.estimatedHours || 4}h)
                    </p>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-xs font-bold text-bronze-600 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" /> Chỉnh
            </button>
          </div>
        )}

        {/* Dashed Separator Line */}
        <div className="border-t-2 border-dashed border-slate-300 my-2" />

        {/* Row 4: Phong cách */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2E8B57]/10 text-[#2E8B57] flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PHONG CÁCH & ĐỊA ĐIỂM / TOUR</span>
              <p className="text-sm font-extrabold text-slate-900">
                {data.travelStyles.join(', ') || 'Gia đình, Ẩm thực, Nghỉ dưỡng'}
              </p>
              {data.preferredAttractions && data.preferredAttractions.length > 0 && (
                <p className="text-[11px] text-bronze-600 font-semibold mt-0.5">
                  📍 Địa điểm & Tour chọn trước ({data.preferredAttractions.length}): {data.preferredAttractions.join(', ')}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="text-xs font-bold text-bronze-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Chỉnh
          </button>
        </div>

        {/* Row 5: Ngân sách */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFB545]/20 text-[#D97706] flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NGÂN SÁCH DỰ KIẾN</span>
              <p className="text-base font-black text-[#2E8B57]">
                {new Intl.NumberFormat('vi-VN').format(data.budget.total || 15000000)} VNĐ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(4)}
            className="text-xs font-bold text-bronze-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Chỉnh
          </button>
        </div>
      </div>

      {/* Main Action Button ✨ Tạo lịch trình */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onConfirmGenerate}
          className="w-full py-4 px-6 rounded-[20px] bg-bronze-600 hover:bg-[#B91C1C] text-white font-extrabold text-base transition-all duration-200 shadow-xl shadow-[#DC2626]/30 flex items-center justify-center gap-2 cursor-pointer group"
        >
          <Sparkles className="w-5 h-5 text-[#FFB545] animate-bounce" />
          <span>✨ Tạo lịch trình</span>
        </button>

        <button
          type="button"
          onClick={onSaveDraft}
          className="w-full py-3 px-6 rounded-xl bg-white border border-slate-200 hover:bg-sand-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <BookmarkCheck className="w-4 h-4 text-slate-500" />
          <span>Lưu bản nháp</span>
        </button>
      </div>
    </div>
  );
};
