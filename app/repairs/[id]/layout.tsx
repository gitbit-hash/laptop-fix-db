import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const repair = await prisma.repair.findUnique({
      where: { id: params.id },
      include: {
        video: true,
        model: {
          include: {
            brand: true,
          },
        },
        problemType: true,
      },
    });

    if (!repair) {
      return {
        title: "Repair Not Found",
        description: "The requested laptop repair could not be found.",
      };
    }

    const brandModel = repair.model
      ? `${repair.model.brand.name} ${repair.model.name}`
      : "Laptop";
    const problem = repair.problemType?.name || "Repair";
    const title = `${brandModel} ${problem} Repair Guide`;
    const description =
      repair.troubleshooting?.substring(0, 155) ||
      repair.solution?.substring(0, 155) ||
      `Watch detailed repair guide for ${brandModel} ${problem}. Step-by-step troubleshooting and solution from Electronics Repair School.`;

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const imageUrl = repair.video.thumbnailUrl || "/og-image.png";

    // Structured data for HowTo and VideoObject
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "HowTo",
          name: title,
          description: description,
          image: imageUrl,
          step: repair.troubleshooting
            ? repair.troubleshooting.split("\n").map((step: string, index: number) => ({
              "@type": "HowToStep",
              position: index + 1,
              name: `Step ${index + 1}`,
              text: step,
            }))
            : [],
        },
        {
          "@type": "VideoObject",
          name: repair.video.title,
          description: repair.video.description || description,
          thumbnailUrl: imageUrl,
          uploadDate: repair.video.publishedAt,
          contentUrl: `https://www.youtube.com/watch?v=${repair.video.youtubeId}`,
          embedUrl: `https://www.youtube.com/embed/${repair.video.youtubeId}`,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Repairs",
              item: `${baseUrl}/repairs`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: title,
              item: `${baseUrl}/repairs/${params.id}`,
            },
          ],
        },
      ],
    };

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: `/repairs/${params.id}`,
        images: [
          {
            url: imageUrl,
            width: 1280,
            height: 720,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      other: {
        "script:ld+json": JSON.stringify(structuredData),
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Laptop Repair Guide",
      description: "Detailed laptop repair troubleshooting and solutions.",
    };
  }
}

export default function RepairDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
