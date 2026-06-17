import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the auth cookie on every request and gates routes.
 *
 * PERF: We cache the admin role in a short-lived cookie so we don't hit Supabase
 * on every navigation. The cookie is a *hint*, not an authorization source —
 * page-level checks + RLS still enforce real security.
 *
 * Route rules:
 *  - /admin/*   → must be admin (admin_users row exists)
 *  - All other non-public routes → must be logged in
 *  - /login, /admin/login, /, /_next/*, /api/public/* → always open
 */

const ADMIN_ROLE_COOKIE = 'zm_role';
const ROLE_COOKIE_MAX_AGE = 60 * 60; // 1 hour

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Forward pathname to Server Components via header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', path);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // ── Public routes (no auth needed) ────────────────────────────────
  const isPublic =
    path === '/login' ||
    path === '/admin/login' ||
    path.startsWith('/api/public') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.startsWith('/icons') ||
    path === '/manifest.json' ||
    path === '/robots.txt' ||
    path === '/logo.svg';

  if (isPublic) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Not logged in → redirect to appropriate login ─────────────────
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = path.startsWith('/admin') ? '/admin/login' : '/login';
    url.searchParams.set('redirect', path);
    // Also clear stale role cookie
    const r = NextResponse.redirect(url);
    r.cookies.delete(ADMIN_ROLE_COOKIE);
    return r;
  }

  // ── Admin routes → must be in admin_users table ───────────────────
  if (path.startsWith('/admin')) {
    const cachedRole = request.cookies.get(ADMIN_ROLE_COOKIE)?.value;

    // Fast path: trust the cached cookie (still safe — pages/RLS re-check)
    if (cachedRole === 'admin') {
      return response;
    }

    // Slow path: verify with DB and cache the result.
    // Try with is_active; if that column doesn't exist yet (migrations not run),
    // fall back to a plain existence check so valid admins are never locked out.
    let admin: { id: string; is_active?: boolean } | null = null;
    {
      const res = await supabase
        .from('admin_users')
        .select('id, is_active')
        .eq('id', user.id)
        .maybeSingle();
      if (res.error) {
        // Column missing or other schema issue → fall back to existence-only
        const fb = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        admin = fb.data;
      } else {
        admin = res.data;
      }
    }

    if (!admin || admin.is_active === false) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'not_admin');
      const r = NextResponse.redirect(url);
      r.cookies.delete(ADMIN_ROLE_COOKIE);
      return r;
    }

    // Cache the role so subsequent admin navigations skip the DB lookup
    response.cookies.set(ADMIN_ROLE_COOKIE, 'admin', {
      maxAge: ROLE_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  return response;
}
