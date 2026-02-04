import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [repairs, total] = await Promise.all([
      prisma.repair.findMany({
        where,
        include: {
          video: {
            select: {
              youtubeId: true,
              title: true,
            },
          },
          model: {
            include: {
              brand: true,
            },
          },
          problemType: true,
        },
        orderBy: { createdAt: "desc" },
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
