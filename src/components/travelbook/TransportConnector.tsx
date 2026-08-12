import React, { useState } from 'react';
import { Navigation, ChevronDown, ChevronUp } from 'lucide-react';
import { TransportDetail } from '../../types';

interface TransportConnectorProps {
  transport?: TransportDetail;
}

export const TransportConnector: React.FC<TransportConnectorProps> = ({ transport }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!transport) {
    return (
      <div className="flex items-center justify-center my-3">
        <div className="w-[2px] h-6 bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="my-3 pl-4 sm:pl-6 border-l-2 border-dashed border-[#DC2626]/40 ml-4 sm:ml-6">
      <div className="bg-sand-50 border border-slate-200/80 rounded-2xl p-2.5 max-w-md space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-bronze-600">
            <Navigation className="w-3.5 h-3.5" />
            <span>
              Di chuyển {transport.durationMinutes} phút · {transport.method}
            </span>
            {transport.distanceKm && (
              <span className="text-slate-500 font-medium">· ~{transport.distanceKm} km</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!collapsed && transport.note && (
          <p className="text-[11px] text-slate-500 font-medium italic pt-0.5 border-t border-slate-200/50">
            {transport.note}
          </p>
        )}
      </div>
    </div>
  );
};
