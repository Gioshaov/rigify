import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminUrl, getAdminCookieDomain } from '@/lib/utils/domain';

export async function POST() {
  // Sign out from Supabase (terminates the session)
  const supabase = createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();

  // Delete the admin preview password cookie with same options as when it was set
  cookieStore.set('rigify_admin_access', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/',
    domain: getAdminCookieDomain(),
  });

  // Redirect to the admin login on the current environment's admin subdomain.
  // Built from a known base (not user input) to avoid open-redirect risk.
  return NextResponse.redirect(`${getAdminUrl()}/admin/login`);
}
