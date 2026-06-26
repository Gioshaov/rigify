export default function BusinessProfileLoading() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 bg-surface border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="h-6 bg-white/10 animate-pulse w-24"></div>
          <div className="h-10 w-10 bg-white/10 animate-pulse rounded-full"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Hero Section Skeleton */}
        <div className="mb-8">
          <div className="h-64 bg-surface-container border border-white/10 animate-pulse mb-6"></div>

          <div className="space-y-4">
            <div className="h-10 bg-white/10 animate-pulse w-64"></div>
            <div className="h-6 bg-white/10 animate-pulse w-full"></div>
            <div className="h-6 bg-white/10 animate-pulse w-5/6"></div>

            <div className="flex gap-4 pt-4">
              <div className="h-12 bg-primary/20 animate-pulse w-40"></div>
              <div className="h-12 bg-white/10 animate-pulse w-40"></div>
            </div>
          </div>
        </div>

        {/* Services Grid Skeleton */}
        <div className="mb-12">
          <div className="h-8 bg-white/10 animate-pulse w-32 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-surface-container border border-white/10 p-6"
              >
                <div className="h-6 bg-white/10 animate-pulse w-3/4 mb-3"></div>
                <div className="h-4 bg-white/10 animate-pulse w-full mb-2"></div>
                <div className="h-4 bg-white/10 animate-pulse w-2/3"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Section Skeleton */}
        <div>
          <div className="h-8 bg-white/10 animate-pulse w-32 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-container border border-white/10 p-6 text-center"
              >
                <div className="w-24 h-24 bg-white/10 animate-pulse rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-white/10 animate-pulse w-32 mx-auto mb-2"></div>
                <div className="h-4 bg-white/10 animate-pulse w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
