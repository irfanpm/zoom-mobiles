export default function AdminProductsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-4 w-60 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-slate-200 animate-pulse" />
      </div>

      <div className="h-14 w-full rounded-2xl bg-white border border-slate-200 animate-pulse" />

      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-lg bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-slate-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
