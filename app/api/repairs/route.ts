import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const brand = searchParams.get("brand") || "";
    const problem = searchParams.get("problem") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: "APPROVED",
    };

    // Search filter
    if (search) {
      where.OR = [
        { video: { title: { contains: search, mode: "insensitive" } } },
        { video: { description: { contains: search, mode: "insensitive" } } },
        { model: { name: { contains: search, mode: "insensitive" } } },
        { model: { brand: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    // Brand filter
    if (brand) {
      where.model = {
        brand: {
          slug: brand,
        },
      };
    }

    // Problem filter
    if (problem) {
      where.problemType = {
        slug: problem.toLowerCase().replace(/\s+/g, "-"),
      };
    }

    // Get repairs with pagination
    const [repairs, total] = await Promise.all([
      prisma.repair.findMany({
        where,
        include: {
          video: {
            select: {
              youtubeId: true,
              title: true,
              thumbnailUrl: true,
              publishedAt: true,
            },
          },
          model: {
            include: {
              brand: true,
            },
          },
          problemType: true,
        },
        orderBy: {
          video: {
            publishedAt: "desc",
          },
        },
        skip,
        take: limit,
      }),
      prisma.repair.count({ where }),
    ]);

    return NextResponse.json({
      repairs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching repairs:", error);
    return NextResponse.json(
      { error: "Failed to fetch repairs" },
      { status: 500 }
    );
  }
}
