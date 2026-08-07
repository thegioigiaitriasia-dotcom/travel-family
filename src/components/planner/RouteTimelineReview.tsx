import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Ticket,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  Sparkles,
  Plane,
  Home,
  Save,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  MultiCityTripPlannerInput,
  TripPlanWarning,
} from '../../types';

interface RouteTimelineReviewProps {
  data: MultiCityTripPlannerInput;
  onGoToStep: (step: number) => void;
  onConfirmGenerate: () => void;
  onSaveDraft: () => void;
}

export const RouteTimelineReview: React.FC<RouteTimelineReviewProps> = ({
  data,
  onGoToStep,
  onConfirmGenerate,
  onSaveDraft,
}) => {
  const windowData = data.tripWindow;
  const stops = data.routeStops;
  const legs = data.journeyLegs;
  const accommodations = data.accommodations;

  // Run Route Logic Validation
  const warnings: TripPlanWarning[] = [];

  // Check 1: Missing transports
  legs.forEach((leg) => {
    if (leg.bookingStatus === 'not_booked') {
      const fromName = stops.find((s) => s.id === leg.fromStopId)?.name || 'Chặng';
      const toName = stops.find((s) => s.id === leg.toStopId)?.name || 'Chặng';
      warnings.push({
        code: 'missing_transport',
        severity: 'warning',
        message: `Chặng ${fromName} → ${toName} chưa đặt vé / xe chính thức. AI sẽ gợi ý khung giờ nhưng bạn cần xác nhận lại.`,
        relatedLegId: leg.id,
        suggestedAction: 'Bổ sung vé ở Bước 3',
      });
    }
  });

  // Check 2: Missing accommodation for stay stops
  stops
    .filter((s) => s.type === 'stay')
    .forEach((stop) => {
      const acc = accommodations.find((a) => a.stopId === stop.id);
      if (!acc || acc.status === 'not_booked') {
        warnings.push({
          code: 'missing_accommodation',
          severity: 'info',
          message: `Điểm dừng ${stop.name} chưa đặt khách sạn. AI sẽ đề xuất khách sạn trung tâm phù hợp gia đình.`,
          relatedStopId: stop.id,
        });
      }
    });

  // Check 3: Tight connection or schedule overlaps
  for (let i = 0; i < legs.length - 1; i++) {
    const curLeg = legs[i];
    const nextLeg = legs[i + 1];
    if (
      curLeg.arrival.time &&
      nextLeg.departure.time &&
      curLeg.arrival.date === nextLeg.departure.date
    ) {
      const [ch, cm] = curLeg.arrival.time.split(':').map(Number);
      const [nh, nm] = nextLeg.departure.time.split(':').map(Number);
      const diffMins = nh * 60 + nm - (ch * 60 + cm);
      if (diffMins > 0 && diffMins < 60) {
        warnings.push({
          code: 'tight_connection',
          severity: 'critical',
          message: `Khoảng thời gian trung chuyển giữa chặng ${i + 1} và chặng ${
            i + 2
          } chỉ có ${diffMins} phút, có thể quá gấp đối với gia đình.`,
          suggestedAction: 'Điều chỉnh giờ khởi hành ở Bước 3',
        });
      }
    }
  }

  // Auto-generate clarification questions if ambiguity exists
  const clarificationQuestions: string[] = [];
  if (warnings.some((w) => w.code === 'tight_connection')) {
    clarificationQuestions.push(
      'Thời gian trung chuyển giữa hai chặng khá sát nhau. Gia đình muốn ưu tiên phương tiện nhanh hơn hay nới rộng giờ khởi hành?'
    );
  }
  if (warnings.some((w) => w.code === 'missing_transport')) {
    clarificationQuestions.push(
      'Một số chặng chưa có vé xe cố định. Gia đình dự kiến tự lái xe hay muốn AI xuất vé khuyến nghị?'
    );
  }
  if (data.mobilityAndComfortNeeds.includes('Có người dễ say xe')) {
    clarificationQuestions.push(
      'Gia đình có thành viên dễ say xe. Bạn có muốn AI chèn trạm dừng nghỉ 15-20 phút giữa các chặng đường dài không?'
    );
  }

  const criticalCount = warnings.filter((w) => w.severity === 'critical').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F0ED] text-[#183B35] text-xs font-bold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Bước 6 / 6 — Kiểm tra toàn tuyến & Tạo lịch trình</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Xem lại hành trình trước khi AI lập kế hoạch
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Timeline tổng thể thể hiện đầy đủ điểm xuất phát, các chặng di chuyển, thời gian lưu trú và cảnh báo logic.
          </p>
        </div>

        <button
          type="button"
          onClick={onSaveDraft}
          className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
        >
          <Save className="w-4 h-4 text-slate-500" />
          <span>Lưu bản nháp</span>
        </button>
      </div>

      {/* Validation Warnings Panel */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Kiểm tra logic hành trình ({warnings.length} lưu ý)
          </h3>
          <div className="space-y-2">
            {warnings.map((w, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                  w.severity === 'critical'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : w.severity === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      w.severity === 'critical'
                        ? 'text-red-600'
                        : w.severity === 'warning'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <div>
                    <span className="font-bold">{w.message}</span>
                    {w.suggestedAction && (
                      <span className="block text-[11px] mt-0.5 font-semibold text-slate-700">
                        👉 Gợi ý: {w.suggestedAction}
                      </span>
                    )}
                  </div>
                </div>

                {w.relatedLegId && (
                  <button
                    type="button"
                    onClick={() => onGoToStep(3)}
                    className="px-2.5 py-1 rounded bg-white border border-slate-300 font-bold text-[11px] hover:bg-slate-100 shrink-0"
                  >
                    Sửa chặng
                  </button>
                )}
                {w.relatedStopId && (
                  <button
                    type="button"
                    onClick={() => onGoToStep(5)}
                    className="px-2.5 py-1 rounded bg-white border border-slate-300 font-bold text-[11px] hover:bg-slate-100 shrink-0"
                  >
                    Sửa lưu trú
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto Clarification Questions */}
      {clarificationQuestions.length > 0 && (
        <div className="bg-[#E9F0ED] border border-[#183B35]/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-[#183B35] font-extrabold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#2E8B57]" />
            <span>Câu hỏi làm rõ tự động từ AI</span>
          </div>
          <ul className="space-y-2 text-xs text-[#183B35]">
            {clarificationQuestions.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold text-[#2E8B57]">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comprehensive Route Timeline */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#2E8B57]" />
          Timeline hành trình chi tiết
        </h3>

        <div className="relative border-l-2 border-[#2E8B57]/30 pl-4 sm:pl-6 ml-2 space-y-6 my-2">
          {/* Start departure event */}
          <div className="relative">
            <div className="absolute -left-[25px] sm:-left-[33px] top-1 w-4 h-4 rounded-full bg-[#2E8B57] ring-4 ring-emerald-100" />
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="text-[#2E8B57]">
                  {windowData.startDate} • {windowData.startTime || '07:00'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                  {windowData.startTimeStatus === 'confirmed' ? 'Đã có vé' : 'Khung giờ mong muốn'}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                Rời nhà tại {stops[0]?.name || 'TP.HCM'} đi sân bay / ga
              </h4>
            </div>
          </div>

          {/* Render legs & stops iteratively */}
          {legs.map((leg, idx) => {
            const fromStop = stops.find((s) => s.id === leg.fromStopId);
            const toStop = stops.find((s) => s.id === leg.toStopId);
            const isConfirmed = leg.bookingStatus === 'confirmed';

            return (
              <React.Fragment key={leg.id}>
                {/* Leg journey card */}
                <div className="relative">
                  <div className="absolute -left-[25px] sm:-left-[33px] top-3 w-4 h-4 rounded-full bg-[#183B35]" />
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">
                        Chặng {idx + 1}: {fromStop?.name} → {toStop?.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isConfirmed ? 'Đã xác nhận' : 'Chưa đặt vé'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                      <Plane className="w-4 h-4 text-[#2E8B57]" />
                      <span>{leg.transportMode.toUpperCase()}</span>
                      {leg.providerName && (
                        <span className="text-xs text-slate-500 font-normal">
                          ({leg.providerName})
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-4">
                      <span>
                        Khởi hành: <strong>{leg.departure.date}</strong> lúc{' '}
                        <strong>{leg.departure.time || '07:00'}</strong>
                      </span>
                      {leg.arrival.time && (
                        <span>
                          Đến nơi: <strong>{leg.arrival.time}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stay in city card */}
                {toStop && toStop.type === 'stay' && (
                  <div className="relative">
                    <div className="absolute -left-[25px] sm:-left-[33px] top-3 w-4 h-4 rounded-full bg-blue-600" />
                    <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                        <span>Ở lại {toStop.name}</span>
                        <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-800">
                          {toStop.nights || 1} đêm
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        Mục đích: {toStop.purposes?.join(', ') || 'Tham quan, nghỉ dưỡng'}
                      </p>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* End return event */}
          <div className="relative">
            <div className="absolute -left-[25px] sm:-left-[33px] top-1 w-4 h-4 rounded-full bg-purple-600 ring-4 ring-purple-100" />
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="text-purple-700">
                  {windowData.endDate} • {windowData.endTime || '18:00'}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px]">
                  Kết thúc hành trình
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                Trở về tại {stops[stops.length - 1]?.name || 'TP.HCM'}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onGoToStep(1)}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
        >
          Sửa lại thông tin
        </button>

        <button
          type="button"
          onClick={onConfirmGenerate}
          disabled={criticalCount > 0}
          className="px-7 py-3 rounded-xl bg-[#2E8B57] text-white font-extrabold text-sm sm:text-base hover:bg-[#236c43] transition-all shadow-lg shadow-[#2E8B57]/30 flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          <span>Xác nhận & Tạo lịch trình AI</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
