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
    <div className="fixed inset-0 bg-black flex justify-center z-50 font-sans">
      <div className="w-full max-w-[26rem] sm:max-w-md relative flex flex-col overflow-hidden bg-black">
        
        {/* HEADER (Floating) */}
        <header className="absolute top-0 left-0 w-full flex items-center px-6 py-8 z-30">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white/10 backdrop-blur-xl rounded-2xl text-white border border-white/20 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="ml-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest">Mode Verifikasi</span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight leading-none">Pindai QR Fasilitas</h1>
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
                {/* Garis Sudut Emerald Modern */}
                <div className="absolute -top-1 -left-1 w-10 h-10 border-t-[5px] border-l-[5px] border-emerald-400 rounded-tl-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <div className="absolute -top-1 -right-1 w-10 h-10 border-t-[5px] border-r-[5px] border-emerald-400 rounded-tr-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-[5px] border-l-[5px] border-emerald-400 rounded-bl-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-[5px] border-r-[5px] border-emerald-400 rounded-br-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                
                {/* Animasi Garis Scan Emerald */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#34d399] animate-scan-move absolute top-0"></div>
              </div>

              {/* Teks Petunjuk */}
              <div className="mt-12 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3">
                <ScanLine className="w-4 h-4 text-emerald-400 animate-pulse" />
                <p className="text-white text-xs font-medium tracking-wide">Arahkan kode ke dalam bingkai</p>
              </div>
            </div>

            {error && (
              <div className="absolute bottom-10 left-6 right-6 z-30 bg-red-500/90 backdrop-blur-lg text-white p-4 rounded-[1.5rem] flex items-center gap-3 shadow-2xl">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
              </div>
            )}
          </div>
        ) : (
          /* ACTION SCREEN (Setelah Berhasil Scan) */
          <div className="absolute inset-0 bg-[#F0F4F2] z-40 flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="flex-grow px-6 py-10 flex flex-col items-center justify-center relative">
              
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-300/30 rounded-full blur-[80px]"></div>

              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/5 relative z-10 border border-emerald-50">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-emerald-950 tracking-tighter mb-1 uppercase text-center relative z-10">{machineName}</h2>
              <p className="text-emerald-800/50 text-[11px] font-bold tracking-widest uppercase mb-10 relative z-10 text-center">Atur Status Operasional</p>

              <div className="w-full space-y-4 relative z-10">
                {/* Pilihan ON */}
                <button 
                  onClick={() => setSelectedStatus('on')}
                  className={`w-full p-5 rounded-[2rem] border-[3px] flex items-center justify-between transition-all active:scale-[0.98] ${
                    selectedStatus === 'on' ? 'border-emerald-500 bg-white shadow-xl shadow-emerald-900/10' : 'border-white bg-white/50 text-emerald-900/40 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-[1.25rem] ${selectedStatus === 'on' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-900/40'}`}>
                      <Power className="w-6 h-6" />
                    </div>
                    <span className={`text-lg font-black tracking-tight ${selectedStatus === 'on' ? 'text-emerald-950' : 'text-emerald-900/40'}`}>MENYALA</span>
                  </div>
                  {selectedStatus === 'on' && <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
                </button>

                {/* Pilihan OFF */}
                <button 
                  onClick={() => setSelectedStatus('off')}
                  className={`w-full p-5 rounded-[2rem] border-[3px] flex items-center justify-between transition-all active:scale-[0.98] ${
                    selectedStatus === 'off' ? 'border-orange-500 bg-white shadow-xl shadow-orange-900/10' : 'border-white bg-white/50 text-emerald-900/40 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-[1.25rem] ${selectedStatus === 'off' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-emerald-50 text-emerald-900/40'}`}>
                      <Power className="w-6 h-6" />
                    </div>
                    <span className={`text-lg font-black tracking-tight ${selectedStatus === 'off' ? 'text-orange-950' : 'text-emerald-900/40'}`}>MATI</span>
                  </div>
                  {selectedStatus === 'off' && <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
                </button>
              </div>
            </div>

            <div className="p-6 pb-12 bg-white rounded-t-[3rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] border-t border-emerald-50 z-20">
              <button 
                onClick={handleConfirmStatus}
                disabled={isUpdating}
                className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-transform text-sm uppercase tracking-widest"
              >
                {isUpdating ? <Loader2 className="animate-spin w-5 h-5" /> : 'KONFIRMASI STATUS'}
              </button>
              <button onClick={() => window.location.reload()} className="w-full mt-5 text-emerald-800/40 font-bold text-[10px] tracking-widest uppercase hover:text-emerald-800 transition-colors">
                Batal & Pindai Ulang
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



