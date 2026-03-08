import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// Save Apple Music user token
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { userToken } = await request.json();
    if (!userToken) {
      return NextResponse.json({ error: "Missing userToken" }, { status: 400 });
    }

    await prisma.appleMusicToken.upsert({
      where: { userId },
      update: { userToken },
      create: { userId, userToken },
    });

    logger.info(`Apple Music token saved for user ${userId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to save Apple Music token", error);
    return NextResponse.json(
      { error: "Failed to save token" },
      { status: 500 }
    );
  }
}
