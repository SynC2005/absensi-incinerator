import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import AdminApprovalClient, { type ProfileRow } from './AdminApprovalClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always write refreshed cookies.
          }
        },
      },
    }
  );

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role');

  return (
    <AdminApprovalClient
      initialProfiles={(data ?? []) as ProfileRow[]}
      initialError={error?.message ?? null}
    />
  );
}
