import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { SpotifyApiError, RateLimitError } from "@/lib/errors";
import { withRetry } from "@/lib/retry";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string };
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: { total: number };
  images: { url: string }[];
}

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// Build the Spotify authorization URL
export function getSpotifyAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.spotify.clientId,
    scope: config.spotify.scopes.join(" "),
    redirect_uri: config.spotify.redirectUri,
    state,
  });

  return `${config.spotify.authorizeUrl}?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeSpotifyCode(code: string): Promise<SpotifyTokens> {
  const response = await fetch(config.spotify.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${config.spotify.clientId}:${config.spotify.clientSecret}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.spotify.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error("Spotify token exchange failed", error);
    throw new SpotifyApiError(`Token exchange failed: ${error}`, response.status);
  }

  return response.json();
}

// Refresh an expired access token
export async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyTokens> {
  const response = await fetch(config.spotify.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${config.spotify.clientId}:${config.spotify.clientSecret}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error("Spotify token refresh failed", error);
    throw new SpotifyApiError(`Token refresh failed: ${error}`, response.status);
  }

  return response.json();
}

// Make authenticated API calls to Spotify
async function spotifyFetch(endpoint: string, accessToken: string): Promise<unknown> {
  return withRetry(async () => {
    const response = await fetch(`${config.spotify.apiBaseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get("Retry-After") || "1", 10);
      throw new RateLimitError(retryAfter);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new SpotifyApiError(`Spotify API error: ${error}`, response.status);
    }

    return response.json();
  });
}

// Get all Liked Songs with pagination
export async function getLikedSongs(accessToken: string): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = [];
  let offset = 0;
  const limit = 50;

  logger.info("Fetching Spotify Liked Songs...");

  while (true) {
    const data = (await spotifyFetch(
      `/me/tracks?limit=${limit}&offset=${offset}`,
      accessToken
    )) as { items: { track: SpotifyTrack }[]; next: string | null };

    for (const item of data.items) {
      tracks.push(item.track);
    }

    logger.debug(`Fetched ${tracks.length} tracks so far...`);

    if (!data.next) break;
    offset += limit;
  }

  logger.info(`Total Liked Songs fetched: ${tracks.length}`);
  return tracks;
}

// Get all user playlists
export async function getUserPlaylists(accessToken: string): Promise<SpotifyPlaylist[]> {
  const playlists: SpotifyPlaylist[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const data = (await spotifyFetch(
      `/me/playlists?limit=${limit}&offset=${offset}`,
      accessToken
    )) as { items: SpotifyPlaylist[]; next: string | null };

    playlists.push(...data.items);

    if (!data.next) break;
    offset += limit;
  }

  logger.info(`Total playlists fetched: ${playlists.length}`);
  return playlists;
}

// Get tracks from a specific playlist
export async function getPlaylistTracks(
  accessToken: string,
  playlistId: string
): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const data = (await spotifyFetch(
      `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
      accessToken
    )) as { items: { track: SpotifyTrack }[]; next: string | null };

    for (const item of data.items) {
      if (item.track) {
        tracks.push(item.track);
      }
    }

    if (!data.next) break;
    offset += limit;
  }

  return tracks;
}

// Get current user's profile
export async function getSpotifyProfile(accessToken: string) {
  return spotifyFetch("/me", accessToken) as Promise<{
    id: string;
    email: string;
    display_name: string;
  }>;
}
