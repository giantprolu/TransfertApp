import jwt from "jsonwebtoken";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { AppleMusicApiError, RateLimitError } from "@/lib/errors";
import { withRetry } from "@/lib/retry";

export interface AppleMusicTrack {
  id: string;
  type: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    durationInMillis: number;
    url: string;
  };
}

export interface AppleMusicSearchResult {
  results: {
    songs?: {
      data: AppleMusicTrack[];
    };
  };
}

// Cache the developer token
let cachedDeveloperToken: string | null = null;
let tokenExpiresAt: number = 0;

// Generate Apple Music developer token (JWT)
export function generateDeveloperToken(): string {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if still valid (with 5-minute buffer)
  if (cachedDeveloperToken && now < tokenExpiresAt - 300) {
    return cachedDeveloperToken;
  }

  const privateKey = config.appleMusic.privateKey.replace(/\\n/g, "\n");

  const token = jwt.sign({}, privateKey, {
    algorithm: "ES256",
    expiresIn: "180d",
    issuer: config.appleMusic.teamId,
    header: {
      alg: "ES256",
      kid: config.appleMusic.keyId,
    },
  });

  cachedDeveloperToken = token;
  tokenExpiresAt = now + 180 * 24 * 60 * 60; // 180 days

  logger.info("Generated new Apple Music developer token");
  return token;
}

// Make authenticated Apple Music API calls
async function appleMusicFetch(
  endpoint: string,
  developerToken: string,
  userToken: string,
  options: RequestInit = {}
): Promise<unknown> {
  return withRetry(async () => {
    const response = await fetch(`https://api.music.apple.com${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${developerToken}`,
        "Music-User-Token": userToken,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get("Retry-After") || "3", 10);
      throw new RateLimitError(retryAfter);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new AppleMusicApiError(
        `Apple Music API error: ${error}`,
        response.status
      );
    }

    // Some responses are 204 No Content
    if (response.status === 204) return null;

    return response.json();
  });
}

// Search for a song on Apple Music
export async function searchTrack(
  query: string,
  developerToken: string,
  userToken: string,
  storefront: string = "us"
): Promise<AppleMusicTrack[]> {
  const params = new URLSearchParams({
    term: query,
    types: "songs",
    limit: "10",
  });

  const data = (await appleMusicFetch(
    `/v1/catalog/${storefront}/search?${params.toString()}`,
    developerToken,
    userToken
  )) as AppleMusicSearchResult;

  return data?.results?.songs?.data || [];
}

// Get user's storefront (country)
export async function getUserStorefront(
  developerToken: string,
  userToken: string
): Promise<string> {
  try {
    const data = (await appleMusicFetch(
      "/v1/me/storefront",
      developerToken,
      userToken
    )) as { data: { id: string }[] };

    return data.data[0]?.id || "us";
  } catch {
    logger.warn("Could not get storefront, defaulting to 'us'");
    return "us";
  }
}

// Create a new playlist
export async function createPlaylist(
  name: string,
  description: string,
  developerToken: string,
  userToken: string
): Promise<string> {
  const data = (await appleMusicFetch(
    "/v1/me/library/playlists",
    developerToken,
    userToken,
    {
      method: "POST",
      body: JSON.stringify({
        attributes: {
          name,
          description,
        },
      }),
    }
  )) as { data: { id: string }[] };

  const playlistId = data.data[0]?.id;

  if (!playlistId) {
    throw new AppleMusicApiError("Failed to create playlist");
  }

  logger.info(`Created Apple Music playlist: ${name} (${playlistId})`);
  return playlistId;
}

// Add tracks to a playlist
export async function addTracksToPlaylist(
  playlistId: string,
  trackIds: string[],
  developerToken: string,
  userToken: string
): Promise<void> {
  // Apple Music API limits to 100 tracks per request
  const batchSize = 100;

  for (let i = 0; i < trackIds.length; i += batchSize) {
    const batch = trackIds.slice(i, i + batchSize);

    await appleMusicFetch(
      `/v1/me/library/playlists/${playlistId}/tracks`,
      developerToken,
      userToken,
      {
        method: "POST",
        body: JSON.stringify({
          data: batch.map((id) => ({
            id,
            type: "songs",
          })),
        }),
      }
    );

    logger.debug(`Added batch ${Math.floor(i / batchSize) + 1} to playlist`);

    // Small delay between batches to avoid rate limits
    if (i + batchSize < trackIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
