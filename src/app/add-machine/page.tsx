// File: src/app/add-machine/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
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
  Download,
  MapPin
} from 'lucide-react';

// Wajib diletakkan di luar komponen agar tidak terjadi infinite loop saat memuat Maps
const libraries: any = ['places'];


export default function AddMachinePage() {
  const router = useRouter();

  // --- KODE BARU: PEMBERSIH HANTU DROPDOWN ---
  useEffect(() => {
    // Fungsi return ini akan dijalankan otomatis tepat SAAT komponen akan dihancurkan (pindah halaman)
    return () => {
      const pacContainers = document.querySelectorAll('.pac-container');
      pacContainers.forEach((container) => container.remove());
    };
  }, []);

  // State untuk form & peta
  const [namaTempat, setNamaTempat] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: -6.9745, lng: 107.6305 }); // Default: Telkom Univ
  const [markerPos, setMarkerPos] = useState({ lat: -6.9745, lng: 107.6305 });
  
  // State sistem
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null); // Menyimpan data mesin setelah berhasil

  // Load Google Maps dengan plugin 'places' untuk fitur Search
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string, // Gunakan env variable
  libraries: libraries,
  });

  // --- LOGIKA PETA ---
  const handlePlaceChanged = () => {
    if (searchBox !== null) {
      const place = searchBox.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMapCenter(newPos);
        setMarkerPos(newPos); // Pindahkan pin otomatis ke tempat yang dicari
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

  // --- LOGIKA SIMPAN KE DATABASE ---
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
          status: 'off' // Default saat mesin baru dibuat
        }
      ])
      .select()
      .single();

    setIsLoading(false);

    if (error) {
      console.error(error);
      alert("Gagal menyimpan data: " + error.message);
    } else {
      // Jika berhasil, tampilkan layar sukses
      setSuccessData(data);
    }
  };

  // --- LOGIKA DOWNLOAD QR CODE ---
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

  // ==============================================================
  // TAMPILAN 1: LAYAR SUKSES & QR CODE (Muncul setelah data disimpan)
  // ==============================================================
  if (successData) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
        <div className="w-full max-w-md bg-[#F8FAFC] min-h-screen relative flex flex-col shadow-xl">
          <div className="p-6 flex flex-col items-center justify-center flex-grow text-center mt-10">
             <div className="bg-green-100 p-5 rounded-full mb-6">
               <CheckCircle className="w-12 h-12 text-green-500" />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Mesin Tersimpan!</h2>
             <p className="text-slate-500 mb-8 max-w-[250px]">
               Data <strong>{successData.nama_tempat}</strong> berhasil dimasukkan ke sistem.
             </p>
             
             {/* Kotak QR Code */}
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 w-full max-w-[280px]">
               <div className="bg-slate-50 p-4 rounded-2xl mb-4 flex justify-center border border-slate-100">
                 <QRCodeCanvas 
                   id="qr-machine" 
                   value={successData.id} // <--- ID UUID Mesin disematkan ke dalam QR
                   size={200} 
                   level={"H"}
                   includeMargin={true}
                 />
               </div>
               <p className="text-[10px] text-slate-400 font-mono break-all leading-tight">
                 ID: {successData.id}
               </p>
             </div>

             <button 
               onClick={downloadQR} 
               className="w-full max-w-[280px] bg-[#FF5A5F] hover:bg-[#ff484d] text-white font-semibold py-4 rounded-2xl mb-3 flex items-center justify-center gap-2 shadow-lg shadow-red-200/50"
             >
               <Download className="w-5 h-5" /> Download QR
             </button>
             
             <button 
               onClick={() => router.push('/dashboard')} 
               className="w-full max-w-[280px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-4 rounded-2xl transition-colors"
             >
               Kembali ke Dashboard
             </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // TAMPILAN 2: FORM TAMBAH MESIN UTAMA
  // ==============================================================
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-[#F8FAFC] min-h-screen relative flex flex-col shadow-xl overflow-hidden">
        
        {/* HEADER */}
        <header className="flex items-center px-6 py-5 bg-white border-b border-slate-100 sticky top-0 z-20">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-[#FF5A5F] hover:bg-red-50 p-2 rounded-full transition-colors -ml-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Tambah Mesin</h1>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto pb-32">
          
          {/* SEARCH BAR DENGAN AUTOCOMPLETE */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            {isLoaded ? (
              <Autocomplete
                onLoad={(ref) => setSearchBox(ref)}
                onPlaceChanged={handlePlaceChanged}
              >
                <input 
                  type="text" 
                  placeholder="Cari lokasi atau alamat..." 
                  className="w-full bg-slate-100 border-transparent focus:border-[#FF5A5F] focus:bg-white focus:ring-2 focus:ring-red-100 rounded-2xl py-3.5 pl-11 pr-4 text-slate-700 outline-none transition-all"
                />
              </Autocomplete>
            ) : (
              <input type="text" placeholder="Memuat pencarian..." disabled className="w-full bg-slate-100 rounded-2xl py-3.5 pl-11 pr-4" />
            )}
          </div>

          {/* GOOGLE MAPS AREA */}
          <div>
            <div className="relative w-full h-[320px] bg-[#E8F0F8] rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={15}
                  options={{ disableDefaultUI: true }}
                  onClick={(e) => {
                    // Jika map diklik, pindahkan pin ke titik tersebut
                    if (e.latLng) setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                  }}
                >
                  <MarkerF 
                    position={markerPos} 
                    draggable={true} // Membuat pin bisa diseret manual
                    onDragEnd={(e) => {
                      if (e.latLng) setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                    }}
                  />
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Memuat Peta...</div>
              )}

              {/* Tombol Target Lokasi Saat Ini */}
              <button 
                onClick={handleGetCurrentLocation}
                className="absolute bottom-4 right-4 bg-white p-3.5 rounded-2xl shadow-lg text-[#B84A4A] hover:bg-slate-50 transition-colors active:scale-95 z-10"
              >
                <LocateFixed className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-4 text-slate-600 px-1">
              <Info className="w-4 h-4 text-[#8B6B66]" />
              <p className="text-sm">Geser pin merah atau tap peta untuk set titik</p>
            </div>
          </div>

          {/* FORM INPUT: NAMA MESIN */}
          <div>
            <label className="block text-base font-medium text-slate-700 mb-2 px-1">Nama Mesin</label>
            <input 
              type="text" 
              value={namaTempat}
              onChange={(e) => setNamaTempat(e.target.value)}
              placeholder="Contoh: Generator Unit 04" 
              className="w-full bg-slate-100 border-transparent focus:border-[#FF5A5F] focus:bg-white focus:ring-2 focus:ring-red-100 rounded-2xl py-3.5 px-4 text-slate-700 outline-none transition-all"
            />
          </div>

          {/* FORM INPUT: DESKRIPSI (Hanya UI, tidak disimpan ke database) */}
          <div>
            <label className="block text-base font-medium text-slate-700 mb-2 px-1">Deskripsi</label>
            <textarea 
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Masukkan detail kondisi atau catatan lokasi..." 
              rows={3}
              className="w-full bg-slate-100 border-transparent focus:border-[#FF5A5F] focus:bg-white focus:ring-2 focus:ring-red-100 rounded-2xl py-3.5 px-4 text-slate-700 outline-none transition-all resize-none"
            ></textarea>
          </div>

        </div>

        {/* FLOATING BOTTOM BUTTON */}
        <div className="absolute bottom-0 left-0 w-full p-6 pt-12 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent z-20">
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className={`w-full font-semibold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-red-200/50 
              ${isLoading ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-[#FF5A5F] hover:bg-[#ff484d] text-white'}`}
          >
            <Save className="w-6 h-6" />
            <span>{isLoading ? 'Menyimpan...' : 'Simpan Mesin'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}