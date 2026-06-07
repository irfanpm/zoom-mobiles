'use client';

import { useMemo, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Plus, Sparkles, Flame, Eye, Minus, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StockBadge, StockDot } from './StockBadge';
import { cn, formatINR } from '@/lib/utils';
import { useEnquiryStore } from '@/store/enquiry-store';
import { quickEnquiryUrl } from '@/lib/whatsapp';
import { useSettings } from '@/components/providers/SettingsProvider';
import { logEnquiry } from '@/lib/enquiries/actions';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  variant?: 'default' | 'compact';
}

export function ProductCard({ product, onView, variant = 'default' }: ProductCardProps) {
  const [fav, setFav] = useState(false);
  const [unit, setUnit] = useState<'box' | 'inner' | 'piece'>('box');
  const [qty, setQty] = useState(1);
  const addItem = useEnquiryStore((s) => s.addItem);
  const items = useEnquiryStore((s) => s.items);
  const settings = useSettings();
  const [waPending, startWa] = useTransition();

  const handleQuickWhatsApp = () => {
    const url = quickEnquiryUrl(product.name, product.code, settings);

    // Open WhatsApp synchronously (avoids popup blocker)
    const popup = window.open(url, '_blank', 'noopener');
    if (!popup) {
      toast.error('Pop-up blocked — please allow popups for this site');
      return;
    }

    // Log to admin panel in background
    startWa(async () => {
      const res = await logEnquiry([
        {
          product_id: product.id,
          code: product.code,
          name: product.name,
          qty: qty || 1,
          unit: unit === 'piece' ? 'pcs' : 'box',
        },
      ]).catch((e) => ({ error: String(e) }));

      if (res && 'error' in res && res.error) {
        toast.error('Enquiry not saved to admin', { description: res.error });
      } else if (res && 'skipped' in res && res.skipped) {
        // admin testing — silent
      } else {
        toast.success('Sent on WhatsApp & logged');
      }
    });
  };
  const inEnquiry = useMemo(() => items.some((i) => i.productId === product.id), [items, product.id]);

  const outOfStock = product.status === 'out-of-stock';
  const enquiryLocked = product.canEnquire === false;
  const disabled = outOfStock || enquiryLocked;

  const handleAdd = () => {
    if (enquiryLocked) {
      toast.error('Enquiry not available for this brand', {
        description: 'Contact Zoom Mobiles to request access.',
      });
      return;
    }
    if (outOfStock) {
      toast.error('Out of stock — add to enquiry instead', {
        description: 'We will notify when this product is back in stock.',
      });
      return;
    }
    addItem(product, qty, unit);
    toast.success(`${product.name} added to enquiry`, {
      description: `${qty} ${unit === 'box' ? 'Box' : unit === 'inner' ? 'Inner' : 'Pcs'} added`,
    });
  };

  const unitValue =
    unit === 'box' ? (product.box ?? 1) : unit === 'inner' ? (product.inner ?? 1) : 1;
  const totalPcs = qty * unitValue;
  const showBoxInfo = product.box !== null;
  const showStock = product.availableQty !== null;
  const showMOQ = product.moq !== null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-white overflow-hidden shadow-card transition-all',
        disabled
          ? 'border-dark-200/60 opacity-90'
          : 'border-dark-200/70 hover:shadow-premium hover:border-primary/30'
      )}
    >
      {(product.isNew || product.isFastSelling || enquiryLocked) && (
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {enquiryLocked && (
            <span className="chip bg-danger/90 text-white shadow-soft backdrop-blur">
              <Lock className="h-3 w-3" /> Enquiry locked
            </span>
          )}
          {product.isNew && (
            <span className="chip bg-secondary text-white shadow-glow-blue">
              <Sparkles className="h-3 w-3" /> New
            </span>
          )}
          {product.isFastSelling && (
            <span className="chip bg-accent text-accent-foreground shadow-soft">
              <Flame className="h-3 w-3" /> Fast Selling
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setFav((v) => !v)}
        className={cn(
          'absolute top-3 right-3 z-10 h-8 w-8 rounded-full inline-flex items-center justify-center transition-all bg-white/80 backdrop-blur border border-dark-200/60 shadow-sm',
          fav ? 'text-danger' : 'text-dark-500 hover:text-danger'
        )}
        aria-label="Favorite"
      >
        <Heart className={cn('h-4 w-4', fav && 'fill-danger')} />
      </button>

      <div className={cn('relative overflow-hidden bg-gradient-to-br from-dark-50 to-dark-100',
        variant === 'compact' ? 'h-32' : 'h-44'
      )}>
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="font-display font-extrabold text-2xl text-dark-800/30 tracking-tight">
                {product.code}
              </div>
              <div className="text-[10px] text-dark-400 mt-1 uppercase tracking-widest">
                {product.brand}
              </div>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <StockBadge status={product.status} />
        </div>
        {showStock && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 chip bg-white/85 backdrop-blur border border-dark-200/60 text-dark-700">
            <StockDot status={product.status} />
            {product.availableQty!.toLocaleString('en-IN')} pcs
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-dark-900 line-clamp-1 leading-snug">
              {product.name}
            </h3>
            <p className="text-xs text-dark-500 mt-0.5">
              {product.brand}
              {showMOQ && <> · MOQ {product.moq}</>}
            </p>
          </div>
          {product.price != null && (
            <div className="text-right shrink-0">
              <div className="text-base font-bold text-dark-900 leading-none">
                {formatINR(product.price)}
              </div>
              <div className="text-[10px] text-dark-500 mt-1">/pc</div>
            </div>
          )}
        </div>

        {showBoxInfo && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-dark-600">
            <span className="chip bg-dark-100 text-dark-700">Box: {product.box}</span>
            {product.inner != null && (
              <span className="chip bg-dark-100 text-dark-700">Inner: {product.inner}</span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-1 rounded-xl border border-dark-200 bg-dark-50 p-1 text-xs">
          {(['box', 'inner', 'piece'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn(
                'flex-1 py-1.5 rounded-lg font-semibold capitalize transition-colors',
                unit === u
                  ? 'bg-white text-dark-900 shadow-sm'
                  : 'text-dark-500 hover:text-dark-800'
              )}
            >
              {u}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center rounded-xl border border-dark-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-9 w-9 inline-flex items-center justify-center text-dark-700 hover:bg-dark-100"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
              className="w-12 h-9 text-center text-sm font-semibold bg-transparent focus:outline-none"
              aria-label="Quantity"
            />
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="h-9 w-9 inline-flex items-center justify-center text-dark-700 hover:bg-dark-100"
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-[11px] text-dark-500">
            = {totalPcs.toLocaleString('en-IN')} pcs
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="col-span-1"
            onClick={() => onView?.(product)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="whatsapp"
            size="sm"
            className="col-span-1"
            onClick={handleQuickWhatsApp}
            disabled={waPending || enquiryLocked}
            aria-label={enquiryLocked ? 'Enquiry restricted' : 'Order on WhatsApp'}
            title={enquiryLocked ? 'Brand restricted — contact admin' : 'Order on WhatsApp'}
          >
            {enquiryLocked ? (
              <Lock className="h-4 w-4" />
            ) : waPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            className="col-span-1"
            onClick={handleAdd}
            disabled={disabled}
            variant={inEnquiry ? 'secondary' : 'default'}
            title={enquiryLocked ? 'Brand restricted — contact admin' : ''}
          >
            {enquiryLocked ? (
              <><Lock className="h-3.5 w-3.5" /> Restricted</>
            ) : inEnquiry ? (
              'Added'
            ) : (
              'Add'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
