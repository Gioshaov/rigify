export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Skeleton */}
      <aside className="hidden lg:flex w-64 border-r border-white/10 bg-surface flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="h-8 bg-white/10 animate-pulse w-32"></div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-white/10 animate-pulse"></div>
          ))}
        </nav>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="h-8 bg-white/10 animate-pulse w-48"></div>
            <div className="h-4 bg-white/10 animate-pulse w-64"></div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container border border-white/10 p-6">
                <div className="h-6 bg-white/10 animate-pulse w-24 mb-4"></div>
                <div className="h-10 bg-white/10 animate-pulse w-32"></div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-surface-container border border-white/10">
            <div className="p-6 border-b border-white/10">
              <div className="h-6 bg-white/10 animate-pulse w-40"></div>
            </div>
            <div className="divide-y divide-white/10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/10 animate-pulse rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 animate-pulse w-48"></div>
                    <div className="h-3 bg-white/10 animate-pulse w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
