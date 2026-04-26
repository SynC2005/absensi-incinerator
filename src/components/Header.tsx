// File: src/components/Header.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Recycle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('Memuat...');
  const hiddenRoutes = ['/login', '/forbidden', '/scan', '/auth/callback', '/dashboard', '/data', '/add-machine'];
  const isHidden = hiddenRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    if (isHidden) return;

    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.user_metadata?.nama || user.email?.split('@')[0] || 'Pengguna';
          setUserName(name);
        } else {
          setUserName('Tamu');
        }
      } catch (error) {
        console.error("Gagal mengambil user header:", error);
        setUserName('Tamu');
      }
    };
    fetchUser();
  }, [isHidden]);

  if (isHidden) return null;

  return (
    <header className="flex justify-between items-center px-6 pt-8 pb-4 bg-emerald-800 sticky top-0 z-40 shadow-md shadow-emerald-900/20">
      <div className="flex items-center gap-2">
        <Recycle className="w-6 h-6 text-emerald-300" />
        <span className="font-bold text-lg text-white tracking-tight">EcoFlow</span>
      </div>
      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 border-2 border-white/40 shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all flex-shrink-0">
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=065f46&color=fff&size=150`} 
          alt="Avatar pengguna" 
          className="w-full h-full object-cover"
        />
      </div>
    </header>
  );
}



