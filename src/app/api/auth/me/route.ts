import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/auth/me - Get current user info
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        spotifyToken: { select: { id: true, expiresAt: true } },
        appleMusicToken: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        spotifyConnected: !!user.spotifyToken,
        appleMusicConnected: !!user.appleMusicToken,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
