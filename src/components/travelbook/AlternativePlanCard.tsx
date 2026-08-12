import React, { useState } from 'react';
import { CloudRain, Sparkles, Check, ArrowRight } from 'lucide-react';
import { AlternativePlan } from '../../types';

interface AlternativePlanCardProps {
  plans?: AlternativePlan[];
  onApplyPlan: (planId: string) => void;
}

export const AlternativePlanCard: React.FC<AlternativePlanCardProps> = ({
  plans,
  onApplyPlan,
}) => {
  const [applied, setApplied] = useState(false);

  if (!plans || plans.length === 0) return null;

  const mainPlan = plans[0];

  const handleApply = () => {
    setApplied(true);
    onApplyPlan(mainPlan.id);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-[22px] p-5 border border-bronze-200/80 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-bronze-400/20 text-bronze-700 flex items-center justify-center shrink-0">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-bronze-700">
              PHƯƠNG ÁN DỰ PHÒNG
            </span>
            <h4 className="text-sm font-extrabold text-slate-900">{mainPlan.condition}</h4>
          </div>
        </div>

        {applied ? (
          <span className="px-3 py-1 rounded-full bg-bronze-600 text-white font-extrabold text-xs flex items-center gap-1">
            <Check className="w-3.5 h-3.5 stroke-[3]" /> Đã áp dụng
          </span>
        ) : (
          <button
            type="button"
            onClick={handleApply}
            className="px-3.5 py-1.5 rounded-xl bg-bronze-500 hover:bg-bronze-600 text-slate-950 font-extrabold text-xs transition-all shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Áp dụng phương án này</span>
          </button>
        )}
      </div>

      <div className="text-xs text-slate-700 space-y-1 bg-white/70 p-3 rounded-xl border border-bronze-200/50">
        <p className="font-bold text-slate-900">{mainPlan.title}</p>
        <p className="text-slate-600 font-medium">{mainPlan.description}</p>
        {mainPlan.replacementActivities && (
          <div className="pt-1.5 flex flex-wrap gap-1.5">
            {mainPlan.replacementActivities.map((act, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold bg-bronze-100 text-bronze-900 px-2.5 py-1 rounded-lg"
              >
                + {act}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
