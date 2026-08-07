import React, { useState } from 'react';
import { TravelDiary, TripSummary, DiaryStatus, DiariesFilterState, TripReflection, UserAuthSession } from '../../types';
import {
  Plus,
  Search,
  BookOpen,
  Calendar,
  MapPin,
  Camera,
  Users,
  ChevronRight,
  MoreVertical,
  Share2,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { CreateDiaryFromTripDialog } from './CreateDiaryFromTripDialog';
import { ShareDiaryDialog } from './ShareDiaryDialog';
import { DiaryOverviewPage } from './DiaryOverviewPage';
import { DiaryDayPage } from './DiaryDayPage';
import { DiaryEditor } from './DiaryEditor';
import { TripReflectionPage } from './TripReflectionPage';

import { fetchSupabaseDiaries, saveSupabaseDiary, deleteSupabaseDiary, isSupabaseConfigured } from '../../lib/supabase';

interface TravelDiariesPageProps {
  completedTrips?: TripSummary[];
  session?: UserAuthSession;
}

export const TravelDiariesPage: React.FC<TravelDiariesPageProps> = ({
  completedTrips = [],
  session,
}) => {
  const [diaries, setDiaries] = useState<TravelDiary[]>([]);
  const [activeDiaryId, setActiveDiaryId] = useState<string | null>(null);
  const [activeDayNumber, setActiveDayNumber] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'overview' | 'day' | 'reflection'>('list');

  // Load diaries from Supabase
  React.useEffect(() => {
    if (session?.isDemoMode) {
      setDiaries([]);
    } else if (session?.currentUser?.id && isSupabaseConfigured()) {
      fetchSupabaseDiaries(session.currentUser.id).then((data) => {
        if (data) {
          // Map DB to TravelDiary
          const mapped = data.map((d: any) => ({
            id: d.id,
            tripId: d.data?.tripId || '',
            title: d.title,
            coverImage: d.cover_image,
            introduction: d.introduction,
            entries: d.data?.entries || [],
            reflections: d.data?.reflections,
          })) as TravelDiary[];
          setDiaries(mapped);
          if (mapped.length > 0) {
            setDiaries(mapped);
          } else {
            setDiaries([]);
          }
        }
      });
    }
  }, [session]);

  // Modals / Drawers state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedShareDiary, setSelectedShareDiary] = useState<TravelDiary | null>(null);

  // Filters State
  const [filterState, setFilterState] = useState<DiariesFilterState>({
    search: '',
    years: [],
    destinations: [],
    statuses: [],
    sort: 'updated_desc',
  });

  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);

  // Active diary selection helper
  const currentDiary = diaries.find((d) => d.id === activeDiaryId) || diaries[0];

  // Filtering Logic
  const filteredDiaries = diaries
    .filter((d) => {
      if (filterState.search.trim()) {
        const query = filterState.search.toLowerCase();
        const matchTitle = d.title.toLowerCase().includes(query);
        const matchDest = d.destinations.some((dest) => dest.toLowerCase().includes(query));
        const matchIntro = d.introduction?.toLowerCase().includes(query);
        if (!matchTitle && !matchDest && !matchIntro) return false;
      }
      if (filterState.statuses.length > 0) {
        if (!filterState.statuses.includes(d.status)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filterState.sort === 'updated_desc') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (filterState.sort === 'photos_desc') {
        return b.photos.length - a.photos.length;
      }
      if (filterState.sort === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });

  // Highlight in-progress diary
  const inProgressDiary = diaries.find((d) => d.status === 'in_progress');

  // Handlers
  const handleCreateDiary = (tripId: string) => {
    const trip = completedTrips.find((t) => t.id === tripId);
    if (!trip) return;

    const newDiary: TravelDiary = {
      id: `diary-${Date.now()}`,
      tripId: trip.id,
      title: trip.title,
      introduction: `Nhật ký kỷ niệm chuyến đi ${trip.title}.`,
      coverImage: trip.coverImage,
      startDate: trip.startDate,
      endDate: trip.endDate,
      destinations: trip.destinations,
      memberIds: ['member-phuc', 'member-lan'],
      status: 'in_progress',
      visibility: 'private',
      shareSettings: {
        showMemberNames: false,
        showExpenses: false,
        showPersonalNotes: false,
        allowPhotoDownload: false,
      },
      days: Array.from({ length: trip.durationDays }, (_, i) => ({
        id: `day-${Date.now()}-${i + 1}`,
        diaryId: `diary-${Date.now()}`,
        dayNumber: i + 1,
        date: trip.startDate,
        title: `Ngày ${i + 1} – ${trip.destinations[0] || 'Khám phá'}`,
        story: '',
        activities: [],
        foodEntries: [],
        isCompleted: false,
        updatedAt: new Date().toISOString(),
      })),
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDiaries([newDiary, ...diaries]);
    setActiveDiaryId(newDiary.id);
    setViewMode('overview');
  };

  const handleUpdateDiary = (updated: TravelDiary) => {
    setDiaries(diaries.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleDeleteDiary = (diaryId: string) => {
    setDiaries(diaries.filter((d) => d.id !== diaryId));
    if (activeDiaryId === diaryId) {
      setActiveDiaryId(null);
      setViewMode('list');
    }
  };

  const handleUpdateReflection = (reflection: TripReflection) => {
    if (!currentDiary) return;
    const updated = {
      ...currentDiary,
      reflection,
      status: 'completed' as DiaryStatus,
      completedAt: new Date().toISOString(),
    };
    handleUpdateDiary(updated);
    setViewMode('overview');
  };

  const handleUpdateStoryInDay = (dayNum: number, storyText: string) => {
    if (!currentDiary) return;
    const updatedDays = currentDiary.days.map((d) =>
      d.dayNumber === dayNum ? { ...d, story: storyText, updatedAt: new Date().toISOString() } : d
    );
    handleUpdateDiary({ ...currentDiary, days: updatedDays });
  };

  // Route Views Render Engine
  if (viewMode === 'overview' && currentDiary) {
    return (
      <>
        <DiaryOverviewPage
          diary={currentDiary}
          onBackToList={() => setViewMode('list')}
          onSelectDay={(dayNum) => {
            setActiveDayNumber(dayNum);
            setViewMode('day');
          }}
          onOpenEditor={() => setIsEditorOpen(true)}
          onOpenShare={() => {
            setSelectedShareDiary(currentDiary);
            setIsShareOpen(true);
          }}
          onOpenReflection={() => setViewMode('reflection')}
          onDeleteDiary={handleDeleteDiary}
          onUpdateIntroduction={(intro) => handleUpdateDiary({ ...currentDiary, introduction: intro })}
        />
        <DiaryEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          diary={currentDiary}
          onSaveDiary={handleUpdateDiary}
        />
        {selectedShareDiary && (
          <ShareDiaryDialog
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            diary={selectedShareDiary}
            onUpdateShareSettings={(shareSettings, visibility) =>
              handleUpdateDiary({ ...selectedShareDiary, shareSettings, visibility })
            }
          />
        )}
      </>
    );
  }

  if (viewMode === 'day' && currentDiary && activeDayNumber !== null) {
    return (
      <>
        <DiaryDayPage
          diary={currentDiary}
          dayNumber={activeDayNumber}
          onSelectDay={(dayNum) => setActiveDayNumber(dayNum)}
          onBackToOverview={() => setViewMode('overview')}
          onOpenEditor={() => setIsEditorOpen(true)}
          onUpdateDayStory={handleUpdateStoryInDay}
        />
        <DiaryEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          diary={currentDiary}
          onSaveDiary={handleUpdateDiary}
        />
      </>
    );
  }

  if (viewMode === 'reflection' && currentDiary) {
    return (
      <TripReflectionPage
        diary={currentDiary}
        onSaveReflection={handleUpdateReflection}
        onBack={() => setViewMode('overview')}
      />
    );
  }

  // View Mode: 'list' (Screen 1: /diaries)
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#18201E] tracking-tight">
            Nhật Ký Du Lịch Gia Đình
          </h1>
          <p className="text-xs sm:text-sm text-[#66706C] mt-1">
            Lưu giữ hình ảnh, câu chuyện và những trải nghiệm đáng nhớ của cả gia đình.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#183B35] hover:bg-[#28584E] rounded-[12px] shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          <span>Tạo nhật ký từ chuyến đi</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#606864] absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
            <input
              type="text"
              value={filterState.search}
              onChange={(e) => setFilterState({ ...filterState, search: e.target.value })}
              placeholder="Tìm theo tên chuyến đi, điểm đến hoặc câu chuyện..."
              className="w-full bg-[#F7F5F0] border border-[#E2E3DE] rounded-[12px] pl-10 pr-4 py-2.5 text-xs text-[#1D211F] placeholder:text-[#606864] focus:outline-none focus:ring-2 focus:ring-[#183B35]/20 focus:border-[#183B35]"
            />
          </div>

          {/* Status Filter Pill buttons */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs font-semibold">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'in_progress', label: 'Đang viết' },
              { id: 'completed', label: 'Đã hoàn thành' },
              { id: 'draft', label: 'Bản nháp' },
            ].map((st) => {
              const isActive =
                st.id === 'all'
                  ? filterState.statuses.length === 0
                  : filterState.statuses.includes(st.id as DiaryStatus);
              return (
                <button
                  key={st.id}
                  onClick={() => {
                    if (st.id === 'all') {
                      setFilterState({ ...filterState, statuses: [] });
                    } else {
                      setFilterState({ ...filterState, statuses: [st.id as DiaryStatus] });
                    }
                  }}
                  className={`px-3.5 py-2 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#183B35] text-white border-[#183B35] shadow-sm'
                      : 'bg-[#F7F5F0] text-[#606864] border-[#E2E3DE] hover:bg-[#E2E3DE]'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>

          {/* Sort selector */}
          <select
            value={filterState.sort}
            onChange={(e) => setFilterState({ ...filterState, sort: e.target.value as any })}
            className="bg-[#F7F5F0] border border-[#E2E3DE] rounded-[12px] px-3.5 py-2 text-xs font-semibold text-[#1D211F] focus:outline-none"
          >
            <option value="updated_desc">Mới cập nhật</option>
            <option value="photos_desc">Nhiều ảnh nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Featured In-Progress Card (Luxury Dark Forest Emerald) */}
      {inProgressDiary && !filterState.search && (
        <div className="bg-gradient-to-r from-[#183B35] via-[#28584E] to-[#0E2F29] rounded-[24px] p-6 sm:p-8 text-white relative overflow-hidden shadow-sm border border-[#183B35]/40">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A46F3D]/20 text-[#E2B788] border border-[#A46F3D]/30 text-[11px] font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#E2B788]" strokeWidth={1.75} />
                <span>Đang lưu giữ kỷ niệm</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{inProgressDiary.title}</h2>
              <p className="text-xs sm:text-sm text-[#E9F0ED]/80">
                Đã hoàn thành {inProgressDiary.days.filter((d) => d.isCompleted).length} / {inProgressDiary.days.length} ngày. Hãy tiếp tục viết nên cuốn cẩm nang du lịch gia đình.
              </p>
            </div>

            <button
              onClick={() => {
                setActiveDiaryId(inProgressDiary.id);
                setViewMode('overview');
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-[#E9F0ED] text-[#183B35] font-semibold text-xs rounded-[12px] shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <span>Tiếp tục viết</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      {/* Main Diaries Grid (3 Columns Desktop) */}
      {filteredDiaries.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-[#E2E3DE] p-12 text-center space-y-4 shadow-sm">
          <BookOpen className="w-12 h-12 text-[#606864] mx-auto" strokeWidth={1.5} />
          <h3 className="font-semibold text-[#1D211F] text-lg">Chưa có nhật ký du lịch nào</h3>
          <p className="text-xs text-[#606864] max-w-md mx-auto">
            Sau mỗi chuyến đi, hãy lưu lại ảnh, câu chuyện và trải nghiệm ý nghĩa của cả gia đình.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 bg-[#183B35] hover:bg-[#28584E] text-white font-semibold text-xs rounded-[12px] shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.75} />
            <span>Tạo nhật ký từ chuyến đi</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiaries.map((diary) => {
            const completedDaysCount = diary.days.filter((d) => d.isCompleted).length;
            const totalDaysCount = diary.days.length;
            const isMenuOpen = activeCardMenuId === diary.id;

            let statusTag = { label: 'ĐANG VIẾT', bg: 'bg-[#F7F5F0] text-[#A46F3D] border-[#E2E3DE]', btnText: 'Tiếp tục' };
            if (diary.status === 'completed') {
              statusTag = { label: 'ĐÃ HOÀN THÀNH', bg: 'bg-[#E9F0ED] text-[#183B35] border-[#183B35]/20', btnText: 'Xem nhật ký' };
            } else if (diary.status === 'draft') {
              statusTag = { label: 'BẢN NHÁP', bg: 'bg-[#F7F5F0] text-[#606864] border-[#E2E3DE]', btnText: 'Bắt đầu viết' };
            }

            return (
              <div
                key={diary.id}
                className="bg-white rounded-[18px] border border-[#E2E3DE] overflow-hidden hover:border-[#183B35]/30 transition-all flex flex-col group shadow-sm"
              >
                {/* Card Cover Image */}
                <div className="relative h-48 overflow-hidden bg-[#F7F5F0]">
                  <img
                    src={diary.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
                    alt={diary.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusTag.bg}`}>
                      {statusTag.label}
                    </span>
                  </div>

                  {/* 3-dot dropdown menu */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCardMenuId(isMenuOpen ? null : diary.id);
                      }}
                      className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-[8px] backdrop-blur-md transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-[12px] shadow-lg border border-[#E2E3DE] py-1.5 z-20 text-xs font-semibold space-y-1">
                        <button
                          onClick={() => {
                            setActiveCardMenuId(null);
                            setSelectedShareDiary(diary);
                            setIsShareOpen(true);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-[#F7F5F0] text-[#1D211F] flex items-center gap-2 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-[#183B35]" strokeWidth={1.75} />
                          <span>Chia sẻ</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveCardMenuId(null);
                            if (confirm('Xóa nhật ký này?')) handleDeleteDiary(diary.id);
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

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[#1D211F] text-[17px] leading-snug line-clamp-1">{diary.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#606864]">
                      <Calendar className="w-3.5 h-3.5 text-[#183B35]" strokeWidth={1.75} />
                      <span>{diary.startDate} – {diary.endDate}</span>
                    </div>

                    <div className="text-xs text-[#606864]">
                      {completedDaysCount}/{totalDaysCount} ngày đã ghi chép
                    </div>

                    {/* Meta stats icons */}
                    <div className="flex items-center gap-4 text-xs text-[#606864] pt-2 border-t border-[#E2E3DE]">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-[#183B35]" strokeWidth={1.75} />
                        {diary.photos.length} ảnh
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#A46F3D]" strokeWidth={1.75} />
                        {diary.destinations.length} điểm đến
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#183B35]" strokeWidth={1.75} />
                        {diary.memberIds.length} người
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveDiaryId(diary.id);
                      setViewMode('overview');
                    }}
                    className="w-full py-2.5 bg-[#F7F5F0] hover:bg-[#E9F0ED] text-[#183B35] rounded-[12px] font-semibold text-xs border border-[#E2E3DE] hover:border-[#183B35]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{statusTag.btnText}</span>
                    <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateDiaryFromTripDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        completedTrips={completedTrips}
        onCreateDiary={handleCreateDiary}
      />

      {selectedShareDiary && (
        <ShareDiaryDialog
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          diary={selectedShareDiary}
          onUpdateShareSettings={(shareSettings, visibility) =>
            handleUpdateDiary({ ...selectedShareDiary, shareSettings, visibility })
          }
        />
      )}
    </div>
  );
};
