// File: src/app/data/page.tsx
'use client';

import { 
  Calendar, 
  ChevronDown, 
  Download, 
  Clock, 
  Plus,
  Wrench,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

// Data Dummy
const logsData = [
  { id: 1, unit: 'WM-UNIT-01', status: 'Off', weight: 12.5, operator: 'Bpk. Ahmad', time: '14:30 | 25 Oktober 2024' },
  { id: 2, unit: 'WM-UNIT-04', status: 'Off', weight: 8.2, operator: 'Bpk. Ahmad', time: '11:15 | 25 Oktober 2024' },
  { id: 3, unit: 'WM-UNIT-01', status: 'On', weight: 15.0, operator: 'Ibu Siti', time: '09:45 | 25 Oktober 2024' },
  { id: 4, unit: 'WM-UNIT-02', status: 'Off', weight: 5.7, operator: 'Bpk. Ahmad', time: '08:20 | 25 Oktober 2024' },
];

export default function DataPage() {
  return (
    <div className="min-h-svh bg-[#F0F4F2] flex justify-center font-sans overflow-x-hidden">
      
      {/* Container utama */}
      <div className="w-full max-w-[26rem] sm:max-w-md flex flex-col relative z-10">

        <div className="px-5 pt-5 sm:px-6 sm:pt-6 pb-32 flex-grow space-y-6">
          
          <header className="relative px-1 mb-2">
            <h1 className="text-3xl font-black text-emerald-950 tracking-tight leading-[1.1]">Log<br/><span className="text-emerald-700">Aktivitas</span></h1>
          </header>

          {/* FILTER & DOWNLOAD SECTION */}
          <section className="space-y-3">
            {/* Date Filter Card */}
            <div className="bg-white border border-emerald-50 p-3 rounded-[1.25rem] flex items-center justify-between shadow-sm cursor-pointer hover:bg-emerald-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-800/40 uppercase tracking-widest mb-0.5">Periode Laporan</p>
                  <p className="text-sm font-black text-emerald-950">Hari ini, 25 Okt 2024</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-emerald-800/30 mr-2" />
            </div>

            {/* Download Button */}
            <button className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-black py-4 rounded-[1.25rem] flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-xl shadow-emerald-900/10 text-[11px] uppercase tracking-widest">
              <Download className="w-4 h-4" />
              <span>EKSPOR DATA</span>
            </button>
          </section>

          {/* DATA LOGS LIST */}
          <section className="space-y-4 mt-8">
            <h2 className="text-[11px] font-black text-emerald-800/40 uppercase tracking-widest px-2 mb-1">Aktivitas Terbaru</h2>
            <div className="flex flex-col gap-3">
              {logsData.map((log) => (
                <div key={log.id} className={`bg-white rounded-[1.5rem] p-5 shadow-xl shadow-emerald-900/5 border-l-4 relative overflow-hidden group transition-colors ${
                  log.status === 'On' 
                    ? 'border-l-green-500 hover:border-green-200' 
                    : 'border-l-red-500 hover:border-red-200'
                }`}>
                  
                  {/* Decorative Blob */}
                  {log.status === 'On' && <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full blur-xl -mr-10 -mt-10"></div>}
                  {log.status === 'Off' && <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-full blur-xl -mr-10 -mt-10"></div>}

                  {/* Header Card: Unit & Status */}
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${log.status === 'On' ? 'bg-green-50' : 'bg-red-50'}`}>
                        <Wrench className={`w-4 h-4 ${log.status === 'On' ? 'text-green-600' : 'text-red-500'}`} />
                      </div>
                      <span className="font-black text-emerald-950 tracking-tight">{log.unit}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                      log.status === 'On' 
                        ? 'bg-green-50 text-green-600 border border-green-200' 
                        : 'bg-red-50 text-red-500 border border-red-200'
                    }`}>
                      {log.status === 'On' 
                        ? <><CheckCircle2 className="w-3 h-3" /> Aktif</>
                        : <><XCircle className="w-3 h-3" /> Mati</>
                      }
                    </span>
                  </div>

                  {/* Content Card: Weight & Operator */}
                  <div className="flex justify-between items-end mb-4 relative z-10 px-1">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-800/40 uppercase tracking-widest mb-1">Sampah Diproses</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-emerald-950 tracking-tighter">{log.weight}</span>
                        <span className="text-sm font-bold text-emerald-500">kg</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-800/40 uppercase tracking-widest mb-1">Operator</p>
                      <p className="text-sm font-bold text-emerald-900">{log.operator}</p>
                    </div>
                  </div>

                  {/* Footer Card: Timestamp */}
                  <div className="flex items-center gap-2 pt-3 border-t border-emerald-50 text-emerald-800/40 relative z-10 px-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold tracking-wider">{log.time}</span>
                  </div>

                </div>
              ))}
            </div>
          </section>

        </div>

        {/* FLOATING ACTION BUTTON (+) */}
        <button className="fixed bottom-[100px] right-6 sm:absolute sm:bottom-28 sm:right-6 bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-2xl shadow-xl shadow-emerald-500/30 transition-transform active:scale-95 z-30">
          <Plus className="w-6 h-6" />
        </button>

        {/* BOTTOM NAVIGATION */}
        <BottomNav />
        
      </div>
    </div>
  );
}
