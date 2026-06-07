'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginCustomer } from '@/lib/auth/actions';

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [pending, start] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set('redirect', redirectTo);
    start(async () => {
      const res = await loginCustomer(fd);
      if (res?.error) setError(res.error);
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
        <Image
          src="/logo.svg"
          alt="Zoom Mobiles"
          width={56}
          height={56}
          className="mb-4 rounded-xl bg-white/15 p-2 backdrop-blur"
        />
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-white/80 text-sm">
          Sign in to access your wholesale catalog
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-8 space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dark-700 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="customer@example.com"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={show ? 'Hide password' : 'Show password'}
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
          className="group relative w-full overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-600 disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in to Catalog'}
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>
            Don&apos;t have an account?{' '}
            <a
              href="https://wa.me/919207908718?text=Hello%20Zoom%20Mobiles%2C%20I%20would%20like%20wholesale%20catalog%20access."
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Request access on WhatsApp
            </a>
          </span>
        </div>

        <div className="text-center">
          <Link
            href="/admin/login"
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Admin login →
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
