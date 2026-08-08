import React, { useState } from 'react';
import { Utensils, Heart, ArrowRight, Sparkles } from 'lucide-react';

export interface FoodItem {
  id: string;
  name: string; // e.g. "Bún chìa"
  destination: string; // e.g. "Đà Nẵng" or "Hội An"
  badge: 'Đặc sản' | 'Phù hợp gia đình' | 'Tráng miệng' | 'Đồ uống';
  imageUrl: string;
}

interface RecommendedFoodSectionProps {
  foods?: FoodItem[];
  onViewAllFoods?: () => void;
}

const defaultFoods: FoodItem[] = [];

export const RecommendedFoodSection: React.FC<RecommendedFoodSectionProps> = ({
  foods = defaultFoods,
  onViewAllFoods,
}) => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!foods || foods.length === 0) return null;

  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-500" />
            Món nên thử trong chuyến đi
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Đặc sản nổi tiếng không thể bỏ qua tại mỗi điểm dừng.
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAllFoods}
          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer border border-amber-100 hidden sm:flex"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of foods */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {foods.slice(0, 6).map((item) => {
          const isFav = favorites[item.id];
          return (
            <div
              key={item.id}
              className="group relative rounded-[20px] overflow-hidden bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Thumbnail Image */}
              <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-200">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge Tag */}
                <span
                  className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm ${
                    item.badge === 'Đặc sản'
                      ? 'bg-amber-500 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {item.badge}
                </span>

                {/* Favorite Heart Button */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(item.id)}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isFav
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/80 hover:bg-white text-slate-600 backdrop-blur-xs'
                  }`}
                  title={isFav ? 'Đã lưu yêu thích' : 'Lưu món ăn'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-3.5 space-y-1">
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-amber-700 transition-colors line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-[11px] font-semibold text-slate-500">
                  {item.destination}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer view all button */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onViewAllFoods}
          className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-amber-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
        >
          <Utensils className="w-4 h-4 text-amber-600" />
          <span>Xem tất cả món và quán ăn</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
