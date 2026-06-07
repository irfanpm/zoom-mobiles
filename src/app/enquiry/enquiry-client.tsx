'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MessageCircle,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useEnquiryStore } from '@/store/enquiry-store';
import { logEnquiry } from '@/lib/enquiries/actions';
import { buildWhatsAppMessage } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import type { DbEnquiryItem } from '@/lib/supabase/types';

interface FormValues {
  name: string;
  phone: string;
  city: string;
  shop: string;
  notes: string;
}

type CustomerData = {
  id: string;
  full_name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
} | null;

export default function EnquiryClient({
  customer,
  whatsappNumber,
  whatsappDisplay,
  companyName,
}: {
  customer: CustomerData;
  whatsappNumber: string;
  whatsappDisplay: string;
  companyName: string;
}) {
  const items = useEnquiryStore((s) => s.items);
  const updateQuantity = useEnquiryStore((s) => s.updateQuantity);
  const updateUnit = useEnquiryStore((s) => s.updateUnit);
  const removeItem = useEnquiryStore((s) => s.removeItem);
  const clear = useEnquiryStore((s) => s.clear);

  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  const { register, watch } = useForm<FormValues>({
    defaultValues: {
      name: customer?.full_name ?? '',
      phone: customer?.phone ?? '',
      city: customer?.city ?? '',
      shop: customer?.company_name ?? '',
      notes: '',
    },
  });

  const values = watch();

  const message = useMemo(() => {
    return buildWhatsAppMessage({
      items,
      customerName: values.name || customer?.full_name || undefined,
      customerCompany: values.shop || customer?.company_name || undefined,
      customerPhone: values.phone || customer?.phone || undefined,
      customerCity: values.city || customer?.city || undefined,
      customerId: customer?.id,
      notes: values.notes,
      settings: {
        whatsapp_number: whatsappNumber,
        company_name: companyName,
      },
    });
  }, [items, values, customer, companyName, whatsappNumber]);

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  const handleSend = () => {
    if (!items.length) return;
    const dbItems: DbEnquiryItem[] = items.map((it) => ({
      product_id: it.productId,
      code: it.code,
      name: it.name,
      qty: it.quantity,
      unit: it.unit === 'piece' ? 'pcs' : 'box',
    }));

    // Open WhatsApp synchronously inside the click handler (no popup blocker)
    const popup = window.open(whatsappUrl, '_blank', 'noopener');
    if (!popup) {
      alert('Pop-up blocked. Please allow popups and try again.');
      return;
    }

    start(async () => {
      const res = await logEnquiry(dbItems, values.notes);
      if (res && 'error' in res && res.error) {
        // surface error but don't undo the open WhatsApp window
        alert('WhatsApp opened, but enquiry could not be saved to admin: ' + res.error);
        return;
      }
      if (res && 'skipped' in res && res.skipped) {
        alert('You are logged in as admin — enquiry NOT saved to /admin/enquiries. Log in as a customer to log enquiries.');
        return;
      }
      setSent(true);
      clear(); // empty the cart so user sees fresh state
    });
  };

  if (!items.length) {
    return (
      <section className="container-fluid py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-dark-100 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-dark-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-dark-900">Your enquiry is empty</h1>
          <p className="mt-2 text-dark-600">
            Browse our wholesale inventory and add products to build your enquiry.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
              Back to Inventory
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container-fluid py-10 lg:py-14">
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-dark-600 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to inventory
        </Link>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-dark-900 tracking-tight">
          Review your enquiry
        </h1>
        <p className="mt-2 text-dark-600">
          Confirm your items and send directly to our sales desk on WhatsApp.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-900">
              {items.length} {items.length === 1 ? 'product' : 'products'} in enquiry
            </h2>
            <button
              type="button"
              onClick={clear}
              className="text-sm text-dark-500 hover:text-danger inline-flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </button>
          </div>

          <motion.ul layout className="space-y-3">
            {items.map((item) => (
              <motion.li
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-dark-200 bg-white p-4 flex items-center gap-4"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-dark-50 to-dark-100 overflow-hidden shrink-0 grid place-items-center">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs text-dark-600">{item.code.slice(0, 6)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-dark-900 truncate">{item.name}</div>
                  <div className="text-xs text-dark-500 mt-0.5">Code: {item.code}</div>
                  <div className="mt-2 flex items-center gap-1 rounded-lg border border-dark-200 bg-dark-50 p-0.5 w-fit text-[11px]">
                    {(['box', 'inner', 'piece'] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => updateUnit(item.productId, u)}
                        className={cn(
                          'px-3 py-1 rounded-md font-semibold capitalize',
                          item.unit === u ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500',
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center rounded-xl border border-dark-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-9 w-9 inline-flex items-center justify-center hover:bg-dark-100"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, Math.max(1, Number(e.target.value || 1)))
                      }
                      className="w-12 h-9 text-center text-sm font-semibold bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-9 w-9 inline-flex items-center justify-center hover:bg-dark-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="h-9 w-9 rounded-xl bg-dark-100 hover:bg-danger/10 hover:text-danger inline-flex items-center justify-center"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          <div className="rounded-2xl border border-dark-200 bg-white p-6 mt-6">
            <h2 className="font-semibold text-dark-900 mb-4">Customer information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name">
                <Input placeholder="Your name" {...register('name')} />
              </Field>
              <Field label="Phone number">
                <Input type="tel" placeholder="+91 99999 99999" {...register('phone')} />
              </Field>
              <Field label="City">
                <Input placeholder="City" {...register('city')} />
              </Field>
              <Field label="Shop / Business name">
                <Input placeholder="Optional" {...register('shop')} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Notes for sales team">
                  <Textarea
                    placeholder="Any special requirements, brand preferences, delivery timeline…"
                    {...register('notes')}
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-dark-200 bg-white overflow-hidden">
              <div className="bg-[#25D366] text-white p-4 flex items-center gap-3">
                <MessageCircle className="h-5 w-5" />
                <div>
                  <div className="font-semibold">WhatsApp Preview</div>
                  <div className="text-xs text-white/80">Sending to {whatsappDisplay}</div>
                </div>
              </div>
              <div className="p-4 bg-[#ECE5DD]">
                <div className="rounded-xl rounded-tl-none bg-white p-4 shadow-sm whitespace-pre-wrap text-sm text-dark-800 font-mono leading-relaxed max-h-[420px] overflow-y-auto">
                  {message}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <Button
                  type="button"
                  variant="whatsapp"
                  size="lg"
                  className="w-full"
                  onClick={handleSend}
                  disabled={!items.length || pending}
                >
                  <MessageCircle className="h-4 w-4" />
                  {pending ? 'Sending…' : 'Send Enquiry on WhatsApp'}
                </Button>
                {sent && (
                  <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Enquiry sent & logged. Our team will reply on WhatsApp shortly.
                  </div>
                )}
                <p className="text-xs text-dark-500 text-center">
                  Your enquiry is securely logged in our system.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-dark-200 bg-dark-50 p-5">
              <h3 className="font-semibold text-dark-900">What happens next?</h3>
              <ul className="mt-3 space-y-2 text-sm text-dark-600">
                <Step n={1}>You send the enquiry on WhatsApp.</Step>
                <Step n={2}>Our team confirms availability & shares wholesale pricing.</Step>
                <Step n={3}>Place order — same-day dispatch with pan-India delivery.</Step>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <Separator className="my-14" />

      <div className="text-center max-w-xl mx-auto">
        <h3 className="text-xl font-bold text-dark-900">Need help with your order?</h3>
        <p className="mt-2 text-sm text-dark-600">
          Our sales team is online 10:00 AM – 8:00 PM IST. Mon – Sat.
        </p>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-white text-xs font-bold inline-flex items-center justify-center">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
