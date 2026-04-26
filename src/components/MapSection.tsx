// File: src/components/MapSection.tsx
'use client';

import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

interface Machine {
  id: string;
  nama_tempat: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface MapSectionProps {
  isLoaded: boolean;
  machines: Machine[];
}

const containerStyle = { width: '100%', height: '100%' };
const center = { lat: -6.9745, lng: 107.6305 };
const mapStyles = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

export default function MapSection({ isLoaded, machines }: MapSectionProps) {
  return (
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
            <div className="w-full h-full flex items-center justify-center text-emerald-300 font-black text-[10px] tracking-widest uppercase animate-pulse">
              Memuat Peta...
            </div>
          )}

          <button className="absolute top-3 right-3 bg-white p-2.5 rounded-xl shadow-lg border border-emerald-50 text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all">
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}