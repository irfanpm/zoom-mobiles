import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Server-rendered pagination bar. Builds page links by merging the current
 * search params with a new `page` value, so existing filters are preserved.
 */
export default function Pagination({
  page,
  pageSize,
  total,
  basePath,
  params = {},
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  /** Other query params to preserve (search, filters). */
  params?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    sp.set('page', String(p));
    return `${basePath}?${sp.toString()}`;
  };

  // Build a compact page-number window (max 5 numbers)
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
      <div className="text-xs text-slate-500">
        Showing <span className="font-semibold text-dark">{from}–{to}</span> of{' '}
        <span className="font-semibold text-dark">{total}</span>
      </div>
      <nav className="flex items-center gap-1">
        <PageLink href={page > 1 ? href(page - 1) : null} aria="Previous">
          <ChevronLeft className="h-4 w-4" />
        </PageLink>
        {start > 1 && (
          <>
            <PageNum href={href(1)} n={1} active={page === 1} />
            {start > 2 && <span className="px-1 text-slate-400">…</span>}
          </>
        )}
        {pages.map((p) => (
          <PageNum key={p} href={href(p)} n={p} active={p === page} />
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
            <PageNum href={href(totalPages)} n={totalPages} active={page === totalPages} />
          </>
        )}
        <PageLink href={page < totalPages ? href(page + 1) : null} aria="Next">
          <ChevronRight className="h-4 w-4" />
        </PageLink>
      </nav>
    </div>
  );
}

function PageNum({ href, n, active }: { href: string; n: number; active: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
        active
          ? 'bg-primary text-white shadow-glow'
          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {n}
    </Link>
  );
}

function PageLink({
  href,
  aria,
  children,
}: {
  href: string | null;
  aria: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 text-slate-300 cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={aria}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
    >
      {children}
    </Link>
  );
}
