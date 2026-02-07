"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncPage() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [fetchAll, setFetchAll] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/videos/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxResults: fetchAll ? 50 : 50,
          fetchAll: fetchAll
        }),
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
            Manually fetch videos from the Electronics Repair School YouTube
            channel. You can fetch the latest 50 videos or all historical videos from the channel.
          </p>

          {/* Fetch All Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={fetchAll}
                onChange={(e) => setFetchAll(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">
                  Fetch All Videos (Historical)
                </span>
                <p className="text-sm text-gray-600">
                  Fetch all videos from the channel, not just the latest 50. This may take several minutes.
                </p>
              </div>
            </label>
          </div>

          {fetchAll && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Note:</strong> This will fetch up to 500 videos from the channel.
                This process may take 5-10 minutes depending on how many new videos are found.
              </p>
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {syncing ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {fetchAll ? 'Fetching All Videos...' : 'Syncing...'}
              </span>
            ) : (
              fetchAll ? 'Fetch All Videos' : 'Sync Latest 50 Videos'
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
                {result.hasMore && (
                  <p className="text-yellow-700 mt-2">
                    ℹ️ More videos available. The sync stopped at the 500 video limit.
                  </p>
                )}
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
          Videos are automatically synced daily at 2:00 AM UTC via Vercel Cron (latest 50 videos). This
          manual sync is useful for immediate updates or fetching historical content.
        </p>
      </div>
    </div>
  );
}
