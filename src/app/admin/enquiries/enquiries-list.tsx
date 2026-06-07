'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ChevronDown,
  Phone,
  Building,
  Calendar,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { updateEnquiryStatus, deleteEnquiry } from '@/lib/enquiries/actions';
import { cn } from '@/lib/utils';
import type { EnquiryStatus, DbEnquiryItem } from '@/lib/supabase/types';

type Enquiry = {
  id: string;
  customer_id: string | null;
  customer_snapshot: {
    full_name?: string;
    company_name?: string;
    phone?: string;
    email?: string;
  } | null;
  items: DbEnquiryItem[];
  message: string | null;
  whatsapp_sent: boolean;
  status: EnquiryStatus;
  created_at: string;
};

const STATUS_LABEL: Record<EnquiryStatus, { text: string; color: string }> = {
  new:       { text: 'New',       color: 'bg-primary/10 text-primary border-primary/20' },
  contacted: { text: 'Contacted', color: 'bg-secondary/10 text-secondary border-secondary/20' },
  converted: { text: 'Converted', color: 'bg-success/10 text-success border-success/20' },
  lost:      { text: 'Lost',      color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export default function EnquiriesList({
  enquiries,
  initialStatus,
}: {
  enquiries: Enquiry[];
  initialStatus: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [items, setItems] = useState(enquiries);
  const [pending, start] = useTransition();

  function setStatus(id: string, status: EnquiryStatus) {
    setItems((p) => p.map((e) => (e.id === id ? { ...e, status } : e)));
    start(() => updateEnquiryStatus(id, status).then((res) => {
      if (res?.error) alert(res.error);
    }));
  }

  function onDel(id: string) {
    if (!confirm('Delete this enquiry?')) return;
    start(async () => {
      const res = await deleteEnquiry(id);
      if (res?.error) alert(res.error);
      else setItems((p) => p.filter((e) => e.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { v: '', l: 'All' },
          { v: 'new', l: 'New' },
          { v: 'contacted', l: 'Contacted' },
          { v: 'converted', l: 'Converted' },
          { v: 'lost', l: 'Lost' },
        ].map((t) => (
          <Link
            key={t.v}
            href={t.v ? `/admin/enquiries?status=${t.v}` : '/admin/enquiries'}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-medium transition',
              initialStatus === t.v
                ? 'bg-dark text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
            )}
          >
            {t.l}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 font-semibold text-dark">No enquiries</h3>
          <p className="text-sm text-slate-500 mt-1">When customers send WhatsApp orders, they appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((e) => {
            const s = STATUS_LABEL[e.status];
            const isOpen = open === e.id;
            return (
              <div
                key={e.id}
                id={e.id}
                className="rounded-2xl bg-white shadow-card border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : e.id)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50/50 transition"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold shrink-0">
                    {(e.customer_snapshot?.full_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-dark text-sm">
                        {e.customer_snapshot?.full_name ?? 'Guest'}
                      </span>
                      {e.customer_snapshot?.company_name && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Building className="h-3 w-3" /> {e.customer_snapshot.company_name}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(e.created_at).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>{e.items.length} items</span>
                    </div>
                  </div>
                  <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', s.color)}>
                    {s.text}
                  </span>
                  <ChevronDown className={cn('h-4 w-4 text-slate-400 transition shrink-0', isOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-slate-100"
                    >
                      <div className="p-5 space-y-4 bg-slate-50/40">
                        {/* Contact actions */}
                        {e.customer_snapshot?.phone && (
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`tel:${e.customer_snapshot.phone}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-dark hover:bg-slate-50"
                            >
                              <Phone className="h-3 w-3" /> Call {e.customer_snapshot.phone}
                            </a>
                            <a
                              href={`https://wa.me/${e.customer_snapshot.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600"
                            >
                              <ExternalLink className="h-3 w-3" /> WhatsApp
                            </a>
                          </div>
                        )}

                        {/* Items */}
                        <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
                          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Requested Items
                          </div>
                          <ul className="divide-y divide-slate-100">
                            {e.items.map((it, i) => (
                              <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                                <div className="min-w-0">
                                  <div className="font-medium text-dark truncate">{it.name}</div>
                                  <div className="text-xs text-slate-500">{it.code}</div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <div className="font-semibold text-dark">{it.qty}</div>
                                  <div className="text-[10px] text-slate-500 uppercase">{it.unit}</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {e.message && (
                          <div className="rounded-xl bg-white border border-slate-200 p-3 text-sm text-dark whitespace-pre-wrap">
                            {e.message}
                          </div>
                        )}

                        {/* Status & delete */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Mark as:</span>
                            {(['new', 'contacted', 'converted', 'lost'] as EnquiryStatus[]).map((st) => (
                              <button
                                key={st}
                                onClick={() => setStatus(e.id, st)}
                                disabled={pending || e.status === st}
                                className={cn(
                                  'rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition',
                                  e.status === st
                                    ? STATUS_LABEL[st].color + ' border'
                                    : 'bg-white border border-slate-200 text-slate-500 hover:text-dark',
                                )}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => onDel(e.id)}
                            disabled={pending}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-danger/5 hover:text-danger hover:border-danger/20 transition"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
