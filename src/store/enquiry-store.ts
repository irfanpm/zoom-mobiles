'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EnquiryItem, Product } from '@/types';

interface EnquiryState {
  items: EnquiryItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, unit?: 'box' | 'inner' | 'piece') => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateUnit: (productId: string, unit: 'box' | 'inner' | 'piece') => void;
  clear: () => void;
  toggleOpen: (open?: boolean) => void;
  totalItems: () => number;
  totalUnits: () => number;
}

export const useEnquiryStore = create<EnquiryState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1, unit = 'box') =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity, unit }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                code: product.code,
                quantity,
                unit,
                image: product.image,
              },
            ],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId ? { ...i, quantity: Math.max(0, quantity) } : i
            )
            .filter((i) => i.quantity > 0),
        })),
      updateUnit: (productId, unit) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, unit } : i
          ),
        })),
      clear: () => set({ items: [] }),
      toggleOpen: (open) =>
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
      totalItems: () => get().items.length,
      totalUnits: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'zoom-mobiles-enquiry',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
