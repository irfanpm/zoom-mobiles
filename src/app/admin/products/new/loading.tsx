export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-4 w-60 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
              <div className="h-5 w-40 rounded bg-slate-200 animate-pulse" />
              <div className="grid sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((__, j) => (
                  <div key={j} className="space-y-1.5">
                    <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
                    <div className="h-10 rounded-xl bg-slate-200 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 h-48 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
