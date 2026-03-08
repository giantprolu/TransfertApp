import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLikedSongs, getUserPlaylists, refreshSpotifyToken } from "@/services/spotifyService";
import { logger } from "@/lib/logger";

// Helper to get a valid Spotify access token
async function getValidAccessToken(userId: string): Promise<string> {
  const tokenRecord = await prisma.spotifyToken.findUnique({
    where: { userId },
  });

  if (!tokenRecord) {
    throw new Error("No Spotify token found");
  }

  // Check if token is expired (with 5-minute buffer)
  if (tokenRecord.expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
    logger.info("Refreshing expired Spotify token");
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

// GET /api/spotify/tracks - Get liked songs
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const accessToken = await getValidAccessToken(userId);
    const tracks = await getLikedSongs(accessToken);

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
    logger.error("Failed to fetch Spotify tracks", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}
