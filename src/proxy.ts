// File: src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          supabaseResponse = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const currentPath = request.nextUrl.pathname

  // =========================================================
  // HALAMAN PUBLIK
  // Bisa diakses tanpa login
  // =========================================================
  const publicRoutes = ['/', '/login', '/forbidden']

  const isPublicRoute =
    publicRoutes.includes(currentPath) ||
    currentPath.startsWith('/auth')

  if (isPublicRoute) {

    // Jika user SUDAH login dan membuka halaman login
    // arahkan ke dashboard sesuai role
    if (currentPath === '/login' && user) {

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'pegawai') {
        return NextResponse.redirect(
          new URL('/dashboard', request.url)
        )
      }

      return NextResponse.redirect(
        new URL('/forbidden', request.url)
      )
    }

    return supabaseResponse
  }

  // =========================================================
  // PROTEKSI HALAMAN PRIVATE
  // =========================================================
  if (!user) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }

  // =========================================================
  // VALIDASI ROLE PEGAWAI
  // =========================================================
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profile?.role !== 'pegawai') {
    return NextResponse.redirect(
      new URL('/forbidden', request.url)
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}