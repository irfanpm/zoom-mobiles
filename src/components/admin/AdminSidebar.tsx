'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useTransition, useEffect, type ComponentType } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Users,
  UsersRound,
  Palette,
  MessageSquare,
  Settings,
  Menu,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  superOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/brands', label: 'Brands', icon: Tag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { href: '/admin/team', label: 'Team', icon: UsersRound, superOnly: true },
  { href: '/admin/appearance', label: 'Appearance', icon: Palette, superOnly: true },
  { href: '/admin/settings', label: 'Settings', icon: Settings, superOnly: true },
];

export default function AdminSidebar({ role = 'admin' }: { role?: 'admin' | 'super_admin' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  // Which link did the user just click? Highlight it immediately so the click
  // FEELS instant even before the server returns.
  const [navTarget, setNavTarget] = useState<string | null>(null);

  // Clear the optimistic target as soon as the real route arrives.
  useEffect(() => {
    if (navTarget && pathname === navTarget) setNavTarget(null);
  }, [pathname, navTarget]);

  const isActive = (item: NavItem) => {
    // If user just clicked, use that as the source of truth (optimistic UI)
    if (navTarget) {
      return item.exact ? navTarget === item.href : navTarget.startsWith(item.href);
    }
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  };

  const handleClick = (href: string) => (e: React.MouseEvent) => {
    if (href === pathname) return;
    e.preventDefault();
    setNavTarget(href);
    setOpen(false);
    startTransition(() => router.push(href));
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-card border border-slate-200"
        aria-label="Open admin menu"
      >
        <Menu className="h-5 w-5 text-dark" />
      </button>

      {/* Top progress bar — shows during navigation transitions */}
      {pending && (
        <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 overflow-hidden bg-primary/20">
          <div className="h-full w-1/3 bg-primary animate-[shimmer_1s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-dark-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-dark-900 text-white transition-transform duration-300 ease-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 px-5 border-b border-white/10">
          <Link
            href="/admin"
            prefetch
            onClick={handleClick('/admin')}
            className="flex items-center gap-2.5"
          >
            <Image
              src="/logo.svg"
              alt="Zoom"
              width={32}
              height={32}
              className="rounded-lg bg-white/10 p-1"
            />
            <div className="leading-tight">
              <div className="text-sm font-bold">Zoom Mobiles</div>
              <div className="text-[10px] uppercase tracking-wider text-accent">
                Admin Console
              </div>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {NAV.filter((item) => !item.superOnly || role === 'super_admin').map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const isLoading = pending && navTarget === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={handleClick(item.href)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-primary text-white shadow-glow'
                    : 'text-white/70 hover:bg-white/5 hover:text-white',
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <Link
            href="/products"
            target="_blank"
            className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-xs text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              View live site
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
