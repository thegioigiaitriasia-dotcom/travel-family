import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  FolderPlus,
  Layers,
  Search,
  MapPin,
  CheckCircle2,
  Heart,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  X,
  Trash2,
  Bookmark,
  Calendar,
  Database,
  Info,
  Compass,
} from 'lucide-react';
import {
  SavedPlace,
  PlaceCollection,
  PlaceCategoryType,
  PlacesFilterState,
  TravelBook,
  TravelActivityType,
  UserAuthSession,
} from '../../types';

import { PlaceCard } from './PlaceCard';
import { PlaceCollectionSidebar } from './PlaceCollectionSidebar';
import { PlaceSearchBar } from './PlaceSearchBar';
import { PlaceEditor } from './PlaceEditor';
import { AddPlaceToTripDialog } from './AddPlaceToTripDialog';
import { CreateCollectionDialog } from './CreateCollectionDialog';
import { PlaceDetailPage } from './PlaceDetailPage';
import { fetchSupabasePlaces, saveSupabasePlace, deleteSupabasePlace } from '../../lib/supabase';

interface MyPlacesPageProps {
  trips?: TravelBook[];
  session?: UserAuthSession;
  onAddActivityToTrip?: (
    tripId: string,
    dayNumber: number,
    activityType: TravelActivityType,
    startTime: string,
    place: SavedPlace
  ) => void;
}

export const MyPlacesPage: React.FC<MyPlacesPageProps> = ({
  trips = [],
  session,
  onAddActivityToTrip,
}) => {
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [collections, setCollections] = useState<PlaceCollection[]>([]);

  // Load accumulated POIs from Supabase database
  useEffect(() => {
    async function loadPOIs() {
      const dbPOIs = await fetchSupabasePlaces(session?.currentUser?.id);
      if (dbPOIs && dbPOIs.length > 0) {
        const mapped: SavedPlace[] = dbPOIs.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: (item.category as PlaceCategoryType) || 'sightseeing',
          address: item.address || 'Địa điểm công cộng',
          city: item.address ? item.address.split(',').pop()?.trim() : 'Đà Nẵng',
          personalRating: item.rating || 4.5,
          coverImage: item.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
          images: [item.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
          personalNote: item.description || 'Địa điểm cá nhân.',
          suitabilityTags: item.tags || ['Dành cho gia đình'],
          collectionIds: [],
          verificationStatus: 'verified',
          visited: false,
          favorite: Boolean(item.is_favorite),
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.created_at || new Date().toISOString(),
        }));

        // Lọc trùng lặp (tránh add hai lần cùng một địa điểm)
        setPlaces((prev) => {
          const names = new Set(prev.map((p) => p.name.toLowerCase()));
          const newUnique = mapped.filter((p) => !names.has(p.name.toLowerCase()));
          return [...prev, ...newUnique];
        });
      }
    }
    loadPOIs();
  }, [session]);

  // Selected Detail View Place
  const [selectedDetailPlace, setSelectedDetailPlace] = useState<SavedPlace | null>(null);

  // Filter State (Section 43)
  const [filterState, setFilterState] = useState<PlacesFilterState>({
    search: '',
    categories: [],
    cities: [],
    collectionIds: [],
    priceLevels: [],
    sort: 'recent',
  });

  // Selected Category & Collection in Sidebar
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategoryType | 'all'>('all');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // View Mode: Grid or List
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Bulk Selection State (Section 14)
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);

  // Dialog & Drawer States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<SavedPlace | null>(null);
  const [isAddToTripOpen, setIsAddToTripOpen] = useState(false);
  const [targetAddToTripPlace, setTargetAddToTripPlace] = useState<SavedPlace | null>(null);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);

  // Extract unique available cities from places
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set);
  }, [places]);

  // Calculate category counts for sidebar
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    places.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [places]);

  const visitedCount = useMemo(() => places.filter((p) => p.visited).length, [places]);
  const favoriteCount = useMemo(() => places.filter((p) => p.favorite).length, [places]);

  // Filter & Sort Logic
  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // 1. Search keyword (name, city, address, note)
      if (filterState.search.trim()) {
        const query = filterState.search.toLowerCase().trim();
        const matchesName = place.name.toLowerCase().includes(query);
        const matchesCity = place.city?.toLowerCase().includes(query) || false;
        const matchesAddress = place.address?.toLowerCase().includes(query) || false;
        const matchesNote = place.personalNote?.toLowerCase().includes(query) || false;
        const matchesTag = place.suitabilityTags.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesCity && !matchesAddress && !matchesNote && !matchesTag) {
          return false;
        }
      }

      // 2. Sidebar category
      if (selectedCategory !== 'all' && place.category !== selectedCategory) {
        return false;
      }

      // 3. Sidebar collection
      if (selectedCollectionId && !place.collectionIds.includes(selectedCollectionId)) {
        return false;
      }

      // 4. Cities filter
      if (filterState.cities.length > 0 && (!place.city || !filterState.cities.includes(place.city))) {
        return false;
      }

      // 5. Visited status filter
      if (filterState.visited !== undefined && place.visited !== filterState.visited) {
        return false;
      }

      // 6. Favorite status filter
      if (filterState.favorite && !place.favorite) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filterState.sort === 'name_asc') {
        return a.name.localeCompare(b.name, 'vi');
      }
      if (filterState.sort === 'rating_desc') {
        return (b.personalRating || 0) - (a.personalRating || 0);
      }
      if (filterState.sort === 'visited_recent') {
        return (b.visitedAt || '').localeCompare(a.visitedAt || '');
      }
      // Mặc định: 'recent'
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [places, filterState, selectedCategory, selectedCollectionId]);

  // Handle Save / Edit Place
  const handleSavePlace = async (placeData: Partial<SavedPlace>) => {
    let finalPlace: SavedPlace;
    if (editingPlace) {
      // Update existing
      finalPlace = { ...editingPlace, ...placeData } as SavedPlace;
      setPlaces((prev) =>
        prev.map((p) => (p.id === editingPlace.id ? finalPlace : p))
      );
    } else {
      // Create new
      finalPlace = { ...placeData, id: placeData.id || `poi-${Date.now()}` } as SavedPlace;
      setPlaces((prev) => [finalPlace, ...prev]);
    }
    setEditingPlace(null);

    if (session?.currentUser?.id) {
      await saveSupabasePlace(session.currentUser.id, finalPlace);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (placeId: string) => {
    const pIdx = places.findIndex(p => p.id === placeId);
    if (pIdx < 0) return;
    const updatedPlace = { ...places[pIdx], favorite: !places[pIdx].favorite };
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? updatedPlace : p))
    );
    if (session?.currentUser?.id) {
      await saveSupabasePlace(session.currentUser.id, updatedPlace);
    }
  };

  // Toggle Visited
  const handleToggleVisited = async (placeId: string) => {
    const pIdx = places.findIndex(p => p.id === placeId);
    if (pIdx < 0) return;
    const isNowVisited = !places[pIdx].visited;
    const updatedPlace = { 
      ...places[pIdx], 
      visited: isNowVisited,
      visitedAt: isNowVisited ? new Date().toISOString() : undefined 
    };
    
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? updatedPlace : p))
    );
    if (session?.currentUser?.id) {
      await saveSupabasePlace(session.currentUser.id, updatedPlace);
    }
  };

  // Delete Place
  const handleDeletePlace = async (placeId: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    setSelectedPlaceIds((prev) => prev.filter((id) => id !== placeId));
    if (session?.currentUser?.id) {
      await deleteSupabasePlace(placeId, session.currentUser.id);
    }
  };

  // Bulk Delete (Section 14)
  const handleBulkDelete = async () => {
    if (confirm(`Bạn có chắc muốn xóa ${selectedPlaceIds.length} địa điểm đã chọn?`)) {
      const idsToDelete = [...selectedPlaceIds];
      setPlaces((prev) => prev.filter((p) => !idsToDelete.includes(p.id)));
      setSelectedPlaceIds([]);
      if (session?.currentUser?.id) {
        await Promise.all(idsToDelete.map(id => deleteSupabasePlace(id, session.currentUser!.id)));
      }
    }
  };

  // Create Collection
  const handleCreateCollection = (name: string, description?: string) => {
    const newCol: PlaceCollection = {
      id: `col-${Date.now()}`,
      name,
      description,
      placeCount: 0,
      visibility: 'private',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCollections((prev) => [...prev, newCol]);
  };

  // If a place detail page is opened
  if (selectedDetailPlace) {
    const livePlace = places.find((p) => p.id === selectedDetailPlace.id) || selectedDetailPlace;
    return (
      <PlaceDetailPage
        place={livePlace}
        collections={collections}
        trips={trips}
        onBack={() => setSelectedDetailPlace(null)}
        onEdit={(p) => {
          setEditingPlace(p);
          setIsEditorOpen(true);
        }}
        onAddToTrip={(p) => {
          setTargetAddToTripPlace(p);
          setIsAddToTripOpen(true);
        }}
        onDelete={handleDeletePlace}
        onToggleFavorite={handleToggleFavorite}
        onToggleVisited={handleToggleVisited}
      />
    );
  }

  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);

  return (
    <div className="min-h-screen bg-[#F7F7F4] text-[#18201E] pb-20 animate-fadeIn">
      {/* Container Layout - Max Width 1440px */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Module Header */}
        <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#606864] font-semibold">Địa điểm yêu thích</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D211F] tracking-tight">
              Địa điểm yêu thích của tôi
            </h1>
            <p className="text-xs sm:text-sm text-[#606864] font-normal">
              {places.length} địa điểm đã lưu để tái sử dụng cho những chuyến đi sau cùng gia đình.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateCollectionOpen(true)}
              className="px-3.5 py-2.5 rounded-[12px] bg-[#F3E9DD] hover:bg-[#e8dbcc] text-[#A46F3D] font-semibold text-xs flex items-center gap-1.5 cursor-pointer border border-[#E2E3DE] transition-colors"
            >
              <FolderPlus className="w-4 h-4 text-[#A46F3D]" strokeWidth={1.75} />
              <span>Tạo bộ sưu tập</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingPlace(null);
                setIsEditorOpen(true);
              }}
              className="px-4 py-2.5 rounded-[12px] bg-[#183B35] hover:bg-[#28584E] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={1.75} />
              <span>Thêm địa điểm</span>
            </button>
          </div>
        </div>

        {/* Public Common POI & Price Disclaimer Banner */}
        <div className="bg-[#E9F0ED] border border-[#183B35]/20 rounded-[18px] p-4 flex items-start gap-3.5 text-xs text-[#183B35]">
          <Compass className="w-5 h-5 text-[#183B35] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#183B35] flex items-center gap-1.5">
              <span>Kho thông tin & địa điểm du lịch dùng chung</span>
            </p>
            <p className="text-[#1D211F]/80 leading-relaxed text-[11px]">
              Danh mục địa điểm lưu trú, ẩm thực, tham quan và tour được tổng hợp liên tục từ cộng đồng để các gia đình dễ dàng tham khảo và đưa vào lịch trình chuyến đi.
            </p>
            <p className="text-[11px] text-[#606864] italic font-medium pt-0.5">
              * Mọi chi phí niêm yết tại các địa điểm mang tính <strong>THAM KHẢO</strong> giúp gia đình ước tính ngân sách. GiaĐìnhViVu hỗ trợ lên kế hoạch lịch trình tự do và <strong>KHÔNG</strong> kinh doanh bán vé hay thu phí từ các địa điểm này.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <PlaceSearchBar
          filterState={filterState}
          availableCities={availableCities}
          viewMode={viewMode}
          onFilterChange={(updated) => setFilterState((prev) => ({ ...prev, ...updated }))}
          onViewModeChange={setViewMode}
          onResetFilters={() =>
            setFilterState({
              search: '',
              categories: [],
              cities: [],
              collectionIds: [],
              priceLevels: [],
              sort: 'recent',
            })
          }
        />

        {/* Bulk Selection Toolbar */}
        {selectedPlaceIds.length > 0 && (
          <div className="bg-[#18201E] text-white rounded-[12px] p-3 px-5 flex items-center justify-between shadow-md text-xs font-semibold animate-fadeIn">
            <span>Đã chọn {selectedPlaceIds.length} địa điểm</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-[8px] bg-rose-700 hover:bg-rose-800 text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Xóa hàng loạt</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlaceIds([])}
                className="p-1 text-[#CDD2CE] hover:text-white"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        )}

        {/* Desktop 2-Column Grid: Sidebar (240px) + Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Collection Sidebar */}
          <PlaceCollectionSidebar
            collections={collections}
            totalPlacesCount={places.length}
            selectedCollectionId={selectedCollectionId}
            selectedCategory={selectedCategory}
            categoryCounts={categoryCounts}
            visitedCount={visitedCount}
            favoriteCount={favoriteCount}
            onSelectCollection={(colId) => setSelectedCollectionId(colId)}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onCreateCollection={() => setIsCreateCollectionOpen(true)}
          />

          {/* Main Places Display Area */}
          <div className="flex-1 w-full space-y-4">
            {/* Header info bar of active collection or category */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-semibold text-[#18201E] tracking-tight">
                {selectedCollection
                  ? `Bộ sưu tập: ${selectedCollection.name}`
                  : selectedCategory !== 'all'
                  ? `Danh mục: ${selectedCategory}`
                  : 'Tất cả địa điểm kho cá nhân'}
                <span className="text-xs font-semibold text-[#183B35] ml-2">
                  ({filteredPlaces.length})
                </span>
              </h2>

              <span className="text-xs text-[#66706C] font-semibold">
                Hiển thị {filteredPlaces.length} / {places.length}
              </span>
            </div>

            {/* Places Grid or List */}
            {places.length === 0 ? (
              // Empty Places Storage State
              <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#E9F0ED] text-[#183B35] flex items-center justify-center mx-auto border border-[#183B35]/20">
                  <Compass className="w-6 h-6 text-[#183B35]" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[#1D211F]">
                    Kho địa điểm cá nhân đang trống
                  </h3>
                  <p className="text-xs text-[#606864] font-normal max-w-md mx-auto leading-relaxed">
                    Bạn đã xóa toàn bộ danh sách địa điểm mẫu. Hãy nhấn nút <strong>"Thêm địa điểm"</strong> hoặc sử dụng công cụ Tìm kiếm Google Places để lưu các địa điểm thực tế của riêng gia đình.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlace(null);
                      setIsEditorOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-[12px] bg-[#183B35] hover:bg-[#28584E] text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.75} />
                    <span>Thêm địa điểm đầu tiên</span>
                  </button>
                </div>
              </div>
            ) : filteredPlaces.length === 0 ? (
              // Empty Filtered Results State
              <div className="bg-white rounded-[18px] border border-[#E2E3DE] p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#F7F5F0] text-[#606864] flex items-center justify-center mx-auto border border-[#E2E3DE]">
                  <Search className="w-5 h-5 text-[#606864]" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold text-[#1D211F]">
                  Không tìm thấy địa điểm phù hợp
                </h3>
                <p className="text-xs text-[#606864] font-normal max-w-sm mx-auto">
                  Hãy thử thay đổi từ khóa tìm kiếm, bỏ bớt bộ lọc thành phố hoặc loại địa điểm.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterState({
                      search: '',
                      categories: [],
                      cities: [],
                      collectionIds: [],
                      priceLevels: [],
                      sort: 'recent',
                    });
                    setSelectedCategory('all');
                    setSelectedCollectionId(null);
                  }}
                  className="px-4 py-2 rounded-[12px] bg-[#F7F5F0] hover:bg-[#E2E3DE] text-[#1D211F] font-semibold text-xs cursor-pointer border border-[#E2E3DE]"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'space-y-3'
                }
              >
                {filteredPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    viewMode={viewMode}
                    isSelected={selectedPlaceIds.includes(place.id)}
                    onSelect={(id) => {
                      if (selectedPlaceIds.includes(id)) {
                        setSelectedPlaceIds(selectedPlaceIds.filter((i) => i !== id));
                      } else {
                        setSelectedPlaceIds([...selectedPlaceIds, id]);
                      }
                    }}
                    onOpenDetail={(p) => setSelectedDetailPlace(p)}
                    onAddToTrip={(p) => {
                      setTargetAddToTripPlace(p);
                      setIsAddToTripOpen(true);
                    }}
                    onEdit={(p) => {
                      setEditingPlace(p);
                      setIsEditorOpen(true);
                    }}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleVisited={handleToggleVisited}
                    onDelete={handleDeletePlace}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Drawer (Screen 4) */}
      <PlaceEditor
        place={editingPlace}
        isOpen={isEditorOpen}
        collections={collections}
        existingPlaces={places}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPlace(null);
        }}
        onSave={handleSavePlace}
        onDelete={handleDeletePlace}
        onCreateNewCollection={() => setIsCreateCollectionOpen(true)}
      />

      {/* Add to Trip Dialog (Section 30) */}
      <AddPlaceToTripDialog
        place={targetAddToTripPlace}
        isOpen={isAddToTripOpen}
        trips={trips}
        onClose={() => setIsAddToTripOpen(false)}
        onConfirmAdd={(tripId, dayNum, type, time, p) => {
          if (onAddActivityToTrip) {
            onAddActivityToTrip(tripId, dayNum, type, time, p);
          }
        }}
      />

      {/* Create Collection Dialog (Section 32) */}
      <CreateCollectionDialog
        isOpen={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
        onCreate={handleCreateCollection}
      />
    </div>
  );
};
