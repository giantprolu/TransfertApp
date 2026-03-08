import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPlaylistTracks, refreshSpotifyToken } from "@/services/spotifyService";
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

// GET /api/spotify/playlists/[id]/tracks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: playlistId } = await params;
    const accessToken = await getValidAccessToken(userId);
    const tracks = await getPlaylistTracks(accessToken, playlistId);

    return NextResponse.json({
      tracks: tracks.map((t) => ({
        id: t.id,
        name: t.name,
        artist: t.artists.map((a) => a.name).join(", "),
        album: t.album?.name || "",
        uri: t.uri,
      })),
      total: tracks.length,
    });
  } catch (error) {
    logger.error("Failed to fetch playlist tracks", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist tracks" },
      { status: 500 }
    );
  }
}
