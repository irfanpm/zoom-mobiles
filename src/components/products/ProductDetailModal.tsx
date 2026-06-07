'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StockBadge } from './StockBadge';
import {
  Package,
  Layers,
  ShieldCheck,
  Truck,
  MessageCircle,
  ShoppingBag,
  Tag,
  BadgeCheck,
  Minus,
  Plus,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatINR } from '@/lib/utils';
import { quickEnquiryUrl } from '@/lib/whatsapp';
import { useEnquiryStore } from '@/store/enquiry-store';
import { useSettings } from '@/components/providers/SettingsProvider';
import { logEnquiry } from '@/lib/enquiries/actions';
import { useTransition } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
  const [unit, setUnit] = useState<'box' | 'inner' | 'piece'>('box');
  const [qty, setQty] = useState(1);
  const addItem = useEnquiryStore((s) => s.addItem);
  const settings = useSettings();
  const [waPending, startWa] = useTransition();

  if (!product) return null;

  const enquiryLocked = product.canEnquire === false;

  const handleQuickWhatsApp = () => {
    if (enquiryLocked) {
      toast.error('Enquiry not available for this brand', {
        description: 'Contact Zoom Mobiles to request access.',
      });
      return;
    }
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

  const outOfStock = product.status === 'out-of-stock';
  const disabled = outOfStock || enquiryLocked;
  const unitValue =
    unit === 'box' ? (product.box ?? 1) : unit === 'inner' ? (product.inner ?? 1) : 1;
  const totalPcs = qty * unitValue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="right" className="w-full max-w-xl">
        <div className="space-y-6 pb-24 sm:pb-0">
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-dark-50 to-dark-100 flex items-center justify-center relative overflow-hidden">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="text-center px-6">
                <div className="font-display font-extrabold text-5xl text-dark-800/25 tracking-tight">
                  {product.code}
                </div>
                <div className="text-xs text-dark-400 mt-2 uppercase tracking-widest">
                  {product.brand}
                </div>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <StockBadge status={product.status} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-dark-500 mb-2">
              <Tag className="h-3.5 w-3.5" />
              <span className="capitalize">{product.category.replaceAll('-', ' ')}</span>
              <span>·</span>
              <span>{product.brand}</span>
            </div>
            <DialogTitle className="text-2xl font-bold text-dark-900">
              {product.name}
            </DialogTitle>
            {product.price != null && (
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-dark-900">
                  {formatINR(product.price)}
                </span>
                <span className="text-sm text-dark-500">/pc · Wholesale</span>
              </div>
            )}
            <p className="mt-4 text-sm text-dark-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            {product.box != null && (
              <Spec icon={Package} label="Box Quantity" value={`${product.box} pcs`} />
            )}
            {product.inner != null && (
              <Spec icon={Layers} label="Inner Quantity" value={`${product.inner} pcs`} />
            )}
            {product.moq != null && (
              <Spec icon={ShoppingBag} label="MOQ" value={`${product.moq} pcs`} />
            )}
            {product.availableQty != null && (
              <Spec
                icon={BadgeCheck}
                label="Available"
                value={`${product.availableQty.toLocaleString('en-IN')} pcs`}
              />
            )}
            <Spec icon={ShieldCheck} label="Warranty" value="Brand Standard" />
            <Spec icon={Truck} label="Dispatch" value="Same-day" />
          </div>

          <Separator />

          <div>
            <div className="text-sm font-semibold text-dark-900 mb-3">Order Configuration</div>
            <div className="flex items-center gap-1 rounded-xl border border-dark-200 bg-dark-50 p-1 text-sm">
              {(['box', 'inner', 'piece'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`flex-1 py-2 rounded-lg font-semibold capitalize transition-colors ${
                    unit === u
                      ? 'bg-white text-dark-900 shadow-sm'
                      : 'text-dark-500 hover:text-dark-800'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center rounded-xl border border-dark-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-11 w-11 inline-flex items-center justify-center text-dark-700 hover:bg-dark-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
                  className="w-16 h-11 text-center text-sm font-semibold bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="h-11 w-11 inline-flex items-center justify-center text-dark-700 hover:bg-dark-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-right">
                <div className="text-xs text-dark-500">Total Pieces</div>
                <div className="text-xl font-extrabold text-primary">
                  {totalPcs.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-dark-200 bg-white p-4 sm:relative sm:border-0 sm:p-0 sm:pt-2">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              type="button"
              variant="whatsapp"
              size="lg"
              onClick={handleQuickWhatsApp}
              disabled={waPending || enquiryLocked}
              title={enquiryLocked ? 'Brand restricted — contact admin' : ''}
            >
              {enquiryLocked ? (
                <Lock className="h-4 w-4" />
              ) : waPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              {enquiryLocked ? 'Restricted' : waPending ? 'Sending…' : 'WhatsApp Order'}
            </Button>
            <Button
              size="lg"
              disabled={disabled}
              onClick={() => {
                if (enquiryLocked) {
                  toast.error('Enquiry not available for this brand');
                  return;
                }
                addItem(product, qty, unit);
                toast.success(`${product.name} added to enquiry`);
                onOpenChange(false);
              }}
              title={enquiryLocked ? 'Brand restricted — contact admin' : ''}
            >
              {enquiryLocked ? (
                <><Lock className="h-4 w-4" /> Restricted</>
              ) : (
                <><ShoppingBag className="h-4 w-4" /> Add to Enquiry</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-dark-200 bg-white p-3">
      <div className="flex items-center gap-2 text-xs text-dark-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 font-semibold text-dark-900 text-sm">{value}</div>
    </div>
  );
}
