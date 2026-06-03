import { cn } from '@/lib/utils';
import type { StockStatus } from '@/types';

interface StockBadgeProps {
  status: StockStatus;
  className?: string;
  showDot?: boolean;
}

const MAP: Record<
  StockStatus,
  { label: string; dot: string; cls: string }
> = {
  'in-stock': {
    label: 'In Stock',
    dot: 'bg-primary',
    cls: 'bg-primary/10 text-primary-700 border-primary/20',
  },
  'low-stock': {
    label: 'Low Stock',
    dot: 'bg-warning',
    cls: 'bg-warning/10 text-warning border-warning/20',
  },
  'out-of-stock': {
    label: 'Out of Stock',
    dot: 'bg-danger',
    cls: 'bg-danger/10 text-danger border-danger/20',
  },
};

export function StockBadge({ status, className, showDot = true }: StockBadgeProps) {
  const m = MAP[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        m.cls,
        className
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />}
      {m.label}
    </span>
  );
}

export function StockDot({ status, className }: { status: StockStatus; className?: string }) {
  return (
    <span className={cn('relative inline-flex h-2 w-2', className)}>
      {status === 'in-stock' && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
      )}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', MAP[status].dot)} />
    </span>
  );
}
