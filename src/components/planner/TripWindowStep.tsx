import React from 'react';
import { Calendar, Clock, Ticket, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { MultiCityTripPlannerInput } from '../../types';

interface TripWindowStepProps {
  data: MultiCityTripPlannerInput;
  onUpdate: (updated: Partial<MultiCityTripPlannerInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const TripWindowStep: React.FC<TripWindowStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const windowData = data.tripWindow;

  const handleUpdateWindow = (fields: Partial<typeof windowData>) => {
    onUpdate({
      tripWindow: {
        ...windowData,
        ...fields,
      },
    });
  };

  const handleStartTimeStatusChange = (status: 'confirmed' | 'preferred' | 'unknown') => {
    handleUpdateWindow({
      startTimeStatus: status,
      ...(status === 'preferred' && !windowData.startTime ? { startTime: 'Buổi sáng' } : {}),
    });
  };

  const handleEndTimeStatusChange = (status: 'confirmed' | 'preferred' | 'unknown') => {
    handleUpdateWindow({
      endTimeStatus: status,
      ...(status === 'preferred' && !windowData.endTime ? { endTime: 'Buổi chiều' } : {}),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F0ED] text-[#183B35] text-xs font-bold mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Bước 1 / 6 — Khung thời gian chuyến đi</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Gia đình dự kiến đi khi nào?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Xác định ngày khởi hành & kết thúc cùng khung giờ thực tế để hệ thống sắp xếp tuyến đường chính xác nhất.
        </p>
      </div>

      {/* Start Trip Section */}
      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#2E8B57] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            Thời điểm khởi hành
          </h3>

          {/* Mode Selector Toggle */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleStartTimeStatusChange('confirmed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                windowData.startTimeStatus === 'confirmed'
                  ? 'bg-[#183B35] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              Đã có vé / Giờ chính xác
            </button>
            <button
              type="button"
              onClick={() => handleStartTimeStatusChange('preferred')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                windowData.startTimeStatus === 'preferred'
                  ? 'bg-[#183B35] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Chưa đặt vé / Khung giờ mong muốn
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ngày khởi hành <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={windowData.startDate}
              onChange={(e) => handleUpdateWindow({ startDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {windowData.startTimeStatus === 'confirmed'
                ? 'Giờ khởi hành chính xác (ghi trên vé)'
                : 'Khung giờ mong muốn rời đi'}
            </label>

            {windowData.startTimeStatus === 'confirmed' ? (
              <input
                type="time"
                value={windowData.startTime || '07:00'}
                onChange={(e) => handleUpdateWindow({ startTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
              />
            ) : (
              <select
                value={windowData.startTime || 'Buổi sáng'}
                onChange={(e) => handleUpdateWindow({ startTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
              >
                <option value="Buổi sáng">Buổi sáng (06:00 – 11:30)</option>
                <option value="Buổi trưa">Buổi trưa (11:30 – 13:30)</option>
                <option value="Buổi chiều">Buổi chiều (13:30 – 18:00)</option>
                <option value="Buổi tối">Buổi tối (18:00 – 22:00)</option>
                <option value="Chưa quyết định">Chưa quyết định</option>
              </select>
            )}
          </div>
        </div>

        {windowData.startTimeStatus === 'preferred' && (
          <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Lưu ý:</strong> Giờ mong muốn giúp AI gợi ý các lịch trình phù hợp, nhưng sẽ được đánh dấu là chưa xác nhận vé cho đến khi bạn nhập chính xác mã vé ở Bước 3.
            </span>
          </div>
        )}
      </div>

      {/* End Trip Section */}
      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#183B35] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            Thời điểm kết thúc chuyến đi
          </h3>

          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleEndTimeStatusChange('confirmed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                windowData.endTimeStatus === 'confirmed'
                  ? 'bg-[#183B35] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              Đã có vé
            </button>
            <button
              type="button"
              onClick={() => handleEndTimeStatusChange('preferred')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                windowData.endTimeStatus === 'preferred'
                  ? 'bg-[#183B35] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Khung giờ mong muốn
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={windowData.endDate}
              onChange={(e) => handleUpdateWindow({ endDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {windowData.endTimeStatus === 'confirmed'
                ? 'Giờ kết thúc / Đã có vé chuyến về'
                : 'Khung giờ dự kiến kết thúc'}
            </label>

            {windowData.endTimeStatus === 'confirmed' ? (
              <input
                type="time"
                value={windowData.endTime || '18:00'}
                onChange={(e) => handleUpdateWindow({ endTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
              />
            ) : (
              <select
                value={windowData.endTime || 'Buổi chiều'}
                onChange={(e) => handleUpdateWindow({ endTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
              >
                <option value="Buổi trưa">Buổi trưa (trước 13:30)</option>
                <option value="Buổi chiều">Buổi chiều (13:30 – 18:00)</option>
                <option value="Buổi tối">Buổi tối (18:00 – 22:00)</option>
                <option value="Chưa quyết định">Chưa quyết định</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
        >
          Quay lại
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-[#2E8B57] text-white font-extrabold text-sm hover:bg-[#236c43] transition-all shadow-md shadow-[#2E8B57]/20 flex items-center gap-2"
        >
          <span>Tiếp tục: Tuyến hành trình</span>
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
