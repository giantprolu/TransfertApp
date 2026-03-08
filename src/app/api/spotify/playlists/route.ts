import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPlaylists, getPlaylistTracks, refreshSpotifyToken } from "@/services/spotifyService";
import { logger } from "@/lib/logger";

async function getValidAccessToken(userId: string): Promise<string> {
  const tokenRecord = await prisma.spotifyToken.findUnique({
    where: { userId },
  });

  if (!tokenRecord) {
    throw new Error("No Spotify token found");
  }

  if (tokenRecord.expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
    const newTokens = await refreshSpotifyToken(tokenRecord.refreshToken);
    await prisma.spotifyToken.update({
      where: { userId },
      data: {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token || tokenRecord.refreshToken,
        expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
      },
    });
    return newTokens.access_token;
  }

  return tokenRecord.accessToken;
}

// GET /api/spotify/playlists - Get user playlists
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const accessToken = await getValidAccessToken(userId);
    const playlists = await getUserPlaylists(accessToken);

    return NextResponse.json({
      playlists: playlists.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        trackCount: p.tracks.total,
        image: p.images?.[0]?.url || null,
      })),
      total: playlists.length,
    });
  } catch (error) {
    logger.error("Failed to fetch Spotify playlists", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}
