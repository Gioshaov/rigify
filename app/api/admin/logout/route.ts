import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

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
    domain: process.env.NODE_ENV === 'production' ? 'admin.rigify.ge' : undefined,
  });

  // Use hardcoded redirect URL to prevent open redirect vulnerability
  // Redirect to login page (middleware will handle password check if needed)
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://admin.rigify.ge'
    : 'http://admin.localhost:3000';

  return NextResponse.redirect(`${baseUrl}/admin/login`);
}
