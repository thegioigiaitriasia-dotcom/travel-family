import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  Thermometer,
  Wind,
  Droplets,
  Shirt,
  Sparkles,
  MapPin,
  Calendar,
  ChevronRight,
  Umbrella,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { TravelBook, TravelBookDay } from '../../types';

interface WeatherForecastItem {
  dayNumber: number;
  dateStr: string;
  destination: string;
  condition: 'sunny' | 'partly_cloudy' | 'rainy' | 'cool_mountain' | 'thunderstorm';
  conditionText: string;
  tempMin: number;
  tempMax: number;
  humidity: number; // %
  rainProbability: number; // %
  uvIndex: number; // 1-11
  uvLevelText: string;
  clothingTip: string;
  familyAdvice: string;
}

interface TripWeatherWidgetProps {
  trip: TravelBook;
  selectedDayNumber?: number;
  onSelectDay?: (dayNumber: number) => void;
}

export const TripWeatherWidget: React.FC<TripWeatherWidgetProps> = ({
  trip,
  selectedDayNumber,
  onSelectDay,
}) => {
  const [activeTab, setActiveTab] = useState<number | 'all'>(selectedDayNumber || 'all');

  // Rich weather data generation per day based on destinations & days
  const forecasts: WeatherForecastItem[] = trip.days.map((day) => {
    const dest = day.destinationName || trip.destinations[0] || 'Điểm đến';
    const isBana = dest.toLowerCase().includes('bà nà');
    const isHoiAn = dest.toLowerCase().includes('hội an');

    if (isBana) {
      return {
        dayNumber: day.dayNumber,
        dateStr: day.dateStr,
        destination: day.destinationName,
        condition: 'cool_mountain',
        conditionText: 'Se lạnh & Sương mờ đỉnh núi',
        tempMin: 18,
        tempMax: 24,
        humidity: 82,
        rainProbability: 25,
        uvIndex: 7,
        uvLevelText: 'Cao (Trưa nắng)',
        clothingTip: 'Áo khoác mỏng cho bé & người già, giày thể thao nhẹ',
        familyAdvice: 'Khí hậu trên núi Bà Nà mát mẻ như Đà Lạt. Nên mang theo áo khoác cardigan hoặc khoác nhẹ cho trẻ em khi lên cáp treo.',
      };
    } else if (isHoiAn) {
      return {
        dayNumber: day.dayNumber,
        dateStr: day.dateStr,
        destination: day.destinationName,
        condition: 'sunny',
        conditionText: 'Nắng đẹp phố cổ & Hoàng hôn êm dịu',
        tempMin: 26,
        tempMax: 33,
        humidity: 70,
        rainProbability: 10,
        uvIndex: 8,
        uvLevelText: 'Rất cao (11:00 - 14:00)',
        clothingTip: 'Quần áo cotton thoáng mát, nón rộng vành, kính râm, sandal',
        familyAdvice: 'Phố cổ Hội An đẹp nhất lúc hoàng hôn. Buổi chiều nên uống đủ nước và đội nón cho bé khi đi thuyền thả đèn hoa đăng.',
      };
    } else if (day.dayNumber === 1) {
      return {
        dayNumber: day.dayNumber,
        dateStr: day.dateStr,
        destination: day.destinationName,
        condition: 'partly_cloudy',
        conditionText: 'Nắng ấm nhẹ · Gió biển Mỹ Khê',
        tempMin: 25,
        tempMax: 32,
        humidity: 74,
        rainProbability: 15,
        uvIndex: 8,
        uvLevelText: 'Rất cao',
        clothingTip: 'Đồ tắm biển, kem chống nắng SPF50+, khăn lau khô',
        familyAdvice: 'Lý tưởng cho tắm biển Mỹ Khê lúc 16:30. Nhớ thoa kem chống nắng trước khi ra bãi biển 20 phút.',
      };
    } else {
      return {
        dayNumber: day.dayNumber,
        dateStr: day.dateStr,
        destination: day.destinationName,
        condition: 'sunny',
        conditionText: 'Trời trong xanh, nắng ấm áp',
        tempMin: 25,
        tempMax: 32,
        humidity: 68,
        rainProbability: 20,
        uvIndex: 6,
        uvLevelText: 'Trung bình',
        clothingTip: 'Trang phục tự do thoáng nhẹ, ô/dù che nắng nhỏ gọn',
        familyAdvice: 'Thời tiết thuận lợi cho chuyến bay trở về. Gia đình di chuyển thong thả.',
      };
    }
  });

  const displayedForecasts =
    activeTab === 'all'
      ? forecasts
      : forecasts.filter((f) => f.dayNumber === activeTab);

  const getWeatherIcon = (cond: WeatherForecastItem['condition']) => {
    switch (cond) {
      case 'sunny':
        return <Sun className="w-6 h-6 text-amber-500 animate-spin-slow" />;
      case 'partly_cloudy':
        return <CloudSun className="w-6 h-6 text-amber-400" />;
      case 'cool_mountain':
        return <Wind className="w-6 h-6 text-cyan-500" />;
      case 'rainy':
      case 'thunderstorm':
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      default:
        return <Sun className="w-6 h-6 text-amber-500" />;
    }
  };

  const getWeatherBadgeColor = (cond: WeatherForecastItem['condition']) => {
    switch (cond) {
      case 'sunny':
        return 'bg-amber-50 text-amber-900 border-amber-200/80';
      case 'partly_cloudy':
        return 'bg-sky-50 text-sky-900 border-sky-200/80';
      case 'cool_mountain':
        return 'bg-cyan-50 text-cyan-900 border-cyan-200/80';
      case 'rainy':
        return 'bg-blue-50 text-blue-900 border-blue-200/80';
      default:
        return 'bg-amber-50 text-amber-900 border-amber-200';
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-100 text-amber-700">
              <Sun className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Dự báo Thời tiết & Chuẩn bị Gia đình
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
              {trip.destinations.join(' • ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Cập nhật thời tiết theo từng ngày lịch trình giúp gia đình chủ động trang phục và vật dụng.
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả các ngày
          </button>
          {trip.days.map((day) => (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => {
                setActiveTab(day.dayNumber);
                onSelectDay?.(day.dayNumber);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === day.dayNumber
                  ? 'bg-[#DC2626] text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ngày {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Weather Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {displayedForecasts.map((item) => (
          <div
            key={item.dayNumber}
            className={`p-4 rounded-2xl border transition-all hover:shadow-md space-y-3 ${getWeatherBadgeColor(
              item.condition
            )}`}
          >
            {/* Top Row: Date, Destination, Condition */}
            <div className="flex items-start justify-between gap-2 border-b border-black/5 pb-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-black/10 rounded-md font-extrabold text-[10px] tracking-wide uppercase">
                    Ngày {item.dayNumber}
                  </span>
                  <span className="text-xs font-bold opacity-80">{item.dateStr}</span>
                </div>
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>{item.destination}</span>
                </h4>
              </div>

              {/* Weather Icon & Temp */}
              <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-2xl border border-white/60 shadow-2xs">
                {getWeatherIcon(item.condition)}
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900 leading-none">
                    {item.tempMin}°C – {item.tempMax}°C
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                    Mát mẻ dễ chịu
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Detail Pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
              <div className="bg-white/70 p-2 rounded-xl border border-white/50">
                <div className="text-slate-400 text-[9px] uppercase flex items-center justify-center gap-1 mb-0.5">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  <span>Độ ẩm</span>
                </div>
                <div className="text-slate-800">{item.humidity}%</div>
              </div>

              <div className="bg-white/70 p-2 rounded-xl border border-white/50">
                <div className="text-slate-400 text-[9px] uppercase flex items-center justify-center gap-1 mb-0.5">
                  <Umbrella className="w-3 h-3 text-indigo-500" />
                  <span>Tỷ lệ mưa</span>
                </div>
                <div className="text-slate-800">{item.rainProbability}%</div>
              </div>

              <div className="bg-white/70 p-2 rounded-xl border border-white/50">
                <div className="text-slate-400 text-[9px] uppercase flex items-center justify-center gap-1 mb-0.5">
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>Chỉ số UV</span>
                </div>
                <div className="text-amber-900">{item.uvIndex} ({item.uvLevelText})</div>
              </div>
            </div>

            {/* Family Advice Box */}
            <div className="bg-white/90 rounded-xl p-2.5 border border-white/80 space-y-1.5 text-xs text-slate-800">
              <div className="flex items-start gap-2">
                <Shirt className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Trang phục khuyên dùng: </span>
                  <span className="text-slate-700">{item.clothingTip}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 italic leading-relaxed">
                  {item.familyAdvice}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
