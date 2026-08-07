import React from 'react';
import {
  FolderHeart,
  Plus,
  Compass,
  Utensils,
  Coffee,
  BedDouble,
  TreePine,
  Gamepad2,
  ShoppingBag,
  Landmark,
  Plane,
  Tag,
  Layers,
  Heart,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { PlaceCollection, PlaceCategoryType } from '../../types';

interface PlaceCollectionSidebarProps {
  collections: PlaceCollection[];
  totalPlacesCount: number;
  selectedCollectionId: string | null;
  selectedCategory: PlaceCategoryType | 'all';
  categoryCounts: Record<string, number>;
  visitedCount: number;
  favoriteCount: number;
  onSelectCollection: (collectionId: string | null) => void;
  onSelectCategory: (cat: PlaceCategoryType | 'all') => void;
  onCreateCollection: () => void;
}

const defaultCategories: { id: PlaceCategoryType; label: string; icon: React.ReactNode }[] = [
  { id: 'food', label: 'Ăn uống', icon: <Utensils className="w-4 h-4 text-[#A46F3D]" /> },
  { id: 'cafe', label: 'Cà phê', icon: <Coffee className="w-4 h-4 text-[#A46F3D]" /> },
  { id: 'sightseeing', label: 'Tham quan', icon: <Compass className="w-4 h-4 text-[#183B35]" /> },
  { id: 'accommodation', label: 'Lưu trú', icon: <BedDouble className="w-4 h-4 text-[#183B35]" /> },
  { id: 'nature', label: 'Biển & Thiên nhiên', icon: <TreePine className="w-4 h-4 text-[#183B35]" /> },
  { id: 'entertainment', label: 'Vui chơi', icon: <Gamepad2 className="w-4 h-4 text-[#A46F3D]" /> },
  { id: 'shopping', label: 'Mua sắm', icon: <ShoppingBag className="w-4 h-4 text-[#A46F3D]" /> },
  { id: 'spiritual', label: 'Tâm linh', icon: <Landmark className="w-4 h-4 text-[#A46F3D]" /> },
  { id: 'transport', label: 'Di chuyển', icon: <Plane className="w-4 h-4 text-[#183B35]" /> },
  { id: 'other', label: 'Khác', icon: <Tag className="w-4 h-4 text-[#606864]" /> },
];

export const PlaceCollectionSidebar: React.FC<PlaceCollectionSidebarProps> = ({
  collections,
  totalPlacesCount,
  selectedCollectionId,
  selectedCategory,
  categoryCounts,
  visitedCount,
  favoriteCount,
  onSelectCollection,
  onSelectCategory,
  onCreateCollection,
}) => {
  return (
    <aside className="w-full lg:w-60 shrink-0 space-y-6 text-xs font-bold text-slate-700 sticky top-20">
      {/* Category Nav Block */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
          <span>Phân loại địa điểm</span>
          <span>{totalPlacesCount}</span>
        </div>

        <div className="space-y-1">
          {/* All Places Button */}
          <button
            type="button"
            onClick={() => {
              onSelectCategory('all');
              onSelectCollection(null);
            }}
            className={`w-full px-3 py-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
              selectedCategory === 'all' && selectedCollectionId === null
                ? 'bg-[#183B35] text-white border-[#183B35] shadow-xs font-semibold'
                : 'bg-white border-transparent text-slate-800 hover:bg-[#F7F5F0]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className={`w-4 h-4 ${selectedCategory === 'all' && selectedCollectionId === null ? 'text-white' : 'text-[#183B35]'}`} />
              <span>Tất cả địa điểm</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              selectedCategory === 'all' && selectedCollectionId === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {totalPlacesCount}
            </span>
          </button>

          {/* List of default Categories */}
          {defaultCategories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id && selectedCollectionId === null;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectCollection(null);
                }}
                className={`w-full px-3 py-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#E9F0ED] border-[#183B35] text-[#183B35] font-semibold'
                    : 'bg-white border-transparent text-slate-700 hover:bg-[#F7F5F0]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {cat.icon}
                  <span className="truncate">{cat.label}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Custom Collections Block */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
            Bộ sưu tập của tôi ({collections.length})
          </span>

          <button
            type="button"
            onClick={onCreateCollection}
            className="p-1 rounded-lg text-[#183B35] hover:bg-[#E9F0ED] cursor-pointer font-semibold text-xs flex items-center gap-0.5"
            title="Tạo bộ sưu tập mới"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px]">Tạo</span>
          </button>
        </div>

        <div className="space-y-1">
          {collections.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic px-2 py-2">Chưa có bộ sưu tập nào</p>
          ) : (
            collections.map((col) => {
              const isSelected = selectedCollectionId === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => {
                    onSelectCollection(col.id);
                    onSelectCategory('all');
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#183B35] text-white border-[#183B35] shadow-xs font-semibold'
                      : 'bg-white border-transparent text-slate-800 hover:bg-[#F7F5F0]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderHeart className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#A46F3D]'}`} />
                    <span className="truncate">{col.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#F3E9DD] text-[#A46F3D]'
                  }`}>
                    {col.placeCount}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
