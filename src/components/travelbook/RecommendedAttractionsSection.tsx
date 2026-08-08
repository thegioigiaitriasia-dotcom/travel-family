import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Ticket,
  MapPin,
  Plus,
  Heart,
  Info,
  Check,
  Star,
  Users,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  X,
  CheckCircle2,
} from 'lucide-react';
import { TravelActivity } from '../../types';

export type AttractionCategory = 'all' | 'sightseeing' | 'tour' | 'entertainment';

export interface AttractionItem {
  id: string;
  name: string;
  category: 'sightseeing' | 'tour' | 'entertainment';
  categoryLabel: string;
  destination: string;
  badge: string;
  rating: number;
  reviewCount: number;
  durationText: string;
  pricePerPerson: number;
  priceText: string;
  imageUrl: string;
  description: string;
  familyTips: string;
  suitabilityTags: string[];
  suggestedStartTime?: string;
  suggestedEndTime?: string;
}

export const defaultAttractions: AttractionItem[] = [];

interface RecommendedAttractionsSectionProps {
  attractions?: AttractionItem[];
  daysCount?: number;
  onAddActivityToDay?: (dayNumber: number, activity: Partial<TravelActivity>) => void;
}

export const RecommendedAttractionsSection: React.FC<RecommendedAttractionsSectionProps> = ({
  attractions = defaultAttractions,
  daysCount = 4,
  onAddActivityToDay,
}) => {
  const [activeCategory, setActiveCategory] = useState<AttractionCategory>('all');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  
  // Modal / Dialog for adding attraction to a day
  const [selectedAttraction, setSelectedAttraction] = useState<AttractionItem | null>(null);
  const [targetDay, setTargetDay] = useState<number>(1);
  const [detailModalItem, setDetailModalItem] = useState<AttractionItem | null>(null);
  const [addedSuccessMsg, setAddedSuccessMsg] = useState<string | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAttractions = attractions.filter((item) => {
    const categoryMatch = activeCategory === 'all' || item.category === activeCategory;
    const destMatch = selectedDestination === 'all' || item.destination === selectedDestination;
    return categoryMatch && destMatch;
  });

  const handleConfirmAdd = () => {
    if (!selectedAttraction) return;

    const newActivity: Partial<TravelActivity> = {
      id: `act-rec-${Date.now()}`,
      title: selectedAttraction.name,
      type: selectedAttraction.category === 'tour' ? 'experience' : 'sightseeing',
      startTime: selectedAttraction.suggestedStartTime || '10:00',
      endTime: selectedAttraction.suggestedEndTime || '12:00',
      status: 'upcoming',
      description: `${selectedAttraction.description} (${selectedAttraction.durationText})`,
      estimatedCost: selectedAttraction.pricePerPerson,
      notes: selectedAttraction.familyTips,
      place: {
        name: selectedAttraction.name,
        address: `${selectedAttraction.destination}`,
      },
    };

    if (onAddActivityToDay) {
      onAddActivityToDay(targetDay, newActivity);
    }

    setAddedSuccessMsg(`Đã thêm "${selectedAttraction.name}" vào Lịch trình Ngày ${targetDay}!`);
    setTimeout(() => {
      setAddedSuccessMsg(null);
    }, 4000);

    setSelectedAttraction(null);
  };

  if (!attractions || attractions.length === 0) return null;

  return (
    <div className="bg-white rounded-[24px] p-6 border border-[#E3E6E2] shadow-xs space-y-6">
      {/* Toast alert */}
      {addedSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#DC2626] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn border border-[#FECACA]/40">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-xs font-semibold">{addedSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E6E2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626]">
              <Compass className="w-5 h-5" strokeWidth={1.75} />
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#18201E] tracking-tight">
              Địa điểm Tham quan, Tour & Vui chơi gợi ý
            </h3>
          </div>
          <p className="text-xs text-[#66706C] font-normal mt-1">
            Lựa chọn điểm đến hấp dẫn & tour trải nghiệm phù hợp nhất cho cả gia đình.
          </p>
        </div>

        {/* Destination Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#66706C] font-medium hidden sm:inline">Điểm đến:</span>
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#F0F1ED] text-[#18201E] font-semibold text-xs border border-[#E3E6E2] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 cursor-pointer"
          >
            <option value="all">Tất cả khu vực</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Hội An">Hội An</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Tất cả gợi ý', icon: Sparkles },
          { id: 'sightseeing', label: 'Tham quan & Check-in', icon: Compass },
          { id: 'tour', label: 'Tour & Trải nghiệm', icon: Ticket },
          { id: 'entertainment', label: 'Vui chơi & Giải trí', icon: Users },
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as AttractionCategory)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'bg-[#F0F1ED] text-[#66706C] hover:bg-[#E3E6E2] hover:text-[#18201E]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Attractions & Tours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAttractions.map((item) => {
          const isFav = favorites[item.id];

          return (
            <div
              key={item.id}
              className="group relative rounded-[20px] bg-white border border-[#E3E6E2] hover:border-[#DC2626]/40 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Image & Badges */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                  <span className="bg-[#DC2626] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs border border-white/20">
                    {item.badge}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
                      isFav
                        ? 'bg-rose-500 text-white'
                        : 'bg-black/30 hover:bg-black/50 text-white border border-white/20'
                    }`}
                    title={isFav ? 'Đã lưu yêu thích' : 'Lưu địa điểm'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} strokeWidth={1.75} />
                  </button>
                </div>

                {/* Bottom Image Info */}
                <div className="absolute bottom-3 left-3 right-3 z-10 text-white flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C98745]" strokeWidth={2} />
                    <span>{item.destination}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full text-[11px] backdrop-blur-xs">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="font-bold">{item.rating}</span>
                    <span className="text-slate-300">({item.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626]">
                      {item.categoryLabel}
                    </span>
                    <span className="text-[11px] text-[#66706C] font-normal flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.durationText}
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-semibold text-[#18201E] group-hover:text-[#DC2626] transition-colors leading-snug line-clamp-1">
                    {item.name}
                  </h4>

                  <p className="text-xs text-[#66706C] font-normal line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Suitability Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.suitabilityTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F0F1ED] text-[#66706C]"
                      >
                        • {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-3 border-t border-[#E3E6E2] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#66706C] block">
                      Chi phí tham khảo
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#DC2626]">
                      {item.priceText}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDetailModalItem(item)}
                      className="p-2 rounded-xl bg-[#F0F1ED] hover:bg-[#E3E6E2] text-[#18201E] transition-colors cursor-pointer"
                      title="Xem chi tiết"
                    >
                      <Info className="w-4 h-4" strokeWidth={1.75} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedAttraction(item)}
                      className="px-3 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Thêm lịch trình</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Attraction to Trip Dialog */}
      {selectedAttraction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#E3E6E2] animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E3E6E2] pb-3">
              <h3 className="font-serif text-xl font-semibold text-[#18201E] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#DC2626]" strokeWidth={2} />
                Thêm vào lịch trình chuyến đi
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAttraction(null)}
                className="p-1.5 rounded-full hover:bg-[#F0F1ED] text-[#66706C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-3 bg-[#F0F1ED] p-3 rounded-2xl border border-[#E3E6E2]">
              <img
                src={selectedAttraction.imageUrl}
                alt={selectedAttraction.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div>
                <h4 className="font-semibold text-sm text-[#18201E]">
                  {selectedAttraction.name}
                </h4>
                <p className="text-xs text-[#66706C] mt-0.5">
                  {selectedAttraction.destination} • {selectedAttraction.durationText}
                </p>
                <p className="text-xs font-semibold text-[#DC2626] mt-1">
                  {selectedAttraction.priceText}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#18201E] block">
                Chọn ngày muốn xếp lịch trình:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: daysCount }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const isSelected = targetDay === dayNum;
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setTargetDay(dayNum)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-semibold text-xs ${
                        isSelected
                          ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-xs'
                          : 'bg-[#F0F1ED] text-[#18201E] border-[#E3E6E2] hover:bg-[#E3E6E2]'
                      }`}
                    >
                      Ngày {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedAttraction(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E3E6E2] text-[#66706C] font-semibold text-xs hover:bg-[#F0F1ED]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Xác nhận thêm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attraction Detail Modal */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full overflow-hidden shadow-2xl border border-[#E3E6E2] animate-fadeIn space-y-0">
            <div className="relative h-56 w-full">
              <img
                src={detailModalItem.imageUrl}
                alt={detailModalItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="bg-[#DC2626] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                  {detailModalItem.badge}
                </span>
                <h3 className="font-serif text-2xl font-semibold mt-2">
                  {detailModalItem.name}
                </h3>
                <p className="text-xs text-slate-200 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C98745]" />
                  <span>{detailModalItem.destination}</span>
                  <span>•</span>
                  <span>Đánh giá {detailModalItem.rating} ⭐ ({detailModalItem.reviewCount} nhận xét)</span>
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h4 className="text-xs uppercase font-semibold text-[#66706C]">Giới thiệu điểm đến</h4>
                <p className="text-sm text-[#18201E] font-normal mt-1 leading-relaxed">
                  {detailModalItem.description}
                </p>
              </div>

              <div className="bg-[#FEF2F2] p-3.5 rounded-2xl border border-[#FECACA]/50 space-y-1">
                <h4 className="text-xs font-semibold text-[#DC2626] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C98745]" />
                  Mẹo cho chuyến đi gia đình
                </h4>
                <p className="text-xs text-[#18201E] font-normal leading-relaxed">
                  {detailModalItem.familyTips}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E3E6E2]">
                <div>
                  <span className="text-xs text-[#66706C] block">Thời gian tham quan:</span>
                  <span className="text-sm font-semibold text-[#18201E]">{detailModalItem.durationText}</span>
                </div>
                <div>
                  <span className="text-xs text-[#66706C] block">Chi phí vé / Tour:</span>
                  <span className="text-sm font-semibold text-[#DC2626]">{detailModalItem.priceText}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F0F1ED] border-t border-[#E3E6E2] flex gap-3">
              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E3E6E2] bg-white text-[#18201E] font-semibold text-xs hover:bg-[#F0F1ED]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedAttraction(detailModalItem);
                  setDetailModalItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm vào Lịch trình</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
