import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getLikedSongs,
  getPlaylistTracks,
  refreshSpotifyToken,
  SpotifyTrack,
} from "@/services/spotifyService";
import {
  generateDeveloperToken,
  getUserStorefront,
  createPlaylist,
  addTracksToPlaylist,
} from "@/services/appleMusicService";
import { matchTrack } from "@/services/matchingService";
import { logger } from "@/lib/logger";

async function getValidAccessToken(userId: string): Promise<string> {
  const tokenRecord = await prisma.spotifyToken.findUnique({
    where: { userId },
  });

  if (!tokenRecord) throw new Error("No Spotify token found");

  if (tokenRecord.expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
    const newTokens = await refreshSpotifyToken(tokenRecord.refreshToken);
    await prisma.spotifyToken.update({
      where: { userId },
      data: {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token || tokenRecord.refreshToken,
        expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
      },
    });
    return newTokens.access_token;
  }

  return tokenRecord.accessToken;
}

// POST /api/transfer - Start a transfer
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { source, playlistId, playlistName } = body;
    // source: "liked_songs" | "playlist"

    // Get Apple Music user token
    const appleMusicToken = await prisma.appleMusicToken.findUnique({
      where: { userId },
    });

    if (!appleMusicToken) {
      return NextResponse.json(
        { error: "Apple Music not connected" },
        { status: 400 }
      );
    }

    // Create import record
    const importRecord = await prisma.import.create({
      data: {
        userId,
        source: source === "liked_songs" ? "spotify_liked" : "spotify_playlist",
        sourcePlaylist: playlistName || "Liked Songs",
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    // Process in background (fire and forget)
    processTransfer(
      userId,
      importRecord.id,
      source,
      playlistId,
      playlistName,
      appleMusicToken.userToken
    ).catch((error) => {
      logger.error("Transfer failed", error);
    });

    return NextResponse.json({
      importId: importRecord.id,
      message: "Transfer started",
    });
  } catch (error) {
    logger.error("Failed to start transfer", error);
    return NextResponse.json(
      { error: "Failed to start transfer" },
      { status: 500 }
    );
  }
}

async function processTransfer(
  userId: string,
  importId: string,
  source: string,
  playlistId: string | undefined,
  playlistName: string | undefined,
  appleMusicUserToken: string
) {
  try {
    // Get Spotify tracks
    const accessToken = await getValidAccessToken(userId);
    let spotifyTracks: SpotifyTrack[];

    if (source === "liked_songs") {
      spotifyTracks = await getLikedSongs(accessToken);
    } else if (playlistId) {
      spotifyTracks = await getPlaylistTracks(accessToken, playlistId);
    } else {
      throw new Error("Invalid source");
    }

    // Update total tracks
    await prisma.import.update({
      where: { id: importId },
      data: { totalTracks: spotifyTracks.length },
    });

    // Get Apple Music developer token and storefront
    const developerToken = generateDeveloperToken();
    const storefront = await getUserStorefront(developerToken, appleMusicUserToken);

    // Match tracks
    const matchedAppleMusicIds: string[] = [];
    let matchedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < spotifyTracks.length; i++) {
      const track = spotifyTracks[i];

      try {
        const result = await matchTrack(
          track,
          developerToken,
          appleMusicUserToken,
          storefront
        );

        // Save track result
        await prisma.track.create({
          data: {
            importId,
            spotifyTrackId: track.id,
            spotifyTitle: track.name,
            spotifyArtist: track.artists.map((a) => a.name).join(", "),
            spotifyAlbum: track.album?.name || "",
            appleMusicId: result.appleMusicTrack?.id || null,
            appleMusicTitle: result.appleMusicTrack?.attributes.name || null,
            appleMusicArtist: result.appleMusicTrack?.attributes.artistName || null,
            matchScore: result.score,
            status: result.matched ? "MATCHED" : "NOT_FOUND",
          },
        });

        if (result.matched && result.appleMusicTrack) {
          matchedAppleMusicIds.push(result.appleMusicTrack.id);
          matchedCount++;
        } else {
          failedCount++;
        }

        // Update progress periodically
        if ((i + 1) % 10 === 0 || i === spotifyTracks.length - 1) {
          await prisma.import.update({
            where: { id: importId },
            data: { matchedTracks: matchedCount, failedTracks: failedCount },
          });
        }

        // Rate limit delay
        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (error) {
        logger.error(`Failed to match track: ${track.name}`, error);
        failedCount++;

        await prisma.track.create({
          data: {
            importId,
            spotifyTrackId: track.id,
            spotifyTitle: track.name,
            spotifyArtist: track.artists.map((a) => a.name).join(", "),
            spotifyAlbum: track.album?.name || "",
            status: "FAILED",
            errorMessage: (error as Error).message,
          },
        });
      }
    }

    // Create Apple Music playlist and add tracks
    if (matchedAppleMusicIds.length > 0) {
      const targetPlaylistName =
        source === "liked_songs"
          ? "Imported from Spotify - Liked Songs"
          : `Imported from Spotify - ${playlistName || "Playlist"}`;

      const amPlaylistId = await createPlaylist(
        targetPlaylistName,
        `Transferred ${matchedAppleMusicIds.length} tracks from Spotify`,
        developerToken,
        appleMusicUserToken
      );

      await addTracksToPlaylist(
        amPlaylistId,
        matchedAppleMusicIds,
        developerToken,
        appleMusicUserToken
      );

      await prisma.import.update({
        where: { id: importId },
        data: {
          targetPlaylist: targetPlaylistName,
          status: "COMPLETED",
          matchedTracks: matchedCount,
          failedTracks: failedCount,
          completedAt: new Date(),
        },
      });

      logger.info(
        `Transfer completed: ${matchedCount}/${spotifyTracks.length} tracks transferred`
      );
    } else {
      await prisma.import.update({
        where: { id: importId },
        data: {
          status: "COMPLETED",
          matchedTracks: 0,
          failedTracks: failedCount,
          completedAt: new Date(),
          errorMessage: "No tracks could be matched",
        },
      });
    }
  } catch (error) {
    logger.error("Transfer process failed", error);

    await prisma.import.update({
      where: { id: importId },
      data: {
        status: "FAILED",
        errorMessage: (error as Error).message,
        completedAt: new Date(),
      },
    });
  }
}
