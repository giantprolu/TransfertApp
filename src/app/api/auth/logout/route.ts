import { NextRequest, NextResponse } from "next/server";

// POST /api/auth/logout
export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = NextResponse.redirect(baseUrl);
  response.cookies.delete("user_id");
  return response;
}
