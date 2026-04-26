// File: src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import {
  FileUp,
  Bluetooth,
  Server,
  Activity,
  PowerOff,
  PlusSquare,
  BarChart2,
  MapPin,
  Loader2,
  X,
  CheckCircle2
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const containerStyle = { width: '100%', height: '100%' };
const center = { lat: -6.9745, lng: 107.6305 };
const mapStyles = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];
const libraries: any = ['places'];

// --- KONFIGURASI BLUETOOTH SESUAI ESP32 ---
// Pastikan UUID ini sama persis dengan yang ada di kodingan Arduino/ESP32 Anda!
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

export default function DashboardPage() {
  // State Bluetooth & Data
  const [btStatus, setBtStatus] = useState<'Disconnected' | 'Connecting' | 'Connected'>('Disconnected');
  const [btDevice, setBtDevice] = useState<any>(null);
  const [weight, setWeight] = useState<number>(0);
  
  // State UI & Database
  const [machines, setMachines] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userProfile, setUserProfile] = useState<{ name: string, role: string }>({ name: 'Memuat...', role: 'Memuat...' });
  
  // State Modal Unggah Data
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries,
  });

  // 1. FETCH DATA AWAL (Mesin & User)
  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 500);

    const fetchInitialData = async () => {
      // Ambil mesin
      const { data: machineData, error } = await supabase
        .from('mesin_incinerator')
        .select('*')
        .order('created_at', { ascending: false });

      if (machineData) {
        setMachines(machineData);
        // Set default pilihan dropdown ke mesin pertama
        if (machineData.length > 0) setSelectedMachineId(machineData[0].id);
      }
      setIsLoadingData(false);

      // Ambil user
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.user_metadata?.nama || user.email?.split('@')[0] || 'Pengguna';
          const role = user.user_metadata?.role || 'Operator';
          setUserProfile({ name, role });
        } else {
          setUserProfile({ name: 'Operator', role: 'Operator' });
        }
      } catch (error) {
        setUserProfile({ name: 'Operator', role: 'Operator' });
      }
    };

    fetchInitialData();
  }, []);

  // 2. FUNGSI MENGHUBUNGKAN BLUETOOTH
  const handleConnectBluetooth = async () => {
    if (!navigator.bluetooth) {
      alert("Browser ini tidak mendukung Web Bluetooth API. Gunakan Google Chrome di Android/PC.");
      return;
    }

    try {
      setBtStatus('Connecting');
      
      // Meminta akses ke perangkat Bluetooth dengan filter Service UUID
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }]
      });

      // Menambahkan listener jika koneksi terputus tiba-tiba
      device.addEventListener('gattserverdisconnected', onDisconnected);
      
      // Menghubungkan ke GATT Server ESP32
      // Mengecek apakah gatt didukung oleh perangkat
      if (!device.gatt) {
        throw new Error("GATT Server tidak tersedia pada perangkat ini.");
      }

      // Jika aman, lanjutkan koneksi
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      // Memulai pembacaan notifikasi data secara real-time
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

      setBtDevice(device);
      setBtStatus('Connected');

    } catch (error) {
      console.error("Koneksi Bluetooth Gagal:", error);
      setBtStatus('Disconnected');
      alert("Gagal terhubung ke Timbangan ESP32. Pastikan perangkat menyala dan berada di dekat Anda.");
    }
  };

  // 3. FUNGSI MENERIMA DATA DARI ESP32
  const handleCharacteristicValueChanged = (event: any) => {
    // Membaca data byte array dari ESP32 lalu diubah menjadi string
    const value = event.target.value;
    const decoder = new TextDecoder('utf-8');
    const weightString = decoder.decode(value);
    
    // Asumsi ESP32 mengirim data murni angka (contoh: "12.50")
    const parsedWeight = parseFloat(weightString);
    if (!isNaN(parsedWeight)) {
      setWeight(parsedWeight);
    }
  };

  // 4. FUNGSI JIKA TERPUTUS
  const onDisconnected = () => {
    console.log("Bluetooth Terputus!");
    setBtStatus('Disconnected');
    setBtDevice(null);
  };

  // 5. FUNGSI MEMUTUSKAN KONEKSI MANUAL
  const handleDisconnect = () => {
    if (btDevice && btDevice.gatt.connected) {
      btDevice.gatt.disconnect();
    }
  };

  // 6. FUNGSI UNGGAH DATA KE DATABASE
  const handleUploadData = async () => {
    if (weight <= 0) {
      alert("Berat tidak valid. Timbangan belum mengirimkan data.");
      return;
    }
    
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const selectedMachine = machines.find(m => m.id === selectedMachineId);

      // Insert ke tabel aktivitas_log
      const { error } = await supabase
        .from('aktivitas_log')
        .insert([{
          mesin_id: selectedMachineId,
          nama_mesin: selectedMachine?.nama_tempat,
          operator_id: user?.id,
          operator_name: userProfile.name,
          aksi: 'Input Berat',
          keterangan: `${weight.toFixed(2)} kg`
        }]);

      if (error) throw error;

      // Jika berhasil
      setUploadSuccess(true);
      
      // Tunggu 2 detik lalu tutup modal dan reset (opsional)
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(false);
      }, 2000);

    } catch (error: any) {
      console.error("Gagal mengunggah data:", error);
      alert("Terjadi kesalahan saat menyimpan data: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Statistik Ringkasan
  const totalMachines = machines.length;
  const activeMachines = machines.filter(m => m.status === 'on').length;
  const inactiveMachines = machines.filter(m => m.status === 'off').length;

  return (
    <div className="min-h-svh bg-[#F0F4F2] flex justify-center font-sans overflow-x-hidden relative">
      <div className="w-full max-w-[26rem] sm:max-w-md flex flex-col relative bg-white shadow-2xl shadow-emerald-900/10">

        {/* --- HEADER MELENGKUNG (Tetap Sama) --- */}
        <div className="bg-[#F0F4F2] pb-5 relative z-0 overflow-hidden">
          <div className="bg-emerald-800 pt-5 pb-36 px-4 min-[390px]:px-5 rounded-b-[2rem] relative z-0 shadow-lg shadow-emerald-900/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex justify-start relative z-10">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden flex-shrink-0 shadow-inner">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=065f46&color=fff&size=150`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 text-left text-white">
                  <h1 className="font-bold text-[13px] leading-tight truncate max-w-[160px] tracking-tight capitalize">{userProfile.name}</h1>
                  <p className="text-[9px] text-emerald-100 font-medium mt-0.5 capitalize">{userProfile.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* LOKASI PERSEBARAN MAPS (Tetap Sama) */}
          <div className="px-4 min-[390px]:px-5 -mt-32 relative z-10 mb-4">
            <div className="bg-white rounded-[1.75rem] p-3 shadow-[0_18px_34px_-24px_rgba(6,95,70,0.42)] border border-white/80 overflow-hidden h-auto">
              <div className="px-1 pb-2 flex justify-between items-center">
                <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest leading-none">Lokasi Mesin</h2>
                <span className="text-[9px] font-bold text-slate-400">Live View</span>
              </div>
              <div className="dashboard-map w-full h-[240px] rounded-[1.35rem] overflow-hidden bg-slate-50 relative isolate">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={14}
                    options={{ disableDefaultUI: true, styles: mapStyles }}
                  >
                    {machines.map((machine) => (
                      <MarkerF
                        key={machine.id}
                        position={{ lat: machine.latitude, lng: machine.longitude }}
                        title={machine.nama_tempat}
                        icon={{
                          path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
                          fillColor: machine.status === 'on' ? '#10b981' : '#ef4444',
                          fillOpacity: 1,
                          strokeColor: "white",
                          strokeWeight: 3,
                          scale: 0.45,
                        }}
                      />
                    ))}
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-300 font-black text-[10px] tracking-widest uppercase animate-pulse">Memuat Peta...</div>
                )}
                <button className="absolute top-3 right-3 bg-white p-2.5 rounded-xl shadow-lg border border-emerald-50 text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all">
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* KARTU TOTAL SAMPAH HARIAN */}
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

              {/* Progress Bar (Tetap) */}
              <div className="relative z-10 mb-4">
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-widest">
                  <span className="text-slate-400">Target: 10kg</span>
                  <span className="text-emerald-700">TERHUBUNG KE SISTEM</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full w-[80%] transition-all duration-1000 ease-out shadow-inner"></div>
                </div>
              </div>

              {/* TOMBOL UNGGAH AKTIF JIKA TERKONEKSI */}
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

        {/* FITUR APLIKASI (GRID MENU) */}
        <div className="bg-white pt-6 pb-6 border-t border-slate-200/60 shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.05)] relative z-10 rounded-b-[1.75rem] overflow-hidden">
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-5 pointer-events-none">
            <div className="w-[180px] h-[180px] bg-[url('/logo-reburn.jpeg')] bg-contain bg-center bg-no-repeat mix-blend-multiply"></div>
          </div>
          
          <section className="px-4 min-[390px]:px-5 relative z-10">
            <h2 className="text-[15px] font-black text-slate-800 mb-4 tracking-tight">Konektivitas & Fitur</h2>
            <div className="grid grid-cols-4 gap-x-2 gap-y-5">

              {/* Tombol Bluetooth Dinamis */}
              <div className="flex flex-col items-center">
                <button
                  onClick={btStatus === 'Connected' ? handleDisconnect : handleConnectBluetooth}
                  className={`w-[68px] h-[68px] rounded-[1.5rem] flex items-center justify-center transition-all active:scale-95 border relative
                    ${btStatus === 'Connected' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-200 shadow-sm text-blue-600 hover:bg-slate-50'}`}
                >
                  <Bluetooth strokeWidth={2.5} className={`w-[28px] h-[28px] ${btStatus === 'Connecting' ? 'animate-pulse' : ''}`} />
                  
                  {/* Indikator Titik Hijau */}
                  {btStatus === 'Connected' && (
                     <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full border border-blue-600"></div>
                  )}
                </button>
                <span className="text-[10px] text-slate-800 text-center mt-2.5 font-semibold leading-tight">
                  {btStatus === 'Connected' ? 'Putuskan' : 'Hubungkan'}
                </span>
              </div>

              {/* Menu Lainnya... */}
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

        {/* OVERVIEW SECTION (Tetap Sama) */}
        <div className="bg-[#F0F4F2] flex-1 pt-6 pb-24 border-t border-emerald-50 shadow-inner relative z-0">
          <section className="px-4 min-[390px]:px-5 space-y-5">
            <div>
              <h2 className="text-base font-black text-slate-800 mb-3 tracking-tight">Status Unit</h2>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-slate-100/50 rounded-2xl p-3.5 sm:p-4 flex flex-col border border-slate-200 shadow-sm">
                  <div className="bg-white p-1.5 rounded-[0.6rem] border border-slate-200 shadow-sm w-fit mb-3"><Server className="w-4 h-4 text-slate-700" /></div>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none mb-1">{totalMachines}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-3.5 sm:p-4 flex flex-col border border-emerald-100 shadow-sm">
                  <div className="bg-white p-1.5 rounded-[0.6rem] border border-emerald-100 shadow-sm w-fit mb-3"><Activity className="w-4 h-4 text-emerald-600" /></div>
                  <p className="text-2xl font-black text-emerald-950 tracking-tighter leading-none mb-1">{activeMachines}</p>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Aktif</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-3.5 sm:p-4 flex flex-col border border-red-100 shadow-sm">
                  <div className="bg-white p-1.5 rounded-[0.6rem] border border-red-100 shadow-sm w-fit mb-3"><PowerOff className="w-4 h-4 text-red-600" /></div>
                  <p className="text-2xl font-black text-red-950 tracking-tighter leading-none mb-1">{inactiveMachines}</p>
                  <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Mati</p>
                </div>
              </div>
            </div>
            
            {/* DAFTAR MESIN */}
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
                  machines.slice(0, 5).map((machine) => (
                    <div key={machine.id} className="bg-white rounded-2xl px-4 py-3.5 border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
                      {/* Status dot / Ikon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${machine.status === 'on'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                        }`}>
                        {machine.status === 'on'
                          ? <Activity className="w-5 h-5 text-green-500" />
                          : <PowerOff className="w-5 h-5 text-red-500" />
                        }
                      </div>
                      
                      {/* Info Nama & Lokasi */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800 truncate leading-tight">
                          {machine.nama_tempat || 'Mesin Incinerator'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                          {machine.lokasi || `${machine.latitude?.toFixed(4)}, ${machine.longitude?.toFixed(4)}`}
                        </p>
                      </div>
                      
                      {/* Badge Status */}
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 border ${machine.status === 'on'
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-red-50 text-red-500 border-red-200'
                        }`}>
                        {machine.status === 'on' ? 'Aktif' : 'Mati'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

      </div>

      {/* --- MODAL UNGGAH DATA SENSOR --- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer" onClick={() => !isUploading && setIsUploadModalOpen(false)}></div>

          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 z-10 border border-emerald-50">
            {uploadSuccess ? (
              // Tampilan Sukses
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500 animate-in zoom-in duration-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Berhasil Diunggah!</h2>
                <p className="text-slate-500 text-sm">Data berat <strong>{weight.toFixed(2)} kg</strong> telah tersimpan di database.</p>
              </div>
            ) : (
              // Form Input
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
                  {/* Tampilan Berat Live */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-[1.5rem] p-6 text-center">
                    <p className="text-[10px] font-black text-emerald-800/50 uppercase tracking-widest mb-1">Data dari Sensor ESP32</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-black text-emerald-700 tracking-tighter">{weight.toFixed(2)}</span>
                      <span className="text-xl font-bold text-emerald-600/60">kg</span>
                    </div>
                  </div>

                  {/* Pilih Mesin */}
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
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         ▼
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleUploadData}
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