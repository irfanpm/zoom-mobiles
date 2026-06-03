'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import type { Product } from '@/types';

export function CategoryProductGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onView={(prod) => {
                setActive(prod);
                setOpen(true);
              }}
            />
          ))}
        </AnimatePresence>
      </motion.div>
      <ProductDetailModal product={active} open={open} onOpenChange={setOpen} />
    </>
  );
}
