export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-4 w-60 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-b border-slate-100">
              <div className="h-9 w-9 rounded-lg bg-slate-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5 h-64 animate-pulse" />
      </div>
    </div>
  );
}
