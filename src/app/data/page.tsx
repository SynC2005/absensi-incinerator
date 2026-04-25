// File: src/app/data/page.tsx
'use client';

import { 
  Menu, 
  Calendar, 
  ChevronDown, 
  Download, 
  Clock, 
  Plus,
  Wrench // Menggunakan Wrench sebagai representasi icon mesin/operator
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

// Data Dummy (Nanti akan diganti dengan data asli dari Supabase)
const logsData = [
  { id: 1, unit: 'WM-UNIT-01', status: 'Off', weight: 12.5, operator: 'Bpk. Ahmad', time: '14:30 | 25 Oktober 2024' },
  { id: 2, unit: 'WM-UNIT-04', status: 'Off', weight: 8.2, operator: 'Bpk. Ahmad', time: '11:15 | 25 Oktober 2024' },
  { id: 3, unit: 'WM-UNIT-01', status: 'On', weight: 15.0, operator: 'Ibu Siti', time: '09:45 | 25 Oktober 2024' },
  { id: 4, unit: 'WM-UNIT-02', status: 'Off', weight: 5.7, operator: 'Bpk. Ahmad', time: '08:20 | 25 Oktober 2024' },
];

export default function DataPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
      
      {/* Container utama (Mobile Viewport) */}
      <div className="w-full max-w-md bg-[#F8FAFC] min-h-screen relative flex flex-col shadow-xl overflow-hidden">

        {/* MAIN CONTENT AREA */}
        {/* pb-32 agar konten paling bawah tidak tertutup Bottom Nav dan FAB */}
        <div className="px-5 pt-6 pb-32 overflow-y-auto flex-grow space-y-6">
          
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Data Aktivitas Mesin</h1>

          {/* FILTER & DOWNLOAD SECTION */}
          <section className="space-y-4">
            {/* Date Filter Card */}
            <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-[#FF5A5F] p-2.5 rounded-xl text-white">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Periode Laporan</p>
                  <p className="text-sm font-semibold text-slate-800">Hari Ini, 25 Okt 2024</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-red-800 mr-2" />
            </div>

            {/* Download Button */}
            <button className="w-full bg-[#FF5A5F] hover:bg-[#ff484d] text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-sm">
              <Download className="w-5 h-5" />
              <span>Download CSV</span>
            </button>
          </section>

          {/* DATA LOGS LIST */}
          <section className="space-y-4">
            {logsData.map((log) => (
              <div key={log.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                
                {/* Header Card: Unit & Status */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-[#A05E49]" />
                    <span className="font-semibold text-slate-900">{log.unit}</span>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-xs font-medium ${
                    log.status === 'On' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {log.status}
                  </span>
                </div>

                {/* Content Card: Weight & Operator */}
                <div className="flex justify-between items-end mb-5">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Berat Sampah</p>
                    <div className="flex items-baseline gap-1 text-[#FF5A5F]">
                      <span className="text-3xl font-light">{log.weight}</span>
                      <span className="text-sm font-medium">kg</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Operator</p>
                    <p className="text-sm font-semibold text-slate-900">{log.operator}</p>
                  </div>
                </div>

                {/* Footer Card: Timestamp */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-50 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">{log.time}</span>
                </div>

              </div>
            ))}
          </section>

        </div>

        {/* FLOATING ACTION BUTTON (+) - Absolute to content area */}
        <button className="absolute bottom-28 right-6 bg-[#FF5A5F] hover:bg-[#ff484d] text-white p-4 rounded-full shadow-lg shadow-red-200/50 transition-transform active:scale-95 z-30">
          <Plus className="w-7 h-7" />
        </button>

        {/* BOTTOM NAVIGATION */}
        <BottomNav />
        
      </div>
    </div>
  );
}