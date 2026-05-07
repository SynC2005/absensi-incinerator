'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import { ChevronLeft, Navigation, Activity, PowerOff, Map as MapIcon, Loader2, Download, Info, X } from 'lucide-react';

const containerStyle = { width: '100%', height: '100%' };
const center = { lat: -6.9745, lng: 107.6305 };
const mapStyles = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];

const LIBRARIES: any = ['places']; // tambahkan ini agar sama dengan dashboard

export default function FullMapPage() {
  const router = useRouter();
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: LIBRARIES,
  });

  useEffect(() => {
    const fetchMachines = async () => {
      const { data } = await supabase.from('mesin_incinerator').select('*');
      if (data) setMachines(data);
    };
    fetchMachines();
  }, []);

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const downloadQR = () => {
    if (!selectedMachine) return;
    const canvas = document.getElementById('qr-machine-details') as HTMLCanvasElement;
    if (!canvas) return;
    
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_Mesin_${selectedMachine.nama_tempat.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="relative w-full h-[100svh] bg-slate-100 overflow-hidden">
      
      {/* Tombol Kembali & Header */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-white/50">
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Sebaran Unit Incinerator</h1>
        </div>
      </div>

      {/* Legenda Peta */}
      <div className="absolute bottom-10 left-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-[2rem] shadow-2xl border border-white/50 w-48">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Legenda</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <span className="text-xs font-bold text-slate-700">Mesin Aktif</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
            <span className="text-xs font-bold text-slate-700">Mesin Mati</span>
          </div>
        </div>
      </div>

      {/* Tampilan Peta */}
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
          options={{ disableDefaultUI: true, styles: mapStyles }}
        >
          {machines.map((machine) => (
            <MarkerF
              key={machine.id}
              position={{ lat: machine.latitude, lng: machine.longitude }}
              onClick={() => setSelectedMachine(machine)}
              icon={{
                path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
                fillColor: machine.status === 'on' ? '#22c55e' : '#ef4444',
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 4,
                scale: 0.5,
              }}
            />
          ))}

          {/* Info Window saat Marker diklik */}
          {selectedMachine && (
            <InfoWindowF
              position={{ lat: selectedMachine.latitude, lng: selectedMachine.longitude }}
              onCloseClick={() => setSelectedMachine(null)}
            >
              <div className="p-2 min-w-[180px] font-sans">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${selectedMachine.status === 'on' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    {selectedMachine.status === 'on' ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{selectedMachine.nama_tempat}</h3>
                <p className="text-[10px] text-slate-500 mb-3">{selectedMachine.lokasi || 'Koordinat tercatat'}</p>
                
                <button 
                  onClick={() => openInGoogleMaps(selectedMachine.latitude, selectedMachine.longitude)}
                  className="w-full bg-emerald-600 text-white py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors mb-2"
                >
                  <Navigation className="w-3 h-3" />
                  DIREKSI
                </button>
                <button 
                  onClick={() => setShowDetailsModal(true)}
                  className="w-full bg-slate-100 text-emerald-800 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  <Info className="w-3 h-3" />
                  LEBIH BANYAK DETAIL
                </button>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Sinkronisasi Peta...</p>
        </div>
      )}

      {/* Modal Detail & QR Code */}
      {showDetailsModal && selectedMachine && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end min-[400px]:justify-center bg-emerald-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md mx-auto bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-emerald-950 mb-1 tracking-tight">{selectedMachine.nama_tempat}</h2>
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${selectedMachine.status === 'on' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs font-bold text-slate-500">{selectedMachine.lokasi || 'Koordinat tercatat'}</span>
            </div>

            {/* Kotak QR Code */}
            <div className="flex flex-col items-center bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 mb-6">
              <div className="bg-white p-3 rounded-2xl shadow-sm mb-3">
                <QRCodeCanvas 
                  id="qr-machine-details" 
                  value={selectedMachine.id} 
                  size={140} 
                  level={"H"}
                  includeMargin={true}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono font-bold tracking-widest break-all text-center px-4">
                ID: {selectedMachine.id}
              </p>
            </div>

            <button 
              onClick={downloadQR} 
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>UNDUH KODE QR</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}