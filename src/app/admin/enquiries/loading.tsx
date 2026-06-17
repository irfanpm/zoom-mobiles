export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-4 w-72 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-xl bg-slate-200 animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-56 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
