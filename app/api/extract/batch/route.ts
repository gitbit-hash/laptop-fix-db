import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { extractRepairData, createSlug, standardizeProblemType } from "@/lib/ai-extractor";

/**
 * Batch process unprocessed videos
 * POST /api/extract/batch
 * Admin only
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const limit = body.limit || 10;

    console.log(`Starting batch extraction for up to ${limit} videos...`);

    // Get unprocessed videos
    const videos = await prisma.video.findMany({
      where: { processed: false },
      take: limit,
      orderBy: { publishedAt: "desc" },
    });

    if (videos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No unprocessed videos found",
        processed: 0,
      });
    }

    console.log(`Found ${videos.length} unprocessed videos`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const video of videos) {
      try {
        console.log(`Processing: ${video.title}`);

        // Extract repair data
        const extracted = await extractRepairData(
          video.title,
          video.description || undefined,
          video.transcript || undefined
        );

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

        // Create repair record
        await prisma.repair.upsert({
          where: { videoId: video.id },
          update: {
            modelId: model?.id || null,
            problemTypeId: problemType?.id || null,
            troubleshooting: extracted.troubleshooting,
            solution: extracted.solution,
            status: extracted.confidence === "high" ? "APPROVED" : "PENDING_REVIEW",
          },
          create: {
            videoId: video.id,
            modelId: model?.id || null,
            problemTypeId: problemType?.id || null,
            troubleshooting: extracted.troubleshooting,
            solution: extracted.solution,
            status: extracted.confidence === "high" ? "APPROVED" : "PENDING_REVIEW",
          },
        });

        // Mark as processed
        await prisma.video.update({
          where: { id: video.id },
          data: { processed: true },
        });

        successCount++;
        results.push({
          videoId: video.id,
          title: video.title,
          status: "success",
          extracted: {
            brand: brand?.name,
            model: model?.name,
            problemType: problemType?.name,
            confidence: extracted.confidence,
          },
        });

        console.log(`✓ Processed: ${video.title}`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to process video ${video.id}:`, error);
        results.push({
          videoId: video.id,
          title: video.title,
          status: "error",
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Batch extraction completed`,
      stats: {
        total: videos.length,
        success: successCount,
        errors: errorCount,
      },
      results,
    });
  } catch (error) {
    console.error("Error in batch extraction:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
