// File: src/app/add-machine/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, MarkerF, Autocomplete } from '@react-google-maps/api';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  LocateFixed, 
  Info, 
  Save,
  CheckCircle,
  Download
} from 'lucide-react';

const libraries: any = ['places'];

export default function AddMachinePage() {
  const router = useRouter();

  useEffect(() => {
    return () => {
      const pacContainers = document.querySelectorAll('.pac-container');
      pacContainers.forEach((container) => container.remove());
    };
  }, []);

  const [namaTempat, setNamaTempat] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: -6.9745, lng: 107.6305 }); 
  const [markerPos, setMarkerPos] = useState({ lat: -6.9745, lng: 107.6305 });
  
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null); 

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries,
  });

  const handlePlaceChanged = () => {
    if (searchBox !== null) {
      const place = searchBox.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMapCenter(newPos);
        setMarkerPos(newPos); 
      }
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(newPos);
          setMarkerPos(newPos);
        },
        () => alert("Gagal mendapatkan lokasi dari perangkat Anda.")
      );
    } else {
      alert("Browser Anda tidak mendukung fitur Geolocation.");
    }
  };

  const handleSave = async () => {
    if (!namaTempat.trim()) {
      alert("Nama Mesin wajib diisi!");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from('mesin_incinerator')
      .insert([
        {
          nama_tempat: namaTempat,
          latitude: markerPos.lat,
          longitude: markerPos.lng,
          status: 'off' 
        }
      ])
      .select()
      .single();

    setIsLoading(false);

    if (error) {
      console.error(error);
      alert("Gagal menyimpan data: " + error.message);
    } else {
      setSuccessData(data);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-machine') as HTMLCanvasElement;
    if (!canvas) return;
    
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_Mesin_${successData.nama_tempat.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (successData) {
    return (
      <div className="min-h-svh bg-[#F0F4F2] flex justify-center font-sans px-4 py-6 sm:items-center">
        <div className="w-full max-w-[26rem] bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-900/5 border border-white/50 flex flex-col items-center justify-center text-center relative overflow-hidden">
           
           <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
           
           <div className="bg-emerald-100 p-5 rounded-[1.5rem] mb-6 relative z-10 shadow-inner">
             <CheckCircle className="w-12 h-12 text-emerald-600" />
           </div>
           
           <h2 className="text-2xl font-black text-emerald-950 mb-2 relative z-10 tracking-tight">Fasilitas Terdaftar</h2>
           <p className="text-emerald-900/60 mb-8 max-w-[250px] relative z-10 text-sm">
             <strong>{successData.nama_tempat}</strong> berhasil ditambahkan ke jaringan.
           </p>
           
           {/* Kotak QR Code */}
           <div className="bg-[#F0F4F2] p-6 rounded-[2rem] shadow-inner mb-8 w-full max-w-[280px] relative z-10">
             <div className="bg-white p-4 rounded-[1.5rem] mb-4 flex justify-center shadow-sm">
               <QRCodeCanvas 
                 id="qr-machine" 
                 value={successData.id} 
                 size={180} 
                 level={"H"}
                 includeMargin={true}
               />
             </div>
             <p className="text-[10px] text-emerald-900/40 font-mono break-all leading-tight font-bold uppercase tracking-widest">
               ID: {successData.id}
             </p>
           </div>

           <button 
             onClick={downloadQR} 
             className="w-full max-w-[280px] bg-emerald-950 hover:bg-emerald-900 text-white font-black py-4 rounded-[1.25rem] mb-3 flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-transform relative z-10"
           >
             <Download className="w-5 h-5" /> <span>SIMPAN KODE QR</span>
           </button>
           
           <button 
             onClick={() => router.push('/dashboard')} 
             className="w-full max-w-[280px] bg-white border-2 border-emerald-50 hover:bg-emerald-50 text-emerald-700 font-bold py-4 rounded-[1.25rem] transition-colors relative z-10 uppercase tracking-wide text-sm"
           >
             KEMBALI KE DASBOR
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#F0F4F2] flex justify-center font-sans overflow-x-hidden">
      <div className="w-full max-w-[26rem] sm:max-w-md flex flex-col relative z-10">
        
        {/* HEADER */}
        <header className="flex items-center px-6 py-6 sticky top-0 z-20 backdrop-blur-xl bg-[#F0F4F2]/80 border-b border-emerald-900/5">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-emerald-950 hover:bg-emerald-100 p-2.5 rounded-2xl transition-colors -ml-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-emerald-950 tracking-tight">Tambah Fasilitas</h1>
        </header>

        <div className="px-6 pt-3 pb-6 space-y-8 flex-grow">
          
          {/* SEARCH BAR */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-emerald-600/50" />
            </div>
            {isLoaded ? (
              <Autocomplete
                onLoad={(ref) => setSearchBox(ref)}
                onPlaceChanged={handlePlaceChanged}
              >
                <input 
                  type="text" 
                  placeholder="Cari lokasi..." 
                  className="w-full bg-white border border-emerald-50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-[1.25rem] py-4 pl-12 pr-4 text-emerald-950 font-medium outline-none transition-all shadow-sm"
                />
              </Autocomplete>
            ) : (
              <input type="text" placeholder="Memuat peta..." disabled className="w-full bg-white/50 rounded-[1.25rem] py-4 pl-12 pr-4" />
            )}
          </div>

          {/* GOOGLE MAPS AREA */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Info className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-bold text-emerald-800/60 uppercase tracking-widest">Tentukan Lokasi</p>
            </div>
            <div className="relative w-full h-[300px] bg-white rounded-[2rem] overflow-hidden border border-emerald-50 shadow-xl shadow-emerald-900/5 p-2">
              <div className="w-full h-full rounded-[1.5rem] overflow-hidden">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={15}
                    options={{ disableDefaultUI: true }}
                    onClick={(e) => {
                      if (e.latLng) setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                    }}
                  >
                    <MarkerF 
                      position={markerPos} 
                      draggable={true} 
                      onDragEnd={(e) => {
                        if (e.latLng) setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                      }}
                    />
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-300 font-black text-[10px] tracking-widest uppercase bg-emerald-50">MEMUAT PETA...</div>
                )}
              </div>

              <button 
                onClick={handleGetCurrentLocation}
                className="absolute bottom-5 right-5 bg-emerald-950 p-4 rounded-2xl shadow-xl shadow-emerald-900/30 text-white hover:bg-emerald-800 transition-colors active:scale-95 z-10"
              >
                <LocateFixed className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* FORM INPUTS */}
          <section className="space-y-6">
            <div>
              <label className="block text-[11px] font-black text-emerald-800/60 uppercase tracking-widest mb-2 px-2">Nama Fasilitas</label>
              <input 
                type="text" 
                value={namaTempat}
                onChange={(e) => setNamaTempat(e.target.value)}
                placeholder="Contoh: Unit Sektor 7" 
                className="w-full bg-white border border-emerald-50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-[1.25rem] py-4 px-5 text-emerald-950 font-medium outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-emerald-800/60 uppercase tracking-widest mb-2 px-2">Catatan (Opsional)</label>
              <textarea 
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Tambahkan kondisi atau catatan operasional..." 
                rows={3}
                className="w-full bg-white border border-emerald-50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-[1.25rem] py-4 px-5 text-emerald-950 font-medium outline-none transition-all shadow-sm resize-none"
              ></textarea>
            </div>
          </section>

        </div>

        {/* FLOATING BOTTOM BUTTON */}
        <div className="sticky bottom-0 left-0 w-full p-6 pt-10 bg-gradient-to-t from-[#F0F4F2] via-[#F0F4F2] to-transparent z-20 pb-10">
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className={`w-full font-black py-4 rounded-[1.25rem] flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-xl uppercase tracking-widest text-sm
              ${isLoading ? 'bg-emerald-100 text-emerald-500 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30'}`}
          >
            {isLoading ? (
              <span className="animate-pulse">Mendaftarkan...</span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Simpan Fasilitas</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}



