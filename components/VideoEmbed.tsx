import { VideoStatus } from "@/generated/prisma/client";
import UnavailableVideoBanner from "./UnavailableVideoBanner";

interface VideoEmbedProps {
  youtubeId: string;
  title: string;
  status?: VideoStatus | null;
  unavailableReason?: string | null;
  unavailableAt?: Date | null;
}

export default function VideoEmbed({
  youtubeId,
  title,
  status = "ACTIVE",
  unavailableReason,
  unavailableAt,
}: VideoEmbedProps) {
  // Show unavailable banner if video is not active
  if (status && status !== "ACTIVE") {
    return (
      <>
        <UnavailableVideoBanner
          status={status}
          unavailableReason={unavailableReason}
          unavailableAt={unavailableAt}
        />
        <div className="relative w-full bg-gray-200 rounded-lg flex items-center justify-center" style={{ paddingBottom: "56.25%" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <svg
              className="w-20 h-20 mb-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium">Video Unavailable</p>
            {status === "BLOCKED" && (
              <a
                href={`https://www.youtube.com/watch?v=${youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Watch on YouTube
              </a>
            )}
          </div>
        </div>
      </>
    );
  }

  // Normal YouTube embed for active videos
  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}
