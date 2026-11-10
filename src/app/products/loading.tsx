export default function ProductsLoading() {
  return (
    <div className="container-page pb-16 pt-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading products</span>
      <div className="h-3 w-40 animate-pulse rounded-full bg-border/70" />
      <div className="mt-7 h-12 w-3/4 max-w-xl animate-pulse rounded-2xl bg-border/60" />
      <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded-full bg-border/50" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
        <div className="hidden h-96 animate-pulse rounded-2xl bg-card/70 lg:block" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-border/60 bg-card/50"
            >
              <div className="aspect-[4/3] animate-pulse bg-border/40" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-4/5 animate-pulse rounded-full bg-border/60" />
                <div className="h-3 w-full animate-pulse rounded-full bg-border/40" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-border/40" />
                <div className="flex justify-between pt-3">
                  <div className="h-8 w-24 animate-pulse rounded-full bg-border/50" />
                  <div className="h-11 w-28 animate-pulse rounded-full bg-border/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
