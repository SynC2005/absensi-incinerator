// File: src/app/edit-machine/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Autocomplete, GoogleMap, MarkerF, useJsApiLoader, type Libraries } from '@react-google-maps/api';
import {
  ArrowLeft,
  CheckCircle,
  Info,
  LocateFixed,
  Loader2,
  Save,
  Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const libraries: Libraries = ['places'];
const defaultPosition = { lat: -6.9745, lng: 107.6305 };

type MachineRecord = {
  id: string;
  nama_tempat: string;
  latitude: number;
  longitude: number;
  status: string;
  lokasi?: string | null;
};

export default function EditMachinePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const machineId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [machine, setMachine] = useState<MachineRecord | null>(null);
  const [namaTempat, setNamaTempat] = useState('');
  const [mapCenter, setMapCenter] = useState(defaultPosition);
  const [markerPos, setMarkerPos] = useState(defaultPosition);
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  useEffect(() => {
    return () => {
      const pacContainers = document.querySelectorAll('.pac-container');
      pacContainers.forEach((container) => container.remove());
    };
  }, []);

  useEffect(() => {
    const fetchMachine = async () => {
      if (!machineId) return;

      setIsLoading(true);
      const { data, error } = await supabase
        .from('mesin_incinerator')
        .select('*')
        .eq('id', machineId)
        .single();

      setIsLoading(false);

      if (error || !data) {
        alert("Data unit tidak ditemukan.");
        router.push('/dashboard');
        return;
      }

      const nextPosition = {
        lat: Number.isFinite(Number(data.latitude)) ? Number(data.latitude) : defaultPosition.lat,
        lng: Number.isFinite(Number(data.longitude)) ? Number(data.longitude) : defaultPosition.lng,
      };

      setMachine(data);
      setNamaTempat(data.nama_tempat || '');
      setMapCenter(nextPosition);
      setMarkerPos(nextPosition);
    };

    fetchMachine();
  }, [machineId, router]);

  const handlePlaceChanged = () => {
    if (searchBox !== null) {
      const place = searchBox.getPlace();
      if (place.geometry && place.geometry.location) {
        const nextPosition = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMapCenter(nextPosition);
        setMarkerPos(nextPosition);
      }
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(nextPosition);
          setMarkerPos(nextPosition);
        },
        () => alert("Gagal mendapatkan lokasi dari perangkat Anda.")
      );
    } else {
      alert("Browser Anda tidak mendukung fitur Geolocation.");
    }
  };

  const handleSave = async () => {
    if (!machineId) return;

    if (!namaTempat.trim()) {
      alert("Nama Mesin wajib diisi!");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from('mesin_incinerator')
      .update({
        nama_tempat: namaTempat.trim(),
        latitude: markerPos.lat,
        longitude: markerPos.lng,
      })
      .eq('id', machineId);

    setIsSaving(false);

    if (error) {
      console.error(error);
      alert("Gagal menyimpan perubahan: " + error.message);
    } else {
      setIsSaved(true);
      setTimeout(() => router.push('/dashboard'), 900);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-svh bg-[#F0F4F2] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-800/50">Memuat Unit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#F0F4F2] flex justify-center font-sans overflow-x-hidden">
      <div className="w-full max-w-[26rem] sm:max-w-md flex flex-col relative z-10">
        <header className="flex items-center px-6 py-6 sticky top-0 z-20 backdrop-blur-xl bg-[#F0F4F2]/80 border-b border-emerald-900/5">
          <button
            onClick={() => router.back()}
            className="mr-4 text-emerald-950 hover:bg-emerald-100 p-2.5 rounded-2xl transition-colors -ml-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Edit Fasilitas</p>
            <h1 className="truncate text-xl font-black text-emerald-950 tracking-tight">
              {machine?.nama_tempat || 'Unit Mesin'}
            </h1>
          </div>
        </header>

        <div className="px-6 pt-3 pb-6 space-y-8 flex-grow">
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

          <section>
            <div className="flex items-center justify-between gap-3 mb-3 px-1">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" />
                <p className="text-xs font-bold text-emerald-800/60 uppercase tracking-widest">Tentukan Lokasi</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-900/40">
                {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}
              </span>
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
                        if (e.latLng) {
                          const nextPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                          setMarkerPos(nextPosition);
                          setMapCenter(nextPosition);
                        }
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
                type="button"
              >
                <LocateFixed className="w-5 h-5" />
              </button>
            </div>
          </section>

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
          </section>
        </div>

        <div className="sticky bottom-0 left-0 w-full p-6 pt-10 bg-gradient-to-t from-[#F0F4F2] via-[#F0F4F2] to-transparent z-20 pb-10">
          <button
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className={`w-full font-black py-4 rounded-[1.25rem] flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-xl uppercase tracking-widest text-sm
              ${isSaving || isSaved ? 'bg-emerald-100 text-emerald-500 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30'}`}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSaved ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isSaving ? 'Menyimpan...' : isSaved ? 'Tersimpan' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
