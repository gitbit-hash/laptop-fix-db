"use client";

export default function AdminLoading() {
  return (
    <div>
      {/* Title skeleton */}
      <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>

      {/* Stats Grid skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="mt-4 h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Quick Actions skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
