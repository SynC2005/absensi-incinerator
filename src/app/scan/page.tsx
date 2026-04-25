// File: src/app/scan/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode'; // Gunakan versi tanpa UI bawaan
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Power, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Zap,
  ZapOff
} from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [machineName, setMachineName] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'on' | 'off' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);

  

  useEffect(() => {
    // Inisialisasi scanner hanya jika belum ada ID yang terscan
    if (!scannedId) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { 
  fps: 25, // Meningkatkan kecepatan tangkapan
  qrbox: { width: 250, height: 250 },
  // Meminta resolusi HD agar QR yang kecil bisa terbaca
  videoConstraints: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    facingMode: "environment"
  }
};
      // Mulai kamera (menggunakan kamera belakang secara otomatis)
      html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        onScanSuccess
      ).catch((err) => {
        console.error("Gagal memulai kamera:", err);
        setError("Izin kamera ditolak atau tidak ditemukan.");
      });

      return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error);
        }
      };
    }
  }, [scannedId]);

  async function onScanSuccess(decodedText: string) {
    // Matikan kamera segera setelah scan berhasil
    if (scannerRef.current) {
      await scannerRef.current.stop();
    }

    try {
      const { data, error } = await supabase
        .from('mesin_incinerator')
        .select('nama_tempat, status')
        .eq('id', decodedText)
        .single();

      if (error || !data) {
        setError("Mesin tidak valid atau tidak terdaftar.");
        // Jika gagal, restart scanner setelah 3 detik
        setTimeout(() => window.location.reload(), 3000);
        return;
      }

      setScannedId(decodedText);
      setMachineName(data.nama_tempat);
      setSelectedStatus(data.status as 'on' | 'off');
    } catch (err) {
      setError("Koneksi bermasalah.");
    }
  }

  const handleConfirmStatus = async () => {
    if (!scannedId || !selectedStatus) return;
    setIsUpdating(true);
    const { error } = await supabase
      .from('mesin_incinerator')
      .update({ status: selectedStatus })
      .eq('id', scannedId);
    setIsUpdating(false);

    if (error) {
      alert("Gagal: " + error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-sans z-50">
      
      {/* OVERLAY HEADER (Transparent) */}
      <header className="absolute top-0 left-0 w-full flex items-center px-6 py-5 z-30 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={() => router.back()} className="mr-4 text-white p-2 -ml-2 bg-white/10 rounded-full backdrop-blur-md">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Scan QR Mesin</h1>
      </header>

      {!scannedId ? (
        /* UI SCANNER FULL SCREEN */
        <div className="relative w-full h-full">
          {/* Elemen Video Kamera */}
          <div id="reader" className="w-full h-full object-cover"></div>

          {/* FRAME OVERLAY (Area Fokus) */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            {/* Bagian Luar yang Gelap */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Kotak Transparan di Tengah */}
            <div className="relative w-64 h-64 border-2 border-white/50 rounded-[40px] overflow-hidden">
                {/* Garis Scan Berjalan */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#FF5A5F] shadow-[0_0_15px_#FF5A5F] animate-scan-line"></div>
                
                {/* Sudut Dekoratif */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FF5A5F] rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FF5A5F] rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#FF5A5F] rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#FF5A5F] rounded-br-xl"></div>
            </div>

            <p className="relative z-20 text-white text-sm font-medium mt-8 px-6 py-2 bg-black/20 backdrop-blur-md rounded-full">
              Posisikan QR Code di dalam kotak
            </p>
          </div>

          {error && (
            <div className="absolute bottom-10 left-6 right-6 z-30 bg-red-500 text-white p-4 rounded-2xl flex items-center gap-3 animate-bounce">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}
        </div>
      ) : (
        /* TAMPILAN PEMILIHAN STATUS (MODERN CARD) */
        <div className="absolute inset-0 bg-[#F8FAFC] z-40 flex flex-col animate-in slide-in-from-bottom duration-500">
           <div className="flex-grow p-8 flex flex-col items-center justify-center">
              <div className="bg-green-100 p-4 rounded-full mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">{machineName}</h2>
              <p className="text-slate-400 mb-10 text-center">Tentukan status operasional mesin incinerator saat ini</p>

              <div className="grid grid-cols-1 w-full gap-4">
                <button 
                  onClick={() => setSelectedStatus('on')}
                  className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                    selectedStatus === 'on' ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${selectedStatus === 'on' ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-300'}`}>
                      <Power className="w-6 h-6" />
                    </div>
                    <span className={`font-bold text-lg ${selectedStatus === 'on' ? 'text-green-700' : 'text-slate-400'}`}>Mesin ON</span>
                  </div>
                  {selectedStatus === 'on' && <CheckCircle2 className="text-green-500" />}
                </button>

                <button 
                  onClick={() => setSelectedStatus('off')}
                  className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                    selectedStatus === 'off' ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${selectedStatus === 'off' ? 'bg-red-500 text-white' : 'bg-slate-50 text-slate-300'}`}>
                      <Power className="w-6 h-6" />
                    </div>
                    <span className={`font-bold text-lg ${selectedStatus === 'off' ? 'text-red-700' : 'text-slate-400'}`}>Mesin OFF</span>
                  </div>
                  {selectedStatus === 'off' && <CheckCircle2 className="text-red-500" />}
                </button>
              </div>
           </div>

           <div className="p-8 bg-white border-t border-slate-100 rounded-t-[40px] shadow-2xl">
              <button 
                onClick={handleConfirmStatus}
                disabled={isUpdating}
                className="w-full bg-[#FF5A5F] hover:bg-[#ff484d] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-red-200"
              >
                {isUpdating ? <Loader2 className="animate-spin" /> : 'SIMPAN PERUBAHAN'}
              </button>
              <button onClick={() => window.location.reload()} className="w-full mt-4 text-slate-400 font-bold py-2">
                Batal & Scan Ulang
              </button>
           </div>
        </div>
      )}

      {/* CSS KHUSUS UNTUK ANIMASI SCAN LINE (Tambahkan di globals.css jika ingin lebih rapi) */}
      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan 2s linear infinite;
        }
        :global(#reader video) {
          object-fit: cover !important;
        }
      `}</style>
    </div>
  );
}