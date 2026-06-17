export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-32 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-4 w-72 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="h-5 w-28 rounded bg-slate-200 animate-pulse" />
          <div className="h-8 w-28 rounded-xl bg-slate-200 animate-pulse" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-44 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-64 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="h-8 w-16 rounded-lg bg-slate-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
