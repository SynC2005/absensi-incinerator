// File: src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase'; // <--- IMPORT SUPABASE DI SINI
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

const containerStyle = { width: '100%', height: '300px' };
const center = { lat: -6.9745, lng: 107.6305 };
const mapStyles = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

const libraries: any = ['places'];

export default function DashboardPage() {
  const [btStatus, setBtStatus] = useState<'Disconnected' | 'Connecting' | 'Connected'>('Disconnected');
  const [weight, setWeight] = useState<number>(0);
  
  // --- STATE BARU UNTUK DATA MESIN DARI DATABASE ---
  const [machines, setMachines] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string, // Gunakan env variable
  libraries: libraries,
  });

  // --- FUNGSI MENGAMBIL DATA DARI SUPABASE ---
  useEffect(() => {
    const fetchMachines = async () => {
      // Ambil semua data dari tabel mesin_incinerator, urutkan dari yang terbaru
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

  // Menghitung Status Mesin Otomatis (Sekarang berdasarkan data asli)
  const totalMachines = machines.length;
  const activeMachines = machines.filter(m => m.status === 'on').length;
  const inactiveMachines = machines.filter(m => m.status === 'off').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center">
    <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative shadow-lg">
        {/* GREETING */}
        <div>
          <p className="text-sm font-medium text-[#B84A4A] mb-1">Good Morning, Waste Officer</p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Dashboard</h1>
        </div>

        {/* SECTION: DATA BANYAK SAMPAH */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-wider">DATA BANYAK SAMPAH</h2>
            <button className="text-sm text-[#FF5A5F] hover:underline">View All</button>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Current Weight Collection</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-light text-slate-800 tracking-tighter">{weight}</span>
                  <span className="text-2xl font-medium text-slate-400">kg</span>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded-2xl">
                <FileUp className="w-6 h-6 text-[#FF5A5F]" />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Daily Target: 10kg</span>
                <span className="text-[#FF5A5F] font-bold">80%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF5A5F] rounded-full w-[80%]"></div>
              </div>
            </div>

            <button 
              disabled={btStatus !== 'Connected'}
              className={`w-full font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all 
                ${btStatus === 'Connected' 
                  ? 'bg-[#FF5A5F] hover:bg-[#ff484d] text-white shadow-md shadow-red-200 active:scale-[0.98]' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}
            >
              <PlusCircle className="w-5 h-5" />
              <span>UPLOAD NEW DATA</span>
            </button>

            <button 
              onClick={handleConnectBluetooth}
              disabled={btStatus === 'Connected'}
              className={`w-full mt-3 font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all 
                ${btStatus === 'Connected'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 active:scale-[0.98]'
                }`}
            >
              {btStatus === 'Disconnected' && <><Bluetooth className="w-5 h-5" /> Hubungkan Timbangan ESP32</>}
              {btStatus === 'Connecting' && <><BluetoothSearching className="w-5 h-5 animate-pulse" /> Mencari Perangkat...</>}
              {btStatus === 'Connected' && <><BluetoothConnected className="w-5 h-5" /> Timbangan Terhubung</>}
            </button>
          </div>
        </section>

        {/* SECTION: GOOGLE MAPS MONITORING */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-wider">MONITORING LOKASI MESIN</h2>
            <div className="flex gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> ON</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> OFF</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-2 shadow-md border border-slate-100 overflow-hidden h-[320px]">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14} // Zoom diperkecil sedikit agar mencakup mesin yang jauh
                options={{ disableDefaultUI: true, styles: mapStyles }}
              >
                {/* Looping Peta menggunakan kolom database asli (latitude, longitude, nama_tempat) */}
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
                      strokeWeight: 2,
                      scale: 0.4,
                    }}
                  />
                ))}
              </GoogleMap>
            ) : (
              <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm">
                Memuat Peta...
              </div>
            )}
          </div>
        </section>

        {/* SECTION: RINGKASAN STATUS MESIN */}
        <section>
          <h2 className="text-sm font-bold text-slate-900 tracking-wider mb-4">RINGKASAN STATUS</h2>
          {isLoadingData ? (
            <div className="text-center text-sm text-slate-400 py-4 animate-pulse">Menghitung data mesin...</div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 border border-slate-100">
                  <Server className="w-5 h-5 text-slate-500" />
                </div>
                <span className="text-2xl font-bold text-slate-800">{totalMachines}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total</span>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2 border border-green-100">
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-2xl font-bold text-green-600">{activeMachines}</span>
                <span className="text-[10px] font-bold text-green-600/70 uppercase tracking-wider mt-1">Aktif</span>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-2 border border-red-100">
                  <PowerOff className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-2xl font-bold text-red-500">{inactiveMachines}</span>
                <span className="text-[10px] font-bold text-red-500/70 uppercase tracking-wider mt-1">Mati</span>
              </div>
            </div>
          )}
        </section>

        {/* SECTION: DAFTAR DETAIL MESIN */}
        <section>
          <h2 className="text-sm font-bold text-slate-900 tracking-wider mb-4 mt-8">DETAIL MESIN</h2>
          {isLoadingData ? (
            <div className="space-y-3">
               <div className="w-full h-20 bg-slate-200 animate-pulse rounded-2xl"></div>
               <div className="w-full h-20 bg-slate-200 animate-pulse rounded-2xl"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {machines.map((machine) => (
                <MachineCard 
                  key={machine.id}
                  name={machine.nama_tempat}      // Disesuaikan dengan nama kolom Database
                  lat={machine.latitude}          // Disesuaikan dengan nama kolom Database
                  lng={machine.longitude}         // Disesuaikan dengan nama kolom Database
                  status={machine.status}
                />
              ))}
              
              {machines.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-6 bg-white rounded-2xl border border-slate-100">
                  Belum ada mesin yang terdaftar.
                </div>
              )}
            </div>
          )}
        </section>

      </div>
      <BottomNav />
    </div>
  );
}