// File: src/app/scan/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Power, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  ScanLine
} from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [machineName, setMachineName] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'on' | 'off' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scannedId) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 20, qrbox: { width: 250, height: 250 } } as any, 
        onScanSuccess,
        () => {} // ignore failure
      ).catch(() => setError("Akses kamera ditolak. Periksa izin browser Anda."));

      return () => {
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
      };
    }
  }, [scannedId]);

  async function onScanSuccess(decodedText: string) {
    if (scannerRef.current) await scannerRef.current.stop();

    try {
      const { data, error } = await supabase
        .from('mesin_incinerator')
        .select('nama_tempat, status')
        .eq('id', decodedText)
        .single();

      if (error || !data) {
        setError("QR Code tidak valid atau mesin tidak ditemukan.");
        setTimeout(() => window.location.reload(), 3000);
        return;
      }

      setScannedId(decodedText);
      setMachineName(data.nama_tempat);
      setSelectedStatus(data.status as 'on' | 'off');
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    }
  }

  const handleConfirmStatus = async () => {
    if (!scannedId || !selectedStatus) return;
    setIsUpdating(true);
    await supabase.from('mesin_incinerator').update({ status: selectedStatus }).eq('id', scannedId);
    setIsUpdating(false);
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-black flex justify-center z-50">
      {/* Container Utama untuk Mobile Viewport */}
      <div className="w-full max-w-md relative flex flex-col overflow-hidden bg-black">
        
        {/* HEADER (Floating) */}
        <header className="absolute top-0 left-0 w-full flex items-center px-6 py-8 z-30">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white/10 backdrop-blur-xl rounded-2xl text-white border border-white/20 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="ml-4">
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">Scan QR Mesin</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1 font-bold">Authentication Mode</p>
          </div>
        </header>

        {!scannedId ? (
          <div className="relative w-full h-full">
            {/* VIDEO FEED */}
            <div id="reader" className="w-full h-full [&_video]:object-cover"></div>

            {/* OVERLAY DESIGN */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
              {/* Lubang Fokus (Hole Punch Effect) */}
              <div className="w-72 h-72 relative">
                {/* Garis Sudut Modern */}
                <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-[#FF5A5F] rounded-tl-3xl"></div>
                <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-[#FF5A5F] rounded-tr-3xl"></div>
                <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-[#FF5A5F] rounded-bl-3xl"></div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-[#FF5A5F] rounded-br-3xl"></div>
                
                {/* Animasi Garis Scan */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#FF5A5F] to-transparent shadow-[0_0_15px_#FF5A5F] animate-scan-move absolute top-0"></div>
              </div>

              {/* Teks Petunjuk */}
              <div className="mt-12 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                <ScanLine className="w-4 h-4 text-[#FF5A5F] animate-pulse" />
                <p className="text-white text-xs font-medium tracking-wide">Posisikan kode di dalam area kotak</p>
              </div>
            </div>

            {error && (
              <div className="absolute bottom-10 left-6 right-6 z-30 bg-red-500/90 backdrop-blur-lg text-white p-4 rounded-3xl flex items-center gap-3 animate-bounce shadow-2xl">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
              </div>
            )}
          </div>
        ) : (
          /* ACTION SCREEN (Setelah Berhasil Scan) */
          <div className="absolute inset-0 bg-[#F8FAFC] z-40 flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="flex-grow p-8 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1 uppercase">{machineName}</h2>
              <p className="text-slate-400 text-sm font-medium mb-10">Pilih status operasional mesin incinerator</p>

              <div className="w-full space-y-4">
                {/* Pilihan ON */}
                <button 
                  onClick={() => setSelectedStatus('on')}
                  className={`w-full p-5 rounded-[2.5rem] border-2 flex items-center justify-between transition-all active:scale-[0.98] ${
                    selectedStatus === 'on' ? 'border-green-500 bg-green-50/50 shadow-lg shadow-green-100' : 'border-slate-100 bg-white text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${selectedStatus === 'on' ? 'bg-green-500 text-white' : 'bg-slate-50'}`}>
                      <Power className="w-6 h-6" />
                    </div>
                    <span className={`text-lg font-bold ${selectedStatus === 'on' ? 'text-green-900' : 'text-slate-400'}`}>Mesin Hidup (ON)</span>
                  </div>
                  {selectedStatus === 'on' && <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
                </button>

                {/* Pilihan OFF */}
                <button 
                  onClick={() => setSelectedStatus('off')}
                  className={`w-full p-5 rounded-[2.5rem] border-2 flex items-center justify-between transition-all active:scale-[0.98] ${
                    selectedStatus === 'off' ? 'border-red-500 bg-red-50/50 shadow-lg shadow-red-100' : 'border-slate-100 bg-white text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${selectedStatus === 'off' ? 'bg-red-500 text-white' : 'bg-slate-50'}`}>
                      <Power className="w-6 h-6" />
                    </div>
                    <span className={`text-lg font-bold ${selectedStatus === 'off' ? 'text-red-900' : 'text-slate-400'}`}>Mesin Mati (OFF)</span>
                  </div>
                  {selectedStatus === 'off' && <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
                </button>
              </div>
            </div>

            <div className="p-8 pb-12 bg-white border-t border-slate-100 rounded-t-[3.5rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
              <button 
                onClick={handleConfirmStatus}
                disabled={isUpdating}
                className="w-full bg-[#FF5A5F] hover:bg-[#ff484d] text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-red-200/50 active:scale-95 transition-transform"
              >
                {isUpdating ? <Loader2 className="animate-spin" /> : 'KONFIRMASI STATUS'}
              </button>
              <button onClick={() => window.location.reload()} className="w-full mt-4 text-slate-400 font-bold text-sm tracking-wider uppercase">
                Batal & Scan Ulang
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scan-move {
          0% { top: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-move {
          animation: scan-move 2.5s ease-in-out infinite;
        }
        :global(#reader video) {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
      `}</style>
    </div>
  );
}