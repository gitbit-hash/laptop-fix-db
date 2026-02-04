import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { extractRepairData, createSlug, standardizeProblemType } from "@/lib/ai-extractor";

import { RepairStatus } from "@/generated/prisma/client";

/**
 * Extract repair data from a video using AI
 * POST /api/extract/[videoId]
 * Admin only
 */
export async function POST(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const session = await auth();

    // Only admins can trigger extraction
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoId = params.videoId;

    // Get video from database
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { repair: true },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    console.log(`Extracting repair data for video: ${video.title}`);

    // Extract repair data using AI
    const extracted = await extractRepairData(
      video.title,
      video.description || undefined,
      video.transcript || undefined
    );

    console.log("Extracted data:", extracted);

    // Find or create brand
    let brand = null;
    let model = null;

    if (extracted.brand) {
      brand = await prisma.brand.upsert({
        where: { slug: createSlug(extracted.brand) },
        update: {},
        create: {
          name: extracted.brand,
          slug: createSlug(extracted.brand),
        },
      });

      // Find or create model
      if (extracted.model && brand) {
        model = await prisma.model.upsert({
          where: {
            brandId_slug: {
              brandId: brand.id,
              slug: createSlug(extracted.model),
            },
          },
          update: {},
          create: {
            name: extracted.model,
            slug: createSlug(extracted.model),
            brandId: brand.id,
          },
        });
      }
    }

    // Find or create problem type
    let problemType = null;
    if (extracted.problemType) {
      const standardized = standardizeProblemType(extracted.problemType);
      if (standardized) {
        problemType = await prisma.problemType.upsert({
          where: { slug: createSlug(standardized) },
          update: {},
          create: {
            name: standardized,
            slug: createSlug(standardized),
          },
        });
      }
    }

    // Create or update repair record
    const repairData = {
      videoId: video.id,
      modelId: model?.id || null,
      problemTypeId: problemType?.id || null,
      troubleshooting: extracted.troubleshooting,
      solution: extracted.solution,
      status: extracted.confidence === "high" ? RepairStatus.APPROVED : RepairStatus.PENDING_REVIEW,
    };

    const repair = await prisma.repair.upsert({
      where: { videoId: video.id },
      update: repairData,
      create: repairData,
      include: {
        model: {
          include: { brand: true },
        },
        problemType: true,
      },
    });

    // Mark video as processed
    await prisma.video.update({
      where: { id: video.id },
      data: { processed: true },
    });

    return NextResponse.json({
      success: true,
      message: "Repair data extracted successfully",
      data: {
        repair,
        extracted,
        entities: {
          brand: brand?.name,
          model: model?.name,
          problemType: problemType?.name,
        },
      },
    });
  } catch (error) {
    console.error("Error in extraction endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
