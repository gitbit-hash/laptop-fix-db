"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Video {
  id: string;
  youtubeId: string;
  title: string;
  publishedAt: string;
  processed: boolean;
  repair: {
    id: string;
    status: string;
  } | null;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "processed" | "unprocessed">("all");
  const [extracting, setExtracting] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "processed") params.set("processed", "true");
      if (filter === "unprocessed") params.set("processed", "false");

      const res = await fetch(`/api/admin/videos?${params}`);
      const data = await res.json();
      setVideos(data.videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async (videoId: string) => {
    setExtracting(videoId);
    try {
      const res = await fetch(`/api/extract/${videoId}`, {
        method: "POST",
      });

      if (res.ok) {
        alert("Extraction completed! Check the repairs page.");
        fetchVideos();
      } else {
        const data = await res.json();
        alert(`Extraction failed: ${data.error}`);
      }
    } catch (error) {
      alert("Extraction failed");
    } finally {
      setExtracting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Videos</h1>
        <Link
          href="/admin/sync"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sync Videos
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg ${filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            All Videos
          </button>
          <button
            onClick={() => setFilter("processed")}
            className={`px-4 py-2 rounded-lg ${filter === "processed"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Processed
          </button>
          <button
            onClick={() => setFilter("unprocessed")}
            className={`px-4 py-2 rounded-lg ${filter === "unprocessed"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Unprocessed
          </button>
        </div>
      </div>

      {/* Videos List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/default.jpg`}
                        alt=""
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {video.title}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(video.publishedAt)}
                  </td>
                  <td className="px-6 py-4">
                    {video.processed ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Processed
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {!video.processed && (
                        <button
                          onClick={() => handleExtract(video.id)}
                          disabled={extracting === video.id}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {extracting === video.id ? "Extracting..." : "Extract"}
                        </button>
                      )}
                      {video.repair && (
                        <Link
                          href={`/admin/repairs/${video.repair.id}`}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          View Repair
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
