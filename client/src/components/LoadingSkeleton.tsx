export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <header className="px-6 md:px-10 py-8 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto">
          {/* Title */}
          <div className="h-16 w-96 bg-gray-200 animate-pulse mb-6"></div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-8">
              <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
            </div>
            <div className="flex gap-6">
              <div className="h-4 w-32 bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12">
        <div className="max-w-[1920px] mx-auto">
          {/* Search Bar Skeleton */}
          <div className="mb-8">
            <div className="h-12 w-full max-w-[500px] bg-gray-200 animate-pulse rounded-lg"></div>
          </div>

          {/* City Filter Skeleton */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 mb-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-8 w-24 bg-gray-200 animate-pulse"></div>
              ))}
            </div>
            <div className="h-8 w-32 bg-gray-200 animate-pulse"></div>
          </div>

          {/* Destination Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="space-y-3">
                {/* Image */}
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                {/* Title */}
                <div className="h-5 w-3/4 bg-gray-200 animate-pulse"></div>
                {/* Subtitle */}
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Load More Button Skeleton */}
          <div className="flex justify-center">
            <div className="h-12 w-40 bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="px-6 md:px-10 py-8 border-t border-gray-200 mt-16">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex justify-between items-center">
            <div className="h-4 w-48 bg-gray-200 animate-pulse"></div>
            <div className="flex gap-6">
              <div className="h-4 w-20 bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

