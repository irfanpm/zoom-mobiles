export default function ProductsLoading() {
  return (
    <>
      {/* Hero shimmer */}
      <section className="bg-gradient-to-b from-dark-50 to-white border-b border-dark-200/70">
        <div className="container-fluid py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="h-6 w-32 rounded-full bg-primary/10 animate-pulse" />
              <div className="h-12 w-72 rounded-xl bg-dark-100 animate-pulse" />
              <div className="h-4 w-96 rounded-md bg-dark-100 animate-pulse" />
            </div>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 w-24 rounded-xl bg-dark-100 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar shimmer */}
      <div className="sticky top-16 z-30 bg-white/85 backdrop-blur-xl border-b border-dark-200/70">
        <div className="container-fluid py-4">
          <div className="h-12 w-full rounded-xl bg-dark-100 animate-pulse" />
        </div>
      </div>

      {/* Grid shimmer */}
      <section className="container-fluid py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-dark-200/70 bg-white overflow-hidden"
            >
              <div className="h-44 bg-dark-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded bg-dark-100 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-dark-100 animate-pulse" />
                <div className="h-9 rounded-xl bg-dark-100 animate-pulse" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 rounded-lg bg-dark-100 animate-pulse" />
                  <div className="h-8 rounded-lg bg-dark-100 animate-pulse" />
                  <div className="h-8 rounded-lg bg-dark-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
