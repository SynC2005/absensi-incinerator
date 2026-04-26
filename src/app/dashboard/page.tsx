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
  MapPin
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = { lat: -6.9745, lng: 107.6305 };

const mapStyles = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

const libraries: any = ['places'];

export default function DashboardPage() {
  const [btStatus, setBtStatus] = useState<'Disconnected' | 'Connecting' | 'Connected'>('Disconnected');
  const [weight, setWeight] = useState<number>(0);
  const [machines, setMachines] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userProfile, setUserProfile] = useState<{ name: string, role: string }>({ name: 'Memuat...', role: 'Memuat...' });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);

    const fetchMachines = async () => {
      const { data, error } = await supabase
        .from('mesin_incinerator')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Gagal mengambil data mesin:", error.message);
      } else if (data) {
        setMachines(data);
      }
      setIsLoadingData(false);
    };

    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.user_metadata?.nama || user.email?.split('@')[0] || 'Pengguna';
          const role = user.user_metadata?.role || 'Admin';
          setUserProfile({ name, role });
        } else {
          setUserProfile({ name: 'Operator', role: 'Operator' });
        }
      } catch (error) {
        console.error("Gagal mengambil profil pengguna:", error);
        setUserProfile({ name: 'Operator', role: 'Operator' });
      }
    };

    fetchMachines();
    fetchUser();
  }, []);

  const handleConnectBluetooth = async () => {
    if (!(navigator as any).bluetooth) {
      alert("Browser ini tidak mendukung Web Bluetooth API.");
      return;
    }
    try {
      setBtStatus('Connecting');
      await (navigator as any).bluetooth.requestDevice({ acceptAllDevices: true });
      setBtStatus('Connected');
      setTimeout(() => setWeight(12.5), 2000);
    } catch (error) {
      console.error("Bluetooth Error:", error);
      setBtStatus('Disconnected');
    }
  };

  const totalMachines = machines.length;
  const activeMachines = machines.filter(m => m.status === 'on').length;
  const inactiveMachines = machines.filter(m => m.status === 'off').length;

  return (
    <div className="min-h-svh bg-[#F0F4F2] flex justify-center font-sans overflow-x-hidden relative">
      {/* Kontainer Utama */}
      <div className="w-full max-w-[26rem] sm:max-w-md flex flex-col relative bg-white shadow-2xl shadow-emerald-900/10">

        {/* BAGIAN ATAS DENGAN BACKGROUND LOGIN */}
        <div className="bg-[#F0F4F2] pb-5 relative z-0 overflow-hidden">
          {/* HEADER MELENGKUNG */}
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

          {/* LOKASI PERSEBARAN (FLOATING MAP OVER HEADER) */}
          <div className="px-4 min-[390px]:px-5 -mt-32 relative z-10 mb-4">
            <div className="bg-white rounded-[1.75rem] p-2.5 shadow-[0_18px_34px_-24px_rgba(6,95,70,0.42)] border border-white/80 overflow-hidden h-[208px]">
              <div className="px-1 pb-2">
                <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest leading-none">Lokasi Mesin</h2>
              </div>
              <div className="dashboard-map w-full h-[160px] rounded-[1.35rem] overflow-hidden bg-[#F0F4F2] relative">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={14}
                    options={{
                      disableDefaultUI: true,
                      styles: [
                        ...mapStyles,
                        { "elementType": "geometry", "stylers": [{ "color": "#f0f4f2" }] },
                        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#d1fae5" }] }
                      ]
                    }}
                  >
                    {machines.map((machine) => (
                      <MarkerF
                        key={machine.id}
                        position={{ lat: machine.latitude, lng: machine.longitude }}
                        title={machine.nama_tempat}
                        icon={{
                          path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
                          fillColor: machine.status === 'on' ? '#22c55e' : '#ef4444',
                          fillOpacity: 1,
                          strokeColor: "white",
                          strokeWeight: 4,
                          scale: 0.45,
                        }}
                      />
                    ))}
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-300 font-black text-[10px] tracking-widest uppercase">Memuat Peta...</div>
                )}

                <button className="absolute top-3 right-3 bg-white p-2.5 rounded-xl shadow-lg border border-emerald-50 text-emerald-700 hover:bg-emerald-50 active:scale-95">
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
                  <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Total Sampah Harian</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{weight}</span>
                    <span className="text-lg font-bold text-emerald-700">kg</span>
                  </div>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-[1rem] text-emerald-700 shadow-[0_10px_22px_-16px_rgba(6,95,70,0.7)]">
                  <FileUp className="w-5 h-5" />
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-widest">
                  <span className="text-slate-400">Target: 10kg</span>
                  <span className="text-emerald-700">80% TERCAPAI</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full w-[80%] transition-all duration-1000 ease-out shadow-inner"></div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* BAGIAN TENGAH DENGAN WATERMARK LOGO */}
        <div className="bg-white pt-6 pb-6 border-t border-slate-200/60 shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.05)] relative z-10 rounded-b-[1.75rem] overflow-hidden">
          {/* Watermark Logo Reburn */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-5 pointer-events-none">
            <div className="w-[180px] h-[180px] bg-[url('/logo-reburn.jpeg')] bg-contain bg-center bg-no-repeat mix-blend-multiply"></div>
          </div>
          
          {/* FITUR APLIKASI (GRID MENU) */}
          <section className="px-4 min-[390px]:px-5 relative z-10">
            <h2 className="text-[15px] font-black text-slate-800 mb-4 tracking-tight">Fitur Aplikasi</h2>
            <div className="grid grid-cols-4 gap-x-2 gap-y-5">

              {/* Item 1: Hubungkan Timbangan */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleConnectBluetooth}
                  className={`w-[68px] h-[68px] rounded-[1.5rem] flex items-center justify-center transition-all active:scale-95 border
                    ${btStatus === 'Connected' ? 'bg-blue-50 border-blue-400 text-blue-600' : 'bg-white border-slate-200 shadow-sm text-blue-600 hover:bg-slate-50'}`}
                >
                  <Bluetooth strokeWidth={2.5} className={`w-[28px] h-[28px] ${btStatus === 'Connecting' ? 'animate-spin' : ''}`} />
                </button>
                <span className="text-[10px] text-slate-800 text-center mt-2.5 font-semibold leading-tight">
                  {btStatus === 'Connected' ? 'Tersambung' : 'Hubungkan'}
                </span>
              </div>

              {/* Item 2: Unggah Data */}
              <div className="flex flex-col items-center">
                <Link href="/data" className="w-[68px] h-[68px] bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center justify-center text-purple-600 hover:bg-slate-50 active:scale-95 transition-all">
                  <FileUp strokeWidth={2.5} className="w-[28px] h-[28px]" />
                </Link>
                <span className="text-[10px] text-slate-800 text-center mt-2.5 font-semibold leading-tight">Unggah<br />Data</span>
              </div>

              {/* Item 3: Tambah Mesin */}
              <div className="flex flex-col items-center">
                <Link href="/add-machine" className="w-[68px] h-[68px] bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center justify-center text-emerald-600 hover:bg-slate-50 active:scale-95 transition-all">
                  <PlusSquare strokeWidth={2.5} className="w-[28px] h-[28px]" />
                </Link>
                <span className="text-[10px] text-slate-800 text-center mt-2.5 font-semibold leading-tight">Tambah<br />Mesin</span>
              </div>

              {/* Item 4: Riwayat Data */}
              <div className="flex flex-col items-center">
                <Link href="/data" className="w-[68px] h-[68px] bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center justify-center text-orange-500 hover:bg-slate-50 active:scale-95 transition-all">
                  <BarChart2 strokeWidth={2.5} className="w-[28px] h-[28px]" />
                </Link>
                <span className="text-[10px] text-slate-800 text-center mt-2.5 font-semibold leading-tight">Riwayat<br />Data</span>
              </div>

            </div>
          </section>
        </div>

        {/* OVERVIEW SECTION (BACKGROUND ABU-ABU) */}
        <div className="bg-[#F0F4F2] flex-1 pt-6 pb-24 border-t border-emerald-50 shadow-inner relative z-0">
          <section className="px-4 min-[390px]:px-5 space-y-5">
            <div>
              <h2 className="text-base font-black text-slate-800 mb-3 tracking-tight">Status Unit</h2>
              <div className="grid grid-cols-3 gap-2.5">

                {/* Card Total */}
                <div className="bg-slate-100/50 rounded-2xl p-3.5 sm:p-4 flex flex-col border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-white p-1.5 rounded-[0.6rem] border border-slate-200 shadow-sm">
                      <Server className="w-4 h-4 text-slate-700" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none mb-1">{totalMachines}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total</p>
                  </div>
                </div>

                {/* Card Aktif */}
                <div className="bg-emerald-50 rounded-2xl p-3.5 sm:p-4 flex flex-col border border-emerald-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-white p-1.5 rounded-[0.6rem] border border-emerald-100 shadow-sm">
                      <Activity className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-emerald-950 tracking-tighter leading-none mb-1">{activeMachines}</p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Aktif</p>
                  </div>
                </div>

                {/* Card Mati */}
                <div className="bg-red-50 rounded-2xl p-3.5 sm:p-4 flex flex-col border border-red-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-white p-1.5 rounded-[0.6rem] border border-red-100 shadow-sm">
                      <PowerOff className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-red-950 tracking-tighter leading-none mb-1">{inactiveMachines}</p>
                    <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Mati</p>
                  </div>
                </div>

              </div>
            </div>

            {/* LOG AKTIVITAS */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-black text-slate-800 tracking-tight">Log Aktivitas</h2>
                <Link href="/data" className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest hover:underline">
                  Lihat Semua
                </Link>
              </div>
              <div className="space-y-2.5">
                {isLoadingData ? (
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-400 font-semibold">Memuat data...</span>
                  </div>
                ) : machines.length === 0 ? (
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-400 font-semibold">Belum ada data mesin</span>
                  </div>
                ) : (
                  machines.slice(0, 5).map((machine) => (
                    <div key={machine.id} className="bg-white rounded-2xl px-4 py-3.5 border border-slate-100 shadow-sm flex items-center gap-3">
                      {/* Status dot */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${machine.status === 'on'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        {machine.status === 'on'
                          ? <Activity className="w-5 h-5 text-green-500" />
                          : <PowerOff className="w-5 h-5 text-red-500" />
                        }
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800 truncate leading-tight">{machine.nama_tempat || 'Mesin Incinerator'}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                          {machine.lokasi || `${machine.latitude?.toFixed(4)}, ${machine.longitude?.toFixed(4)}`}
                        </p>
                      </div>
                      {/* Badge */}
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${machine.status === 'on'
                        ? 'bg-green-50 text-green-600 border border-green-200'
                        : 'bg-red-50 text-red-500 border border-red-200'
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

      <BottomNav />
    </div>
  );
}
