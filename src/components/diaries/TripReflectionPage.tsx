import React, { useState } from 'react';
import { TravelDiary, TripReflection } from '../../types';
import { ArrowLeft, Star, Heart, AlertCircle, RefreshCw, CheckCircle2, Award, ThumbsUp, Save, Mic } from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';

interface TripReflectionPageProps {
  diary: TravelDiary;
  onSaveReflection: (reflection: TripReflection) => void;
  onBack: () => void;
}

export const TripReflectionPage: React.FC<TripReflectionPageProps> = ({
  diary,
  onSaveReflection,
  onBack,
}) => {
  const existing = diary.reflection || {
    overallRating: 9,
    bestThings: '',
    inconveniences: '',
    memorablePlaceIds: [],
    favoriteFoodIds: [],
    returnIntent: 'yes',
    futureChanges: [],
    recommendToFamily: 'yes',
  };

  const [rating, setRating] = useState<number>(existing.overallRating || 9);
  const [bestThings, setBestThings] = useState<string>(existing.bestThings || '');
  const [inconveniences, setInconveniences] = useState<string>(existing.inconveniences || '');
  const [returnIntent, setReturnIntent] = useState<TripReflection['returnIntent']>(existing.returnIntent || 'yes');
  const [recommendToFamily, setRecommendToFamily] = useState<TripReflection['recommendToFamily']>(existing.recommendToFamily || 'yes');
  const [futureChanges, setFutureChanges] = useState<string[]>(existing.futureChanges || []);

  const changeOptions = [
    'Đi ít địa điểm hơn',
    'Thêm thời gian nghỉ',
    'Đổi nơi lưu trú',
    'Đổi phương tiện',
    'Dành thêm ngân sách',
    'Đi vào mùa khác',
    'Không cần thay đổi',
  ];

  const toggleFutureChange = (option: string) => {
    if (futureChanges.includes(option)) {
      setFutureChanges(futureChanges.filter((item) => item !== option));
    } else {
      setFutureChanges([...futureChanges, option]);
    }
  };

  const handleSave = () => {
    const updated: TripReflection = {
      overallRating: rating,
      bestThings,
      inconveniences,
      memorablePlaceIds: existing.memorablePlaceIds || [],
      favoriteFoodIds: existing.favoriteFoodIds || [],
      returnIntent,
      futureChanges,
      recommendToFamily,
    };
    onSaveReflection(updated);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#183B35] transition-colors bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại tổng quan</span>
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#183B35] hover:bg-[#28584E] rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Lưu tổng kết chuyến đi</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#183B35] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-100 text-xs font-semibold border border-white/10">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Tổng kết chuyến đi gia đình</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{diary.title}</h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Dành 5 phút nhìn lại những kỉ niệm đáng nhớ nhất, những điều trải nghiệm xuất sắc và những lưu ý rút kinh nghiệm cho chuyến đi sau.
          </p>
        </div>
      </div>

      {/* Form Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-8">
        {/* 1. Rating Scale 1-10 */}
        <div className="space-y-3">
          <label className="block font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>1. Bạn và gia đình đánh giá chuyến đi này thế nào?</span>
            <span className="text-[#183B35] font-extrabold text-lg">{rating} / 10 điểm</span>
          </label>
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setRating(val)}
                className={`h-11 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  rating === val
                    ? 'bg-[#183B35] text-white shadow-md scale-105'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-right">
            {rating >= 9
              ? 'Rất tuyệt vời! Đầy ắp kỉ niệm đẹp'
              : rating >= 7
              ? 'Tốt, chuyến đi đáng nhớ'
              : 'Bình thường, cần rút kinh nghiệm'}
          </p>
        </div>

        {/* 2. Best Things */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-600" />
              <span>2. Điều cả gia đình thích nhất là gì?</span>
            </label>
            <VoiceInputButton
              targetFieldTitle="Điều thích nhất"
              currentText={bestThings}
              onTranscribed={(text, mode) => {
                setBestThings(mode === 'append' && bestThings ? `${bestThings}\n${text}` : text);
              }}
              variant="secondary"
              size="sm"
              label="Nói câu trả lời"
            />
          </div>
          <textarea
            rows={3}
            value={bestThings}
            onChange={(e) => setBestThings(e.target.value)}
            placeholder="Ví dụ: Hoàng hôn Bãi biển Mỹ Khê cực kì yên bình, không khí Bà Nà mát mẻ, món mì Quảng Bà Mua rất ngon..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#183B35]/20 focus:border-[#183B35] leading-relaxed"
          />
        </div>

        {/* 3. Inconveniences */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>3. Điều gì khiến chuyến đi chưa thực sự thuận tiện?</span>
            </label>
            <VoiceInputButton
              targetFieldTitle="Điều chưa thuận tiện"
              currentText={inconveniences}
              onTranscribed={(text, mode) => {
                setInconveniences(mode === 'append' && inconveniences ? `${inconveniences}\n${text}` : text);
              }}
              variant="secondary"
              size="sm"
              label="Nói câu trả lời"
            />
          </div>
          <textarea
            rows={3}
            value={inconveniences}
            onChange={(e) => setInconveniences(e.target.value)}
            placeholder="Ví dụ: Chặng đường di chuyển xe ô tô hơi mệt với em bé nhỏ..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#183B35]/20 focus:border-[#183B35] leading-relaxed"
          />
        </div>

        {/* 4. Return Intent */}
        <div className="space-y-3">
          <label className="block font-bold text-slate-900 text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#183B35]" />
            <span>4. Gia đình có muốn quay lại nơi này không?</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'yes', label: 'Có, nhất định' },
              { id: 'yes_with_changes', label: 'Có, nhưng đổi lịch trình' },
              { id: 'unsure', label: 'Chưa chắc chắn' },
              { id: 'no', label: 'Không' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setReturnIntent(opt.id as TripReflection['returnIntent'])}
                className={`p-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                  returnIntent === opt.id
                    ? 'border-[#183B35] bg-[#E9F0ED] text-[#183B35] font-bold shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Future Changes */}
        <div className="space-y-3">
          <label className="block font-bold text-slate-900 text-sm">
            5. Lần sau nếu đi lại, nên thay đổi điều gì?
          </label>
          <div className="flex flex-wrap gap-2">
            {changeOptions.map((opt) => {
              const isSelected = futureChanges.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleFutureChange(opt)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#183B35] text-white border-[#183B35] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Recommend to relatives */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block font-bold text-slate-900 text-sm flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-[#183B35]" />
            <span>6. Bạn có giới thiệu lịch trình này cho người thân/bè bạn không?</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'yes', label: 'Rất giới thiệu' },
              { id: 'yes_with_notes', label: 'Có, kèm lưu ý' },
              { id: 'no', label: 'Không' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRecommendToFamily(opt.id as TripReflection['recommendToFamily'])}
                className={`p-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                  recommendToFamily === opt.id
                    ? 'border-[#183B35] bg-[#E9F0ED] text-[#183B35] font-bold shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
