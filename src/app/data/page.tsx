// File: src/app/data/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, 
  ChevronDown, 
  Download, 
  Plus,
  User,
  Zap,
  Scale,
  History,
  Loader2
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function DataPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      // Ambil data log dari database (urut dari yang paling baru)
      const { data, error } = await supabase
        .from('aktivitas_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Gagal memuat log:", error.message);
      } else if (data) {
        // Konversi format database agar sesuai dengan desain UI Timeline kita
        const formattedLogs = data.map((item: any) => {
          // Ambil jam dan menit saja dari timestamp (contoh: "14:30")
          const timeString = new Date(item.created_at).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          });

          // Tentukan ikon warna dari isi keterangan log
          let logType = 'system';
          if (item.aksi === 'Input Berat') logType = 'weight';
          else if (item.keterangan.includes('ON')) logType = 'status-on';
          else if (item.keterangan.includes('OFF')) logType = 'status-off';

          return {
            id: item.id,
            time: timeString,
            operator: item.operator_name || 'Operator',
            action: item.aksi === 'Input Berat' ? 'Memasukkan data berat' : item.nama_mesin,
            value: item.keterangan,
            type: logType
          };
        });

        setLogs(formattedLogs);
      }
      setIsLoading(false);
    };

    fetchLogs();
  }, []);

  return (
    <div className="min-h-svh bg-[#F8FAFC] flex justify-center font-sans overflow-x-hidden">
      <div className="w-full max-w-md flex flex-col relative z-10">
        <div className="px-6 pt-10 pb-40 flex-grow space-y-8">
          
          <header className="px-1">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Activity Stream</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Log Aktivitas</h1>
          </header>

          {/* FILTER & EXPORT */}
          <section className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold text-slate-700">Hari ini</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-300" />
            </div>
            <button className="bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">
              <Download className="w-3 h-3" /> Ekspor
            </button>
          </section>

          {/* TIMELINE SECTION */}
          <section className="relative pl-2">
            <div className="absolute left-[45px] top-4 bottom-0 w-[2px] bg-slate-100"></div>

            <div className="space-y-8 relative">
              {isLoading ? (
                // Animasi Loading
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                // State Kosong jika belum ada aktivitas
                <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 shadow-sm relative z-10 ml-12">
                  <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">Belum ada aktivitas tercatat.</p>
                </div>
              ) : (
                // Mapping Data Dinamis
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 group">
                    <div className="w-12 pt-1 flex-shrink-0">
                      <span className="text-[11px] font-black text-slate-400 group-hover:text-emerald-600 transition-colors">
                        {log.time}
                      </span>
                    </div>

                    <div className={`relative z-10 w-4 h-4 rounded-full border-4 border-[#F8FAFC] mt-1.5 flex-shrink-0 ${
                      log.type === 'status-on' ? 'bg-green-500' : 
                      log.type === 'status-off' ? 'bg-orange-500' : 
                      log.type === 'weight' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}></div>

                    <div className="flex-grow bg-white border border-slate-50 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{log.operator}</span>
                        </div>
                        
                        {log.type === 'weight' && <Scale className="w-3.5 h-3.5 text-emerald-500" />}
                        {log.type.includes('status') && <Zap className={`w-3.5 h-3.5 ${log.type === 'status-on' ? 'text-green-500' : 'text-orange-500'}`} />}
                        {log.type === 'system' && <History className="w-3.5 h-3.5 text-blue-500" />}
                      </div>

                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <p className="text-[13px] font-medium text-slate-600">{log.action}:</p>
                        <p className={`text-sm font-black tracking-tight ${
                          log.type === 'status-on' ? 'text-green-600' : 
                          log.type === 'status-off' ? 'text-orange-600' : 
                          'text-slate-900'
                        }`}>
                          {log.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <button className="fixed bottom-28 right-6 bg-emerald-600 text-white p-4 rounded-2xl shadow-xl shadow-emerald-200 active:scale-90 transition-transform z-30">
          <Plus className="w-6 h-6" />
        </button>

        <BottomNav />
      </div>
    </div>
  );
}