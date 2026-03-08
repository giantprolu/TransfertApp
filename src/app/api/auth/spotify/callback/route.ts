import { NextRequest, NextResponse } from "next/server";
import { exchangeSpotifyCode, getSpotifyProfile } from "@/services/spotifyService";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const storedState = request.cookies.get("spotify_auth_state")?.value;

    if (error) {
      logger.error("Spotify auth error", error);
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
    
    // Get user profile
    const profile = await getSpotifyProfile(tokens.access_token);

    // Upsert user and tokens in database
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: {
        name: profile.display_name,
      },
      create: {
        email: profile.email,
        name: profile.display_name,
      },
    });

    await prisma.spotifyToken.upsert({
      where: { userId: user.id },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        scope: tokens.scope,
      },
      create: {
        userId: user.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        scope: tokens.scope,
      },
    });

    logger.info(`User authenticated: ${profile.display_name} (${profile.email})`);

    // Set session cookie with user ID
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    response.cookies.set("user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    response.cookies.delete("spotify_auth_state");

    return response;
  } catch (error) {
    logger.error("Spotify callback error", error);
    return NextResponse.redirect(`${baseUrl}?error=callback_failed`);
  }
}
