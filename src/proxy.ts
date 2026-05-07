// File: src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const EMPLOYEE_ROLE = 'pegawai'
const ADMIN_ROLE = 'admin'
const ACTIVE_ROLES = [EMPLOYEE_ROLE, ADMIN_ROLE]

function getRedirectPath(role?: string | null) {
  if (role === ADMIN_ROLE) return '/admin'
  if (role === EMPLOYEE_ROLE) return '/dashboard'
  return '/forbidden'
}

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
  const isAdminRoute = currentPath.startsWith('/admin')

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

      return NextResponse.redirect(
        new URL(getRedirectPath(profile?.role), request.url)
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
  // VALIDASI ROLE
  // =========================================================
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  if (error || !ACTIVE_ROLES.includes(role)) {
    return NextResponse.redirect(
      new URL('/forbidden', request.url)
    )
  }

  if (isAdminRoute && role !== ADMIN_ROLE) {
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
