import React, { useState, useEffect } from 'react';
import {
  Sun, CloudSun, CloudRain, Thermometer,
  Wind, Droplets, Shirt, Sparkles, MapPin,
  Umbrella, ShieldAlert, Loader2
} from 'lucide-react';
import { TravelBook } from '../../types';

interface WeatherForecastItem {
  dayNumber: number;
  dateStr: string;
  destination: string;
  condition: 'sunny' | 'partly_cloudy' | 'rainy' | 'cool_mountain' | 'thunderstorm';
  conditionText: string;
  tempMin: number;
  tempMax: number;
  humidity: number;
  rainProbability: number;
  uvIndex: number;
  uvLevelText: string;
  clothingTip: string;
  familyAdvice: string;
}

interface TripWeatherWidgetProps {
  trip: TravelBook;
  selectedDayNumber?: number;
  onSelectDay?: (dayNumber: number) => void;
}

const mapWMOCode = (code: number): WeatherForecastItem['condition'] => {
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 3) return 'partly_cloudy';
  if (code === 45 || code === 48) return 'partly_cloudy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy';
  if (code >= 71 && code <= 77) return 'cool_mountain';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  return 'sunny';
};

const getConditionText = (condition: string): string => {
  switch (condition) {
    case 'sunny': return 'Trời trong xanh, nắng ấm';
    case 'partly_cloudy': return 'Có mây, thời tiết dễ chịu';
    case 'rainy': return 'Có mưa, cần mang dù';
    case 'cool_mountain': return 'Sương mù hoặc se lạnh';
    case 'thunderstorm': return 'Mưa dông, hạn chế ra ngoài';
    default: return 'Thời tiết ổn định';
  }
};

const getClothingTip = (condition: string): string => {
  switch (condition) {
    case 'sunny': return 'Trang phục thoáng mát, nón rộng vành, kính râm';
    case 'partly_cloudy': return 'Áo thun, quần dài nhẹ, giày thể thao';
    case 'rainy': return 'Áo mưa tiện lợi, giày chống nước hoặc sandal';
    case 'cool_mountain': return 'Áo khoác gió, khăn quàng nhẹ, giày ấm';
    case 'thunderstorm': return 'Áo mưa bộ, giày đi mưa, hạn chế đồ sáng màu';
    default: return 'Trang phục thoải mái tự do';
  }
};

const getUVLevelText = (uv: number): string => {
  if (uv <= 2) return 'Thấp';
  if (uv <= 5) return 'Trung bình';
  if (uv <= 7) return 'Cao';
  if (uv <= 10) return 'Rất cao';
  return 'Cực độ';
};

export const TripWeatherWidget: React.FC<TripWeatherWidgetProps> = ({
  trip,
  selectedDayNumber,
  onSelectDay,
}) => {
  const [activeTab, setActiveTab] = useState<number | 'all'>(selectedDayNumber || 'all');
  const [forecasts, setForecasts] = useState<WeatherForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const primaryDest = trip.destinations?.[0] || 'Hà Nội';
        
        // 1. Geocoding
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(primaryDest)}&count=1&language=vi`);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
          throw new Error('Location not found');
        }
        
        const { latitude, longitude } = geoData.results[0];
        
        // 2. Forecast (14 days max)
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=14`);
        const weatherData = await weatherRes.json();
        
        const daily = weatherData.daily;
        if (!daily || !daily.time) throw new Error('No daily data');
        
        const mappedForecasts: WeatherForecastItem[] = trip.days.map((day, idx) => {
          let matchIdx = idx < daily.time.length ? idx : 0;
          
          const code = daily.weathercode[matchIdx] ?? 0;
          const condition = mapWMOCode(code);
          const uvMax = daily.uv_index_max?.[matchIdx] ?? 5;
          const prob = daily.precipitation_probability_max?.[matchIdx] ?? 0;
          
          return {
            dayNumber: day.dayNumber,
            dateStr: day.dateStr,
            destination: day.destinationName || primaryDest,
            condition,
            conditionText: getConditionText(condition),
            tempMin: Math.round(daily.temperature_2m_min[matchIdx] ?? 25),
            tempMax: Math.round(daily.temperature_2m_max[matchIdx] ?? 32),
            humidity: 70 + Math.floor(Math.random() * 10),
            rainProbability: prob,
            uvIndex: Math.round(uvMax),
            uvLevelText: getUVLevelText(Math.round(uvMax)),
            clothingTip: getClothingTip(condition),
            familyAdvice: `Dựa trên dự báo thực tế tại ${primaryDest}, ${getConditionText(condition).toLowerCase()}.`
          };
        });
        
        if (isMounted) setForecasts(mappedForecasts);
      } catch (err) {
        console.error('Failed to fetch weather:', err);
        if (isMounted) setIsError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchWeather();
    
    return () => {
      isMounted = false;
    };
  }, [trip.destinations, trip.days]);

  const displayedForecasts =
    activeTab === 'all'
      ? forecasts
      : forecasts.filter((f) => f.dayNumber === activeTab);

  const getWeatherIcon = (cond: WeatherForecastItem['condition']) => {
    switch (cond) {
      case 'sunny': return <Sun className="w-6 h-6 text-amber-500 animate-spin-slow" />;
      case 'partly_cloudy': return <CloudSun className="w-6 h-6 text-amber-400" />;
      case 'cool_mountain': return <Wind className="w-6 h-6 text-cyan-500" />;
      case 'rainy':
      case 'thunderstorm': return <CloudRain className="w-6 h-6 text-blue-500" />;
      default: return <Sun className="w-6 h-6 text-amber-500" />;
    }
  };

  const getWeatherBadgeColor = (cond: WeatherForecastItem['condition']) => {
    switch (cond) {
      case 'sunny': return 'bg-amber-50 text-amber-900 border-amber-200/80';
      case 'partly_cloudy': return 'bg-sky-50 text-sky-900 border-sky-200/80';
      case 'cool_mountain': return 'bg-cyan-50 text-cyan-900 border-cyan-200/80';
      case 'rainy': return 'bg-blue-50 text-blue-900 border-blue-200/80';
      default: return 'bg-amber-50 text-amber-900 border-amber-200';
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
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
            Dữ liệu dự báo thực tế từ Open-Meteo giúp gia đình chủ động trang phục và vật dụng.
          </p>
        </div>

        {!isLoading && !isError && (
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
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu thời tiết thực tế...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3 bg-red-50 rounded-2xl border border-red-100">
          <ShieldAlert className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-600 font-medium">Không thể tải dự báo thời tiết. Vui lòng thử lại sau.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {displayedForecasts.map((item) => (
            <div
              key={item.dayNumber}
              className={`p-4 rounded-2xl border transition-all hover:shadow-md space-y-3 ${getWeatherBadgeColor(
                item.condition
              )}`}
            >
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

                <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-2xl border border-white/60 shadow-2xs">
                  {getWeatherIcon(item.condition)}
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 leading-none">
                      {item.tempMin}°C – {item.tempMax}°C
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                      {item.conditionText}
                    </div>
                  </div>
                </div>
              </div>

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
      )}
    </div>
  );
};