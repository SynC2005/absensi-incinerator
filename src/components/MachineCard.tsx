// File: src/components/MachineCard.tsx
import { MapPin, Activity, PowerOff } from 'lucide-react';

interface MachineCardProps {
  name: string;
  lat: number;
  lng: number;
  status: string;
  lokasi?: string; // Tambahkan opsional lokasi jika ada teks alamat
}

export default function MachineCard({ name, lat, lng, status, lokasi }: MachineCardProps) {
  return (
    <div className="bg-white rounded-[1.75rem] px-4 py-3.5 border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all group">
      
      {/* Container Ikon dengan Indikator ON/OFF */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-105 ${
        status === 'on'
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}>
        {status === 'on'
          ? <Activity className="w-5 h-5 text-green-500" />
          : <PowerOff className="w-5 h-5 text-red-500" />
        }
      </div>
      
      {/* Info Nama & Lokasi / Koordinat */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-slate-800 truncate leading-tight">
          {name || 'Mesin Incinerator'}
        </p>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate uppercase tracking-tight">
          {lokasi || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
        </p>
      </div>
      
      {/* Badge Status */}
      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 border ${
        status === 'on'
          ? 'bg-green-50 text-green-600 border-green-200 shadow-sm shadow-green-100'
          : 'bg-red-50 text-red-500 border-red-200'
      }`}>
        {status === 'on' ? 'Aktif' : 'Mati'}
      </span>
    </div>
  );
}