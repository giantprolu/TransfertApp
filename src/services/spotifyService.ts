import { config } from "@/lib/config";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
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

/** Build the Spotify authorization URL */
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

/** Exchange authorization code for tokens */
export async function exchangeSpotifyCode(
  code: string
): Promise<SpotifyTokens> {
  const res = await fetch(config.spotify.tokenUrl, {
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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify token exchange failed: ${err}`);
  }
  return res.json();
}

/** Refresh an expired access token */
export async function refreshSpotifyToken(
  refreshToken: string
): Promise<SpotifyTokens> {
  const res = await fetch(config.spotify.tokenUrl, {
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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify token refresh failed: ${err}`);
  }
  return res.json();
}

/** Authenticated Spotify API call */
async function spotifyFetch<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  const res = await fetch(`${config.spotify.apiBaseUrl}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "2", 10);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return spotifyFetch<T>(endpoint, accessToken);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify API error ${res.status}: ${err}`);
  }
  return res.json();
}

/** Get all Liked Songs with automatic pagination */
export async function getLikedSongs(
  accessToken: string,
  onProgress?: (fetched: number) => void
): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const data = await spotifyFetch<{
      items: { track: SpotifyTrack }[];
      next: string | null;
    }>(`/me/tracks?limit=${limit}&offset=${offset}`, accessToken);

    for (const item of data.items) {
      if (item.track) tracks.push(item.track);
    }

    onProgress?.(tracks.length);
    if (!data.next) break;
    offset += limit;
  }

  return tracks;
}

/** Get all user playlists */
export async function getUserPlaylists(
  accessToken: string
): Promise<SpotifyPlaylist[]> {
  const playlists: SpotifyPlaylist[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const data = await spotifyFetch<{
      items: SpotifyPlaylist[];
      next: string | null;
    }>(`/me/playlists?limit=${limit}&offset=${offset}`, accessToken);

    playlists.push(...data.items);
    if (!data.next) break;
    offset += limit;
  }

  return playlists;
}

/** Get tracks from a specific playlist */
export async function getPlaylistTracks(
  accessToken: string,
  playlistId: string
): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const data = await spotifyFetch<{
      items: { track: SpotifyTrack }[];
      next: string | null;
    }>(
      `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
      accessToken
    );

    for (const item of data.items) {
      if (item.track) tracks.push(item.track);
    }

    if (!data.next) break;
    offset += limit;
  }

  return tracks;
}

/** Get current user profile */
export async function getSpotifyProfile(accessToken: string) {
  return spotifyFetch<{
    id: string;
    email: string;
    display_name: string;
    images: { url: string }[];
  }>("/me", accessToken);
}
