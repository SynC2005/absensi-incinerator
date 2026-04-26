// File: src/components/UploadModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface Machine {
  id: string;
  nama_tempat: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
  isSubmitting: boolean;
  onSubmit: (data: { mesin_id: string; aksi: string; keterangan: string }) => void;
}

export default function UploadModal({ isOpen, onClose, machines, isSubmitting, onSubmit }: UploadModalProps) {
  const [formData, setFormData] = useState({
    mesin_id: '',
    aksi: 'Input Berat',
    keterangan: ''
  });

  // Set default mesin_id jika machines sudah di-load
  useEffect(() => {
    if (machines.length > 0 && !formData.mesin_id) {
      setFormData(prev => ({ ...prev, mesin_id: machines[0].id }));
    }
  }, [machines]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Modal ditutup oleh parent setelah submit selesai
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Input Data Manual</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mode Darurat / Offline</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">PILIH UNIT MESIN</label>
            <select 
              required
              value={formData.mesin_id}
              onChange={(e) => setFormData({...formData, mesin_id: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none font-medium"
            >
              {machines.map(m => (
                <option key={m.id} value={m.id}>{m.nama_tempat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 mt-4">JENIS AKTIVITAS</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, aksi: 'Input Berat', keterangan: ''})}
                className={`p-3 rounded-2xl border-2 font-bold text-sm transition-all outline-none ${formData.aksi === 'Input Berat' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-400'}`}
              >
                Berat Sampah
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, aksi: 'Ubah Status', keterangan: 'ON'})}
                className={`p-3 rounded-2xl border-2 font-bold text-sm transition-all outline-none ${formData.aksi === 'Ubah Status' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-400'}`}
              >
                Status Mesin
              </button>
            </div>
          </div>

          <div className="pt-2">
            {formData.aksi === 'Input Berat' ? (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">BERAT SAMPAH (KG)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.keterangan}
                    onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                    placeholder="Contoh: 12.5"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-black text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">KG</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">STATUS MESIN SAAT INI</label>
                <select 
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none font-black"
                >
                  <option value="ON">MENYALA (ON)</option>
                  <option value="OFF">MATI (OFF)</option>
                </select>
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 mt-6 shadow-lg shadow-emerald-200 active:scale-95 transition-transform disabled:bg-slate-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
            <span>SIMPAN DATA MANUAL</span>
          </button>
        </form>
      </div>
    </div>
  );
}