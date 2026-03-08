import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET /api/imports - Get user import history
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const imports = await prisma.import.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        source: true,
        sourcePlaylist: true,
        targetPlaylist: true,
        status: true,
        totalTracks: true,
        matchedTracks: true,
        failedTracks: true,
        errorMessage: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ imports });
  } catch (error) {
    logger.error("Failed to fetch imports", error);
    return NextResponse.json(
      { error: "Failed to fetch imports" },
      { status: 500 }
    );
  }
}
