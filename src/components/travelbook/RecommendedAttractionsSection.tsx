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
  
  // Dialog state for details
  const [detailModalItem, setDetailModalItem] = useState<AttractionItem | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAttractions = attractions.filter((item) => {
    const categoryMatch = activeCategory === 'all' || item.category === activeCategory;
    const destMatch = selectedDestination === 'all' || item.destination === selectedDestination;
    return categoryMatch && destMatch;
  });

  if (!attractions || attractions.length === 0) return null;

  return (
    <div className="bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E2E3DE] shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E3DE] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#E9F0ED] text-[#183B35]">
              <Compass className="w-5 h-5" strokeWidth={1.75} />
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1D211F] tracking-tight">
              Địa điểm & Lịch trình tham quan
            </h3>
          </div>
          <p className="text-xs text-[#5D6B63] font-normal mt-1">
            Danh sách các địa điểm nổi bật đã lên lịch trong chuyến đi.
          </p>
        </div>

        {/* Destination Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#5D6B63] font-medium hidden sm:inline">Điểm đến:</span>
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#F7F6F0] text-[#1D211F] font-semibold text-xs border border-[#E2E3DE] focus:outline-none focus:ring-2 focus:ring-[#183B35]/20 cursor-pointer"
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
          { id: 'entertainment', label: 'Vui chơi & Giải trí', icon: Ticket },
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as AttractionCategory)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#183B35] text-white shadow-xs'
                  : 'bg-[#F7F6F0] text-[#5D6B63] hover:bg-[#E2E3DE] hover:text-[#1D211F]'
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
              className="group relative rounded-[20px] bg-white border border-[#E2E3DE] hover:border-[#183B35]/30 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Image Header */}
              <div className="relative h-48 w-full shrink-0 bg-[#E2E3DE]">
                {(!item.imageUrl || item.imageUrl.includes('unsplash.com')) ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#183B35] to-[#28584E] relative flex flex-col items-center justify-center p-3 text-center">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    <Compass className="w-10 h-10 text-white/20 absolute" />
                  </div>
                ) : (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                  <span className="bg-[#183B35] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs border border-white/20">
                    {item.badge}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
                      isFav
                        ? 'bg-emerald-500 text-white'
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
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E9F0ED] text-[#183B35]">
                      {item.categoryLabel}
                    </span>
                    <span className="text-[11px] text-[#5D6B63] font-normal flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.durationText}
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-semibold text-[#1D211F] group-hover:text-[#183B35] transition-colors leading-snug line-clamp-1">
                    {item.name}
                  </h4>

                  <p className="text-xs text-[#5D6B63] font-normal line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Suitability Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.suitabilityTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F7F6F0] text-[#5D6B63]"
                      >
                        • {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-3 border-t border-[#E2E3DE] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#5D6B63] block">
                      Chi phí tham khảo
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#183B35]">
                      {item.priceText}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDetailModalItem(item)}
                      className="px-4 py-2 rounded-xl bg-[#F7F6F0] hover:bg-[#E2E3DE] text-[#1D211F] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
                      title="Xem chi tiết"
                    >
                      <Info className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Chi tiết</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attraction Detail Modal */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full overflow-hidden shadow-2xl border border-[#E2E3DE] animate-fadeIn space-y-0">
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
                <span className="bg-[#183B35] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
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
                <h4 className="text-xs uppercase font-semibold text-[#5D6B63]">Giới thiệu điểm đến</h4>
                <p className="text-sm text-[#1D211F] font-normal mt-1 leading-relaxed">
                  {detailModalItem.description}
                </p>
              </div>

              <div className="bg-[#E9F0ED] p-3.5 rounded-2xl border border-[#183B35]/50 space-y-1">
                <h4 className="text-xs font-semibold text-[#183B35] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C98745]" />
                  Mẹo cho chuyến đi gia đình
                </h4>
                <p className="text-xs text-[#1D211F] font-normal leading-relaxed">
                  {detailModalItem.familyTips}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E2E3DE]">
                <div>
                  <span className="text-xs text-[#5D6B63] block">Thời gian tham quan:</span>
                  <span className="text-sm font-semibold text-[#1D211F]">{detailModalItem.durationText}</span>
                </div>
                <div>
                  <span className="text-xs text-[#5D6B63] block">Chi phí vé / Tour:</span>
                  <span className="text-sm font-semibold text-[#183B35]">{detailModalItem.priceText}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F7F6F0] border-t border-[#E2E3DE] flex gap-3">
              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E2E3DE] bg-white text-[#1D211F] font-semibold text-xs hover:bg-[#F7F6F0]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedAttraction(detailModalItem);
                  setDetailModalItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#183B35] hover:bg-[#132d28] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5"
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
