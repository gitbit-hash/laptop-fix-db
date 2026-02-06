"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Repair {
  id: string;
  video: {
    youtubeId: string;
    title: string;
    thumbnailUrl: string | null;
    publishedAt: string;
  };
  model: {
    name: string;
    brand: {
      name: string;
    };
  } | null;
  problemType: {
    name: string;
  } | null;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface ProblemType {
  id: string;
  name: string;
  slug: string;
}

export default function RepairsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    brand: searchParams.get("brand") || "",
    problem: searchParams.get("problem") || "",
  });

  useEffect(() => {
    fetchBrands();
    fetchProblemTypes();
  }, []);

  useEffect(() => {
    fetchRepairs();
  }, [searchParams]);

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/brands");
      const data = await res.json();
      setBrands(data.brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchProblemTypes = async () => {
    try {
      const res = await fetch("/api/problem-types");
      const data = await res.json();
      setProblemTypes(data.problemTypes);
    } catch (error) {
      console.error("Error fetching problem types:", error);
    }
  };

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const res = await fetch(`/api/repairs?${params}`);
      const data = await res.json();
      setRepairs(data.repairs);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching repairs:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1
    router.push(`/repairs?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/repairs");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              LaptopFixDB
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateFilters("search", filters.search);
                  }
                }}
                placeholder="Brand, model, problem..."
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={filters.brand}
                onChange={(e) => {
                  setFilters({ ...filters, brand: e.target.value });
                  updateFilters("brand", e.target.value);
                }}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.slug}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Type
              </label>
              <select
                value={filters.problem}
                onChange={(e) => {
                  setFilters({ ...filters, problem: e.target.value });
                  updateFilters("problem", e.target.value);
                }}
                className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Problems</option>
                {problemTypes.map((type) => (
                  <option key={type.id} value={type.slug}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading repairs...</p>
          </div>
        ) : repairs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-xl text-gray-600">No repairs found</p>
            <p className="mt-2 text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found {pagination.total} repair{pagination.total !== 1 ? "s" : ""}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repairs.map((repair) => (
                <Link
                  key={repair.id}
                  href={`/repairs/${repair.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <div className="relative h-48 bg-gray-200">
                    {repair.video.thumbnailUrl ? (
                      <img
                        src={repair.video.thumbnailUrl}
                        alt={repair.video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No thumbnail
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600">
                      {repair.video.title}
                    </h3>
                    <div className="space-y-1 text-sm">
                      {repair.model && (
                        <p className="text-gray-600">
                          <span className="font-medium">
                            {repair.model.brand.name} {repair.model.name}
                          </span>
                        </p>
                      )}
                      {repair.problemType && (
                        <p className="text-blue-600 font-medium">
                          {repair.problemType.name}
                        </p>
                      )}
                      <p className="text-gray-500">
                        {formatDate(repair.video.publishedAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => updateFilters("page", page.toString())}
                      className={`px-4 py-2 rounded-lg ${page === pagination.page
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
