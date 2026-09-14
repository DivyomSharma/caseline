import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from './session';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Offline mock mode: pass through. We will handle local cookies or localStorage for session.
  if (!supabaseUrl || !supabaseAnonKey) {
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                            request.nextUrl.pathname === '/' ||
                            request.nextUrl.pathname.match(/^\/(cases|fir|criminals|victims|officers|stations|reports|analytics|settings|investigations|evidence|laws|courts|map)/);
    
    // Verify the session cookie's signature, not merely its presence — a raw
    // presence check let anyone reach every protected route by hand-setting
    // any cookie value in devtools, bypassing loginAction's password check.
    const sessionCookie = request.cookies.get('caseline_session');
    const verifiedEmail = await verifySession(sessionCookie?.value);

    if (!verifiedEmail && isProtectedRoute && request.nextUrl.pathname !== '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Redirect / to /dashboard if logged in
    if (verifiedEmail && request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtectedRoute = path === '/' || 
                          path.startsWith('/dashboard') ||
                          path.startsWith('/cases') ||
                          path.startsWith('/fir') ||
                          path.startsWith('/criminals') ||
                          path.startsWith('/victims') ||
                          path.startsWith('/officers') ||
                          path.startsWith('/stations') ||
                          path.startsWith('/reports') ||
                          path.startsWith('/analytics') ||
                          path.startsWith('/settings') ||
                          path.startsWith('/investigations') ||
                          path.startsWith('/evidence') ||
                          path.startsWith('/laws') ||
                          path.startsWith('/courts') ||
                          path.startsWith('/map');

  if (!user && isProtectedRoute && path !== '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect / to /dashboard if logged in
  if (user && path === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}
