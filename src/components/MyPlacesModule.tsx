import React, { useState } from 'react';
import { PlaceCategory, FavoritePlace } from '../types';
import { MapPin, Coffee, Utensils, Waves, Hotel, Landmark, Star, Bookmark, ExternalLink } from 'lucide-react';

interface MyPlacesModuleProps {
  categories: PlaceCategory[];
  places: FavoritePlace[];
}

export const MyPlacesModule: React.FC<MyPlacesModuleProps> = ({ categories, places }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  const filteredPlaces =
    selectedCategory === 'Tất cả'
      ? places
      : places.filter((p) => p.category === selectedCategory);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Cafe':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'Nhà hàng':
        return <Utensils className="w-4 h-4 text-orange-600" />;
      case 'Biển':
        return <Waves className="w-4 h-4 text-cyan-600" />;
      case 'Khách sạn':
        return <Hotel className="w-4 h-4 text-indigo-600" />;
      case 'Chùa':
        return <Landmark className="w-4 h-4 text-red-600" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Địa điểm yêu thích</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Địa Điểm Yêu Thích (My Places)</h2>
        <p className="text-slate-600 text-sm">
          Lưu trữ các quán ăn, quán cà phê, khách sạn và thắng cảnh gia đình yêu thích để đưa vào các chuyến đi.
        </p>
      </div>

      {/* Category Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
              selectedCategory === cat.name
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {getCategoryIcon(cat.name)}
              <span className="font-bold text-sm">{cat.name}</span>
            </div>
            <span
              className={`text-xs font-semibold ${
                selectedCategory === cat.name ? 'text-indigo-100' : 'text-slate-500'
              }`}
            >
              {cat.count} địa điểm
            </span>
          </button>
        ))}
      </div>

      {/* Places List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">
            Danh sách địa điểm: <span className="text-indigo-600">{selectedCategory}</span>
          </h3>
          <span className="text-xs font-medium text-slate-500">
            Hiển thị {filteredPlaces.length} / {places.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-300 transition-all flex flex-col"
            >
              <div className="h-44 w-full bg-slate-100 relative">
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{place.rating}</span>
                </div>
                <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-1.5 rounded-full text-slate-700 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer">
                  <Bookmark className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {place.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{place.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{place.address}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                  "{place.notes}"
                </p>

                <div className="pt-1 flex items-center justify-end">
                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <span>Xem bản đồ & đường đi</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
