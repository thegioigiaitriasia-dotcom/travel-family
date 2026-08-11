import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Check,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  Copy,
  ArrowRightLeft,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Plane,
  Utensils,
  Compass,
  BedDouble,
  Coffee,
  AlertTriangle,
  RefreshCw,
  Search,
  Tag,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { TravelActivity, TravelActivityType } from '../../types';
import { DeleteActivityDialog } from './DeleteActivityDialog';
import { supabase } from '../../lib/supabase';

interface ActivityEditorDrawerProps {
  activity: TravelActivity | null;
  isOpen: boolean;
  totalDays?: number;
  currentDayNumber?: number;
  onClose: () => void;
  onSave: (updatedActivity: TravelActivity) => void;
  onDelete?: (activityId: string) => void;
  onDuplicate?: (activity: TravelActivity) => void;
  onMoveDay?: (activityId: string, targetDayNumber: number) => void;
  onShiftUp?: (activityId: string) => void;
  onShiftDown?: (activityId: string) => void;
  onReplaceAI?: (activityId: string, newTitle: string, newPlaceName: string, newCost?: number) => void;
}

const activityTypes: { id: TravelActivityType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'transport', label: 'Di chuyển', icon: <Plane className="w-4 h-4 text-blue-600" />, color: 'bg-blue-50 border-blue-200 text-blue-900' },
  { id: 'food', label: 'Ăn uống', icon: <Utensils className="w-4 h-4 text-orange-600" />, color: 'bg-orange-50 border-orange-200 text-orange-900' },
  { id: 'sightseeing', label: 'Tham quan', icon: <Compass className="w-4 h-4 text-red-600" />, color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
  { id: 'rest', label: 'Nghỉ ngơi', icon: <Coffee className="w-4 h-4 text-slate-600" />, color: 'bg-slate-100 border-slate-200 text-slate-900' },
  { id: 'accommodation', label: 'Khách sạn', icon: <BedDouble className="w-4 h-4 text-purple-600" />, color: 'bg-purple-50 border-purple-200 text-purple-900' },
  { id: 'experience', label: 'Trải nghiệm', icon: <Sparkles className="w-4 h-4 text-amber-600" />, color: 'bg-amber-50 border-amber-200 text-amber-900' },
];

const availableTags = ['Gia đình', 'Trẻ em', 'Checkin', 'Ẩm thực', 'Biển', 'Văn hóa', 'Mạo hiểm', 'Thư giãn', 'Mùa mưa'];

const transportMethods = ['Máy bay', 'Grab', 'Taxi', 'Xe máy', 'Xe khách', 'Đi bộ'];

const locationSuggestions = [
  { name: 'Công viên Trung tâm', address: 'Khu vực trung tâm thành phố', distance: '1.5 km' },
  { name: 'Khu mua sắm địa phương', address: 'Chợ truyền thống', distance: '3.0 km' },
  { name: 'Nhà hàng đặc sản', address: 'Khu phố ẩm thực', distance: '0.8 km' },
  { name: 'Bảo tàng & Khu di tích', address: 'Điểm tham quan lịch sử', distance: '4.2 km' },
];

const aiReplaceReasons = ['Quá xa', 'Không phù hợp trẻ em', 'Trời mưa', 'Muốn rẻ hơn', 'Muốn đẹp hơn'];

// Đã xóa mockAIOptions

export const ActivityEditorDrawer: React.FC<ActivityEditorDrawerProps> = ({
  activity,
  isOpen,
  totalDays = 4,
  currentDayNumber = 1,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  onMoveDay,
  onShiftUp,
  onShiftDown,
  onReplaceAI,
}) => {
  if (!isOpen || !activity) return null;

  // Form State
  const [type, setType] = useState<TravelActivityType>(activity.type);
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description || '');
  const [startTime, setStartTime] = useState(activity.startTime || '08:00');
  const [endTime, setEndTime] = useState(activity.endTime || '09:30');
  const [placeName, setPlaceName] = useState(activity.place?.name || '');
  const [placeAddress, setPlaceAddress] = useState(activity.place?.address || '');
  const [cost, setCost] = useState<string>(activity.estimatedCost ? String(activity.estimatedCost) : '');
  const [isUnspecifiedCost, setIsUnspecifiedCost] = useState<boolean>(activity.estimatedCost === undefined);
  
  // Specific fields
  const [transportMethod, setTransportMethod] = useState<string>('Grab');
  const [bookingCode, setBookingCode] = useState<string>(activity.place?.bookingCode || '');
  const [checkInTime, setCheckInTime] = useState<string>('14:00');
  const [checkOutTime, setCheckOutTime] = useState<string>('12:00');
  const [familyTips, setFamilyTips] = useState<string>(activity.familyTips?.[0] || activity.notes || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Gia đình']);

  // Cover Image
  const [imageUrl, setImageUrl] = useState<string>(activity.place?.imageUrl || activity.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  // Autocomplete Location search
  const [showLocationResults, setShowLocationResults] = useState(false);

  // Dialog States
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showMoveDayDialog, setShowMoveDayDialog] = useState(false);
  const [showReplaceAIDialog, setShowReplaceAIDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // AI Replace State
  const [selectedAIReason, setSelectedAIReason] = useState<string>('Trời mưa');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [selectedAIOptionId, setSelectedAIOptionId] = useState<string>('');
  const [aiOptions, setAiOptions] = useState<any[]>([]);
  const [aiErrorMsg, setAiErrorMsg] = useState('');

  // Track initial state for unsaved dirty check
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(
      title !== activity.title ||
      type !== activity.type ||
      startTime !== activity.startTime ||
      endTime !== (activity.endTime || '') ||
      description !== (activity.description || '')
    );
  }, [title, type, startTime, endTime, description, activity]);

  // Time Validation Check
  const isTimeInvalid = startTime && endTime && endTime <= startTime;

  // Handle Safe Close
  const handleAttemptClose = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isTimeInvalid) return;

    const updated: TravelActivity = {
      ...activity,
      title: title.trim(),
      type,
      startTime,
      endTime: endTime || undefined,
      description: description.trim() || undefined,
      estimatedCost: isUnspecifiedCost ? undefined : Number(cost) || 0,
      bookingCode: bookingCode.trim() || activity.bookingCode,
      bookingStatus: bookingCode.trim() ? 'confirmed' : activity.bookingStatus,
      notes: familyTips.trim() || undefined,
      familyTips: familyTips.trim() ? [familyTips.trim()] : undefined,
      place: placeName.trim()
        ? {
            ...activity.place,
            name: placeName.trim(),
            address: placeAddress.trim() || undefined,
            bookingCode: bookingCode.trim() || activity.place?.bookingCode,
            suitableFor: selectedTags,
            imageUrl: imageUrl || activity.place?.imageUrl,
          }
        : undefined,
      imageUrl: imageUrl || activity.imageUrl,
    };

    onSave(updated);
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `places/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('poi_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('poi_images').getPublicUrl(filePath);
      
      setImageUrl(data.publicUrl);
      
      // Auto-save to poi_database for crowdsourcing if placeName is present
      if (placeName.trim()) {
        await supabase.from('poi_database').upsert({
          name: placeName.trim(),
          category: type || 'Attraction',
          address: placeAddress || '',
          city: '', // Leave blank, AI will handle
          image_url: data.publicUrl,
          source: 'user_uploaded'
        }, { onConflict: 'name,city' }).catch(console.warn);
      }

    } catch (err: any) {
      console.error('Lỗi tải ảnh:', err);
      alert('Không thể tải ảnh lên. Hãy thử lại. ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectLocation = (loc: { name: string; address: string }) => {
    setPlaceName(loc.name);
    setPlaceAddress(loc.address);
    setShowLocationResults(false);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
        {/* Responsive Container: Full screen mobile bottom sheet / 520px Drawer desktop */}
        <div className="bg-white w-full sm:w-[520px] h-full shadow-2xl flex flex-col justify-between p-0 animate-fadeIn relative">
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Chỉnh sửa hoạt động
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Cập nhật chi tiết lịch trình du lịch
              </p>
            </div>

            <button
              type="button"
              onClick={handleAttemptClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Pills Menu */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-2.5 flex items-center justify-between gap-2 text-xs font-bold text-slate-700 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowReplaceAIDialog(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 flex items-center gap-1.5 cursor-pointer font-extrabold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>✨ Đề xuất khác</span>
              </button>

              <button
                type="button"
                onClick={() => onDuplicate?.(activity)}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Copy className="w-3 h-3 text-slate-500" />
                <span>Nhân bản</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMoveDayDialog(true)}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                <span>Chuyển ngày</span>
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onShiftUp && (
                <button
                  type="button"
                  onClick={() => onShiftUp(activity.id)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  title="Di chuyển lên"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              )}
              {onShiftDown && (
                <button
                  type="button"
                  onClick={() => onShiftDown(activity.id)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  title="Di chuyển xuống"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Form Content Body */}
          <form id="activity-editor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-bold text-slate-700">
            {/* Field 1: Activity Type Select */}
            <div className="space-y-1.5">
              <label className="block text-slate-800 font-extrabold">
                1. Loại hoạt động
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                {activityTypes.map((cat) => {
                  const isSelected = type === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setType(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? `${cat.color} font-black shadow-xs ring-2 ring-[#DC2626]/20`
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat.icon}
                      <span className="text-xs truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 2: Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-slate-800 font-extrabold">
                  2. Tiêu đề hoạt động *
                </label>
                <span className="text-[10px] text-slate-400 font-normal">
                  {title.length}/80 ký tự
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Ăn sáng Phở Cà phê"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            {/* Field 3: Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-slate-800 font-extrabold">
                  3. Mô tả (Tùy chọn)
                </label>
                <span className="text-[10px] text-slate-400 font-normal">
                  {description.length}/500 ký tự
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn gọn về hoạt động..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            {/* Field 4: Time Picker */}
            <div className="space-y-1">
              <label className="block text-slate-800 font-extrabold">
                4. Thời gian
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Giờ bắt đầu</span>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="08:00"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 pl-8"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Giờ kết thúc</span>
                  <div className="relative">
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="09:30"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 pl-8"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>

              {isTimeInvalid && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Thời gian kết thúc không hợp lệ.</span>
                </p>
              )}
            </div>

            {/* Field 5: Location Search */}
            <div className="space-y-1 relative">
              <label className="block text-slate-800 font-extrabold">
                5. Địa điểm (Tìm kiếm & Tự chọn)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => {
                    setPlaceName(e.target.value);
                    setShowLocationResults(true);
                  }}
                  onFocus={() => setShowLocationResults(true)}
                  placeholder="Nhập địa điểm..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 pl-9"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              {/* Location Autocomplete Dropdown */}
              {showLocationResults && (
                <div className="absolute left-0 right-0 top-16 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 px-2 block">
                    Gợi ý địa điểm nổi tiếng
                  </span>
                  {locationSuggestions.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-start gap-2 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">{loc.name}</p>
                        <p className="text-[10px] text-slate-500">{loc.address}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowLocationResults(false)}
                    className="w-full text-center py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    Đóng gợi ý
                  </button>
                </div>
              )}

              <input
                type="text"
                value={placeAddress}
                onChange={(e) => setPlaceAddress(e.target.value)}
                placeholder="Địa chỉ cụ thể (Tùy chọn)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 mt-2"
              />
            </div>

            {/* Field 5.5: Hình ảnh Địa điểm (Upload) */}
            <div className="space-y-1">
              <label className="block text-slate-800 font-extrabold">
                5.5. Hình ảnh đại diện
              </label>
              <div className="flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0">
                    <img src={imageUrl} alt="Place" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImageUrl('')} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 cursor-pointer transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className={`w-20 h-20 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-bold block">{isUploading ? 'Đang tải...' : '+ Ảnh'}</span>
                    </div>
                  </label>
                )}
                <div className="text-xs text-slate-500 flex-1 leading-relaxed">
                  Ảnh bạn tải lên sẽ được hiển thị trên lịch trình và đóng góp vào cơ sở dữ liệu chung của cộng đồng.
                </div>
              </div>
            </div>

            {/* Field 6: Cost Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-slate-800 font-extrabold">
                  6. Chi phí dự kiến (VNĐ)
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUnspecifiedCost}
                    onChange={(e) => setIsUnspecifiedCost(e.target.checked)}
                    className="rounded text-[#DC2626]"
                  />
                  <span>Không xác định</span>
                </label>
              </div>

              {!isUnspecifiedCost && (
                <div className="relative">
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="250000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 pl-9"
                  />
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              )}
            </div>

            {/* Field 7: Transport Method (Only if type === 'transport') */}
            {type === 'transport' && (
              <div className="space-y-1 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-200">
                <label className="block text-blue-950 font-extrabold">
                  7. Phương tiện di chuyển
                </label>
                <div className="flex flex-wrap gap-2">
                  {transportMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setTransportMethod(method)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        transportMethod === method
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Field 8: Booking Details (Only if type === 'accommodation') */}
            {type === 'accommodation' && (
              <div className="space-y-3 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-200">
                <label className="block text-purple-950 font-extrabold">
                  8. Thông tin đặt phòng Khách sạn
                </label>

                <div>
                  <span className="text-[11px] text-purple-900 block mb-1">Mã đặt phòng (Booking Code)</span>
                  <input
                    type="text"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    placeholder="VD: BK-99201"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-purple-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-purple-900 block mb-1">Giờ Check-in</span>
                    <input
                      type="text"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-purple-950"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-purple-900 block mb-1">Giờ Check-out</span>
                    <input
                      type="text"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-purple-950"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Field 9: Family Tips */}
            <div className="space-y-1">
              <label className="block text-slate-800 font-extrabold">
                9. Ghi chú / Mẹo cho gia đình
              </label>
              <textarea
                rows={2}
                value={familyTips}
                onChange={(e) => setFamilyTips(e.target.value)}
                placeholder="VD: Mang theo nước uống, có nhiều bậc thang dốc..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            {/* Field 10: Tags */}
            <div className="space-y-1.5">
              <label className="block text-slate-800 font-extrabold">
                10. Nhãn gắn (Tags)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#DC2626] text-white border-[#DC2626]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Footer Bar */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
            {/* Delete button on left */}
            {onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Xóa</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleAttemptClose}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="submit"
                form="activity-editor-form"
                disabled={isTimeInvalid || !title.trim()}
                className="px-5 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-xs shadow-md shadow-[#DC2626]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 text-left animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">
                  Bạn có thay đổi chưa lưu
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Rời đi lúc này sẽ hủy bỏ các thay đổi.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedDialog(false);
                  const formEl = document.getElementById('activity-editor-form') as HTMLFormElement;
                  if (formEl) formEl.requestSubmit();
                }}
                className="w-full py-2.5 rounded-xl bg-[#DC2626] text-white font-extrabold text-xs hover:bg-[#B91C1C]"
              >
                Lưu ngay
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUnsavedDialog(false);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Bỏ qua thay đổi
              </button>

              <button
                type="button"
                onClick={() => setShowUnsavedDialog(false)}
                className="w-full py-2 rounded-xl text-slate-500 font-bold text-xs hover:text-slate-800"
              >
                Tiếp tục chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Day Selection Dialog */}
      {showMoveDayDialog && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 text-left animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-slate-900">Chuyển sang ngày khác</h4>
              <button
                type="button"
                onClick={() => setShowMoveDayDialog(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Chọn ngày trong hành trình để di chuyển hoạt động này:
            </p>

            <div className="space-y-2">
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const isCurrent = dayNum === currentDayNumber;
                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => {
                      if (!isCurrent && onMoveDay) {
                        onMoveDay(activity.id, dayNum);
                        setShowMoveDayDialog(false);
                        onClose();
                      }
                    }}
                    disabled={isCurrent}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer font-extrabold text-xs transition-all ${
                      isCurrent
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white hover:bg-red-50 hover:border-[#DC2626] text-slate-800'
                    }`}
                  >
                    <span>NGÀY {dayNum}</span>
                    {isCurrent ? (
                      <span className="text-[10px] text-slate-400">Hiên tại</span>
                    ) : (
                      <ArrowRightLeft className="w-3.5 h-3.5 text-[#DC2626]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Replace by AI Dialog */}
      {showReplaceAIDialog && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-md w-full space-y-5 shadow-2xl border border-purple-200 text-left animate-fadeIn relative">
            <button
              type="button"
              onClick={() => setShowReplaceAIDialog(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  ✨ AI Đề xuất thay thế
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Đang xem xét: {activity.title}
                </p>
              </div>
            </div>

            {/* Reasons */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 block">
                Vì sao bạn muốn thay đổi?
              </label>
              <div className="flex flex-wrap gap-2">
                {aiReplaceReasons.map((r) => {
                  const isSelected = selectedAIReason === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={async () => {
                        setSelectedAIReason(r);
                        setIsAIGenerating(true);
                        setAiErrorMsg('');
                        setAiOptions([]);
                        try {
                          const res = await fetch(`/api/suggest-alternative`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              activity: title,
                              reason: r,
                              city: placeName || '',
                            })
                          });
                          const data = await res.json();
                          if (data.success && data.options) {
                            setAiOptions(data.options);
                            if (data.options.length > 0) {
                              setSelectedAIOptionId(data.options[0].id);
                            }
                          } else {
                            setAiErrorMsg('Không thể lấy gợi ý từ AI.');
                          }
                        } catch (err) {
                          setAiErrorMsg('Lỗi kết nối AI.');
                        } finally {
                          setIsAIGenerating(false);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl border font-extrabold text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Cards */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-extrabold text-slate-800 block">
                Đề xuất tốt nhất từ AI:
              </label>

              {isAIGenerating ? (
                <div className="p-6 text-center text-slate-400 font-bold space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                  <p className="text-xs">AI đang tìm địa điểm tối ưu...</p>
                </div>
              ) : aiErrorMsg ? (
                <div className="p-4 text-center text-red-500 bg-red-50 rounded-xl text-xs">
                  {aiErrorMsg}
                </div>
              ) : aiOptions.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {aiOptions.map((opt) => {
                    const isSelected = selectedAIOptionId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedAIOptionId(opt.id)}
                        className={`p-3.5 rounded-2xl border text-xs cursor-pointer space-y-1 transition-all ${
                          isSelected
                            ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-600/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-black text-slate-900">
                          <span>{opt.title}</span>
                          <span className="text-[10px] text-purple-700 font-bold">{opt.distance}</span>
                        </div>
                        <p className="text-purple-600 font-medium text-[11px] mb-1">{opt.placeName}</p>
                        <p className="text-slate-600 font-medium text-[11px]">{opt.reason}</p>
                        <div className="text-[10px] font-bold text-slate-500 pt-1">
                          Chi phí: {new Intl.NumberFormat('vi-VN').format(opt.cost)} đ
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 italic text-xs">
                  Chọn lý do ở trên để AI gợi ý.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReplaceAIDialog(false)}
                className="py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={() => {
                  const chosen = aiOptions.find((o) => o.id === selectedAIOptionId);
                  if (onReplaceAI && chosen) {
                    onReplaceAI(activity.id, chosen.title, chosen.placeName, chosen.cost);
                  }
                  setShowReplaceAIDialog(false);
                  onClose();
                }}
                className="py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md shadow-purple-700/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Thay hoạt động này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteActivityDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title={activity.title}
        onConfirm={() => {
          if (onDelete) onDelete(activity.id);
          setShowDeleteDialog(false);
          onClose();
        }}
      />
    </>
  );
};
