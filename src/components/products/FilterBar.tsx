'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { categories } from '@/data/categories';
import type { StockStatus } from '@/types';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FilterBarProps {
  query: string;
  onQuery: (v: string) => void;
  category: string;
  onCategory: (slug: string) => void;
  status: 'all' | StockStatus;
  onStatus: (s: 'all' | StockStatus) => void;
  brand: string;
  onBrand: (b: string) => void;
  brands: string[];
  sort: 'name' | 'stock-high' | 'stock-low' | 'price-low' | 'price-high';
  onSort: (s: 'name' | 'stock-high' | 'stock-low' | 'price-low' | 'price-high') => void;
  total: number;
  filtered: number;
  onReset: () => void;
}

export function FilterBar(props: FilterBarProps) {
  const {
    query,
    onQuery,
    category,
    onCategory,
    status,
    onStatus,
    brand,
    onBrand,
    brands,
    sort,
    onSort,
    total,
    filtered,
    onReset,
  } = props;

  return (
    <div className="sticky top-16 lg:top-[72px] z-30 bg-white/85 backdrop-blur-xl border-b border-dark-200/70">
      <div className="container-fluid py-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
            <Input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search products, codes, brands…"
              className="pl-11 h-12 text-base"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-dark-100 hover:bg-dark-200 inline-flex items-center justify-center"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={brand}
              onChange={(e) => onBrand(e.target.value)}
              className="h-12 rounded-xl border border-dark-200 bg-white px-4 text-sm font-medium text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => onStatus(e.target.value as 'all' | StockStatus)}
              className="h-12 rounded-xl border border-dark-200 bg-white px-4 text-sm font-medium text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">Any Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value as FilterBarProps['sort'])}
              className="h-12 rounded-xl border border-dark-200 bg-white px-4 text-sm font-medium text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="name">Sort: Name</option>
              <option value="stock-high">Stock: High → Low</option>
              <option value="stock-low">Stock: Low → High</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
            <Button variant="ghost" size="default" onClick={onReset}>
              <SlidersHorizontal className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {categories.map((c) => {
              const Icon =
                ((Icons as unknown as Record<string, LucideIcon>)[c.icon] ?? Icons.Package);
              const active = category === c.slug;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCategory(c.slug)}
                  className={cn(
                    'shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all border',
                    active
                      ? 'bg-dark-900 text-white border-dark-900 shadow-card'
                      : 'bg-white text-dark-700 border-dark-200 hover:border-primary/30 hover:text-primary'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {c.name}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      active ? 'bg-white/15 text-white' : 'bg-dark-100 text-dark-600'
                    )}
                  >
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="hidden sm:block shrink-0 text-xs text-dark-500 whitespace-nowrap">
            Showing <span className="font-bold text-dark-900">{filtered}</span> of {total} products
          </div>
        </div>
      </div>
    </div>
  );
}
