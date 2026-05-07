// File: src/app/tutorial/page.tsx
'use client';

import BottomNav from '@/components/BottomNav';
import { BookOpen, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TutorialPage() {
  // Anda bisa menaruh file PDF panduan di dalam folder public
  const pdfUrl = "/tutorial.pdf";
  const [viewerUrl, setViewerUrl] = useState<string>('');

  useEffect(() => {
    const absolutePdfUrl = `${window.location.origin}${pdfUrl}`;
    setViewerUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(absolutePdfUrl)}&embedded=true`);
  }, [pdfUrl]);

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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-emerald-900">Dokumen PDF</h2>
            <a 
              href={pdfUrl} 
              download
              className="flex items-center justify-center gap-2 bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Unduh
            </a>
          </div>
          
          <div className="w-full h-[60vh] rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-100 relative">
            {/* Embed PDF menggunakan Google Docs Viewer via iframe */}
            {viewerUrl ? (
              <iframe 
                src={viewerUrl} 
                className="w-full h-full z-10 relative bg-white"
                title="Panduan Aplikasi"
                frameBorder="0"
              />
            ) : null}
            
            {/* Placeholder visual jika iframe/object gagal memuat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none -z-10">
              <BookOpen className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-bold">Harap letakkan "tutorial.pdf" di folder public</p>
            </div>
          </div>
        </div>
        
      </div>

      {/* 3. MENU BAWAH */}
      <BottomNav />
    </main>
  );
}