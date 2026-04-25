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
    <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Ikon MapPin */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <MapPin className="w-6 h-6 text-slate-400" />
        </div>
        
        {/* Nama dan Koordinat */}
        <div>
          <h3 className="font-medium text-slate-800 text-lg leading-tight mb-1">
            {name}
          </h3>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            {lat}, {lng}
          </p>
        </div>
      </div>

      {/* Indikator Status ON/OFF */}
      <div>
        {status === 'on' ? (
          <div className="bg-green-50 text-green-600 border border-green-100 px-4 py-2 rounded-xl text-xs font-bold tracking-wider">
            ON
          </div>
        ) : (
          <div className="bg-red-50 text-red-500 border border-red-100 px-4 py-2 rounded-xl text-xs font-bold tracking-wider">
            OFF
          </div>
        )}
      </div>
    </div>
  );
}