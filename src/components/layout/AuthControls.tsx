'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { LogOut, User, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/lib/auth/actions';
import { useEnquiryStore } from '@/store/enquiry-store';

type Me = { name: string; company: string | null } | null;

export default function AuthControls({ className = '' }: { className?: string }) {
  const [me, setMe] = useState<Me>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, start] = useTransition();
  const clearCart = useEnquiryStore((s) => s.clear);

  const handleLogout = () => {
    // Wipe the customer's enquiry cart so the next person on this device
    // can't see / send the previous customer's items.
    clearCart();
    try {
      localStorage.removeItem('zoom-mobiles-enquiry');
    } catch {
      // ignore
    }
    start(() => logout());
  };

  useEffect(() => {
    const supabase = createClient();
    let cancel = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancel) {
          if (!cancel) setLoaded(true);
          return;
        }
        const { data } = await supabase
          .from('customers')
          .select('full_name, company_name')
          .eq('id', user.id)
          .maybeSingle();
        if (cancel) return;
        if (data) setMe({ name: data.full_name, company: data.company_name });
        setLoaded(true);
      } catch {
        // Network blip / offline — fail quietly, just show the logged-out state.
        if (!cancel) setLoaded(true);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  if (!loaded) return null;

  if (!me) {
    return (
      <Link
        href="/login"
        className={`inline-flex items-center gap-1.5 rounded-lg bg-dark-100 px-3 py-2 text-xs font-medium text-dark-800 hover:bg-dark-200 transition ${className}`}
      >
        <LogIn className="h-3.5 w-3.5" />
        Login
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="hidden sm:flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-1.5">
        <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-[10px] font-bold">
          {me.name.charAt(0).toUpperCase()}
        </div>
        <div className="leading-tight">
          <div className="text-[11px] font-semibold text-dark-900 truncate max-w-[120px]">{me.name}</div>
          {me.company && (
            <div className="text-[9px] text-dark-500 truncate max-w-[120px]">{me.company}</div>
          )}
        </div>
      </div>
      <form action={handleLogout}>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dark-200 bg-white px-2.5 py-1.5 text-xs font-medium text-dark-600 hover:bg-slate-50 hover:text-danger transition disabled:opacity-60"
          aria-label="Logout"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </form>
    </div>
  );
}
