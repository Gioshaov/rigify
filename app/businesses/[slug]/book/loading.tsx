export default function BookingLoading() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 bg-surface border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="h-6 bg-white/10 animate-pulse w-24"></div>
          <div className="h-10 w-10 bg-white/10 animate-pulse rounded-full"></div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
        {/* Progress Bar Skeleton */}
        <div className="mb-8">
          <div className="h-2 bg-white/5 w-full">
            <div className="h-full bg-primary/50 w-1/2 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Skeleton */}
          <div className="lg:col-span-7 bg-surface-container border border-white/10 p-8">
            <div className="h-8 bg-white/10 animate-pulse w-48 mb-8"></div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 42 }).map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Time Slots Skeleton */}
          <div className="lg:col-span-5 bg-surface-container border border-white/10 p-8">
            <div className="h-6 bg-white/10 animate-pulse w-40 mb-6"></div>

            <div className="grid grid-cols-2 gap-2 mb-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/5 animate-pulse"></div>
              ))}
            </div>

            {/* Form Fields Skeleton */}
            <div className="space-y-4">
              <div className="h-12 bg-white/5 animate-pulse"></div>
              <div className="h-12 bg-white/5 animate-pulse"></div>
              <div className="h-12 bg-white/5 animate-pulse"></div>
              <div className="h-12 bg-primary/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
