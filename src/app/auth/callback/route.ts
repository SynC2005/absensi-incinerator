// File: src/app/auth/callback/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

function getRedirectPath(role?: string | null) {
  if (role === 'admin') return '/admin'
  if (role === 'pegawai') return '/dashboard'
  return '/forbidden'
}

function getUserFullName(user: User) {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Pengguna'
  )
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.error("Gagal set cookie:", error);
            }
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          await supabase.from('profiles').insert({
            id: user.id,
            full_name: getUserFullName(user),
          })

          return NextResponse.redirect(`${origin}/forbidden`)
        }

        return NextResponse.redirect(`${origin}${getRedirectPath(profile?.role)}`)
      }

      return NextResponse.redirect(`${origin}/forbidden`)
    }
  }

  // GAGAL: Arahkan kembali ke halaman masuk utama
  return NextResponse.redirect(`${origin}/?error=GagalAutentikasi`)
}
