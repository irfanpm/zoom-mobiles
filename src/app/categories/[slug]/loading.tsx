export default function CategoryLoading() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-secondary-900 to-primary-700">
        <div className="container-fluid py-16 lg:py-20">
          <div className="h-4 w-32 rounded bg-white/20 animate-pulse" />
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-white/20 animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-12 w-72 rounded-xl bg-white/20 animate-pulse" />
              <div className="h-4 w-96 rounded bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-fluid py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-dark-200/70 bg-white overflow-hidden">
              <div className="h-44 bg-dark-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-dark-100 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-dark-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
