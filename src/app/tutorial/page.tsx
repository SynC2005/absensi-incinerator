import BottomNav from '@/components/BottomNav';
import { BookOpen, ExternalLink } from 'lucide-react';

export default function TutorialPage() {
  const pdfUrl = '/manual_book/tutorial.pdf';

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24">
      {/* 1. KONTEN UTAMA */}
      <div className="flex-1 w-full bg-slate-50 p-5 sm:p-7">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-sm border border-emerald-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-emerald-950 tracking-tight">Tutorial</h1>
            <p className="text-xs font-bold text-slate-400">Panduan penggunaan aplikasi</p>
          </div>
        </div>

        {/* BUNGKUSAN PDF VIEWER */}
        <div className="w-full bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center mb-4">
            <h2 className="text-sm font-bold text-emerald-900">Dokumen PDF</h2>
          </div>
          
          <div className="w-full h-[60vh] rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-100 relative">
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full bg-white"
              aria-label="Panduan penggunaan aplikasi"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-slate-500">
                <BookOpen className="w-12 h-12 opacity-25" />
                <p className="text-sm font-bold">PDF tidak bisa ditampilkan di browser ini.</p>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-900"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka PDF
                </a>
              </div>
            </object>
          </div>
        </div>
        
      </div>

      {/* 3. MENU BAWAH */}
      <BottomNav />
    </main>
  );
}
