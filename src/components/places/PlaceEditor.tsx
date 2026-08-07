import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Trash2,
  MapPin,
  Star,
  Upload,
  Heart,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  DollarSign,
  FolderHeart,
  Plus,
} from 'lucide-react';
import { SavedPlace, PlaceCategoryType, PlaceCollection } from '../../types';
import { categoryMeta, priceLevelLabels } from './PlaceCard';

interface PlaceEditorProps {
  place: SavedPlace | null; // Null means creating a new place
  isOpen: boolean;
  collections: PlaceCollection[];
  existingPlaces: SavedPlace[];
  onClose: () => void;
  onSave: (placeData: Partial<SavedPlace>) => void;
  onDelete?: (placeId: string) => void;
  onCreateNewCollection?: () => void;
}

const suitabilityOptions = [
  'Phù hợp trẻ em',
  'Phù hợp người lớn tuổi',
  'Không cần đi bộ nhiều',
  'Có chỗ đậu xe',
  'Có máy lạnh',
  'Phù hợp gia đình đông người',
  'Cần đặt trước',
  'Giá bình dân',
  'Chụp ảnh đẹp',
  'Đặc sản địa phương',
];

const mockCoverImages = [
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80',
];

export const PlaceEditor: React.FC<PlaceEditorProps> = ({
  place,
  isOpen,
  collections,
  existingPlaces,
  onClose,
  onSave,
  onDelete,
  onCreateNewCollection,
}) => {
  if (!isOpen) return null;

  const isEdit = !!place;

  // Form State
  const [name, setName] = useState(place?.name || '');
  const [category, setCategory] = useState<PlaceCategoryType>(place?.category || 'food');
  const [city, setCity] = useState(place?.city || 'Đà Nẵng');
  const [address, setAddress] = useState(place?.address || '');
  const [coverImage, setCoverImage] = useState(place?.coverImage || mockCoverImages[0]);
  const [visited, setVisited] = useState(place?.visited || false);
  const [favorite, setFavorite] = useState(place?.favorite || false);
  const [personalNote, setPersonalNote] = useState(place?.personalNote || '');
  const [personalRating, setPersonalRating] = useState<number>(place?.personalRating || 4.5);
  const [priceLevel, setPriceLevel] = useState<SavedPlace['priceLevel']>(place?.priceLevel || 'budget');
  const [selectedTags, setSelectedTags] = useState<string[]>(place?.suitabilityTags || ['Phù hợp gia đình']);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(place?.collectionIds || []);

  // Duplicate Check Warning state
  const [duplicateMatch, setDuplicateMatch] = useState<SavedPlace | null>(null);

  // Check duplicate place when name changes
  useEffect(() => {
    if (!name.trim() || isEdit) {
      setDuplicateMatch(null);
      return;
    }
    const match = existingPlaces.find(
      (p) => p.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    setDuplicateMatch(match || null);
  }, [name, existingPlaces, isEdit]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleCollection = (colId: string) => {
    if (selectedCollectionIds.includes(colId)) {
      setSelectedCollectionIds(selectedCollectionIds.filter((id) => id !== colId));
    } else {
      setSelectedCollectionIds([...selectedCollectionIds, colId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: place?.id || `place-${Date.now()}`,
      name: name.trim(),
      category,
      city: city.trim() || undefined,
      address: address.trim() || undefined,
      coverImage,
      visited,
      favorite,
      visitedAt: visited ? place?.visitedAt || new Date().toISOString() : undefined,
      personalNote: personalNote.trim() || undefined,
      personalRating: visited ? personalRating : undefined,
      priceLevel,
      suitabilityTags: selectedTags,
      collectionIds: selectedCollectionIds,
      verificationStatus: place?.verificationStatus || 'needs_check',
      updatedAt: new Date().toISOString(),
      createdAt: place?.createdAt || new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      {/* Responsive Drawer Container */}
      <div className="bg-white w-full sm:w-[560px] h-full shadow-2xl flex flex-col justify-between p-0 animate-fadeIn relative">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {isEdit ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm mới'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Địa điểm yêu thích của gia đình
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate Warning Notification */}
        {duplicateMatch && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-2 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p>Có thể bạn đã lưu địa điểm này: <span className="underline">{duplicateMatch.name}</span> ({duplicateMatch.city})</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form id="place-editor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-bold text-slate-700">
          {/* Field 1: Name */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-slate-900 font-extrabold">
                1. Tên địa điểm *
              </label>
              <span className="text-[10px] text-slate-400 font-normal">{name.length}/120 ký tự</span>
            </div>
            <input
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Bún chìa Cô Cúc, Làng Cà phê Trung Nguyên..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#DC2626]"
            />
          </div>

          {/* Field 2: Category Select */}
          <div className="space-y-1.5">
            <label className="block text-slate-900 font-extrabold">
              2. Phân loại địa điểm *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(categoryMeta) as PlaceCategoryType[]).map((catKey) => {
                const meta = categoryMeta[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? `${meta.badgeBg} ${meta.textColor} font-black ring-2 ring-[#DC2626]/20`
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {meta.icon}
                    <span className="text-xs truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 3 & 4: Address & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-900 font-extrabold">
                3. Thành phố / Tỉnh *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Đà Nẵng, Hội An, Phú Quốc..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-900 font-extrabold">
                4. Địa chỉ chi tiết
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: 222 Điện Biên Phủ..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#DC2626]"
              />
            </div>
          </div>

          {/* Field 5: Cover Image Picker & Device Upload */}
          <div className="space-y-2">
            <label className="block text-slate-900 font-extrabold text-xs sm:text-sm">
              5. Ảnh đại diện địa điểm
            </label>

            {/* Current Image Preview & Device Upload Trigger */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden border border-slate-300 relative bg-slate-100 shrink-0">
                {coverImage ? (
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                    Chưa có ảnh
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh từ thiết bị</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setCoverImage(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <span className="text-[11px] text-slate-500 font-medium">hoặc dán liên kết URL</span>
                </div>

                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#DC2626]"
                />
              </div>
            </div>

            {/* Presets Row */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Hoặc chọn ảnh gợi ý nhanh:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {mockCoverImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCoverImage(imgUrl)}
                    className={`w-14 h-12 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                      coverImage === imgUrl ? 'border-[#DC2626] ring-2 ring-[#DC2626]/30 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Cover option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Field 6: Status & Favorite */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="block text-slate-900 font-extrabold">
              6. Trạng thái & Yêu thích
            </label>
            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visited}
                  onChange={(e) => setVisited(e.target.checked)}
                  className="rounded text-[#DC2626] w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Đã từng ghé qua</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(e) => setFavorite(e.target.checked)}
                  className="rounded text-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>Yêu thích</span>
                </span>
              </label>
            </div>
          </div>

          {/* Personal Rating if Visited */}
          {visited && (
            <div className="space-y-1 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200">
              <label className="block text-amber-950 font-extrabold">
                Đánh giá cá nhân của bạn
              </label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setPersonalRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= personalRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-black text-amber-900 ml-2">
                  {personalRating.toFixed(1)} / 5 sao
                </span>
              </div>
            </div>
          )}

          {/* Field 7: Personal Notes */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-slate-900 font-extrabold">
                7. Ghi chú cá nhân (Vì sao bạn lưu nơi này?)
              </label>
              <span className="text-[10px] text-slate-400 font-normal">{personalNote.length}/1000 ký tự</span>
            </div>
            <textarea
              rows={3}
              maxLength={1000}
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder="VD: Nên ghé buổi sáng, quán gần Chùa Khải Đoan, cả nhà muốn thử bún chìa..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#DC2626]"
            />
          </div>

          {/* Field 8: Suitability Tags */}
          <div className="space-y-1.5">
            <label className="block text-slate-900 font-extrabold">
              8. Tiện ích & Phù hợp gia đình
            </label>
            <div className="flex flex-wrap gap-1.5">
              {suitabilityOptions.map((tag) => {
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

          {/* Field 9: Price Level */}
          <div className="space-y-1">
            <label className="block text-slate-900 font-extrabold">
              9. Mức giá ước tính
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'free', label: 'Miễn phí' },
                { id: 'budget', label: 'Bình dân' },
                { id: 'moderate', label: 'Trung bình' },
                { id: 'expensive', label: 'Cao cấp' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setPriceLevel(lvl.id as SavedPlace['priceLevel'])}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    priceLevel === lvl.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field 10: Collection Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-slate-900 font-extrabold">
                10. Bộ sưu tập
              </label>

              {onCreateNewCollection && (
                <button
                  type="button"
                  onClick={onCreateNewCollection}
                  className="text-xs text-[#DC2626] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo bộ sưu tập mới</span>
                </button>
              )}
            </div>

            <div className="space-y-1">
              {collections.map((col) => {
                const isSelected = selectedCollectionIds.includes(col.id);
                return (
                  <label
                    key={col.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50 border-purple-300 text-purple-950 font-black'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCollection(col.id)}
                        className="rounded text-purple-600"
                      />
                      <span>{col.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {col.placeCount} địa điểm
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer Bar */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          {isEdit && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(place.id)}
              className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa địa điểm</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              form="place-editor-form"
              disabled={!name.trim()}
              className="px-5 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-xs shadow-md shadow-[#DC2626]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isEdit ? 'Lưu địa điểm' : 'Tạo địa điểm'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
