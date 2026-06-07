'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ShoppingBag, X, ChevronUp, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEnquiryStore } from '@/store/enquiry-store';
import { buildWhatsAppMessage } from '@/lib/whatsapp';
import { useSettings, whatsappUrl } from '@/components/providers/SettingsProvider';
import { cn } from '@/lib/utils';
import { logEnquiry } from '@/lib/enquiries/actions';
import { toast } from 'sonner';
import type { DbEnquiryItem } from '@/lib/supabase/types';

export function FloatingEnquiryBar() {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const items = useEnquiryStore((s) => s.items);
  const clear = useEnquiryStore((s) => s.clear);
  const removeItem = useEnquiryStore((s) => s.removeItem);
  const settings = useSettings();
  const [pending, start] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSend = () => {
    if (items.length === 0) return;

    // Map UI items → DB shape
    const dbItems: DbEnquiryItem[] = items.map((it) => ({
      product_id: it.productId,
      code: it.code,
      name: it.name,
      qty: it.quantity,
      unit: it.unit === 'piece' ? 'pcs' : 'box',
    }));

    const msg = buildWhatsAppMessage({ items, settings });
    const url = whatsappUrl(settings.whatsapp_number, msg);

    // ── Open WhatsApp SYNCHRONOUSLY inside the user-click handler ──
    // Browsers block window.open() that fires later inside an async callback.
    // Doing it now (directly in the click) bypasses the popup blocker.
    const popup = window.open(url, '_blank', 'noopener');
    if (!popup) {
      toast.error('Pop-up blocked', {
        description: `Please allow popups, or open ${settings.whatsapp_display} manually.`,
      });
      return;
    }

    // ── Log to DB in background (won't block the customer) ──
    start(async () => {
      const res = await logEnquiry(dbItems);
      if (!res) {
        toast.error('Unknown error logging enquiry');
        return;
      }
      if ('error' in res && res.error) {
        toast.error('Enquiry not saved to admin', { description: res.error });
        return;
      }
      if ('skipped' in res && res.skipped) {
        toast.warning('WhatsApp opened, but enquiry NOT logged', {
          description:
            'You are logged in as admin — enquiry logging requires a customer account.',
          duration: 6000,
        });
        return;
      }
      toast.success('✅ Enquiry sent & saved to admin panel');
      clear(); // empty the cart so user sees a clean slate
    });
  };

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 220 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 sm:px-6 sm:pb-6"
        >
          <div className="mx-auto max-w-5xl rounded-2xl bg-dark-900 text-white shadow-premium border border-white/10 overflow-hidden">
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/10"
                >
                  <div className="max-h-[40vh] overflow-y-auto p-4 space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
                      >
                        <div className="h-10 w-10 rounded-lg bg-white/10 overflow-hidden shrink-0 grid place-items-center">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-bold text-white/80 text-xs">{item.code.slice(0, 4)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{item.name}</div>
                          <div className="text-xs text-white/60">
                            {item.quantity} {item.unit === 'box' ? 'Box' : item.unit === 'inner' ? 'Inner' : 'Pcs'} · {item.code}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="h-8 w-8 rounded-lg bg-white/5 hover:bg-danger/20 hover:text-danger inline-flex items-center justify-center transition-colors"
                          aria-label="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 p-3 sm:p-4">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className="relative shrink-0">
                  <div className="h-11 w-11 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-base">
                    {items.length}
                  </div>
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent border-2 border-dark-900" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
                    Your Enquiry
                    <ChevronUp
                      className={cn(
                        'h-4 w-4 transition-transform',
                        expanded && 'rotate-180'
                      )}
                    />
                  </div>
                  <div className="text-xs text-white/60 truncate">
                    {items.length} {items.length === 1 ? 'product' : 'products'} · {totalUnits} units total
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="hidden sm:inline-flex text-white/80 hover:bg-white/10 hover:text-white"
                  onClick={clear}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
                <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
                  <Link href="/enquiry">
                    <ShoppingBag className="h-4 w-4" />
                    Review
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="whatsapp"
                  onClick={handleSend}
                  disabled={pending}
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {pending ? 'Sending…' : 'Send on WhatsApp'}
                  </span>
                  <span className="sm:hidden">{pending ? '…' : 'Send'}</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
