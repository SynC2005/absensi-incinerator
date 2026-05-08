'use client';

import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();

  // Sembunyikan header di halaman yang punya shell sendiri.
  const hideHeader =
    pathname === '/' ||
    pathname.startsWith('/forbidden') ||
    pathname.startsWith('/scan') ||
    pathname.startsWith('/auth/callback');

  return (
    <html lang="id">
      <body className={`${plusJakarta.className} bg-[#F0F4F2] text-[#064E3B]`}>
        <div className="flex justify-center min-h-screen">
          <div className="w-full max-w-md bg-background min-h-screen relative flex flex-col shadow-2xl shadow-emerald-900/10 overflow-x-hidden">

            {/* Header hanya untuk halaman private */}
            {!hideHeader && <Header />}

            <main className="flex-grow flex flex-col relative">
              {children}
            </main>

          </div>
        </div>
      </body>
    </html>
  );
}
