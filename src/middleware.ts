// File: src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const currentPath = request.nextUrl.pathname

  // 1. IZINKAN AKSES LANGSUNG KE HALAMAN FORBIDDEN & AUTH CALLBACK
  // Ini penting agar tidak terjadi infinite loop
  if (currentPath.startsWith('/forbidden') || currentPath.startsWith('/auth')) {
    return supabaseResponse
  }

  // 2. LOGIKA UNTUK HALAMAN LOGIN
  if (currentPath.startsWith('/login')) {
    if (user) {
      // Jika sudah login, cek role dulu sebelum lempar ke dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role === 'pegawai') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      // Jika bukan pegawai, biarkan dia di halaman login atau arahkan ke forbidden
      return NextResponse.redirect(new URL('/forbidden', request.url))
    }
    return supabaseResponse
  }

  // 3. PROTEKSI HALAMAN PRIVATE (DASHBOARD, SCAN, DLL)
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. VALIDASI ROLE PEGAWAI UNTUK SEMUA HALAMAN PROTECTED
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profile?.role !== 'pegawai') {
    // User login tapi bukan pegawai -> LEMPAR KE FORBIDDEN
    // Karena /forbidden sudah dikecualikan di atas, loop akan berhenti di sini.
    return NextResponse.redirect(new URL('/forbidden', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}