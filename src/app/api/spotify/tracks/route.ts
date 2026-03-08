import { NextRequest, NextResponse } from "next/server";
import { getLikedSongs, refreshSpotifyToken } from "@/services/spotifyService";
import { enrichTracksWithLinks } from "@/services/appleSearchService";

async function getAccessToken(request: NextRequest): Promise<{
  accessToken: string;
  refreshed?: { access_token: string; expires_in: number };
}> {
  let accessToken = request.cookies.get("spotify_access_token")?.value;
  const refreshToken = request.cookies.get("spotify_refresh_token")?.value;

  if (!accessToken && refreshToken) {
    const newTokens = await refreshSpotifyToken(refreshToken);
    return { accessToken: newTokens.access_token, refreshed: newTokens };
  }

  if (!accessToken) throw new Error("Not authenticated");
  return { accessToken };
}

// GET /api/spotify/tracks — Get liked songs with Apple Music links
export async function GET(request: NextRequest) {
  try {
    const { accessToken, refreshed } = await getAccessToken(request);
    const tracks = await getLikedSongs(accessToken);
    const enriched = enrichTracksWithLinks(tracks);

    const res = NextResponse.json({
      tracks: enriched,
      total: enriched.length,
    });

    // If token was refreshed, update the cookie
    if (refreshed) {
      res.cookies.set("spotify_access_token", refreshed.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: refreshed.expires_in,
        path: "/",
      });
    }

    return res;
  } catch (error) {
    console.error("Failed to fetch Spotify tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}
