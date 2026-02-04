"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncPage() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSync = async () => {
    setSyncing(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/videos/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxResults: 50 }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Sync failed");
      }
    } catch (err) {
      setError("Failed to sync videos");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Sync Videos</h1>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Manual Video Sync
          </h2>
          <p className="text-gray-600 mb-6">
            Manually fetch the latest videos from the Electronics Repair School YouTube
            channel. This will fetch up to 50 videos and update existing ones.
          </p>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {syncing ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Syncing...
              </span>
            ) : (
              "Start Sync"
            )}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">
                ✅ Sync Completed Successfully!
              </h3>
              <div className="space-y-2 text-sm text-green-800">
                <p>
                  <strong>Total videos found:</strong> {result.stats.total}
                </p>
                <p>
                  <strong>New videos saved:</strong> {result.stats.saved}
                </p>
                <p>
                  <strong>Videos updated:</strong> {result.stats.updated}
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/videos")}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View Videos
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Automatic Sync</h3>
        <p className="text-blue-800 text-sm">
          Videos are automatically synced daily at 2:00 AM UTC via Vercel Cron. This
          manual sync is useful for immediate updates.
        </p>
      </div>
    </div>
  );
}
