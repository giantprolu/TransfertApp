import { NextRequest, NextResponse } from "next/server";
import { exchangeSpotifyCode } from "@/services/spotifyService";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const storedState = request.cookies.get("spotify_auth_state")?.value;

    if (error) {
      return NextResponse.redirect(`${baseUrl}?error=${error}`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}?error=missing_params`);
    }

    if (state !== storedState) {
      return NextResponse.redirect(`${baseUrl}?error=state_mismatch`);
    }

    // Exchange code for tokens
    const tokens = await exchangeSpotifyCode(code);

    // Store tokens in httpOnly cookies (no database needed)
    const response = NextResponse.redirect(`${baseUrl}/songs`);

    response.cookies.set("spotify_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
      path: "/",
    });

    response.cookies.set("spotify_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    response.cookies.delete("spotify_auth_state");

    return response;
  } catch (err) {
    console.error("Spotify callback error:", err);
    return NextResponse.redirect(`${baseUrl}?error=callback_failed`);
  }
}
