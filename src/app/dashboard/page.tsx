// File: src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { 
  PlusCircle, 
  FileUp, 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothSearching,
  Server,
  Activity,
  PowerOff
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import MachineCard from '@/components/MachineCard';

const containerStyle = { 
  width: '100%', 
  height: '280px' 
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

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries,
  });

  useEffect(() => {
    // Fix untuk bug layar memanjang: paksa scroll ke atas & trigger resize
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

    fetchMachines();
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
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center overflow-x-hidden">
      {/* Kontainer Utama (Mobile Max Width) */}
      <div className="w-full max-w-md bg-[#F8FAFC] min-h-screen flex flex-col relative">
        
        {/* Konten dengan Spacing yang Rapi */}
        <div className="flex flex-col space-y-9 px-6 pt-10 pb-40">
          
          {/* GREETING */}
          <header>
            <p className="text-[10px] font-black text-[#FF5A5F] uppercase tracking-[0.2em] mb-2">
              Management System
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
              Your Dashboard
            </h1>
          </header>

          {/* SECTION: DATA BANYAK SAMPAH */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Koleksi Sampah</h2>
              <button className="text-xs font-bold text-[#FF5A5F]">View History</button>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-7 shadow-xl shadow-slate-200/50 border border-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Total Berat Hari Ini</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-black text-slate-800 tracking-tighter">{weight}</span>
                    <span className="text-xl font-bold text-slate-300">kg</span>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl">
                  <FileUp className="w-6 h-6 text-[#FF5A5F]" />
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-wide">
                  <span className="text-slate-400">Target: 10kg</span>
                  <span className="text-[#FF5A5F]">80% Reach</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF5A5F] rounded-full w-[80%] shadow-[0_0_8px_rgba(255,90,95,0.4)]"></div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  disabled={btStatus !== 'Connected'}
                  className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95
                    ${btStatus === 'Connected' 
                      ? 'bg-[#FF5A5F] text-white shadow-lg shadow-red-100' 
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>UPLOAD DATA BARU</span>
                </button>

                <button 
                  onClick={handleConnectBluetooth}
                  disabled={btStatus === 'Connected'}
                  className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95
                    ${btStatus === 'Connected'
                      ? 'bg-blue-50 text-blue-500 border border-blue-100'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                    }`}
                >
                  <Bluetooth className="w-5 h-5" />
                  <span>{btStatus === 'Disconnected' ? 'Koneksi Timbangan' : btStatus === 'Connecting' ? 'Mencari...' : 'Timbangan Aktif'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* SECTION: GOOGLE MAPS */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Monitoring Lokasi</h2>
            <div className="bg-white rounded-[2.5rem] p-2 shadow-xl shadow-slate-200/50 border-4 border-white overflow-hidden h-[320px]">
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
                        fillColor: machine.status === 'on' ? '#22c55e' : '#ef4444',
                        fillOpacity: 1,
                        strokeColor: "white",
                        strokeWeight: 3,
                        scale: 0.4,
                      }}
                    />
                  ))}
                </GoogleMap>
              ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 font-bold text-xs">LOADING MAP...</div>
              )}
            </div>
          </section>

          {/* SECTION: RINGKASAN STATUS */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Statistik Mesin</h2>
            <div className="grid grid-cols-3 gap-4">
               {/* Total */}
               <div className="bg-white rounded-3xl py-6 flex flex-col items-center border border-slate-100 shadow-sm">
                  <Server className="w-5 h-5 text-slate-300 mb-2" />
                  <span className="text-2xl font-black text-slate-800">{totalMachines}</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Total</span>
               </div>
               {/* Aktif */}
               <div className="bg-white rounded-3xl py-6 flex flex-col items-center border border-green-50 shadow-sm">
                  <Activity className="w-5 h-5 text-green-400 mb-2" />
                  <span className="text-2xl font-black text-green-600">{activeMachines}</span>
                  <span className="text-[8px] font-black text-green-500/60 uppercase mt-1">Aktif</span>
               </div>
               {/* Mati */}
               <div className="bg-white rounded-3xl py-6 flex flex-col items-center border border-red-50 shadow-sm">
                  <PowerOff className="w-5 h-5 text-red-400 mb-2" />
                  <span className="text-2xl font-black text-red-500">{inactiveMachines}</span>
                  <span className="text-[8px] font-black text-red-500/60 uppercase mt-1">Mati</span>
               </div>
            </div>
          </section>

          {/* SECTION: DETAIL MESIN (LIST) */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Daftar Unit</h2>
            <div className="flex flex-col gap-3">
              {isLoadingData ? (
                <div className="w-full h-24 bg-white animate-pulse rounded-[2rem]"></div>
              ) : (
                machines.map((machine) => (
                  <MachineCard 
                    key={machine.id}
                    name={machine.nama_tempat}
                    lat={machine.latitude}
                    lng={machine.longitude}
                    status={machine.status}
                  />
                ))
              )}
            </div>
          </section>

        </div>
      </div>

      <BottomNav />
    </div>
  );
}