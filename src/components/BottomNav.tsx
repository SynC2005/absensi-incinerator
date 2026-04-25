// File: src/components/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Home, 
  BarChart2, 
  QrCode, 
  ClipboardList, 
  BookOpen,
  PlusSquare
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Daftar rute di mana Bottom Nav ini TIDAK BOLEH muncul
  const hiddenRoutes = ['/login', '/forbidden', '/scan', '/auth/callback'];
  const isHidden = hiddenRoutes.some(route => pathname.startsWith(route));

  // Fungsi Logout Supabase yang dipasang di tombol Tutorial
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Jika berhasil keluar, arahkan ke halaman login
      router.push('/login');
    } catch (err: any) {
      console.error("Gagal logout:", err.message);
      alert("Terjadi kesalahan saat mencoba keluar.");
    }
  };

  // Jika di halaman login/scan, sembunyikan navigasi bawah ini
  if (isHidden) return null;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 px-6 py-2 z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl">
      <div className="flex justify-between items-center relative h-16">
        
        {/* TOMBOL 1: HOME */}
        <Link href="/dashboard" className="flex flex-col items-center justify-center w-12 h-full">
          <Home className={`w-6 h-6 ${pathname === '/dashboard' ? 'text-[#FF5A5F]' : 'text-slate-400 hover:text-slate-600 transition-colors'}`} />
          <span className={`text-[10px] mt-1 font-medium ${pathname === '/dashboard' ? 'text-[#FF5A5F]' : 'text-slate-400'}`}>Home</span>
        </Link>

        {/* TOMBOL 2: DATA / STATS */}
        <Link href="/data" className="flex flex-col items-center justify-center w-12 h-full mr-6">
          <BarChart2 className={`w-6 h-6 ${pathname === '/data' ? 'text-[#FF5A5F]' : 'text-slate-400 hover:text-slate-600 transition-colors'}`} />
          <span className={`text-[10px] mt-1 font-medium ${pathname === '/data' ? 'text-[#FF5A5F]' : 'text-slate-400'}`}>Data</span>
        </Link>

        {/* TOMBOL TENGAH: SCAN QR (FLOATING ACTION BUTTON) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link href="/scan">
            <button className="bg-[#FF5A5F] hover:bg-[#ff484d] text-white p-4 rounded-full shadow-lg shadow-red-200/50 transition-transform active:scale-95 flex items-center justify-center border-4 border-[#F8FAFC]">
              <QrCode className="w-7 h-7" />
            </button>
          </Link>
        </div>

        {/* TOMBOL 3: ADD NEW MACHINE (MENGGANTIKAN HISTORY) */}
        <Link href="/add-machine" className="flex flex-col items-center justify-center w-12 h-full ml-6">
          <PlusSquare className={`w-6 h-6 ${pathname === '/add-machine' ? 'text-[#FF5A5F]' : 'text-slate-400 hover:text-slate-600 transition-colors'}`} />
          <span className={`text-[10px] mt-1 font-medium ${pathname === '/add-machine' ? 'text-[#FF5A5F]' : 'text-slate-400'} whitespace-nowrap`}>
            Add Machine
          </span>
        </Link>

        {/* TOMBOL 4: TUTORIAL (SEKARANG MENJADI TOMBOL LOGOUT UNTUK UJI COBA) */}
        <button 
          onClick={handleLogout} 
          className="flex flex-col items-center justify-center w-12 h-full transition-all active:scale-95"
          title="Klik untuk Logout (Uji Coba)"
        >
          {/* Ikon dan teks tetap menggunakan desain BookOpen/Tutorial */}
          <BookOpen className="w-6 h-6 text-slate-400 hover:text-[#FF5A5F] transition-colors" />
          <span className="text-[10px] mt-1 font-medium text-slate-400">Tutorial</span>
        </button>

      </div>
    </div>
  );
}