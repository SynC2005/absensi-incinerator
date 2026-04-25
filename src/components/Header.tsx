// File: src/components/Header.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Recycle } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const hiddenRoutes = ['/login', '/forbidden', '/scan', '/auth/callback'];
  const isHidden = hiddenRoutes.some(route => pathname.startsWith(route));

  if (isHidden) return null;

  return (
    <header className="flex justify-between items-center px-6 pt-8 pb-4 bg-[#F8FAFC] sticky top-0 z-40 border-b border-slate-100/50 shadow-sm">
      <div className="flex items-center gap-2">
        <Recycle className="w-6 h-6 text-[#FF5A5F]" />
        <span className="font-bold text-lg text-[#FF5A5F]">Civic Flow</span>
      </div>
      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shadow-sm cursor-pointer hover:ring-2 hover:ring-red-100 transition-all">
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0" 
          alt="User Avatar" 
          className="w-full h-full object-cover"
        />
      </div>
    </header>
  );
}