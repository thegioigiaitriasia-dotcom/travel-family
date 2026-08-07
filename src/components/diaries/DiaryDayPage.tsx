import React, { useState } from 'react';
import { TravelDiary, DiaryDay } from '../../types';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Calendar,
  MapPin,
  Clock,
  Camera,
  Heart,
  DollarSign,
  Utensils,
  Plus,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  Mic,
} from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';

interface DiaryDayPageProps {
  diary: TravelDiary;
  dayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  onBackToOverview: () => void;
  onOpenEditor: () => void;
  onUpdateDayStory: (dayNumber: number, storyText: string) => void;
}

export const DiaryDayPage: React.FC<DiaryDayPageProps> = ({
  diary,
  dayNumber,
  onSelectDay,
  onBackToOverview,
  onOpenEditor,
  onUpdateDayStory,
}) => {
  const day = diary.days.find((d) => d.dayNumber === dayNumber) || diary.days[0];
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyInput, setStoryInput] = useState(day?.story || '');

  if (!day) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-600">Ngày này chưa có thông tin trong nhật ký.</p>
        <button
          onClick={onBackToOverview}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Quay lại tổng quan
        </button>
      </div>
    );
  }

  const dayPhotos = diary.photos.filter((p) => p.dayId === day.id);
  const totalDays = diary.days.length;

  const handleSaveStory = () => {
    onUpdateDayStory(day.dayNumber, storyInput);
    setIsEditingStory(false);
  };

  const getMoodBadge = (primary?: string) => {
    switch (primary) {
      case 'very_happy':
        return { label: 'Rất vui', color: 'bg-[#E9F0ED] text-[#183B35] border-[#183B35]/20' };
      case 'happy':
        return { label: 'Vui vẻ', color: 'bg-[#E9F0ED] text-[#183B35] border-[#183B35]/20' };
      case 'neutral':
        return { label: 'Bình thường', color: 'bg-[#F0F1ED] text-[#606864] border-[#E2E3DE]' };
      case 'tired':
        return { label: 'Hơi mệt', color: 'bg-[#F7F5F0] text-[#A46F3D] border-[#E2E3DE]' };
      case 'difficult':
        return { label: 'Trắc trở', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: 'Vui vẻ', color: 'bg-[#E9F0ED] text-[#183B35] border-[#183B35]/20' };
    }
  };

  const moodInfo = getMoodBadge(day.mood?.primary);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToOverview}
          className="flex items-center gap-2 text-xs font-semibold text-[#1D211F] hover:text-[#183B35] transition-colors bg-white px-3.5 py-2 rounded-[12px] border border-[#E2E3DE] shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#183B35]" strokeWidth={1.75} />
          <span>Quay về Tổng quan Nhật ký</span>
        </button>

        {/* Prev / Next Day controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectDay(dayNumber - 1)}
            disabled={dayNumber <= 1}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-[12px] border border-[#E2E3DE] bg-white hover:bg-[#F7F5F0] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Ngày trước</span>
          </button>
          <span className="text-xs font-semibold text-[#1D211F] bg-[#E9F0ED] px-3 py-2 rounded-[12px]">
            NGÀY {dayNumber} / {totalDays}
          </span>
          <button
            onClick={() => onSelectDay(dayNumber + 1)}
            disabled={dayNumber >= totalDays}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-[12px] border border-[#E2E3DE] bg-white hover:bg-[#F7F5F0] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <span className="hidden sm:inline">Ngày sau</span>
            <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Day Banner Header */}
      <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#183B35] uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-[#183B35]" strokeWidth={1.75} />
            <span>NGÀY {day.dayNumber} &bull; {day.date}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D211F] tracking-tight">{day.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#606864] pt-1">
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#183B35]" strokeWidth={1.75} />
              {dayPhotos.length} hình ảnh
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#A46F3D]" strokeWidth={1.75} />
              {day.activities.length} địa điểm ghé qua
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#1D211F]">
              <DollarSign className="w-4 h-4 text-[#183B35]" strokeWidth={1.75} />
              {(day.actualCost || 0).toLocaleString('vi-VN')}đ đã chi
            </span>
          </div>
        </div>

        <button
          onClick={onOpenEditor}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E9F0ED] hover:bg-[#183B35]/20 text-[#183B35] rounded-[12px] text-xs font-semibold border border-[#183B35]/20 transition-colors shrink-0 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" strokeWidth={1.75} />
          <span>Chỉnh sửa ngày</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Story, Timeline, Photo Gallery */}
        <div className="lg:col-span-8 space-y-8">
          {/* Day Story */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E3DE] pb-3">
              <h3 className="font-semibold text-[#1D211F] text-[17px] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#183B35]" strokeWidth={1.75} />
                <span>Câu chuyện trong ngày</span>
              </h3>
              <div className="flex items-center gap-2">
                <VoiceInputButton
                  targetFieldTitle={`Ghi âm cảm nghĩ - Ngày ${day.dayNumber}`}
                  currentText={storyInput}
                  onTranscribed={(text, mode) => {
                    const newText = mode === 'append' && storyInput ? `${storyInput}\n${text}` : text;
                    setStoryInput(newText);
                    onUpdateDayStory(day.dayNumber, newText);
                  }}
                  variant="outline"
                  size="sm"
                  label="Ghi âm giọng nói"
                />
                {!isEditingStory && (
                  <button
                    onClick={() => setIsEditingStory(true)}
                    className="text-xs font-semibold text-[#183B35] hover:underline flex items-center gap-1 bg-[#E9F0ED] px-3 py-1.5 rounded-xl border border-[#183B35]/20 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Sửa văn bản</span>
                  </button>
                )}
              </div>
            </div>

            {isEditingStory ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#606864]">
                    Nhập nội dung văn bản hoặc nói trực tiếp qua micro:
                  </span>
                  <VoiceInputButton
                    targetFieldTitle={`Chỉnh sửa Ngày ${day.dayNumber}`}
                    currentText={storyInput}
                    onTranscribed={(text, mode) => {
                      setStoryInput(mode === 'append' && storyInput ? `${storyInput}\n${text}` : text);
                    }}
                    variant="secondary"
                    size="sm"
                    label="Nói để chèn văn bản"
                  />
                </div>
                <textarea
                  rows={6}
                  value={storyInput}
                  onChange={(e) => setStoryInput(e.target.value)}
                  placeholder="Ghi lại những khoảnh khắc, cảm xúc và kỉ niệm đáng nhớ trong ngày..."
                  className="w-full border border-[#CDD2CE] rounded-[12px] p-3 text-xs text-[#1D211F] focus:outline-none focus:ring-2 focus:ring-[#183B35]/20 focus:border-[#183B35] leading-relaxed"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingStory(false)}
                    className="px-3 py-1.5 text-xs text-[#606864] hover:text-[#1D211F] cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveStory}
                    className="px-4 py-1.5 bg-[#183B35] hover:bg-[#28584E] text-white text-xs font-semibold rounded-[12px] cursor-pointer"
                  >
                    Lưu câu chuyện
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none text-xs sm:text-sm text-[#1D211F] leading-relaxed whitespace-pre-line">
                {day.story || 'Chưa có nội dung câu chuyện được ghi lại cho ngày này.'}
              </div>
            )}
          </div>

          {/* Actual Timeline vs Planned (Section 14 Spec) */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-[#1D211F] text-[17px] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#183B35]" strokeWidth={1.75} />
              <span>Dòng thời gian đã trải nghiệm</span>
            </h3>

            {day.activities.length === 0 ? (
              <p className="text-xs text-[#606864] italic">Chưa ghi nhận hoạt động cụ thể trong ngày này.</p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#CDD2CE]">
                {day.activities.map((act) => {
                  let statusBadge = { label: 'Đã trải nghiệm', bg: 'bg-[#E9F0ED] text-[#183B35] border-[#183B35]/20', icon: CheckCircle };
                  if (act.status === 'skipped') {
                    statusBadge = { label: 'Đã bỏ qua', bg: 'bg-[#F0F1ED] text-[#606864] border-[#E2E3DE]', icon: XCircle };
                  } else if (act.status === 'changed') {
                    statusBadge = { label: 'Đã thay đổi', bg: 'bg-[#F7F5F0] text-[#A46F3D] border-[#E2E3DE]', icon: RefreshCw };
                  } else if (act.status === 'added_during_trip') {
                    statusBadge = { label: 'Phát sinh', bg: 'bg-[#E9F0ED] text-[#183B35] border-[#183B35]/20', icon: Plus };
                  }
                  const StatusIcon = statusBadge.icon;

                  return (
                    <div key={act.id} className="relative group">
                      <div className="absolute -left-[22px] top-2 w-2.5 h-2.5 rounded-full bg-[#183B35]" />
                      <div className="bg-[#FFFFFF] rounded-[12px] p-4 border border-[#E2E3DE] border-l-4 border-l-[#183B35] space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-[#183B35] bg-[#E9F0ED] px-2 py-0.5 rounded-[4px]">
                              {act.actualTime || act.plannedTime || 'Mọi lúc'}
                            </span>
                            <h4 className="font-semibold text-[#1D211F] text-sm">{act.title}</h4>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                            <StatusIcon className="w-3 h-3" strokeWidth={1.75} />
                            <span>{statusBadge.label}</span>
                          </span>
                        </div>

                        {act.placeName && (
                          <div className="text-xs text-[#606864] flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#A46F3D]" strokeWidth={1.75} />
                            <span>{act.placeName}</span>
                          </div>
                        )}

                        {act.note && (
                          <p className="text-xs text-[#606864] italic bg-[#F7F5F0] p-2.5 rounded-[8px] border border-[#E2E3DE]">
                            "{act.note}"
                          </p>
                        )}

                        {act.actualCost && (
                          <div className="text-xs font-semibold text-[#183B35]">
                            Chi phí thực tế: {act.actualCost.toLocaleString('vi-VN')}đ
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Album Photos for this day */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#1D211F] text-[17px] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#183B35]" strokeWidth={1.75} />
                <span>Khoảnh khắc hình ảnh ({dayPhotos.length})</span>
              </h3>
              <button
                onClick={onOpenEditor}
                className="text-xs font-semibold text-[#183B35] hover:underline cursor-pointer"
              >
                + Thêm ảnh mới
              </button>
            </div>

            {dayPhotos.length === 0 ? (
              <div className="p-8 text-center bg-[#F7F5F0] rounded-[12px] border border-dashed border-[#CDD2CE] space-y-2">
                <Camera className="w-8 h-8 text-[#606864] mx-auto" strokeWidth={1.5} />
                <p className="text-xs text-[#606864]">Chưa có ảnh nào được lưu cho ngày này.</p>
                <button onClick={onOpenEditor} className="text-xs text-[#183B35] font-semibold hover:underline cursor-pointer">
                  Thêm ảnh ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dayPhotos.map((photo) => (
                  <div key={photo.id} className="group relative rounded-[12px] overflow-hidden bg-[#F7F5F0] border border-[#E2E3DE] aspect-square">
                    <img
                      src={photo.fileUrl}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-white">
                      <p className="text-[11px] font-semibold truncate">{photo.caption || 'Hình kỷ niệm'}</p>
                      {photo.placeName && (
                        <p className="text-[10px] text-[#CDD2CE] truncate">{photo.placeName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (4 cols): Mood, Memorable moment, Foods, Expenses */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mood Card */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-5 shadow-sm space-y-3">
            <h4 className="font-semibold text-[#606864] text-xs uppercase tracking-wider">
              Cảm xúc trong ngày
            </h4>
            <div className={`p-3.5 rounded-[12px] border flex items-center gap-3 ${moodInfo.color}`}>
              <div>
                <div className="font-semibold text-sm">{moodInfo.label}</div>
                <div className="text-[11px] opacity-80">Cảm nhận chung của chuyến đi</div>
              </div>
            </div>

            {day.mood?.tags && day.mood.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {day.mood.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold bg-[#F7F5F0] text-[#606864] px-2.5 py-1 rounded-full border border-[#E2E3DE]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Memorable Moment */}
          {day.memorableMoment && (
            <div className="bg-[#F7F5F0] rounded-[18px] border border-[#E2E3DE] p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-1.5 text-[#A46F3D] font-semibold text-xs uppercase tracking-wider">
                <Heart className="w-4 h-4 text-[#A46F3D]" strokeWidth={1.75} />
                <span>Khoảnh khắc nhớ nhất</span>
              </div>
              <p className="text-xs text-[#1D211F] leading-relaxed italic font-medium">
                "{day.memorableMoment.text}"
              </p>
            </div>
          )}

          {/* Tried Foods */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-5 shadow-sm space-y-3">
            <h4 className="font-semibold text-[#606864] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-[#183B35]" strokeWidth={1.75} />
              <span>Món ăn trong ngày ({day.foodEntries.length})</span>
            </h4>

            {day.foodEntries.length === 0 ? (
              <p className="text-xs text-[#606864] italic">Chưa lưu món ăn.</p>
            ) : (
              <div className="space-y-2.5">
                {day.foodEntries.map((food) => (
                  <div key={food.id} className="p-3 bg-[#F7F5F0] rounded-[12px] border border-[#E2E3DE] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#1D211F]">{food.name}</span>
                      {food.personalRating && (
                        <span className="text-[11px] font-semibold text-[#A46F3D] bg-[#F7F5F0] px-2 py-0.5 rounded-full border border-[#E2E3DE]">
                          ★ {food.personalRating} / 5
                        </span>
                      )}
                    </div>
                    {food.note && <p className="text-[11px] text-[#606864]">"{food.note}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Day Expense Card */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-[#606864] text-xs uppercase tracking-wider">
                Chi phí trong ngày
              </h4>
              <span className="text-xs font-semibold text-[#183B35]">
                {(day.actualCost || 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="p-3 rounded-[12px] bg-[#E9F0ED] border border-[#183B35]/20 text-xs text-[#183B35]">
              Chi phí được bảo mật riêng tư cho gia đình.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
