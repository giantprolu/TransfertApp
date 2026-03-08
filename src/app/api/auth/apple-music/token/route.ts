import { NextRequest, NextResponse } from "next/server";
import { generateDeveloperToken } from "@/services/appleMusicService";
import { logger } from "@/lib/logger";

// Return the developer token for MusicKit JS initialization
export async function GET(request: NextRequest) {
  try {
    const token = generateDeveloperToken();
    return NextResponse.json({ token });
  } catch (error) {
    logger.error("Failed to generate Apple Music developer token", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
