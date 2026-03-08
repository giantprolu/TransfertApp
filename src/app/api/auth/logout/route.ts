import { NextResponse } from "next/server";

// POST /api/auth/logout — Clear Spotify session cookies
export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = NextResponse.json({ success: true });
  res.cookies.delete("spotify_access_token");
  res.cookies.delete("spotify_refresh_token");
  return res;
}
