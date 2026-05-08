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
import UploadModal from '@/components/UploadModal';

export default function DataPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE UNTUK MODAL INPUT MANUAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  // Fungsi untuk memuat data log dan daftar mesin
  const fetchData = async () => {
    setIsLoading(true);

    
    
    // 1. Ambil data log
    const { data: logData, error: logError } = await supabase
      .from('aktivitas_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (!logError && logData) {
      const formattedLogs = logData.map((item: any) => {
  // Gunakan created_at dari database
  const rawDate = item.created_at;
  const dateObj = new Date(rawDate);

  // Pastikan tanggal valid, jika tidak valid gunakan waktu saat ini sebagai cadangan
  const isValidDate = !isNaN(dateObj.getTime());
  const finalDate = isValidDate ? dateObj : new Date();

  // Format Jam:Menit (untuk UI)
  const timeString = finalDate.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  }).replace('.', ':'); // Memastikan pemisah adalah titik dua

  // Format Tanggal Lengkap (untuk Excel)
  const fullDateString = finalDate.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  let logType = 'system';
  if (item.aksi === 'Input Berat') logType = 'weight';
  else if (item.keterangan && item.keterangan.includes('ON')) logType = 'status-on';
  else if (item.keterangan && item.keterangan.includes('OFF')) logType = 'status-off';

  return {
    id: item.id,
    time: timeString,
    fullDate: fullDateString, // Ini yang akan kita panggil di Excel
    operator: item.operator_name || 'Operator',
    action: item.aksi === 'Input Berat' ? 'Memasukkan data berat' : item.nama_mesin,
    value: item.keterangan,
    type: logType
  };
});
      setLogs(formattedLogs);
    }

    // 2. Ambil daftar mesin untuk Dropdown form manual
    const { data: machineData } = await supabase
      .from('mesin_incinerator')
      .select('id, nama_tempat, status');
    
    if (machineData) {
      setMachines(machineData);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FUNGSI SUBMIT DATA MANUAL DARI MODAL ---
  // Parameter sekarang langsung menerima formData dari komponen UploadModal
  const handleManualSubmit = async (formData: { mesin_id: string; aksi: string; keterangan: string }) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const selectedMachine = machines.find(m => m.id === formData.mesin_id);

      // Siapkan nilai keterangan berdasarkan jenis aksi
      let finalKeterangan = formData.keterangan;
      if (formData.aksi === 'Input Berat') {
        finalKeterangan = `${formData.keterangan} kg`;
      } else {
        finalKeterangan = `Mesin ${formData.keterangan}`; // Misal: "Mesin ON"
      }

      // Insert ke tabel log
      const { error: logError } = await supabase
        .from('aktivitas_log')
        .insert([{
          mesin_id: formData.mesin_id,
          nama_mesin: selectedMachine?.nama_tempat,
          operator_id: user?.id,
          operator_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Operator Manual',
          aksi: formData.aksi === 'Input Berat' ? 'Input Berat' : 'Perubahan Status',
          keterangan: finalKeterangan
        }]);

      if (logError) throw logError;

      // Jika yang diubah adalah status, update juga tabel mesin_incinerator
      if (formData.aksi === 'Ubah Status') {
        await supabase
          .from('mesin_incinerator')
          .update({ status: formData.keterangan.toLowerCase() }) // 'on' atau 'off'
          .eq('id', formData.mesin_id);
      }

      // Tutup modal dan refresh timeline
      setIsModalOpen(false);
      fetchData();
      
    } catch (error) {
      console.error("Gagal menyimpan data manual:", error);
      alert("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
  if (logs.length === 0) {
    alert("Tidak ada data untuk diekspor");
    return;
  }

  // 1. Filter data (Hanya mengambil field yang dibutuhkan, membuang id dan type)
  // logs di state Anda sudah diformat dengan baik di fetchData()
  const dataToExport = logs.map(({ id, type, ...rest }) => ({
    "Waktu": rest.time,
    "Tanggal": rest.fullDate,
    "Operator": rest.operator,
    "Aktivitas": rest.action,
    "Keterangan": rest.value
  }));

  // 2. Gunakan library xlsx secara dynamic import (agar bundle size tetap kecil)
  import('xlsx').then((XLSX) => {
    // Membuat worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    // Membuat workbook (file excel)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log Aktivitas");

    // 3. Download file dengan nama berdasarkan tanggal hari ini
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Log_Aktivitas_Reburn_${dateStr}.xlsx`);
  });
};

  return (
    <div className="h-svh bg-[#F8FAFC] flex justify-center font-sans overflow-hidden">
      
      {/* CONTAINER KONTEN UTAMA */}
      <div className="w-full max-w-md h-svh flex flex-col relative z-10 bg-[#F8FAFC] shadow-2xl shadow-slate-200/70 overflow-hidden">
        <div className="shrink-0 bg-[#F8FAFC]/95 px-5 pt-8 pb-4 backdrop-blur border-b border-slate-200/70">
          
          <header className="px-1">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Activity Stream</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Log Aktivitas</h1>
          </header>

          <section className="mt-5 grid grid-cols-2 gap-3">
            <div className="h-12 bg-white border border-slate-100 px-3 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold text-slate-700">Hari ini</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-300" />
            </div>
            <button 
              onClick={handleExport} // Pasang di sini
              className="bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">
              <Download className="w-3 h-3" /> Ekspor
            </button>
          </section>
        </div>

          {/* TIMELINE SECTION */}
        <section className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-32 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
          <div className="relative min-h-full">
            <div className="absolute left-[76px] top-4 bottom-4 w-[2px] bg-slate-100"></div>

            <div className="space-y-4 relative">
              {isLoading ? (
                <div className="flex min-h-[50svh] justify-center items-center">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 shadow-sm relative z-10 ml-20">
                  <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">Belum ada aktivitas tercatat.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex min-w-0 items-start gap-3 group">
                    <div className="w-14 pt-1 flex-shrink-0 flex flex-col items-start">
                      <span className="text-[11px] font-black text-slate-400 group-hover:text-emerald-600 transition-colors leading-none">
                        {log.time}
                      </span>

                      <span className="text-[9px] font-semibold text-slate-300 mt-1 block leading-tight">
                        {log.fullDate}
                      </span>
                    </div>

                    <div className={`relative z-10 w-4 h-4 rounded-full border-4 border-[#F8FAFC] mt-1.5 flex-shrink-0 ${
                      log.type === 'status-on' ? 'bg-green-500' : 
                      log.type === 'status-off' ? 'bg-orange-500' : 
                      log.type === 'weight' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}></div>

                    <div className="min-w-0 flex-1 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                      <div className="flex min-w-0 justify-between items-start gap-3 mb-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-300" />
                          <span className="min-w-0 truncate text-[10px] font-black text-slate-400 uppercase tracking-tight">{log.operator}</span>
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
          </div>
          </section>

        {/* --- FLOATING ACTION BUTTON (+) --- */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-24 right-5 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl shadow-xl shadow-emerald-200 active:scale-90 transition-transform z-[60] flex items-center justify-center cursor-pointer"
        >
          <Plus className="w-6 h-6 pointer-events-none" />
        </button>
        
        <BottomNav />
      </div>

      {/* --- MODAL INPUT MANUAL PANGGILAN KOMPONEN --- */}
      <UploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
        machines={machines} 
        isSubmitting={isSubmitting} // PERBAIKAN: Gunakan isSubmitting, bukan isUploading
        onSubmit={handleManualSubmit}
      />
    </div>
  );
}
