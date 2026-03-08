import { NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/services/spotifyService";

export async function GET() {
  try {
    const state = crypto.randomUUID();
    const authUrl = getSpotifyAuthUrl(state);

    const response = NextResponse.redirect(authUrl);
    response.cookies.set("spotify_auth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Spotify auth error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}?error=auth_failed`);
  }
}
