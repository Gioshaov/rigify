import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only POST to prevent CSRF logout attacks
export async function POST(request: Request) {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error);
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
