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
  Home, 
  LogIn 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // Jika nanti tombol keluar dihubungkan ke Supabase

export default function ForbiddenPage() {
  const router = useRouter();

  const handleLogout = async () => {
    // Fungsi untuk keluar (sign out) jika user tersangkut di sesi yang salah
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
      
      {/* Container utama (Mobile Viewport) */}
      <div className="w-full max-w-md bg-[#F8FAFC] min-h-screen relative flex flex-col shadow-xl overflow-hidden">
        
        {/* HEADER */}
        <header className="flex justify-between items-center px-6 py-5 bg-transparent z-10">
          <div className="flex items-center gap-2 text-[#FF5A5F] font-semibold">
            <Lock className="w-5 h-5" />
            <span>Access Restricted</span>
          </div>
          <button className="text-slate-500 hover:text-slate-700 bg-slate-200/50 p-1.5 rounded-full transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="flex-grow flex flex-col items-center px-6 pt-4 pb-28 overflow-y-auto">
          
          {/* ICON ILLUSTRATION */}
          <div className="relative mb-8 mt-4">
            {/* Dotted border background */}
            <div className="absolute inset-0 border-[3px] border-dashed border-red-200 rounded-[3rem] scale-125 opacity-60"></div>
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-red-400/20 blur-3xl rounded-full scale-150"></div>
            
            {/* Main Icon Box */}
            <div className="relative bg-white w-32 h-32 rounded-[2.5rem] flex items-center justify-center shadow-lg shadow-red-100/50 z-10">
              <ShieldAlert className="w-16 h-16 text-[#FF5A5F]" fill="#FF5A5F" color="white" strokeWidth={1} />
            </div>
          </div>

          {/* TYPOGRAPHY */}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center leading-tight mb-4 tracking-tight">
            Akses Belum<br />Diizinkan
          </h1>
          
          <p className="text-center text-slate-600 text-[15px] leading-relaxed mb-8">
            Mohon maaf, email Anda tidak terdaftar dalam sistem resmi <span className="font-bold text-[#FF5A5F]">Civic Flow</span>. Untuk alasan keamanan, akses ke platform ini memerlukan otorisasi admin.
          </p>

          {/* INFO CARD */}
          <div className="w-full bg-white border border-slate-100 rounded-3xl p-5 mb-8 shadow-sm">
            <div className="flex gap-4">
              <div className="bg-red-50 p-3 rounded-2xl h-fit shrink-0">
                <Info className="w-5 h-5 text-[#FF5A5F]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">Apa yang harus saya lakukan?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Silakan hubungi administrator IT atau manajer operasional instansi Anda untuk mendaftarkan akun atau mengaktifkan profil akses Anda.
                </p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="w-full space-y-3 mb-8">
            <button className="w-full bg-[#FF5A5F] hover:bg-[#ff484d] text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-md shadow-red-200/50">
              <Headset className="w-5 h-5" />
              <span>Hubungi Admin</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-[#FFF0F0] to-[#FFF5F5] hover:from-[#FFE5E5] text-[#FF5A5F] font-medium py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar</span>
            </button>
          </div>

          {/* SYSTEM STATUS */}
          <div className="flex items-center justify-center gap-2 bg-slate-200/60 px-5 py-2.5 rounded-full text-xs font-medium text-slate-600 mt-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            Sistem Berjalan Normal
          </div>

        </div>

        {/* CUSTOM BOTTOM NAVIGATION */}
        <nav className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 rounded-t-3xl px-8 py-4 flex justify-between items-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20">
          
          <Link href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          
          <Link href="/support" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
            <HelpCircle className="w-6 h-6" />
            <span className="text-[10px] font-medium">Support</span>
          </Link>

          {/* Login tab becomes the active/highlighted one */}
          <Link href="/login" className="flex flex-col items-center gap-1 text-[#FF5A5F] bg-red-50 px-6 py-2 rounded-2xl">
            <LogIn className="w-6 h-6" />
            <span className="text-[10px] font-bold">Login</span>
          </Link>

        </nav>

      </div>
    </div>
  );
}