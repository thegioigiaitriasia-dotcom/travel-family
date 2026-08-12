import React, { useState } from 'react';
import { X, Check, Calendar, MapPin, Sparkles, BookOpen } from 'lucide-react';
import { TripSummary } from '../../types';

interface CreateDiaryFromTripDialogProps {
  isOpen: boolean;
  onClose: () => void;
  completedTrips: TripSummary[];
  onCreateDiary: (tripId: string, options: { copyDays: boolean; copyPlaces: boolean; copyCosts: boolean; copyPhotos: boolean }) => void;
}

export const CreateDiaryFromTripDialog: React.FC<CreateDiaryFromTripDialogProps> = ({
  isOpen,
  onClose,
  completedTrips,
  onCreateDiary,
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string>(completedTrips[0]?.id || '');
  const [copyDays, setCopyDays] = useState(true);
  const [copyPlaces, setCopyPlaces] = useState(true);
  const [copyCosts, setCopyCosts] = useState(true);
  const [copyPhotos, setCopyPhotos] = useState(true);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!selectedTripId) return;
    onCreateDiary(selectedTripId, { copyDays, copyPlaces, copyCosts, copyPhotos });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sand-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E9F0ED] text-[#183B35] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tạo Nhật ký từ Chuyến đi</h3>
              <p className="text-xs text-slate-500">Lưu giữ lại kỉ niệm và câu chuyện thực tế</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Select completed trip */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              1. Chọn chuyến đi đã hoàn thành
            </label>
            {completedTrips.length === 0 ? (
              <div className="p-4 rounded-xl bg-bronze-50 border border-bronze-200 text-bronze-800 text-xs">
                Bạn chưa có chuyến đi nào đã hoàn thành. Hãy hoàn tất kế hoạch chuyến đi trong Travel Book để bắt đầu viết nhật ký!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {completedTrips.map((trip) => {
                  const isSelected = selectedTripId === trip.id;
                  return (
                    <div
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#183B35] bg-[#E9F0ED]/60 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={trip.coverImage}
                          alt={trip.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{trip.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {trip.startDate} – {trip.endDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {trip.destinations.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#183B35] border-[#183B35] text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Content Copy Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              2. Nội dung tự động sao chép
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-sand-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={copyDays}
                  onChange={(e) => setCopyDays(e.target.checked)}
                  className="rounded text-[#183B35] focus:ring-[#183B35]"
                />
                <span className="font-medium text-slate-700">Các ngày lịch trình</span>
              </label>
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-sand-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={copyPlaces}
                  onChange={(e) => setCopyPlaces(e.target.checked)}
                  className="rounded text-[#183B35] focus:ring-[#183B35]"
                />
                <span className="font-medium text-slate-700">Địa điểm đã ghé</span>
              </label>
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-sand-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={copyCosts}
                  onChange={(e) => setCopyCosts(e.target.checked)}
                  className="rounded text-[#183B35] focus:ring-[#183B35]"
                />
                <span className="font-medium text-slate-700">Chi phí thực tế</span>
              </label>
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-sand-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={copyPhotos}
                  onChange={(e) => setCopyPhotos(e.target.checked)}
                  className="rounded text-[#183B35] focus:ring-[#183B35]"
                />
                <span className="font-medium text-slate-700">Ảnh trong chuyến đi</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              * Ghi chú riêng tư và mã vé nhạy cảm sẽ không được sao chép để đảm bảo an toàn.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-sand-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedTripId || completedTrips.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#183B35] hover:bg-[#28584E] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Khởi tạo Nhật ký</span>
          </button>
        </div>
      </div>
    </div>
  );
};
