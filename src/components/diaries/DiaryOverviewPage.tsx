import React, { useState } from 'react';
import { TravelDiary } from '../../types';
import {
  ArrowLeft,
  Share2,
  Edit3,
  FileText,
  Calendar,
  MapPin,
  Camera,
  Users,
  DollarSign,
  Utensils,
  Award,
  ChevronRight,
  Sparkles,
  Heart,
  MoreVertical,
  CheckCircle2,
  Lock,
  Globe,
  Trash2,
  Mic,
} from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';

interface DiaryOverviewPageProps {
  diary: TravelDiary;
  onBackToList: () => void;
  onSelectDay: (dayNumber: number) => void;
  onOpenEditor: () => void;
  onOpenShare: () => void;
  onOpenReflection: () => void;
  onDeleteDiary: (diaryId: string) => void;
  onUpdateIntroduction?: (intro: string) => void;
}

export const DiaryOverviewPage: React.FC<DiaryOverviewPageProps> = ({
  diary,
  onBackToList,
  onSelectDay,
  onOpenEditor,
  onOpenShare,
  onOpenReflection,
  onDeleteDiary,
  onUpdateIntroduction,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const totalPhotos = diary.photos.length;
  const totalPlaces = diary.days.reduce((acc, d) => acc + d.activities.length, 0);
  const totalFoods = diary.days.reduce((acc, d) => acc + d.foodEntries.length, 0);
  const totalSpent = diary.actualBudget?.total || diary.days.reduce((acc, d) => acc + (d.actualCost || 0), 0);

  const highlightPhotos = diary.photos.filter((p) => p.isHighlight || p.isCover).slice(0, 6);
  const allFoods = diary.days.flatMap((d) => d.foodEntries).slice(0, 6);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToList}
          className="flex items-center gap-2 text-xs font-semibold text-[#1D211F] hover:text-[#183B35] transition-colors bg-white px-3.5 py-2 rounded-[12px] border border-[#E2E3DE] shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#183B35]" strokeWidth={1.75} />
          <span>Danh sách Nhật ký</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F7F5F0] border border-[#E2E3DE] text-[#1D211F] text-xs font-semibold rounded-[12px] shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#183B35]" strokeWidth={1.75} />
            <span>Chia sẻ</span>
          </button>

          <button
            onClick={onOpenEditor}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#183B35] hover:bg-[#28584E] text-white text-xs font-semibold rounded-[12px] shadow-sm transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4" strokeWidth={1.75} />
            <span>Chỉnh sửa</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white border border-[#E2E3DE] hover:bg-[#F7F5F0] text-[#1D211F] rounded-[12px] transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" strokeWidth={1.75} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-[12px] shadow-lg border border-[#E2E3DE] py-1.5 z-20 text-xs font-semibold space-y-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenEditor();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#F7F5F0] text-[#1D211F] cursor-pointer"
                >
                  Đổi ảnh bìa
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    alert('Đã xuất PDF bản xem trước!');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#F7F5F0] text-[#1D211F] flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#183B35]" strokeWidth={1.75} />
                  <span>Xuất bản PDF</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (confirm('Bạn có chắc chắn muốn xóa nhật ký này?')) {
                      onDeleteDiary(diary.id);
                    }
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Xóa nhật ký</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="relative h-[280px] sm:h-[380px] rounded-[24px] overflow-hidden shadow-sm border border-[#E2E3DE]">
        <img
          src={diary.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'}
          alt={diary.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D211F]/90 via-[#1D211F]/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold border border-white/20 flex items-center gap-1.5">
              {diary.status === 'completed' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E9F0ED]" strokeWidth={1.75} />
                  <span>Đã hoàn thành</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#E2B788]" strokeWidth={1.75} />
                  <span>Đang viết</span>
                </>
              )}
            </span>

            <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-medium border border-white/10 flex items-center gap-1">
              {diary.visibility === 'private' ? (
                <>
                  <Lock className="w-3 h-3 text-[#CDD2CE]" strokeWidth={1.75} />
                  <span>Chỉ mình tôi</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 text-[#E9F0ED]" strokeWidth={1.75} />
                  <span>Đã chia sẻ</span>
                </>
              )}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">{diary.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#E9F0ED] font-normal">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#E2B788]" strokeWidth={1.75} />
              {diary.startDate} – {diary.endDate}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#E2B788]" strokeWidth={1.75} />
              {diary.destinations.join(' – ')}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#E9F0ED]" strokeWidth={1.75} />
              {diary.memberIds.length} thành viên gia đình
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout (Left Content + Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Introduction Card */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#1D211F] text-[17px] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#183B35]" strokeWidth={1.75} />
                <span>Lời mở đầu chuyến đi</span>
              </h3>
              <VoiceInputButton
                targetFieldTitle="Lời mở đầu chuyến đi"
                currentText={diary.introduction || ''}
                onTranscribed={(text, mode) => {
                  const newIntro = mode === 'append' && diary.introduction ? `${diary.introduction}\n${text}` : text;
                  if (onUpdateIntroduction) {
                    onUpdateIntroduction(newIntro);
                  }
                }}
                variant="outline"
                size="sm"
                label="Ghi âm lời mở đầu"
              />
            </div>
            {diary.introduction ? (
              <p className="text-xs sm:text-sm text-[#1D211F] leading-relaxed italic bg-[#F7F5F0] p-4 rounded-[12px] border border-[#E2E3DE]">
                "{diary.introduction}"
              </p>
            ) : (
              <div className="text-xs text-[#606864] flex items-center justify-between bg-[#F7F5F0] p-4 rounded-[12px] border border-dashed border-[#CDD2CE]">
                <span>Chưa có lời mở đầu. Nhấn "Ghi âm lời mở đầu" để nói cảm nghĩ của gia đình!</span>
                <button onClick={onOpenEditor} className="text-[#183B35] font-semibold hover:underline shrink-0 ml-2 cursor-pointer">
                  + Viết lời mở đầu
                </button>
              </div>
            )}
          </div>

          {/* Highlights Photo Collage */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#1D211F] text-[17px] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#183B35]" strokeWidth={1.75} />
                <span>Khoảnh khắc nổi bật</span>
              </h3>
              <span className="text-xs text-[#606864] font-medium">{totalPhotos} ảnh đã lưu</span>
            </div>

            {highlightPhotos.length === 0 ? (
              <p className="text-xs text-[#606864] italic">Chưa có ảnh khoảnh khắc nổi bật.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {highlightPhotos.map((photo) => (
                  <div key={photo.id} className="group relative rounded-[12px] overflow-hidden bg-[#F7F5F0] border border-[#E2E3DE] aspect-square">
                    <img
                      src={photo.fileUrl}
                      alt={photo.caption || 'Highlight'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-2.5 text-white">
                      <p className="text-[11px] font-semibold truncate">{photo.caption || 'Kỉ niệm gia đình'}</p>
                      {photo.placeName && <p className="text-[10px] text-[#CDD2CE] truncate">{photo.placeName}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Days List Summary */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-[#1D211F] text-[17px] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#183B35]" strokeWidth={1.75} />
              <span>Hành trình theo ngày ({diary.days.length} ngày)</span>
            </h3>

            <div className="space-y-3">
              {diary.days.map((day) => (
                <div
                  key={day.id}
                  onClick={() => onSelectDay(day.dayNumber)}
                  className="p-4 rounded-[12px] border border-[#E2E3DE] hover:border-[#183B35]/30 hover:bg-[#E9F0ED]/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#183B35] bg-[#E9F0ED] px-2.5 py-0.5 rounded-[6px]">
                        NGÀY {day.dayNumber}
                      </span>
                      <span className="font-semibold text-[#1D211F] text-sm">{day.title}</span>
                      {day.isCompleted && (
                        <span className="text-[10px] font-semibold text-[#183B35] bg-[#E9F0ED] px-2 py-0.5 rounded-full border border-[#183B35]/20">
                          Đã viết
                        </span>
                      )}
                    </div>
                    {day.story && (
                      <p className="text-xs text-[#606864] line-clamp-1 italic">"{day.story}"</p>
                    )}
                    <div className="flex items-center gap-4 text-[11px] text-[#606864] pt-1">
                      <span>{day.activities.length} địa điểm</span>
                      <span>{(day.actualCost || 0).toLocaleString('vi-VN')}đ đã chi</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#183B35] text-xs font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Xem ngày</span>
                    <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Memorable Foods Section */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-[#1D211F] text-[17px] flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#183B35]" strokeWidth={1.75} />
              <span>Món ăn đáng nhớ</span>
            </h3>

            {allFoods.length === 0 ? (
              <p className="text-xs text-[#606864] italic">Chưa ghi nhận món ăn đáng nhớ.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allFoods.map((food) => (
                  <div key={food.id} className="p-3.5 bg-[#F7F5F0] rounded-[12px] border border-[#E2E3DE] flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-[#E9F0ED] text-[#183B35] flex items-center justify-center font-semibold shrink-0">
                      <Utensils className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-xs text-[#1D211F] truncate">{food.name}</h4>
                        {food.personalRating && (
                          <span className="text-[10px] font-semibold text-[#A46F3D] bg-[#F7F5F0] px-1.5 py-0.5 rounded border border-[#E2E3DE]">
                            ★ {food.personalRating}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#606864] truncate">{food.placeName || 'Địa điểm ẩm thực'}</p>
                      {food.note && <p className="text-[11px] text-[#606864] italic">"{food.note}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-5 shadow-sm space-y-4">
            <h4 className="font-semibold text-[#606864] text-xs uppercase tracking-wider">
              Thống kê nhanh
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-[#F7F5F0] rounded-[12px] border border-[#E2E3DE]">
                <div className="text-xl font-semibold text-[#183B35]">{diary.days.length}</div>
                <div className="text-[11px] text-[#606864]">Ngày đi</div>
              </div>
              <div className="p-3 bg-[#F7F5F0] rounded-[12px] border border-[#E2E3DE]">
                <div className="text-xl font-semibold text-[#183B35]">{totalPhotos}</div>
                <div className="text-[11px] text-[#606864]">Hình ảnh</div>
              </div>
              <div className="p-3 bg-[#F7F5F0] rounded-[12px] border border-[#E2E3DE]">
                <div className="text-xl font-semibold text-[#183B35]">{totalPlaces}</div>
                <div className="text-[11px] text-[#606864]">Địa điểm</div>
              </div>
              <div className="p-3 bg-[#F7F5F0] rounded-[12px] border border-[#E2E3DE]">
                <div className="text-xl font-semibold text-[#183B35]">{totalFoods}</div>
                <div className="text-[11px] text-[#606864]">Món đã thử</div>
              </div>
            </div>
          </div>

          {/* Actual Budget Card */}
          <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-[#606864] text-xs uppercase tracking-wider">
                Chi phí thực tế
              </h4>
              <DollarSign className="w-4 h-4 text-[#183B35]" strokeWidth={1.75} />
            </div>
            <div className="p-3.5 bg-[#E9F0ED] rounded-[12px] border border-[#183B35]/20 text-center">
              <div className="text-xl font-semibold text-[#183B35]">
                {totalSpent.toLocaleString('vi-VN')}đ
              </div>
              <div className="text-[11px] text-[#183B35] mt-0.5 font-medium">Tổng đã chi thực tế</div>
            </div>
          </div>

          {/* Trip Reflection Card Callout */}
          <div className="bg-[#183B35] rounded-[18px] p-5 text-white space-y-3 shadow-sm border border-[#183B35]">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#E2B788]" strokeWidth={1.75} />
              <h4 className="font-semibold text-sm">Tổng kết chuyến đi</h4>
            </div>
            <p className="text-xs text-[#E9F0ED]/80">
              {diary.reflection?.bestThings
                ? diary.reflection.bestThings
                : 'Dành ít phút ghi lại cảm nhận và những điều cả gia đình thích nhất sau chuyến đi.'}
            </p>
            <button
              onClick={onOpenReflection}
              className="w-full py-2.5 bg-white text-[#183B35] hover:bg-[#E9F0ED] rounded-[12px] font-semibold text-xs transition-colors cursor-pointer"
            >
              {diary.reflection ? 'Xem tổng kết chi tiết' : 'Viết tổng kết chuyến đi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
