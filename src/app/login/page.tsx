// File: src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, HelpCircle, Factory, ShieldCheck, Headset } from 'lucide-react';

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
          // WAJIB: Arahkan ke rute callback
          redirectTo: `${window.location.origin}/auth/callback`, 
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-red-500">
          <Building2 className="w-6 h-6" />
          <span className="font-bold text-lg text-slate-900 tracking-tight">UtilityConnect</span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <HelpCircle className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6">
        <div className="flex items-center justify-center gap-8 mb-8">
          <img src="/image_1.png" alt="Telkom University" className="h-14 w-auto object-contain drop-shadow-sm" />
          <img src="/image_2.png" alt="Sea Lab 1" className="h-14 w-auto object-contain drop-shadow-sm" />
          <img src="/image_3.png" alt="Sea Lab 2" className="h-14 w-auto object-contain drop-shadow-sm" />
        </div>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <Factory className="w-10 h-10 text-[#FF4F4F]" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Halo, Warga!</h1>
          <p className="text-slate-500 text-lg max-w-sm leading-relaxed">
            Silakan masuk untuk mencatat kehadiran Anda di fasilitas pengolahan limbah.
          </p>
        </div>

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-sm p-8 mb-8 text-center">
          <h2 className="text-slate-800 font-semibold mb-6">Akses Masuk Terpusat</h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:shadow-sm"
          >
            <img src="https://www.google.com/images/branding/product/2x/googleg_32dp.png" alt="Google" className="w-6 h-6" />
            <span className="text-base">{loading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}</span>
          </button>
          
          <p className="text-xs text-slate-400 mt-6 leading-relaxed">
            Dengan masuk, Anda menyetujui kebijakan privasi dan persyaratan layanan portal UtilityConnect.
          </p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="bg-slate-200/50 p-5 rounded-2xl flex items-start gap-4">
            <div className="bg-[#EAE1DF] p-2.5 rounded-lg shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6 text-[#A05E49]" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800 mb-1">Keamanan Terjamin</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Data kehadiran Anda tersimpan dengan enkripsi standar industri.</p>
            </div>
          </div>

          <div className="bg-slate-200/50 p-5 rounded-2xl flex items-start gap-4">
            <div className="bg-[#DCE7F3] p-2.5 rounded-lg shrink-0 mt-0.5">
              <Headset className="w-6 h-6 text-[#3B69A1]" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800 mb-1">Butuh Bantuan?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Tim dukungan kami siap membantu Anda 24/7 jika ada kendala.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-[#F8FAFC] py-10 flex flex-col items-center border-t border-slate-200 mt-auto">
        <h4 className="font-bold text-slate-900 mb-6">UtilityConnect Management.</h4>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-500 mb-8">
          <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Accessibility</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Contact Support</a>
        </div>
        <p className="text-slate-400 text-sm text-center px-4 max-w-sm">© 2024 UtilityConnect Management. Trusted Industrial Service.</p>
      </footer>
    </div>
  );
}