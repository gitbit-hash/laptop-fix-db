import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const repair = await prisma.repair.update({
      where: { id },
      data: {
        status: body.status,
        troubleshooting: body.troubleshooting,
        solution: body.solution,
        modelId: body.modelId || null,
        problemTypeId: body.problemTypeId || null,
      },
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

    return NextResponse.json({ repair });
  } catch (error) {
    console.error("Error updating repair:", error);
    return NextResponse.json(
      { error: "Failed to update repair" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return NextResponse.json({ error: "Repair not found" }, { status: 404 });
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
