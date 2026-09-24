import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { supabaseConfigured, supabaseKey, supabaseUrl } from '@/lib/supabase/config';

/**
 * Keeps the admin's Supabase session fresh. Runs only for /admin, so the public
 * site stays fully static.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!supabaseConfigured) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  // Refreshes the session cookies if they have expired.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
