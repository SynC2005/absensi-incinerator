// File: src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// KODE DEBUGGING: Cek di inspect element browser (Console)
console.log("URL Terbaca:", supabaseUrl ? "BERHASIL" : "KOSONG");
console.log("Key Terbaca:", supabaseAnonKey ? "BERHASIL" : "KOSONG");

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ PERINGATAN: Variabel Environment Supabase KOSONG!");
}

export const supabase = createBrowserClient(
  supabaseUrl!,
  supabaseAnonKey!
);