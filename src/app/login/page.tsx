// File: src/app/login/page.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Leaf, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh w-full bg-[#F0F4F2] text-emerald-950 flex justify-center items-start font-sans relative overflow-hidden px-3 py-4 sm:items-center sm:py-6">

      {/* Dynamic Background Elements to fill empty space */}
      <div className="absolute top-[-8rem] left-[-8rem] w-72 h-72 bg-emerald-300/35 rounded-full mix-blend-multiply blur-[70px] animate-blob sm:w-96 sm:h-96"></div>
      <div className="absolute top-[10rem] right-[-7rem] w-64 h-64 bg-emerald-300/35 rounded-full mix-blend-multiply blur-[70px] animate-blob animation-delay-2000 sm:w-72 sm:h-72"></div>
      <div className="absolute bottom-[-8rem] left-[10%] w-64 h-64 bg-emerald-200/40 rounded-full mix-blend-multiply blur-[70px] animate-blob animation-delay-4000 sm:w-80 sm:h-80"></div>

      <div className="w-full max-w-[26rem] flex flex-col relative z-10">

        {/* HERO SECTION */}
        <div className="bg-emerald-800 rounded-[2rem] px-5 pt-6 pb-16 relative overflow-hidden shadow-2xl shadow-emerald-900/20 sm:rounded-[2.5rem] sm:px-6 sm:pt-10 sm:pb-20">
          {/* Subtle overlay pattern/icon */}
          <Leaf className="absolute -bottom-8 -right-8 w-48 h-48 text-emerald-700/30 -rotate-12 sm:-bottom-10 sm:-right-10 sm:w-64 sm:h-64" />

          <header className="flex justify-between items-center mb-7 relative z-10 sm:mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-[0.85rem] shadow-lg flex items-center justify-center p-1.5 border border-white/20 overflow-hidden">
                <Image src="/logo-reburn.jpeg" alt="reburn Logo" width={40} height={40} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-black text-white leading-none tracking-wide">Reburn</p>
                <p className="text-[10px] text-emerald-200 font-medium mt-1 tracking-widest uppercase">Dashboard Aplikasi </p>
              </div>
            </div>
          </header>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700/50 mb-3 sm:mb-4">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Portal Kelola</span>
            </div>
            <h1 className="text-[2rem] font-black text-white mb-2 tracking-tight leading-[1.05] sm:text-[2.2rem] sm:tracking-tighter">
              Monitoring <br /> <span className="text-emerald-300">Insinerator Sampah</span>
            </h1>
            <p className="text-emerald-100/80 text-[13px] sm:text-sm max-w-[280px] leading-relaxed">
              Pantau performa pembakaran, status unit operasional, dan riwayat data secara terpusat.
            </p>
          </div>
        </div>

        <div className="flex-grow px-3 flex flex-col -mt-12 relative z-20 sm:px-6 sm:-mt-16">

          {/* LOGIN CARD (Floating) */}
          <section className="rounded-[1.75rem] bg-white p-5 shadow-2xl shadow-emerald-900/10 border border-white/50 backdrop-blur-xl mb-5 sm:rounded-[2rem] sm:p-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-black text-emerald-950 tracking-tight">Masuk ke Sistem</h2>
                <p className="text-[11px] text-emerald-700/60 font-medium">Gunakan akun google yang terdaftar</p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 text-center animate-pulse">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full min-h-14 bg-emerald-950 hover:bg-emerald-900 text-white font-black py-3.5 px-4 rounded-[1.25rem] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait shadow-xl shadow-emerald-900/20 group sm:py-4 sm:px-5"
            >
              <div className="bg-white p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                <Image src="https://www.google.com/images/branding/product/2x/googleg_32dp.png" alt="Google" width={20} height={20} className="w-5 h-5" />
              </div>
              <span className="text-sm tracking-wide">{loading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}</span>
            </button>

            <p className="text-[10px] text-emerald-900/40 mt-5 leading-relaxed text-center font-semibold">
              Akses untuk mitra dan pengelola program
            </p>
          </section>

          {/* SPONSOR LOGOS */}
          <section className="mt-2 mb-4 sm:mt-4 sm:mb-6">
            <p className="text-[10px] text-center text-emerald-800/40 font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4">Didukung Oleh</p>
            <div className="flex items-center justify-center gap-4 bg-white/60 backdrop-blur-sm rounded-3xl py-3 px-4 border border-white/40 shadow-sm sm:gap-6 sm:py-4 sm:px-6">
              <Image src="/ic_telkom_univ.webp" alt="Telkom University" width={48} height={48} className="h-7 w-auto object-contain hover:scale-110 transition-transform sm:h-8" priority />
              <Image src="/logosea.webp" alt="SEA Laboratory" width={80} height={48} className="h-7 w-auto object-contain hover:scale-110 transition-transform sm:h-8" priority />
              <Image src="/logoinacos.webp" alt="INACOS" width={80} height={48} className="h-7 w-auto object-contain hover:scale-110 transition-transform sm:h-8" priority />
            </div>
          </section>

          <footer className="pb-2 text-center">
            <p className="text-[9px] text-emerald-800/30 font-black uppercase tracking-[0.15em]">
              (c) 2026 ReBurn  | Telkom University
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}


