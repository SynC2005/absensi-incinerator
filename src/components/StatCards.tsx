// File: src/components/StatCards.tsx
'use client';

import { Server, Activity, PowerOff } from 'lucide-react';

interface StatCardsProps {
  total: number;
  active: number;
  inactive: number;
}

export default function StatCards({ total, active, inactive }: StatCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {/* Card Total */}
      <div className="bg-slate-100/50 rounded-2xl p-3.5 sm:p-4 flex flex-col border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="bg-white p-1.5 rounded-[0.6rem] border border-slate-200 shadow-sm w-fit mb-3">
          <Server className="w-4 h-4 text-slate-700" />
        </div>
        <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none mb-1">{total}</p>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total</p>
      </div>

      {/* Card Aktif */}
      <div className="bg-emerald-50 rounded-2xl p-3.5 sm:p-4 flex flex-col border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="bg-white p-1.5 rounded-[0.6rem] border border-emerald-100 shadow-sm w-fit mb-3">
          <Activity className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-2xl font-black text-emerald-950 tracking-tighter leading-none mb-1">{active}</p>
        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Aktif</p>
      </div>

      {/* Card Mati */}
      <div className="bg-red-50 rounded-2xl p-3.5 sm:p-4 flex flex-col border border-red-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="bg-white p-1.5 rounded-[0.6rem] border border-red-100 shadow-sm w-fit mb-3">
          <PowerOff className="w-4 h-4 text-red-600" />
        </div>
        <p className="text-2xl font-black text-red-950 tracking-tighter leading-none mb-1">{inactive}</p>
        <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Mati</p>
      </div>
    </div>
  );
}