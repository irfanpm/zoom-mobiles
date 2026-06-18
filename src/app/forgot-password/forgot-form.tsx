'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { requestPasswordReset } from '@/lib/auth/actions';

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await requestPasswordReset(fd);
      if (res?.error) setError(res.error);
      else setSent(true);
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
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-white/80 text-sm">
          We&apos;ll email you a secure link to set a new password.
        </p>
      </div>

      <div className="p-8">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/10 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="font-semibold text-dark text-lg">Check your email</h2>
            <p className="text-sm text-slate-500">
              If an account exists for that email, a password-reset link is on its way.
              Click it to set a new password. The link expires in 1 hour.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
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
              {pending ? 'Sending…' : 'Send reset link'}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-dark"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
