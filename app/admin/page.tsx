"use client";

import { useEffect, useState } from "react";

interface Stats {
  videos: {
    total: number;
    processed: number;
    unprocessed: number;
  };
  repairs: {
    total: number;
    pending: number;
    approved: number;
  };
  brands: number;
  problemTypes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return <div>Error loading stats</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Videos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.videos.total}</p>
            </div>
            <div className="text-4xl">🎥</div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {stats.videos.processed} processed, {stats.videos.unprocessed} pending
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Repairs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.repairs.total}</p>
            </div>
            <div className="text-4xl">🔧</div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {stats.repairs.approved} approved, {stats.repairs.pending} pending
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Brands</p>
              <p className="text-3xl font-bold text-gray-900">{stats.brands}</p>
            </div>
            <div className="text-4xl">💻</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Problem Types</p>
              <p className="text-3xl font-bold text-gray-900">{stats.problemTypes}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/admin/sync"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl">🔄</span>
            <div>
              <p className="font-semibold text-gray-900">Sync Videos</p>
              <p className="text-sm text-gray-600">Fetch new videos from YouTube</p>
            </div>
          </a>

          <a
            href="/admin/repairs"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-900">Review Repairs</p>
              <p className="text-sm text-gray-600">
                {stats.repairs.pending} pending review
              </p>
            </div>
          </a>

          <a
            href="/admin/videos"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl">🎬</span>
            <div>
              <p className="font-semibold text-gray-900">Manage Videos</p>
              <p className="text-sm text-gray-600">View all videos</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
