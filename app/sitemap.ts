import { MetadataRoute } from "next";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/repairs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic repair pages
  try {
    const repairs = await prisma.repair.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
      where: {
        status: "APPROVED", // Only include approved repairs
      },
    });

    const repairRoutes: MetadataRoute.Sitemap = repairs.map((repair) => ({
      url: `${baseUrl}/repairs/${repair.id}`,
      lastModified: repair.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...repairRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  } finally {
    await prisma.$disconnect();
  }
}
