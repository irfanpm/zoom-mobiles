'use client';

import { useTransition } from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { logout } from '@/lib/auth/actions';

export default function AdminHeader({
  adminName,
  adminRole,
}: {
  adminName: string;
  adminRole: string;
}) {
  const [pending, start] = useTransition();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-3 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8">
      <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span>Secure session</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right leading-tight hidden sm:block">
          <div className="text-sm font-semibold text-dark">{adminName}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            {adminRole.replace('_', ' ')}
          </div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold">
          {adminName.charAt(0).toUpperCase()}
        </div>

        <form
          action={() => start(() => logout())}
          className="ml-1"
        >
          <button
            type="submit"
            disabled={pending}
            suppressHydrationWarning
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-danger disabled:opacity-60"
          >
            <LogOut className="h-3.5 w-3.5" />
            {pending ? '…' : 'Logout'}
          </button>
        </form>
      </div>
    </header>
  );
}
