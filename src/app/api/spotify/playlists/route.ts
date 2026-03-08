import { NextRequest, NextResponse } from "next/server";
import {
  getUserPlaylists,
  refreshSpotifyToken,
} from "@/services/spotifyService";

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

// GET /api/spotify/playlists — Get user playlists
export async function GET(request: NextRequest) {
  try {
    const { accessToken, refreshed } = await getAccessToken(request);
    const playlists = await getUserPlaylists(accessToken);

    const res = NextResponse.json({
      playlists: playlists.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        trackCount: p.tracks.total,
        image: p.images?.[0]?.url || null,
      })),
      total: playlists.length,
    });

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
    console.error("Failed to fetch playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}
