// File: src/app/akun/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Mail, ShieldAlert, LogOut, CheckCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function AkunPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            // Kombinasikan data profile dengan full_name pattern yang sama seperti di history activity
            setProfile({
              ...profileData,
              namaDetail: user.user_metadata?.full_name || user.email?.split('@')[0] || profileData.nama || 'Operator Manual'
            });
          } else {
            // Fallback jika tidak ada data di tabel profiles
            setProfile({
              namaDetail: user.user_metadata?.full_name || user.user_metadata?.nama || user.email?.split('@')[0] || 'Operator Manual',
              role: 'pegawai'
            });
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data user:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

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

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24">
      {/* KONTEN UTAMA */}
      <div className="flex-1 w-full bg-slate-50 p-5 sm:p-7">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-sm border border-emerald-200">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-emerald-950 tracking-tight">Akun Saya</h1>
            <p className="text-xs font-bold text-slate-400">Informasi profil pengguna</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Profil Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-16 bg-emerald-800/10"></div>
              <div className="w-20 h-20 rounded-full overflow-hidden bg-emerald-100 border-4 border-white mb-3 shadow-lg relative z-10">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.namaDetail || 'Tamu')}&background=065f46&color=fff&size=150`} 
                  alt="Avatar pengguna" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg font-black text-emerald-950 relative z-10">{profile?.namaDetail || 'Tamu'}</h2>
              <div className="flex items-center gap-1 mt-1 bg-emerald-50 px-3 py-1 rounded-full text-emerald-700 relative z-10">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{profile?.role || 'User'}</span>
              </div>
            </div>

            {/* Info Details */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <User className="w-3 h-3" /> Nama Lengkap
                </label>
                <div className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                  {profile?.namaDetail || '-'}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <div className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                  {email || '-'}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3 h-3" /> Role Sistem
                </label>
                <div className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 capitalize">
                  {profile?.role || '-'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="w-full bg-white text-red-500 hover:bg-red-50 hover:border-red-100 border border-slate-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar dari Aplikasi</span>
            </button>
          </div>
        )}
      </div>

      {/* MENU BAWAH */}
      <BottomNav />
    </main>
  );
}