export function SkeletonList({ count = 5 }) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="p-5 border rounded-lg bg-white animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/5"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }