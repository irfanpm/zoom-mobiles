'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ShoppingBag, X, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEnquiryStore } from '@/store/enquiry-store';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

export function FloatingEnquiryBar() {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const items = useEnquiryStore((s) => s.items);
  const clear = useEnquiryStore((s) => s.clear);
  const removeItem = useEnquiryStore((s) => s.removeItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSend = () => {
    if (items.length === 0) return;
    const msg = buildWhatsAppMessage({ items });
    window.open(buildWhatsAppUrl(msg), '_blank', 'noopener');
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
                        <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white/80 text-xs shrink-0">
                          {item.code.slice(0, 4)}
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
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Send on WhatsApp</span>
                  <span className="sm:hidden">Send</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
