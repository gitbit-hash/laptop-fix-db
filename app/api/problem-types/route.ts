import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const problemTypes = await prisma.problemType.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { repairs: true },
        },
      },
    });

    return NextResponse.json({ problemTypes });
  } catch (error) {
    console.error("Error fetching problem types:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem types" },
      { status: 500 }
    );
  }
}
