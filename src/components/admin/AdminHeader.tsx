'use client';

import { useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, LogOut, KeyRound, X, Eye, EyeOff, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { logout, changeOwnPassword } from '@/lib/auth/actions';

export default function AdminHeader({
  adminName,
  adminRole,
}: {
  adminName: string;
  adminRole: string;
}) {
  const [pending, start] = useTransition();
  const [showPwModal, setShowPwModal] = useState(false);

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

        {/* Change password */}
        <button
          type="button"
          onClick={() => setShowPwModal(true)}
          suppressHydrationWarning
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-primary"
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Password</span>
        </button>

        <form action={() => start(() => logout())}>
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

      <AnimatePresence>
        {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
      </AnimatePresence>
    </header>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [show, setShow] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await changeOwnPassword(fd);
      if (res?.error) setError(res.error);
      else {
        setDone(true);
        setTimeout(onClose, 2000);
      }
    });
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-premium overflow-hidden"
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-dark flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" /> Change Password
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Update your admin account password.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-dark"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5">
          {done ? (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="font-semibold text-dark">Password updated!</p>
              <p className="text-sm text-slate-500">Use your new password next time you log in.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-700">New Password</label>
                <div className="relative">
                  <input
                    name="new_password"
                    type={show ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-700">Confirm New Password</label>
                <input
                  name="confirm"
                  type={show ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60"
              >
                <KeyRound className="h-4 w-4" />
                {pending ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
