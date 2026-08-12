import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  CheckCircle2,
  Clock,
  PlusCircle,
  Share2,
  Edit,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Image as ImageIcon,
  FolderHeart,
  Tag,
  Sparkles,
  Info,
  Check,
  Building2,
} from 'lucide-react';
import { SavedPlace, PlaceCollection, TravelBook } from '../../types';
import { categoryMeta, priceLevelLabels } from './PlaceCard';
import { SharePlaceDialog } from './SharePlaceDialog';

interface PlaceDetailPageProps {
  place: SavedPlace;
  collections: PlaceCollection[];
  trips: TravelBook[];
  onBack: () => void;
  onEdit: (place: SavedPlace) => void;
  onAddToTrip: (place: SavedPlace) => void;
  onDelete: (placeId: string) => void;
  onToggleFavorite: (placeId: string) => void;
  onToggleVisited: (placeId: string) => void;
}

export const PlaceDetailPage: React.FC<PlaceDetailPageProps> = ({
  place,
  collections,
  trips,
  onBack,
  onEdit,
  onAddToTrip,
  onDelete,
  onToggleFavorite,
  onToggleVisited,
}) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(
    place.images || [place.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80']
  );

  const cat = categoryMeta[place.category] || categoryMeta.other;
  const placeCollections = collections.filter((c) => place.collectionIds.includes(c.id));

  // Find trips that used this place
  const relatedTrips = trips.filter((t) =>
    t.days.some((d) =>
      d.activities.some((act) => act.place?.name.toLowerCase() === place.name.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-sand-50 text-slate-800 pb-20 animate-fadeIn">
      {/* Sticky Sub-Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-extrabold text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Địa điểm yêu thích</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(place.id)}
            className={`p-2 rounded-xl border cursor-pointer transition-all ${
              place.favorite
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-sand-50'
            }`}
            title="Đánh dấu Yêu thích"
          >
            <Heart className={`w-4 h-4 ${place.favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-sand-50 cursor-pointer"
            title="Chia sẻ địa điểm"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(place)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-sand-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chỉnh sửa</span>
          </button>

          <button
            type="button"
            onClick={() => onAddToTrip(place)}
            className="px-4 py-2 rounded-xl bg-bronze-600 hover:bg-[#B91C1C] text-white font-extrabold text-xs shadow-sm shadow-[#DC2626]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm vào chuyến đi</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Place Hero Section */}
        <div className="relative rounded-[24px] overflow-hidden bg-slate-900 shadow-xl h-[260px] sm:h-[360px]">
          <img
            src={place.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
            alt={place.name}
            className="w-full h-full object-cover opacity-80"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-black border backdrop-blur-md flex items-center gap-1.5 ${cat.badgeBg} ${cat.textColor}`}>
                {cat.icon}
                <span>{cat.label}</span>
              </span>

              {place.city && (
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{place.city}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-red-500xl font-black tracking-tight drop-shadow-md">
              {place.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl line-clamp-2">
              {place.address || `${place.city || ''}, ${place.province || ''}`}
            </p>
          </div>
        </div>

        {/* 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          {/* Main Content Column */}
          <div className="space-y-6">
            {/* Personal Note Box (Section 19: Vì sao tôi lưu nơi này?) */}
            <div className="bg-white rounded-[24px] border border-bronze-200 p-6 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-bronze-400"></div>
              <div className="flex items-center gap-2 text-bronze-900 font-black text-sm">
                <Sparkles className="w-4 h-4 text-bronze-600" />
                <h3>Vì sao tôi lưu nơi này? (Ghi chú cá nhân)</h3>
              </div>

              {place.personalNote ? (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-bronze-50/50 p-4 rounded-2xl border border-bronze-100">
                  "{place.personalNote}"
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa có ghi chú cá nhân nào cho địa điểm này.</p>
              )}
            </div>

            {/* Suitability & Amenities Section */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">
                Phù hợp gia đình & Tiện ích
              </h3>

              {place.suitabilityTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {place.suitabilityTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-red-50 text-bronze-600 border border-sky-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa gắn nhãn phù hợp gia đình.</p>
              )}
            </div>

            {/* Trip Usage History Section (Section 23) */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-bronze-600" />
                  <span>Lịch sử xuất hiện trong các chuyến đi</span>
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  {relatedTrips.length} chuyến đi
                </span>
              </div>

              {relatedTrips.length > 0 ? (
                <div className="space-y-2">
                  {relatedTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="p-3.5 rounded-2xl bg-sand-50 border border-slate-200 flex items-center justify-between text-xs font-bold"
                    >
                      <div className="space-y-0.5">
                        <p className="text-slate-900 font-extrabold">{trip.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {trip.startDate} - {trip.endDate} ({trip.durationDays} ngày)
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg bg-forest-100 text-forest-800 text-[10px] font-black">
                        Đã lập lịch
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-sand-50 p-4 rounded-2xl text-center">
                  Địa điểm này chưa được thêm vào chuyến đi nào.
                </p>
              )}
            </div>

            {/* Personal Photos Section (Section 24) */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Ảnh kỷ niệm cá nhân</span>
                </h3>

                <button
                  type="button"
                  onClick={() => alert('Chức năng tải ảnh kỷ niệm sẽ tải ảnh lên thiết bị.')}
                  className="text-xs text-bronze-600 hover:underline font-bold cursor-pointer"
                >
                  + Thêm ảnh
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={img} alt={`Memory ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            {/* Quick Visit & Rating Card */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Trạng thái & Đánh giá
              </h4>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onToggleVisited(place.id)}
                  className={`w-full p-3 rounded-2xl border text-left font-extrabold text-xs flex items-center justify-between cursor-pointer transition-all ${
                    place.visited
                      ? 'bg-forest-50 border-forest-300 text-forest-900'
                      : 'bg-sand-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${place.visited ? 'text-bronze-600' : 'text-slate-400'}`} />
                    <span>{place.visited ? 'Đã từng ghé địa điểm này' : 'Chưa ghé (Muốn ghé)'}</span>
                  </div>
                </button>

                {place.visited && place.personalRating && (
                  <div className="p-3.5 rounded-2xl bg-bronze-50 border border-bronze-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-bronze-900">Đánh giá cá nhân:</span>
                    <div className="flex items-center gap-1 text-bronze-600 font-black text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-bronze-400" />
                      <span>{place.personalRating.toFixed(1)} / 5</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Khoảng giá:</span>
                <span className="text-slate-900 font-extrabold">
                  {priceLevelLabels[place.priceLevel || 'unknown']}
                </span>
              </div>
            </div>

            {/* Belonging Collections Card */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <FolderHeart className="w-4 h-4 text-purple-600" />
                <span>Thuộc bộ sưu tập</span>
              </h4>

              {placeCollections.length > 0 ? (
                <div className="space-y-1.5">
                  {placeCollections.map((col) => (
                    <div
                      key={col.id}
                      className="p-2.5 rounded-xl bg-purple-50 text-purple-950 font-bold text-xs flex items-center justify-between"
                    >
                      <span>{col.name}</span>
                      <span className="text-[10px] text-purple-700 font-extrabold">{col.placeCount} địa điểm</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa đưa vào bộ sưu tập nào.</p>
              )}
            </div>

            {/* Address & Maps Link Card */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Địa chỉ & Bản đồ
              </h4>

              <div className="space-y-2 text-xs font-medium text-slate-700">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-bronze-600 shrink-0 mt-0.5" />
                  <span>{place.address || `${place.city || ''}, ${place.province || ''}`}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.address || place.city || ''))}`, '_blank')
                }
                className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-sky-100 text-bronze-600 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở Google Maps</span>
              </button>
            </div>

            {/* Verification Notice Card (Section 22) */}
            {place.verificationStatus === 'needs_check' && (
              <div className="bg-bronze-50 rounded-[24px] border border-bronze-200 p-4 space-y-2 text-xs text-bronze-900">
                <div className="flex items-center gap-2 font-black text-bronze-950">
                  <ShieldAlert className="w-4 h-4 text-bronze-600" />
                  <span>Cần kiểm tra trước khi đi</span>
                </div>
                <p className="font-medium text-[11px]">
                  Địa chỉ này cần được kiểm tra hoặc gọi điện thoại xác nhận giờ mở cửa trước khi khởi hành.
                </p>
              </div>
            )}

            {/* Delete button */}
            <button
              type="button"
              onClick={() => {
                if (confirm(`Bạn có chắc muốn xóa địa điểm "${place.name}" khỏi kho?`)) {
                  onDelete(place.id);
                  onBack();
                }
              }}
              className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa địa điểm khỏi kho</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <SharePlaceDialog
        title={place.name}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
};
