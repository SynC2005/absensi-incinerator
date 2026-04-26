// File: src/components/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Home, 
  ClipboardList, 
  QrCode, 
  Bell,
  User
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Daftar rute di mana Bottom Nav ini TIDAK BOLEH muncul
  const hiddenRoutes = ['/login', '/forbidden', '/scan', '/auth/callback'];
  const isHidden = hiddenRoutes.some(route => pathname.startsWith(route));

  // Fungsi Logout Supabase yang dipasang di tombol Akun
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
    if (!confirmLogout) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.push('/login');
    } catch (err: any) {
      console.error("Gagal logout:", err.message);
      alert("Terjadi kesalahan saat mencoba keluar.");
    }
  };

  if (isHidden) return null;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-emerald-50 px-4 sm:px-6 py-2 z-50 shadow-[0_-10px_30px_-15px_rgba(6,95,70,0.16)] rounded-t-[2.5rem]">
      <div className="flex justify-between items-center relative h-16">
        
        {/* TOMBOL 1: BERANDA */}
        <Link href="/dashboard" className="flex flex-col items-center justify-center w-12 h-full group">
          <Home className={`w-6 h-6 transition-all duration-300 ${pathname === '/dashboard' ? 'text-emerald-700 scale-110' : 'text-slate-400 group-hover:text-emerald-600'}`} />
          <span className={`text-[10px] mt-1 font-bold tracking-tight transition-colors ${pathname === '/dashboard' ? 'text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600'}`}>Beranda</span>
        </Link>

        {/* TOMBOL 2: TIMELINE / DATA */}
        <Link href="/data" className="flex flex-col items-center justify-center w-12 h-full group mr-4 sm:mr-6">
          <ClipboardList className={`w-6 h-6 transition-all duration-300 ${pathname === '/data' ? 'text-emerald-700 scale-110' : 'text-slate-400 group-hover:text-emerald-600'}`} />
          <span className={`text-[10px] mt-1 font-bold tracking-tight transition-colors ${pathname === '/data' ? 'text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600'}`}>Aktivitas</span>
        </Link>

        {/* TOMBOL TENGAH: SCAN QR (FLOATING ACTION BUTTON) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8">
          <Link href="/scan">
            <button className="bg-emerald-800 hover:bg-emerald-900 text-white p-4 sm:p-5 rounded-full shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center border-4 border-white">
              <QrCode className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
          </Link>
        </div>

        {/* TOMBOL 3: NOTIFIKASI */}
        <button className="flex flex-col items-center justify-center w-12 h-full group ml-4 sm:ml-6 transition-all active:scale-95">
          <div className="relative">
             <Bell className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
             <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </div>
          <span className="text-[10px] mt-1 font-bold tracking-tight text-slate-400 group-hover:text-emerald-600 whitespace-nowrap">
            Notifikasi
          </span>
        </button>

        {/* TOMBOL 4: AKUN (LOGOUT) */}
        <button 
          onClick={handleLogout} 
          className="flex flex-col items-center justify-center w-12 h-full group transition-all active:scale-95"
        >
          <User className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          <span className="text-[10px] mt-1 font-bold tracking-tight text-slate-400 group-hover:text-emerald-600">Akun</span>
        </button>

      </div>
    </div>
  );
}
