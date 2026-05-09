import BottomNav from '@/components/BottomNav';
import { BookOpen, Download, ExternalLink } from 'lucide-react';

export default function TutorialPage() {
  const pdfUrl = '/tutorial/pdf';
  const pdfViewerUrl = `${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`;

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
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-emerald-900">Dokumen PDF</h2>
            <div className="flex items-center gap-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Buka PDF di tab baru"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 transition-colors hover:bg-emerald-100"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href={pdfUrl}
                download="tutorial.pdf"
                aria-label="Unduh PDF"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div className="w-full h-[60vh] rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-100 relative">
            <iframe
              src={pdfViewerUrl}
              title="Panduan penggunaan aplikasi"
              className="w-full h-full bg-white"
              loading="lazy"
            />
          </div>

          <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Jika pratinjau kosong di browser tertentu, buka file langsung di tab baru.</span>
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
        </div>
        
      </div>

      {/* 3. MENU BAWAH */}
      <BottomNav />
    </main>
  );
}
