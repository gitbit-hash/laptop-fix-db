"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoEmbed from "@/components/VideoEmbed";

interface Repair {
  id: string;
  status: string;
  troubleshooting: string | null;
  solution: string | null;
  video: {
    youtubeId: string;
    title: string;
    description: string | null;
  };
  model: {
    id: string;
    name: string;
    brand: {
      id: string;
      name: string;
    };
  } | null;
  problemType: {
    id: string;
    name: string;
  } | null;
}

export default function EditRepairPage() {
  const params = useParams();
  const router = useRouter();
  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    status: "PENDING_REVIEW",
    troubleshooting: "",
    solution: "",
  });

  useEffect(() => {
    fetchRepair();
  }, [params.id]);

  const fetchRepair = async () => {
    try {
      const res = await fetch(`/api/admin/repairs/${params.id}`);
      const data = await res.json();
      setRepair(data.repair);
      setFormData({
        status: data.repair.status,
        troubleshooting: data.repair.troubleshooting || "",
        solution: data.repair.solution || "",
      });
    } catch (error) {
      console.error("Error fetching repair:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/repairs/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Repair updated successfully!");
        router.push("/admin/repairs");
      } else {
        alert("Failed to update repair");
      }
    } catch (error) {
      alert("Failed to update repair");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!repair) {
    return <div>Repair not found</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Repair</h1>
        <button
          onClick={() => router.push("/admin/repairs")}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          ← Back
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 text-gray-900">
        {/* Video Preview */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Video Preview</h2>
            <VideoEmbed youtubeId={repair.video.youtubeId} title={repair.video.title} />
            <h3 className="mt-4 font-medium text-gray-900">{repair.video.title}</h3>
          </div>

          {/* Current Data */}
          <div className="bg-white text-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-lg text-gray-900 font-semibold mb-4">Extracted Data</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Brand/Model:</span>
                <p className="font-medium">
                  {repair.model
                    ? `${repair.model.brand.name} ${repair.model.name}`
                    : "Not set"}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Problem Type:</span>
                <p className="font-medium">
                  {repair.problemType ? repair.problemType.name : "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white text-gray-700 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Details</h2>

          <div className="space-y-4 text-gray-700">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="APPROVED">Approved</option>
              </select>
            </div>

            {/* Troubleshooting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Troubleshooting Steps
              </label>
              <textarea
                value={formData.troubleshooting}
                onChange={(e) =>
                  setFormData({ ...formData, troubleshooting: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the troubleshooting steps..."
              />
            </div>

            {/* Solution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Solution
              </label>
              <textarea
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe how the issue was fixed..."
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
