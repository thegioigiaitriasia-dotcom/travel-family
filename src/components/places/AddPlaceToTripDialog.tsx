import React, { useState } from 'react';
import { X, Calendar, Clock, Check, AlertTriangle, MapPin, Sparkles, Plane, Utensils, Compass } from 'lucide-react';
import { SavedPlace, TravelBook, TravelActivityType } from '../../types';

interface AddPlaceToTripDialogProps {
  place: SavedPlace | null;
  isOpen: boolean;
  trips: TravelBook[];
  onClose: () => void;
  onConfirmAdd: (
    tripId: string,
    dayNumber: number,
    activityType: TravelActivityType,
    startTime: string,
    place: SavedPlace
  ) => void;
}

const activityTypes: { id: TravelActivityType; label: string }[] = [
  { id: 'food', label: 'Ăn uống' },
  { id: 'sightseeing', label: 'Tham quan' },
  { id: 'cafe' as any, label: 'Cà phê' },
  { id: 'accommodation', label: 'Khách sạn' },
  { id: 'experience', label: 'Trải nghiệm' },
  { id: 'rest', label: 'Nghỉ ngơi' },
];

export const AddPlaceToTripDialog: React.FC<AddPlaceToTripDialogProps> = ({
  place,
  isOpen,
  trips,
  onClose,
  onConfirmAdd,
}) => {
  if (!isOpen || !place) return null;

  const defaultTrip = trips[0];
  const [selectedTripId, setSelectedTripId] = useState<string>(defaultTrip?.id || '');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [activityType, setActivityType] = useState<TravelActivityType>(
    place.category === 'food' ? 'food' : place.category === 'accommodation' ? 'accommodation' : 'sightseeing'
  );
  const [startTime, setStartTime] = useState<string>('09:00');
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const activeTrip = trips.find((t) => t.id === selectedTripId) || defaultTrip;
  const activeDay = activeTrip?.days.find((d) => d.dayNumber === selectedDayNumber);

  // Check if place is already added to this day
  const isDuplicateOnDay = activeDay?.activities.some(
    (act) => act.place?.name.toLowerCase().trim() === place.name.toLowerCase().trim()
  );

  const handleConfirm = () => {
    onConfirmAdd(selectedTripId, selectedDayNumber, activityType, startTime, place);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn text-xs font-bold text-slate-700">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-[#DC2626] flex items-center justify-center shrink-0 border border-sky-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Thêm vào chuyến đi</h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[240px]">
                {place.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {showSuccessToast ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 animate-bounce">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900">
              Đã thêm vào Lịch trình thành công!
            </h4>
            <p className="text-xs text-slate-500">
              Đang quay lại kho địa điểm...
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Step 1: Select Trip */}
            <div className="space-y-1">
              <label className="block text-slate-900 font-extrabold">
                1. Chọn chuyến đi
              </label>
              <select
                value={selectedTripId}
                onChange={(e) => {
                  setSelectedTripId(e.target.value);
                  setSelectedDayNumber(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#183B35] cursor-pointer"
              >
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.title} ({trip.startDate})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Day */}
            {activeTrip && (
              <div className="space-y-1">
                <label className="block text-slate-900 font-semibold">
                  2. Chọn ngày trong lịch trình
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {activeTrip.days.map((day) => {
                    const isSelected = day.dayNumber === selectedDayNumber;
                    return (
                      <button
                        key={day.dayNumber}
                        type="button"
                        onClick={() => setSelectedDayNumber(day.dayNumber)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#183B35] text-white border-[#183B35] font-semibold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs font-semibold">NGÀY {day.dayNumber}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-[#E9F0ED]' : 'text-slate-500'}`}>
                          {day.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Select Activity Type */}
            <div className="space-y-1">
              <label className="block text-slate-900 font-extrabold">
                3. Loại hoạt động
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activityTypes.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityType(act.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      activityType === act.id
                        ? 'bg-[#E9F0ED] text-[#183B35] border-[#183B35]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Time */}
            <div className="space-y-1">
              <label className="block text-slate-900 font-extrabold">
                4. Thời gian bắt đầu
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="09:00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 pl-9"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Duplicate Notice */}
            {isDuplicateOnDay && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Cảnh báo: Địa điểm này đã xuất hiện trong Ngày {selectedDayNumber}.</span>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="py-3 rounded-xl bg-[#183B35] hover:bg-[#28584E] text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Thêm vào lịch trình</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
