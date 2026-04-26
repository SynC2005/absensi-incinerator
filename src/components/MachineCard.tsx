// File: src/components/MachineCard.tsx
import { MapPin } from 'lucide-react';

// Menentukan tipe data yang dibutuhkan oleh komponen ini
interface MachineCardProps {
  name: string;
  lat: number;
  lng: number;
  status: string;
}

export default function MachineCard({ name, lat, lng, status }: MachineCardProps) {
  return (
    <div className="bg-white rounded-[2rem] p-5 flex items-center justify-between shadow-sm border border-emerald-50 hover:shadow-md hover:border-emerald-100 transition-all group">
      <div className="flex items-center gap-4">
        {/* Ikon MapPin */}
        <div className={`p-4 rounded-2xl border group-hover:scale-110 transition-transform ${
          status === 'on' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <MapPin className={`w-6 h-6 ${status === 'on' ? 'text-green-600' : 'text-red-500'}`} />
        </div>
        
        {/* Nama dan Koordinat */}
        <div>
          <h3 className="font-bold text-foreground text-lg leading-tight mb-1">
            {name}
          </h3>
          <p className="text-[10px] text-emerald-800/40 font-black uppercase tracking-widest">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Indikator Status ON/OFF */}
      <div>
        {status === 'on' ? (
          <div className="bg-green-500 text-white px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest shadow-lg shadow-green-500/20">
            AKTIF
          </div>
        ) : (
          <div className="bg-red-500 text-white px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest shadow-lg shadow-red-500/20">
            MATI
          </div>
        )}
      </div>
    </div>
  );
}
