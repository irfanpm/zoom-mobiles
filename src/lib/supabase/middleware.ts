import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the auth cookie on every request and gates routes.
 *
 * Route rules:
 *  - /admin/*   → must be admin (admin_users row exists)
 *  - /products, /categories, /enquiry, /about → must be logged in (customer or admin)
 *  - /login, /admin/login, /, /_next/*, /api/public/* → always open
 */
export async function updateSession(request: NextRequest) {
  // Forward pathname to Server Components via header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

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

  const path = request.nextUrl.pathname;

  // ── Public routes (no auth needed) ────────────────────────────────
  // NOTE: `/` is NOT public — this is a private B2B portal. The root page
  // handles the redirect to /login (anonymous) or /products (customer) or
  // /admin (admin) so customers never see a marketing page.
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

  // ── Root redirect: send / based on role ───────────────────────────
  // Anonymous → /login (handled below). Customer → /products. Admin → /admin.
  // We still allow / to render for logged-in users so the root page itself
  // can decide where to send them (in case we want to show a "loading…" UI).

  // ── Not logged in → redirect to appropriate login ─────────────────
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = path.startsWith('/admin') ? '/admin/login' : '/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // ── Admin routes → must be in admin_users table ───────────────────
  if (path.startsWith('/admin')) {
    const { data: admin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!admin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'not_admin');
      return NextResponse.redirect(url);
    }
  }

  return response;
}
