import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/services/spotifyService";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    // Generate a state parameter for CSRF protection
    const state = uuidv4();
    const authUrl = getSpotifyAuthUrl(state);

    // Store state in a cookie for verification
    const response = NextResponse.redirect(authUrl);
    response.cookies.set("spotify_auth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Spotify auth error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}?error=auth_failed`);
  }
}
