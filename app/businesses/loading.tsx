export default function BusinessesLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 bg-surface border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="h-6 bg-white/10 animate-pulse w-24"></div>
          <div className="h-10 w-10 bg-white/10 animate-pulse rounded-full"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Search/Filter Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-12 bg-surface-container border border-white/10 animate-pulse"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-surface-container border border-white/10 animate-pulse w-32"></div>
            <div className="h-10 bg-surface-container border border-white/10 animate-pulse w-32"></div>
            <div className="h-10 bg-surface-container border border-white/10 animate-pulse w-32"></div>
          </div>
        </div>

        {/* Business Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-surface-container border border-white/10 overflow-hidden"
            >
              {/* Image Skeleton */}
              <div className="h-48 bg-white/10 animate-pulse"></div>

              {/* Content Skeleton */}
              <div className="p-6 space-y-3">
                <div className="h-6 bg-white/10 animate-pulse w-3/4"></div>
                <div className="h-4 bg-white/10 animate-pulse w-full"></div>
                <div className="h-4 bg-white/10 animate-pulse w-5/6"></div>

                <div className="flex gap-2 pt-2">
                  <div className="h-6 bg-white/10 animate-pulse w-16"></div>
                  <div className="h-6 bg-white/10 animate-pulse w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
