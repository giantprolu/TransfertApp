import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET /api/transfer/[id] - Get import status & progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: importId } = await params;

    const importRecord = await prisma.import.findFirst({
      where: { id: importId, userId },
      include: {
        tracks: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!importRecord) {
      return NextResponse.json({ error: "Import not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: importRecord.id,
      status: importRecord.status,
      source: importRecord.source,
      sourcePlaylist: importRecord.sourcePlaylist,
      targetPlaylist: importRecord.targetPlaylist,
      totalTracks: importRecord.totalTracks,
      matchedTracks: importRecord.matchedTracks,
      failedTracks: importRecord.failedTracks,
      errorMessage: importRecord.errorMessage,
      startedAt: importRecord.startedAt,
      completedAt: importRecord.completedAt,
      progress:
        importRecord.totalTracks > 0
          ? Math.round(
              ((importRecord.matchedTracks + importRecord.failedTracks) /
                importRecord.totalTracks) *
                100
            )
          : 0,
      tracks: importRecord.tracks.map((t) => ({
        id: t.id,
        spotifyTitle: t.spotifyTitle,
        spotifyArtist: t.spotifyArtist,
        appleMusicTitle: t.appleMusicTitle,
        appleMusicArtist: t.appleMusicArtist,
        matchScore: t.matchScore,
        status: t.status,
      })),
    });
  } catch (error) {
    logger.error("Failed to get import status", error);
    return NextResponse.json(
      { error: "Failed to get import status" },
      { status: 500 }
    );
  }
}
