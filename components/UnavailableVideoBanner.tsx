import { VideoStatus } from "@/generated/prisma/client";

interface UnavailableVideoBannerProps {
  status: VideoStatus;
  unavailableReason?: string | null;
  unavailableAt?: Date | null;
}

export default function UnavailableVideoBanner({
  status,
  unavailableReason,
  unavailableAt,
}: UnavailableVideoBannerProps) {
  const getMessage = () => {
    switch (status) {
      case "PRIVATE":
        return {
          title: "Video is Private",
          description:
            "This video has been made private by the content creator and is no longer publicly accessible.",
          icon: "🔒",
          color: "yellow",
        };
      case "DELETED":
        return {
          title: "Video Deleted",
          description:
            "This video has been deleted from YouTube and is no longer available.",
          icon: "❌",
          color: "red",
        };
      case "BLOCKED":
        return {
          title: "Embedding Disabled",
          description:
            "This video cannot be embedded. You can watch it directly on YouTube using the link below.",
          icon: "⚠️",
          color: "orange",
        };
      case "UNAVAILABLE":
        return {
          title: "Video Unavailable",
          description:
            "This video is temporarily unavailable. Please try again later.",
          icon: "⏸️",
          color: "gray",
        };
      default:
        return {
          title: "Video Issue",
          description: "There is an issue with this video.",
          icon: "⚠️",
          color: "gray",
        };
    }
  };

  const message = getMessage();

  const colorClasses = {
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      text: "text-yellow-800",
      titleText: "text-yellow-900",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-400",
      text: "text-red-800",
      titleText: "text-red-900",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-400",
      text: "text-orange-800",
      titleText: "text-orange-900",
    },
    gray: {
      bg: "bg-gray-50",
      border: "border-gray-400",
      text: "text-gray-800",
      titleText: "text-gray-900",
    },
  };

  const colors = colorClasses[message.color as keyof typeof colorClasses];

  return (
    <div
      className={`${colors.bg} border-l-4 ${colors.border} p-4 rounded-r-lg mb-4`}
    >
      <div className="flex items-start">
        <span className="text-3xl mr-3">{message.icon}</span>
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${colors.titleText} mb-1`}>
            {message.title}
          </h3>
          <p className={`${colors.text} mb-2`}>{message.description}</p>
          {unavailableReason && (
            <p className={`text-sm ${colors.text} opacity-75`}>
              Reason: {unavailableReason}
            </p>
          )}
          {unavailableAt && (
            <p className={`text-sm ${colors.text} opacity-75 mt-1`}>
              Unavailable since:{" "}
              {new Date(unavailableAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          <div className="mt-3 text-sm ${colors.text}">
            <p>
              ℹ️ You can still view the cached transcript and repair information
              below.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
