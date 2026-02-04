"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Repair {
  id: string;
  status: string;
  video: {
    youtubeId: string;
    title: string;
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

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "PENDING_REVIEW" | "APPROVED">("all");

  useEffect(() => {
    fetchRepairs();
  }, [filter]);

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);

      const res = await fetch(`/api/admin/repairs?${params}`);
      const data = await res.json();
      setRepairs(data.repairs);
    } catch (error) {
      console.error("Error fetching repairs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Repairs</h1>

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
            All Repairs
          </button>
          <button
            onClick={() => setFilter("PENDING_REVIEW")}
            className={`px-4 py-2 rounded-lg ${filter === "PENDING_REVIEW"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setFilter("APPROVED")}
            className={`px-4 py-2 rounded-lg ${filter === "APPROVED"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Repairs List */}
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
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Brand/Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Problem
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
              {repairs.map((repair) => (
                <tr key={repair.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://img.youtube.com/vi/${repair.video.youtubeId}/default.jpg`}
                        alt=""
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {repair.video.title}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {repair.model ? (
                      <div>
                        <p className="font-medium">{repair.model.brand.name}</p>
                        <p className="text-gray-500">{repair.model.name}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {repair.problemType ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {repair.problemType.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {repair.status === "APPROVED" ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/repairs/${repair.id}`}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </Link>
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
