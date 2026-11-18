import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cdigidyfpjqlalnsacxp.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ALI35DxSGdo0oWvHNbP7wA_jPXgC0am';

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run any logic between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
  const isPublic = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  // Also check if dev token cookie exists for local testing
  const devToken = request.cookies.get('scorecard_auth_token')?.value;
  const isAuthenticated = !!user || !!devToken;

  // Protected route check: if user is not authenticated and trying to access protected pages
  if (!isAuthenticated && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Auth pages check: if user is already authenticated and visits login, redirect to manual-scorecard
  if (isAuthenticated && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/manual-scorecard';
    return NextResponse.redirect(url);
  }

  // Redirect /dashboard or /admin/users directly to /manual-scorecard
  if (pathname === '/dashboard' || pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/manual-scorecard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
