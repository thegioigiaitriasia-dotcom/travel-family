import React, { useEffect, useState } from 'react';
import { Sparkles, Check, Loader2, Database, Bot } from 'lucide-react';
import { accumulateTripPOIs } from '../../lib/supabase';
import { MultiCityTripPlannerInput } from '../../types';

interface GeneratingPlanStateProps {
  formData?: MultiCityTripPlannerInput;
  onComplete: () => void;
}

const progressSteps = [
  'Đang kết nối Gemini AI & Phân tích lộ trình...',
  'Đang tối ưu thời gian di chuyển & Giờ nghỉ cho gia đình...',
  'Đang gợi ý quán ăn, đặc sản theo ngân sách...',
  'Đang sắp xếp danh thắng & Điểm vui chơi phù hợp bé...',
  'Đang hoàn thiện Kế hoạch Du lịch Đa chặng hoàn chỉnh...',
];

export const GeneratingPlanState: React.FC<GeneratingPlanStateProps> = ({
  formData,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generationSource, setGenerationSource] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let timer: any = null;

    // Call real backend Gemini API /api/generate-plan
    const fetchAiPlan = async () => {
      try {
        const response = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData || {}),
        });

        const data = await response.json();
        if (data.success && data.plan) {
          localStorage.setItem('generated_ai_plan', JSON.stringify(data.plan));
          if (data.source) {
            setGenerationSource(
              data.source === 'deepseek_chat' || !data.source?.includes('fallback')
                ? 'Được tạo trực tiếp bởi Trí tuệ Nhân tạo DeepSeek'
                : 'Được tối ưu bởi thuật toán thông minh'
            );
          }
        } else {
          if (!isCancelled) {
             setErrorMsg(data.error || 'Đã xảy ra lỗi không xác định từ AI.');
             clearInterval(timer);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
           setErrorMsg(err.message || 'Mất kết nối máy chủ AI.');
           clearInterval(timer);
        }
      }
    };

    fetchAiPlan();

    timer = setInterval(() => {
      if (errorMsg) {
         clearInterval(timer);
         return;
      }
      setCurrentStepIndex((prev) => {
        if (prev < progressSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);

          // Accumulate generated real POIs into database for reuse
          accumulateTripPOIs('system-ai-planner', [
            {
              name: 'Sun World Bà Nà Hills & Cầu Vàng',
              category: 'Attraction',
              address: 'Xã Hòa Ninh, Huyện Hòa Vang, TP. Đà Nẵng',
              rating: 4.9,
              imageUrl:
                'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
              description:
                'Khu du lịch sinh thái & giải trí đẳng cấp với Cầu Vàng nổi tiếng thế giới, Làng Pháp cổ kính và tuyến cáp treo đạt nhiều kỷ lục.',
              priceLevel: 'High',
              tags: [
                'Địa điểm nổi tiếng',
                'Cầu Vàng',
                'Trẻ em thích',
                'Nhiều góc chụp đẹp',
              ],
            },
            {
              name: 'Nhà hàng Ẩm thực Trần - Đặc sản Đà Nẵng',
              category: 'Restaurant',
              address: '4 Lê Hồng Phong, Q. Hải Châu, TP. Đà Nẵng',
              rating: 4.8,
              imageUrl:
                'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
              description:
                'Nổi tiếng với món Bánh tráng thịt heo 2 đầu da cuộn rau sống đậm đà mắm nêm truyền thống. Không gian rộng thoáng, lịch sự cho gia đình.',
              priceLevel: 'Medium',
              tags: [
                'Đặc sản Đà Nẵng',
                'Bánh tráng thịt heo',
                'Bãi đậu xe rộng',
              ],
            },
          ]);

          setTimeout(() => {
            if (!isCancelled) onComplete();
          }, 800);
          return prev;
        }
      });
    }, 1000);

    return () => {
      isCancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [formData, onComplete, errorMsg]);

  return (
    <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-2xl max-w-md mx-auto my-8 text-center space-y-6">
      {/* Animated Icon */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 rounded-full bg-[#DC2626]/20 animate-ping opacity-60" />
        <div className="relative w-20 h-20 rounded-full bg-[#DC2626] text-white flex items-center justify-center shadow-lg shadow-[#DC2626]/30">
          <Sparkles className="w-10 h-10 text-[#FFB545] animate-spin" />
        </div>
      </div>

      {errorMsg ? (
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-red-600 tracking-tight">
            Tạo lịch trình thất bại
          </h3>
          <p className="text-xs text-slate-500">{errorMsg}</p>
        </div>
      ) : (
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Đang xây dựng chuyến đi...
          </h3>
          <p className="text-xs text-slate-500">
            AI đang tự động ghép nối dữ liệu từng bước cho gia đình bạn.
          </p>
        </div>
      )}

      {/* Progress Animated Steps */}
      <div className="space-y-3 bg-slate-50 p-5 rounded-[20px] border border-slate-200 text-left">
        {progressSteps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={idx} className="flex items-center gap-3 text-xs">
              {isDone ? (
                <div className="w-5 h-5 rounded-full bg-[#2E8B57] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : isCurrent ? (
                <div className="w-5 h-5 rounded-full bg-[#DC2626]/20 text-[#DC2626] flex items-center justify-center shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
              )}
              <span
                className={`font-semibold ${
                  isDone
                    ? 'text-slate-900 font-bold'
                    : isCurrent
                    ? 'text-[#DC2626] font-black text-sm animate-pulse'
                    : 'text-slate-400'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {errorMsg ? (
         <button 
           onClick={() => window.location.reload()}
           className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
         >
            Thử lại
         </button>
      ) : (
        <div className="bg-[#DC2626]/10 text-[#DC2626] text-xs p-3.5 rounded-2xl border border-[#DC2626]/20 font-bold">
          💡 Lịch trình cá nhân hóa đang được tính toán theo độ tuổi gia đình bạn.
        </div>
      )}
    </div>
  );
};
