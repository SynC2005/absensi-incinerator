// File: src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useJsApiLoader } from '@react-google-maps/api';
import { 
  FileUp, 
  Bluetooth, 
  PlusSquare, 
  BarChart2, 
  CheckCircle2, 
  Loader2, 
  X 
} from 'lucide-react';

// --- IMPORT KOMPONEN & CUSTOM HOOKS ---
import BottomNav from '@/components/BottomNav';
import MapSection from '@/components/MapSection';
import StatCards from '@/components/StatCards';
import { useBluetooth } from '@/hooks/useBluetooth';
import { useDashboardData } from '@/hooks/useDashboardData';
import MachineCard from '@/components/MachineCard';

export default function DashboardPage() {
  // Panggil "otak" sistem
  const { btStatus, weight, connectBluetooth, disconnectBluetooth } = useBluetooth();
  const { machines, isLoadingData, userProfile, isUploading, uploadSensorData } = useDashboardData();

  // State Modal Unggah
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Setup Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  // Set default mesin saat data selesai dimuat
  useEffect(() => {
    if (machines.length > 0 && !selectedMachineId) {
      setSelectedMachineId(machines[0].id);
    }
  }, [machines]);

  // Fungsi Eksekusi Unggah ke DB
  const handleExecuteUpload = async () => {
    try {
      await uploadSensorData(selectedMachineId, weight);
      setUploadSuccess(true);
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      alert("Gagal mengunggah data. Periksa koneksi Anda.");
    }
  };

  const activeMachines = machines.filter(m => m.status === 'on').length;
  const inactiveMachines = machines.filter(m => m.status === 'off').length;

  return (
    <div className="min-h-svh bg-[#F0F4F2] flex justify-center font-sans overflow-x-hidden relative">
      <div className="w-full max-w-[26rem] sm:max-w-md flex flex-col relative bg-white shadow-2xl shadow-emerald-900/10">

        {/* --- BAGIAN ATAS (HEADER & PETA & KARTU TOTAL) --- */}
        <div className="bg-[#F0F4F2] pb-5 relative z-0 overflow-hidden">
          
          {/* Header Melengkung */}
          <div className="bg-emerald-800 pt-5 pb-36 px-4 min-[390px]:px-5 rounded-b-[2rem] relative z-0 shadow-lg shadow-emerald-900/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex justify-start relative z-10">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden flex-shrink-0 shadow-inner">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=065f46&color=fff&size=150`} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 text-left text-white">
                  <h1 className="font-bold text-[13px] leading-tight truncate max-w-[160px] tracking-tight capitalize">{userProfile.name}</h1>
                  <p className="text-[9px] text-emerald-100 font-medium mt-0.5 capitalize">{userProfile.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section Dipanggil dari Komponen */}
          <MapSection isLoaded={isLoaded} machines={machines} />

          {/* Kartu Total Sampah Harian */}
          <section className="px-4 min-[390px]:px-5">
            <div className="bg-white rounded-[1.75rem] p-4 shadow-[0_18px_34px_-24px_rgba(6,95,70,0.45)] border border-emerald-50 relative overflow-hidden">
              <FileUp className="absolute -right-5 top-3 z-0 w-24 h-24 -rotate-12 text-emerald-50/80 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                    {btStatus === 'Connected' ? 'Data Timbangan Live' : 'Total Sampah Harian'}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-800 tracking-tighter leading-none">
                      {btStatus === 'Connected' ? weight.toFixed(2) : '0.00'}
                    </span>
                    <span className="text-lg font-bold text-emerald-700">kg</span>
                  </div>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-[1rem] text-emerald-700 shadow-[0_10px_22px_-16px_rgba(6,95,70,0.7)]">
                  <FileUp className="w-5 h-5" />
                </div>
              </div>

              {/* Progress Bar Dikembalikan */}
              <div className="relative z-10 mb-4">
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-widest">
                  <span className="text-slate-400">Target: 10kg</span>
                  <span className="text-emerald-700">{btStatus === 'Connected' ? 'TERHUBUNG KE SISTEM' : 'MENUNGGU KONEKSI'}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full w-[80%] transition-all duration-1000 ease-out shadow-inner"></div>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                disabled={btStatus !== 'Connected'}
                className={`relative z-10 w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2
                  ${btStatus === 'Connected' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
              >
                <PlusSquare className="w-4 h-4" />
                Unggah Data Sensor
              </button>
            </div>
          </section>
        </div>

        {/* --- BAGIAN TENGAH (FITUR APLIKASI & WATERMARK) --- */}
        <div className="bg-white pt-6 pb-6 border-t border-slate-200/60 shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.05)] relative z-10 rounded-b-[1.75rem] overflow-hidden">
          
          {/* Watermark Logo Dikembalikan */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-5 pointer-events-none">
            <div className="w-[180px] h-[180px] bg-[url('/logo-reburn.jpeg')] bg-contain bg-center bg-no-repeat mix-blend-multiply"></div>
          </div>
          
          <section className="px-4 min-[390px]:px-5 relative z-10">
            <h2 className="text-[15px] font-black text-slate-800 mb-4 tracking-tight">Konektivitas & Fitur</h2>
            <div className="grid grid-cols-4 gap-x-2 gap-y-5">

              {/* Menu 1: Bluetooth */}
              <div className="flex flex-col items-center">
                <button
                  onClick={btStatus === 'Connected' ? disconnectBluetooth : connectBluetooth}
                  className={`w-[68px] h-[68px] rounded-[1.5rem] flex items-center justify-center transition-all active:scale-95 border relative
                    ${btStatus === 'Connected' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-200 shadow-sm text-blue-600 hover:bg-slate-50'}`}
                >
                  <Bluetooth strokeWidth={2.5} className={`w-[28px] h-[28px] ${btStatus === 'Connecting' ? 'animate-pulse' : ''}`} />
                  {btStatus === 'Connected' && (
                     <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full border border-blue-600"></div>
                  )}
                </button>
                <span className="text-[10px] text-slate-800 text-center mt-2.5 font-semibold leading-tight">
                  {btStatus === 'Connected' ? 'Putuskan' : 'Hubungkan'}
                </span>
              </div>

              {/* Menu 2-4 Dikembalikan secara lengkap */}
              <div className="flex flex-col items-center">
                <Link href="/data" className="w-[68px] h-[68px] bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center justify-center text-purple-600 hover:bg-slate-50 active:scale-95 transition-all">
                  <FileUp strokeWidth={2.5} className="w-[28px] h-[28px]" />
                </Link>
                <span className="text-[10px] text-slate-800 text-center mt-2.5 font-semibold leading-tight">Riwayat<br />Data</span>
              </div>

              <div className="flex flex-col items-center">
                <Link href="/add-machine" className="w-[68px] h-[68px] bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center justify-center text-emerald-600 hover:bg-slate-50 active:scale-95 transition-all">
                  <PlusSquare strokeWidth={2.5} className="w-[28px] h-[28px]" />
                </Link>
                <span className="text-[10px] text-slate-800 text-center mt-2.5 font-semibold leading-tight">Tambah<br />Mesin</span>
              </div>

              <div className="flex flex-col items-center">
                <Link href="/data" className="w-[68px] h-[68px] bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center justify-center text-orange-500 hover:bg-slate-50 active:scale-95 transition-all">
                  <BarChart2 strokeWidth={2.5} className="w-[28px] h-[28px]" />
                </Link>
                <span className="text-[10px] text-slate-800 text-center mt-2.5 font-semibold leading-tight">Analisa<br />Kinerja</span>
              </div>

            </div>
          </section>
        </div>

        {/* --- OVERVIEW SECTION (STATUS & LIST) --- */}
        <div className="bg-[#F0F4F2] flex-1 pt-6 pb-24 border-t border-emerald-50 shadow-inner relative z-0">
          <section className="px-4 min-[390px]:px-5 space-y-5">
            
            {/* 1. KARTU STATUS UNIT */}
            <div>
              <h2 className="text-base font-black text-slate-800 mb-3 tracking-tight">Status Unit</h2>
              <StatCards total={machines.length} active={activeMachines} inactive={inactiveMachines} />
            </div>

            {/* 2. DAFTAR MESIN */}
            <div>
              <div className="flex justify-between items-center mb-3 mt-6">
                <h2 className="text-base font-black text-slate-800 tracking-tight">Daftar Unit Mesin</h2>
                <Link href="/data" className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest hover:underline">
                  Lihat Semua
                </Link>
              </div>
              
              <div className="space-y-2.5">
                {isLoadingData ? (
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center shadow-sm">
                    <span className="text-[11px] text-slate-400 font-semibold animate-pulse">Memuat data mesin...</span>
                  </div>
                ) : machines.length === 0 ? (
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center shadow-sm">
                    <span className="text-[11px] text-slate-400 font-semibold">Belum ada data mesin terdaftar.</span>
                  </div>
                ) : (
                  // Gunakan komponen MachineCard di sini
                  machines.slice(0, 5).map((machine) => (
                    <MachineCard 
                      key={machine.id}
                      name={machine.nama_tempat}
                      lat={machine.latitude}
                      lng={machine.longitude}
                      status={machine.status}
                      lokasi={machine.lokasi}
                    />
                  ))
                )}
              </div>
            </div>

          </section>
        </div>

      </div>

      {/* --- MODAL UNGGAH DATA (Langsung di Dashboard) --- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer" onClick={() => !isUploading && setIsUploadModalOpen(false)}></div>

          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 z-10 border border-emerald-50">
            {uploadSuccess ? (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500 animate-in zoom-in duration-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Berhasil Diunggah!</h2>
                <p className="text-slate-500 text-sm">Data berat <strong>{weight.toFixed(2)} kg</strong> telah tersimpan di database.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Konfirmasi Data</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pilih Lokasi Mesin</p>
                  </div>
                  <button onClick={() => setIsUploadModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-[1.5rem] p-6 text-center">
                    <p className="text-[10px] font-black text-emerald-800/50 uppercase tracking-widest mb-1">Data dari Sensor ESP32</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-black text-emerald-700 tracking-tighter">{weight.toFixed(2)}</span>
                      <span className="text-xl font-bold text-emerald-600/60">kg</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Koneksikan ke Unit</label>
                    <div className="relative">
                      <select 
                        value={selectedMachineId}
                        onChange={(e) => setSelectedMachineId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-4 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none font-bold"
                      >
                        {machines.map(m => (
                          <option key={m.id} value={m.id}>{m.nama_tempat}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                  </div>

                  <button 
                    onClick={handleExecuteUpload}
                    disabled={isUploading || !selectedMachineId}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-all disabled:bg-slate-300"
                  >
                    {isUploading ? <Loader2 className="animate-spin w-5 h-5" /> : <FileUp className="w-5 h-5" />}
                    <span>SIMPAN KE DATABASE</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}