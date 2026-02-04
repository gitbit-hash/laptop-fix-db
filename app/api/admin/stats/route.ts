import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalVideos,
      processedVideos,
      totalRepairs,
      pendingRepairs,
      approvedRepairs,
      totalBrands,
      totalProblemTypes,
    ] = await Promise.all([
      prisma.video.count(),
      prisma.video.count({ where: { processed: true } }),
      prisma.repair.count(),
      prisma.repair.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.repair.count({ where: { status: "APPROVED" } }),
      prisma.brand.count(),
      prisma.problemType.count(),
    ]);

    return NextResponse.json({
      stats: {
        videos: {
          total: totalVideos,
          processed: processedVideos,
          unprocessed: totalVideos - processedVideos,
        },
        repairs: {
          total: totalRepairs,
          pending: pendingRepairs,
          approved: approvedRepairs,
        },
        brands: totalBrands,
        problemTypes: totalProblemTypes,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
