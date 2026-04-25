// File: src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Civic Flow App",
  description: "Aplikasi Absensi & Monitoring Incinerator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-100 text-slate-800`}>
        <div className="flex justify-center min-h-screen">
          <div className="w-full max-w-md bg-[#F8FAFC] min-h-screen relative flex flex-col shadow-xl overflow-x-hidden">
            
            {/* Header Global */}
            <Header />

            {/* Konten Halaman */}
            <main className="flex-grow flex flex-col relative">
              {children}
            </main>

          </div>
        </div>
      </body>
    </html>
  );
}