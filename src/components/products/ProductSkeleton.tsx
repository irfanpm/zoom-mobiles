import { Skeleton } from '@/components/ui/skeleton';

export function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-dark-200/70 bg-white overflow-hidden">
      <Skeleton className="h-44 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
