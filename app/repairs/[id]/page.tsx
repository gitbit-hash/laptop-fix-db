"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import VideoEmbed from "@/components/VideoEmbed";

interface Repair {
  id: string;
  troubleshooting: string | null;
  solution: string | null;
  video: {
    youtubeId: string;
    title: string;
    description: string | null;
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

export default function RepairDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepair();
  }, [params.id]);

  const fetchRepair = async () => {
    try {
      const res = await fetch(`/api/repairs/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRepair(data.repair);
      } else {
        router.push("/repairs");
      }
    } catch (error) {
      console.error("Error fetching repair:", error);
      router.push("/repairs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading repair...</p>
        </div>
      </div>
    );
  }

  if (!repair) {
    return null;
  }

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
              href="/repairs"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              ← Back to Repairs
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <VideoEmbed youtubeId={repair.video.youtubeId} title={repair.video.title} />
        </div>

        {/* Details Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {repair.video.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b">
            {repair.model && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Laptop:</span>
                <span className="font-semibold text-gray-900">
                  {repair.model.brand.name} {repair.model.name}
                </span>
              </div>
            )}
            {repair.problemType && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Problem:</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {repair.problemType.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Published:</span>
              <span className="text-gray-700">
                {formatDate(repair.video.publishedAt)}
              </span>
            </div>
          </div>

          {/* Troubleshooting */}
          {repair.troubleshooting && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                Troubleshooting Steps
              </h2>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {repair.troubleshooting}
                </p>
              </div>
            </div>
          )}

          {/* Solution */}
          {repair.solution && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Solution
              </h2>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {repair.solution}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {repair.video.description && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Video Description
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {repair.video.description}
                </p>
              </div>
            </div>
          )}

          {/* Watch on YouTube */}
          <div className="mt-8 pt-6 border-t">
            <a
              href={`https://www.youtube.com/watch?v=${repair.video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Watch on YouTube
            </a>
          </div>
        </div>

        {/* Credit */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            Video by{" "}
            <a
              href="https://www.youtube.com/@electronicsrepairschool"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Electronics Repair School
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
