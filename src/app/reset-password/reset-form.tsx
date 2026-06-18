'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Phase = 'verifying' | 'ready' | 'invalid' | 'done';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [pending, start] = useTransition();

  // Establish the recovery session from the URL (PKCE ?code= or hash token).
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function init() {
      try {
        const url = new URL(window.location.href);

        // 1) Error returned in the link (expired/invalid)
        const errDesc =
          url.searchParams.get('error_description') ||
          new URLSearchParams(window.location.hash.slice(1)).get('error_description');
        if (errDesc) {
          if (!cancelled) { setPhase('invalid'); setError(decodeURIComponent(errDesc)); }
          return;
        }

        // 2) PKCE flow → exchange the ?code= for a session
        const code = url.searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) { if (!cancelled) setPhase('invalid'); return; }
        }

        // 3) Hash-token flow is auto-detected by the browser client.
        //    Either way, check whether we now have a session.
        const { data } = await supabase.auth.getSession();
        if (!cancelled) setPhase(data.session ? 'ready' : 'invalid');
      } catch {
        if (!cancelled) setPhase('invalid');
      }
    }

    init();

    // Supabase fires PASSWORD_RECOVERY when the recovery session is ready.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' || session) setPhase('ready');
    });

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password') ?? '');
    const confirm = String(fd.get('confirm') ?? '');

    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    start(async () => {
      // Update using the BROWSER client — it holds the recovery session.
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(
          /session|jwt|expired/i.test(error.message)
            ? 'This reset link is invalid or has expired. Please request a new one.'
            : error.message,
        );
        return;
      }
      setPhase('done');
      setTimeout(() => router.push('/login'), 2500);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md rounded-3xl bg-white shadow-premium border border-slate-200/60 overflow-hidden"
    >
      <div className="bg-gradient-to-br from-primary to-primary-700 p-8 text-white">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-white/80 text-sm">Choose a strong password for your account.</p>
      </div>

      <div className="p-8">
        {phase === 'verifying' && (
          <div className="text-center py-6 space-y-3">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-slate-500">Verifying your reset link…</p>
          </div>
        )}

        {phase === 'invalid' && (
          <div className="text-center space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-danger/10 text-danger">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h2 className="font-semibold text-dark text-lg">Link invalid or expired</h2>
            <p className="text-sm text-slate-500">
              {error || 'This password-reset link is no longer valid. Reset links expire after 1 hour.'}
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition"
            >
              Request a new link
            </Link>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/10 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="font-semibold text-dark text-lg">Password updated!</h2>
            <p className="text-sm text-slate-500">Redirecting you to login…</p>
          </div>
        )}

        {phase === 'ready' && (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> New Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={show ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Confirm Password
              </label>
              <input
                name="confirm"
                type={show ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Re-enter password"
                suppressHydrationWarning
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-danger/5 border border-danger/20 px-3 py-2.5 text-sm text-danger">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60"
            >
              {pending ? 'Updating…' : 'Update password'}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-xs text-slate-500 hover:text-dark">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
