'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight,
  Leaf,
  ShieldCheck,
  BarChart3,
  MapPinned,
  Cpu,
  Recycle
} from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F0F4F2] overflow-hidden relative font-sans">

      {/* BACKGROUND BLOBS */}
      <div className="absolute top-[-10rem] left-[-8rem] w-80 h-80 bg-emerald-300/30 rounded-full blur-[90px]"></div>
      <div className="absolute top-[10rem] right-[-8rem] w-80 h-80 bg-emerald-200/30 rounded-full blur-[90px]"></div>
      <div className="absolute bottom-[-8rem] left-[20%] w-72 h-72 bg-emerald-400/20 rounded-full blur-[90px]"></div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">

        {/* HERO */}
        <section className="px-5 pt-6 pb-10">
          
          {/* BRANDING */}
<div className="mb-8 flex items-center gap-3">
  <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden border border-white/60">
    <Image
      src="/logo-reburn.jpeg"
      alt="ReBurn Logo"
      width={48}
      height={48}
      className="w-full h-full object-cover"
    />
  </div>

  <div>
    <h1 className="text-lg font-black text-emerald-950 tracking-tight">
      ReBurn
    </h1>

    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-700/60">
      Smart Monitoring System
    </p>
  </div>
</div>

          {/* HERO CARD */}
          <div className="bg-emerald-800 rounded-[2.5rem] p-6 relative overflow-hidden shadow-2xl shadow-emerald-900/20">

            <Leaf className="absolute -right-10 -bottom-10 w-56 h-56 text-emerald-700/20 rotate-12" />

            <div className="relative z-10">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700/50 mb-5">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
                  Sistem Monitoring
                </span>
              </div>

              <h2 className="text-[2.3rem] leading-[1.05] font-black text-white tracking-tight mb-4">
                Monitoring <br />
                <span className="text-emerald-300">
                  Incinerator Pintar
                </span>
              </h2>

              <p className="text-sm text-emerald-100/80 leading-relaxed max-w-[280px]">
                ReBurn membantu pemantauan operasional mesin incinerator
                secara real-time mulai dari status unit, data pembakaran,
                hingga pengelolaan aktivitas pengguna dalam satu dashboard
                terintegrasi.
              </p>

              <Link
  href="/login"
  className="mt-7 inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-900 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-950/10 active:scale-95 transition-all"
>
  Login & Mulai Sekarang
  <ArrowRight className="w-4 h-4" />
</Link>
            </div>
          </div>
        </section>

        {/* FITUR */}
        <section className="px-5 pb-8">

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-700">
                Fitur Utama
              </p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Sistem Terintegrasi
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="bg-white rounded-[1.8rem] p-5 border border-emerald-50 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>

              <h4 className="text-sm font-black text-slate-900 mb-2">
                Monitoring Data
              </h4>

              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                Pantau data pembakaran dan berat sampah secara langsung.
              </p>
            </div>

            <div className="bg-white rounded-[1.8rem] p-5 border border-emerald-50 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 mb-4">
                <MapPinned className="w-6 h-6" />
              </div>

              <h4 className="text-sm font-black text-slate-900 mb-2">
                Lokasi Mesin
              </h4>

              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                Integrasi Google Maps untuk memantau lokasi unit aktif.
              </p>
            </div>

            <div className="bg-white rounded-[1.8rem] p-5 border border-emerald-50 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700 mb-4">
                <Cpu className="w-6 h-6" />
              </div>

              <h4 className="text-sm font-black text-slate-900 mb-2">
                Integrasi Sensor
              </h4>

              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                Terhubung dengan ESP32 dan sensor timbangan digital.
              </p>
            </div>

            <div className="bg-white rounded-[1.8rem] p-5 border border-emerald-50 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
                <Recycle className="w-6 h-6" />
              </div>

              <h4 className="text-sm font-black text-slate-900 mb-2">
                Ramah Lingkungan
              </h4>

              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                Mendukung pengelolaan limbah yang lebih modern dan efisien.
              </p>
            </div>

          </div>
        </section>

        {/* ORGANIZATION */}
        <section className="px-5 pb-10 mt-auto">

          <div className="bg-white rounded-[2rem] border border-emerald-50 p-6 shadow-sm">

            <p className="text-[10px] text-center text-emerald-800/40 font-black uppercase tracking-[0.2em] mb-5">
              Didukung Oleh
            </p>

            <div className="flex items-center justify-center gap-5">

              <Image
                src="/ic_telkom_univ.webp"
                alt="Telkom University"
                width={60}
                height={60}
                className="h-9 w-auto object-contain"
              />

              <Image
                src="/logosea.webp"
                alt="SEA Laboratory"
                width={90}
                height={60}
                className="h-9 w-auto object-contain"
              />

              <Image
                src="/logoinacos.webp"
                alt="INACOS"
                width={90}
                height={60}
                className="h-9 w-auto object-contain"
              />

            </div>

            <div className="mt-6 text-center">
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Platform monitoring incinerator berbasis IoT untuk
                mendukung pengelolaan sampah yang lebih efektif,
                transparan, dan berkelanjutan.
              </p>
            </div>

          </div>

          <footer className="pt-6 text-center">
            <p className="text-[9px] text-emerald-900/30 font-black uppercase tracking-[0.2em]">
              © 2026 ReBurn — Telkom University
            </p>
          </footer>

        </section>
      </div>
    </main>
  );
}