import React from 'react';
import { Search, Filter, ArrowUpDown, LayoutGrid, List, X, MapPin } from 'lucide-react';
import { PlacesFilterState, PlaceCategoryType } from '../../types';

interface PlaceSearchBarProps {
  filterState: PlacesFilterState;
  availableCities: string[];
  viewMode: 'grid' | 'list';
  onFilterChange: (updated: Partial<PlacesFilterState>) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onResetFilters: () => void;
}

export const PlaceSearchBar: React.FC<PlaceSearchBarProps> = ({
  filterState,
  availableCities,
  viewMode,
  onFilterChange,
  onViewModeChange,
  onResetFilters,
}) => {
  const [showFilterDrawer, setShowFilterDrawer] = React.useState(false);

  const hasActiveFilters =
    filterState.search ||
    filterState.cities.length > 0 ||
    filterState.visited !== undefined ||
    filterState.favorite !== undefined ||
    filterState.priceLevels.length > 0;

  return (
    <div className="space-y-3 bg-white p-4 rounded-[24px] border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input field */}
        <div className="relative flex-1">
          <input
            type="text"
            value={filterState.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Tìm tên địa điểm, thành phố, địa chỉ hoặc ghi chú..."
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-10 focus:outline-none focus:border-[#DC2626] focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          {filterState.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons & Sorting */}
        <div className="flex items-center gap-2 overflow-x-auto shrink-0">
          {/* City Filter Select */}
          <select
            value={filterState.cities[0] || ''}
            onChange={(e) => onFilterChange({ cities: e.target.value ? [e.target.value] : [] })}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả thành phố</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Sort Select */}
          <select
            value={filterState.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value as PlacesFilterState['sort'] })}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="recent">Mới lưu gần đây</option>
            <option value="name_asc">Tên A–Z</option>
            <option value="rating_desc">Đánh giá cá nhân cao nhất</option>
            <option value="visited_recent">Đã ghé gần đây</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Chế độ Lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Chế độ Danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Status Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs font-bold">
        <button
          type="button"
          onClick={() =>
            onFilterChange({
              visited: filterState.visited === true ? undefined : true,
            })
          }
          className={`px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
            filterState.visited === true
              ? 'bg-red-600 text-white border-red-600 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ✓ Đã ghé
        </button>

        <button
          type="button"
          onClick={() =>
            onFilterChange({
              visited: filterState.visited === false ? undefined : false,
            })
          }
          className={`px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
            filterState.visited === false
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ⏱️ Muốn ghé
        </button>

        <button
          type="button"
          onClick={() =>
            onFilterChange({
              favorite: filterState.favorite ? undefined : true,
            })
          }
          className={`px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
            filterState.favorite
              ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ❤️ Yêu thích
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 font-bold hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  );
};
