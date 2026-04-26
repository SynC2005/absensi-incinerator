// File: src/app/forbidden/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { 
  Lock, 
  HelpCircle, 
  ShieldAlert, 
  Info, 
  Headset, 
  LogOut, 
  ShieldCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForbiddenPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Lakukan Sign Out dari Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // 2. Clear localStorage/sessionStorage secara manual untuk memastikan
      window.localStorage.clear();
      
      // 3. Paksa redirect ke halaman login
      // Menggunakan window.location.href lebih ampuh untuk reset state total
      window.location.href = '/login';
    } catch (err) {
      console.error("Gagal keluar:", err);
      // Fallback jika API bermasalah
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
      
      {/* Container utama (Mobile Viewport) */}
      <div className="w-full max-w-md bg-[#F8FAFC] min-h-screen relative flex flex-col shadow-xl overflow-hidden">
        
        {/* HEADER */}
        <header className="flex justify-between items-center px-6 py-5 bg-transparent z-10">
          <div className="flex items-center gap-2 text-[#FF5A5F] font-semibold">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm tracking-tight">Sistem Keamanan</span>
          </div>
          <button className="text-slate-400 hover:text-slate-600 bg-slate-200/30 p-2 rounded-full transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="flex-grow flex flex-col items-center px-8 pt-10 pb-10">
          
          {/* ICON ILLUSTRATION */}
          <div className="relative mb-12">
            {/* Dotted border background */}
            <div className="absolute inset-0 border-[3px] border-dashed border-red-200 rounded-[3rem] scale-125 opacity-60 animate-spin-slow"></div>
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-red-400/10 blur-3xl rounded-full scale-150"></div>
            
            {/* Main Icon Box */}
            <div className="relative bg-white w-32 h-32 rounded-[2.8rem] flex items-center justify-center shadow-2xl shadow-red-100/80 z-10 border border-white">
              <ShieldAlert className="w-16 h-16 text-[#FF5A5F]" fill="#FF5A5F" color="white" strokeWidth={1} />
            </div>
          </div>

          {/* TYPOGRAPHY */}
          <h1 className="text-3xl font-black text-slate-900 text-center leading-[1.1] mb-5 tracking-tighter">
            Akses Belum<br />Diizinkan
          </h1>
          
          <p className="text-center text-slate-500 text-[15px] leading-relaxed mb-10 px-2">
            Email Anda belum terverifikasi sebagai <span className="font-bold text-[#FF5A5F]">Pegawai Aktif</span>. Akses terbatas ini diterapkan untuk menjaga keamanan data operasional.
          </p>

          {/* INFO CARD */}
          <div className="w-full bg-white border border-slate-100 rounded-[2rem] p-6 mb-10 shadow-sm">
            <div className="flex gap-4">
              <div className="bg-red-50 p-3 rounded-2xl h-fit shrink-0">
                <Info className="w-5 h-5 text-[#FF5A5F]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">Langkah Selanjutnya</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  Mintalah Admin untuk memperbarui status profil Anda di tabel <code className="bg-slate-100 px-1 rounded">profiles</code> menjadi <span className="text-slate-800 font-semibold italic">'pegawai'</span>.
                </p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="w-full space-y-4">
            <button className="w-full bg-[#FF5A5F] hover:bg-[#ff484d] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-red-200/50">
              <Headset className="w-5 h-5" />
              <span>Hubungi Admin IT</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar dari Akun</span>
            </button>
          </div>

          {/* SYSTEM STATUS */}
          <div className="mt-auto pt-10 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Sistem Aktif</span>
            </div>
          </div>

        </div>

        {/* BOTTOM NAV DIHAPUS - Diganti dengan dekorasi simpel agar tidak kosong */}
        <div className="h-6 w-full bg-transparent"></div>

      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg) scale(1.25); }
          to { transform: rotate(360deg) scale(1.25); }
        }
      `}</style>
    </div>
  );
}



