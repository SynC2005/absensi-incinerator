// File: src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aplikasi EcoFlow",
  description: "Aplikasi Absensi & Monitoring Incinerator",
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1', // Tambahkan ini
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${plusJakarta.className} bg-[#F0F4F2] text-[#064E3B]`}>
        <div className="flex justify-center min-h-screen">
          <div className="w-full max-w-md bg-background min-h-screen relative flex flex-col shadow-2xl shadow-emerald-900/10 overflow-x-hidden">
            
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



