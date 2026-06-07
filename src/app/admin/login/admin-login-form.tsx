'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react';
import { loginAdmin } from '@/lib/auth/actions';

export default function AdminLoginForm({
  redirectTo,
  initialError,
}: {
  redirectTo: string;
  initialError: string | null;
}) {
  const [error, setError] = useState<string | null>(initialError);
  const [show, setShow] = useState(false);
  const [pending, start] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set('redirect', redirectTo);
    start(async () => {
      const res = await loginAdmin(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl shadow-premium border border-white/10 overflow-hidden"
    >
      <div className="bg-gradient-to-br from-dark-900 via-dark-800 to-secondary-900 p-8 text-white">
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur">
          <KeyRound className="h-6 w-6 text-accent" />
        </div>
        <h1 className="text-2xl font-bold">Admin Console</h1>
        <p className="mt-1 text-white/70 text-sm">
          Restricted access — authorized personnel only
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-8 space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dark-700 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Admin Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@zoommobiles.in"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dark-700 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={show ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
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

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-xl bg-danger/5 border border-danger/20 px-3 py-2.5 text-sm text-danger"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-gradient-to-r from-dark-900 to-secondary px-4 py-3 text-sm font-semibold text-white shadow-glow-blue transition hover:from-dark-800 hover:to-secondary-600 disabled:opacity-60"
        >
          {pending ? 'Verifying…' : 'Sign in to Admin'}
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <ShieldCheck className="h-4 w-4 text-secondary" />
          <span>
            All admin actions are logged. Unauthorized access is prohibited.
          </span>
        </div>
      </form>
    </motion.div>
  );
}
