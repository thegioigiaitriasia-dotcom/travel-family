import React from 'react';
import {
  MapPin,
  Star,
  Bookmark,
  MoreVertical,
  CheckCircle2,
  Heart,
  PlusCircle,
  Clock,
  ExternalLink,
  Utensils,
  Coffee,
  Compass,
  BedDouble,
  TreePine,
  Gamepad2,
  ShoppingBag,
  Landmark,
  Plane,
  Tag,
} from 'lucide-react';
import { SavedPlace, PlaceCategoryType } from '../../types';

interface PlaceCardProps {
  place: SavedPlace;
  isSelected?: boolean;
  viewMode?: 'grid' | 'list';
  collectionNames?: string[];
  onSelect?: (placeId: string) => void;
  onOpenDetail: (place: SavedPlace) => void;
  onAddToTrip: (place: SavedPlace) => void;
  onEdit: (place: SavedPlace) => void;
  onToggleFavorite: (placeId: string) => void;
  onToggleVisited: (placeId: string) => void;
  onDelete: (placeId: string) => void;
}

export const categoryMeta: Record<
  PlaceCategoryType,
  { label: string; icon: React.ReactNode; badgeBg: string; textColor: string }
> = {
  food: { label: 'Ăn uống', icon: <Utensils className="w-3.5 h-3.5 text-[#A46F3D]" />, badgeBg: 'bg-[#F3E9DD] border-[#E2E3DE]', textColor: 'text-[#A46F3D]' },
  cafe: { label: 'Cà phê', icon: <Coffee className="w-3.5 h-3.5 text-[#A46F3D]" />, badgeBg: 'bg-[#F3E9DD] border-[#E2E3DE]', textColor: 'text-[#A46F3D]' },
  sightseeing: { label: 'Tham quan', icon: <Compass className="w-3.5 h-3.5 text-[#183B35]" />, badgeBg: 'bg-[#E9F0ED] border-[#183B35]/20', textColor: 'text-[#183B35]' },
  accommodation: { label: 'Lưu trú', icon: <BedDouble className="w-3.5 h-3.5 text-[#183B35]" />, badgeBg: 'bg-[#E9F0ED] border-[#183B35]/20', textColor: 'text-[#183B35]' },
  nature: { label: 'Biển & Thiên nhiên', icon: <TreePine className="w-3.5 h-3.5 text-[#183B35]" />, badgeBg: 'bg-[#E9F0ED] border-[#183B35]/20', textColor: 'text-[#183B35]' },
  entertainment: { label: 'Vui chơi', icon: <Gamepad2 className="w-3.5 h-3.5 text-[#A46F3D]" />, badgeBg: 'bg-[#F3E9DD] border-[#E2E3DE]', textColor: 'text-[#A46F3D]' },
  shopping: { label: 'Mua sắm', icon: <ShoppingBag className="w-3.5 h-3.5 text-[#A46F3D]" />, badgeBg: 'bg-[#F3E9DD] border-[#E2E3DE]', textColor: 'text-[#A46F3D]' },
  spiritual: { label: 'Tâm linh', icon: <Landmark className="w-3.5 h-3.5 text-[#A46F3D]" />, badgeBg: 'bg-[#F3E9DD] border-[#E2E3DE]', textColor: 'text-[#A46F3D]' },
  transport: { label: 'Di chuyển', icon: <Plane className="w-3.5 h-3.5 text-[#183B35]" />, badgeBg: 'bg-[#E9F0ED] border-[#183B35]/20', textColor: 'text-[#183B35]' },
  other: { label: 'Khác', icon: <Tag className="w-3.5 h-3.5 text-[#606864]" />, badgeBg: 'bg-[#F7F5F0] border-[#E2E3DE]', textColor: 'text-[#606864]' },
};

export const priceLevelLabels: Record<string, string> = {
  free: 'Miễn phí',
  budget: 'Giá bình dân',
  moderate: 'Giá trung bình',
  expensive: 'Cao cấp',
  unknown: 'Chưa biết giá',
};

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  isSelected = false,
  viewMode = 'grid',
  collectionNames = [],
  onSelect,
  onOpenDetail,
  onAddToTrip,
  onEdit,
  onToggleFavorite,
  onToggleVisited,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const cat = categoryMeta[place.category] || categoryMeta.other;

  if (viewMode === 'list') {
    return (
      <div
        className={`group bg-white rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-stretch overflow-hidden shadow-xs hover:shadow-md ${
          isSelected ? 'border-[#183B35] ring-2 ring-[#183B35]/20 bg-[#E9F0ED]/20' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {/* Thumbnail Image */}
        <div
          onClick={() => onOpenDetail(place)}
          className="sm:w-48 h-40 sm:h-auto bg-slate-100 relative shrink-0 cursor-pointer overflow-hidden"
        >
          <img
            src={place.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {onSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(place.id);
              }}
              className="absolute top-2 left-2 z-10 w-6 h-6 rounded-lg bg-white/90 backdrop-blur-xs flex items-center justify-center border border-slate-200 text-slate-700 cursor-pointer shadow-xs"
            >
              <input type="checkbox" checked={isSelected} onChange={() => {}} className="rounded text-[#DC2626]" />
            </button>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(place.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md shadow-xs transition-transform cursor-pointer active:scale-95 ${
                place.favorite ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${place.favorite ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border flex items-center gap-1 ${cat.badgeBg} ${cat.textColor}`}>
                  {cat.icon}
                  <span>{cat.label}</span>
                </span>
                {place.city && (
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{place.city}</span>
                  </span>
                )}
              </div>

              {place.visited && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-red-600" />
                  <span>Đã ghé</span>
                </span>
              )}
            </div>

            <h3
              onClick={() => onOpenDetail(place)}
              className="text-base font-black text-slate-900 hover:text-[#DC2626] cursor-pointer tracking-tight leading-snug"
            >
              {place.name}
            </h3>

            {place.address && (
              <p className="text-xs text-slate-500 truncate font-medium">
                {place.address}
              </p>
            )}

            {place.personalNote && (
              <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                "{place.personalNote}"
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-3">
              {place.personalRating && (
                <div className="flex items-center gap-1 text-amber-600 font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{place.personalRating.toFixed(1)}/5</span>
                </div>
              )}
              {place.priceLevel && (
                <span className="text-[11px] font-medium text-slate-500">
                  {priceLevelLabels[place.priceLevel] || place.priceLevel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAddToTrip(place)}
                className="px-3 py-1.5 rounded-xl bg-[#E9F0ED] hover:bg-[#183B35] text-[#183B35] hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Thêm vào chuyến đi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Mode Card
  return (
    <div
      className={`group bg-white rounded-[20px] border transition-all duration-200 flex flex-col overflow-hidden shadow-xs hover:shadow-md relative ${
        isSelected ? 'border-[#183B35] ring-2 ring-[#183B35]/20 bg-[#E9F0ED]/10' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Cover Image Area */}
      <div
        onClick={() => onOpenDetail(place)}
        className="h-44 w-full bg-slate-100 relative cursor-pointer overflow-hidden"
      >
        <img
          src={place.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {onSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(place.id);
              }}
              className="w-6 h-6 rounded-lg bg-white/95 backdrop-blur-xs flex items-center justify-center border border-slate-200 text-slate-700 cursor-pointer shadow-xs"
            >
              <input type="checkbox" checked={isSelected} onChange={() => {}} className="rounded text-[#183B35]" />
            </button>
          )}

          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold border backdrop-blur-md shadow-xs flex items-center gap-1 ${cat.badgeBg} ${cat.textColor}`}>
            {cat.icon}
            <span>{cat.label}</span>
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(place.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md shadow-xs transition-transform cursor-pointer active:scale-95 ${
              place.favorite ? 'bg-[#A46F3D] text-white' : 'bg-white/90 text-slate-600 hover:bg-white'
            }`}
            title={place.favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          >
            <Heart className={`w-3.5 h-3.5 ${place.favorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Visited Status Banner on Image */}
        {place.visited && (
          <div className="absolute bottom-3 left-3 bg-[#183B35]/90 text-white backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-[#E9F0ED]" />
            <span>Đã ghé</span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onOpenDetail(place)}
              className="text-base font-semibold text-[#1D211F] hover:text-[#183B35] cursor-pointer tracking-tight leading-snug line-clamp-1"
            >
              {place.name}
            </h3>

            {/* Menu 3-dots */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 top-7 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-xs font-semibold text-slate-700 space-y-0.5"
                  onClick={() => setShowMenu(false)}
                >
                  <button
                    type="button"
                    onClick={() => onEdit(place)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>Chỉnh sửa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleVisited(place.id)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>{place.visited ? 'Đánh dấu chưa ghé' : 'Đánh dấu đã ghé'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddToTrip(place)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-[#183B35]"
                  >
                    <span>Thêm vào chuyến đi</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    type="button"
                    onClick={() => onDelete(place.id)}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                  >
                    <span>Xóa khỏi kho</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Location & City */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{place.city || place.province || place.address || 'Chưa rõ thành phố'}</span>
          </div>

          {/* Personal Rating & Price */}
          <div className="flex items-center gap-2 pt-0.5">
            {place.personalRating && (
              <div className="flex items-center gap-1 bg-[#F3E9DD] border border-[#E2E3DE] text-[#A46F3D] px-2 py-0.5 rounded-lg text-[11px] font-semibold">
                <Star className="w-3 h-3 fill-[#A46F3D] text-[#A46F3D]" />
                <span>{place.personalRating.toFixed(1)}/5</span>
              </div>
            )}

            {place.priceLevel && (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                {priceLevelLabels[place.priceLevel] || place.priceLevel}
              </span>
            )}
          </div>

          {/* Personal Note excerpt */}
          {place.personalNote && (
            <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic font-normal">
              "{place.personalNote}"
            </p>
          )}

          {/* Suitability tags */}
          {place.suitabilityTags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {place.suitabilityTags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="text-[10px] font-medium text-[#183B35] bg-[#E9F0ED] px-2 py-0.5 rounded-md border border-[#183B35]/10">
                  {tag}
                </span>
              ))}
              {place.suitabilityTags.length > 2 && (
                <span className="text-[10px] text-slate-400 font-semibold">
                  +{place.suitabilityTags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onOpenDetail(place)}
            className="text-xs font-semibold text-[#606864] hover:text-[#183B35] cursor-pointer"
          >
            Chi tiết
          </button>

          <button
            type="button"
            onClick={() => onAddToTrip(place)}
            className="px-3 py-1.5 rounded-xl bg-[#E9F0ED] hover:bg-[#183B35] text-[#183B35] hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Thêm vào chuyến</span>
          </button>
        </div>
      </div>
    </div>
  );
};
