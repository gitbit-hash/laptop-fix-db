import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const repair = await prisma.repair.findUnique({
      where: { id },
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
      return NextResponse.json(
        { error: "Repair not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ repair });
  } catch (error) {
    console.error("Error fetching repair:", error);
    return NextResponse.json(
      { error: "Failed to fetch repair" },
      { status: 500 }
    );
  }
}
