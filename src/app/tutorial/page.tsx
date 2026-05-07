// File: src/app/tutorial/page.tsx
'use client';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { BookOpen, Download } from 'lucide-react';

export default function TutorialPage() {
  // Anda bisa menaruh file PDF panduan di dalam folder public/
  // Contoh: public/tutorial.pdf
  const pdfUrl = "/tutorial.pdf";

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans mb-24">
      {/* 1. LAYER HIJAU (BACKGROUND ATAS) & HEADER */}
      <div className="bg-emerald-950 w-full h-[60px] fixed top-0 z-0"></div>
      <Header />

      {/* 2. LAYER PUTIH (KONTEN UTAMA) */}
      <div className="flex-1 w-full bg-slate-50 mt-[80px] rounded-t-[2.5rem] relative z-10 p-5 sm:p-7 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.1)]">
        
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
            {/* Embed PDF menggunakan iframe. Jika file belum ada, ini akan menampilkan pesan error bawaan browser */}
            <iframe 
              src={`${pdfUrl}#toolbar=0`} 
              className="w-full h-full"
              title="Panduan Aplikasi"
            />
            
            {/* Placeholder visual jika iframe gagal memuat (PDF belum ditambahkan) */}
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