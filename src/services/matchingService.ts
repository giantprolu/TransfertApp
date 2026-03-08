import { distance } from "fastest-levenshtein";
import { SpotifyTrack } from "./spotifyService";
import { AppleMusicTrack, searchTrack } from "./appleMusicService";
import { logger } from "@/lib/logger";

export interface MatchResult {
  appleMusicTrack: AppleMusicTrack | null;
  score: number;
  matched: boolean;
}

// Normalize a string for comparison
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/\(feat\..*?\)/gi, "")
    .replace(/\(ft\..*?\)/gi, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?remix.*?\)/gi, "")
    .replace(/\(.*?version.*?\)/gi, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Calculate similarity between two strings (0 to 1)
function similarity(str1: string, str2: string): number {
  const s1 = normalize(str1);
  const s2 = normalize(str2);

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const maxLen = Math.max(s1.length, s2.length);
  const dist = distance(s1, s2);

  return 1 - dist / maxLen;
}

// Calculate combined match score for a potential match
function calculateMatchScore(
  spotifyTrack: { title: string; artist: string; album: string },
  appleMusicTrack: AppleMusicTrack
): number {
  const titleScore = similarity(spotifyTrack.title, appleMusicTrack.attributes.name);
  const artistScore = similarity(
    spotifyTrack.artist,
    appleMusicTrack.attributes.artistName
  );
  const albumScore = similarity(
    spotifyTrack.album,
    appleMusicTrack.attributes.albumName
  );

  // Weighted score: title and artist are more important than album
  const weightedScore = titleScore * 0.4 + artistScore * 0.4 + albumScore * 0.2;

  return weightedScore;
}

// Find the best matching Apple Music track for a Spotify track
export async function matchTrack(
  spotifyTrack: SpotifyTrack,
  developerToken: string,
  userToken: string,
  storefront: string = "us"
): Promise<MatchResult> {
  const title = spotifyTrack.name;
  const artist = spotifyTrack.artists.map((a) => a.name).join(" ");
  const album = spotifyTrack.album?.name || "";

  // Try different search queries for better results
  const queries = [
    `${title} ${artist}`,
    `${title} ${spotifyTrack.artists[0]?.name || ""}`,
  ];

  let bestMatch: AppleMusicTrack | null = null;
  let bestScore = 0;

  for (const query of queries) {
    try {
      const results = await searchTrack(query, developerToken, userToken, storefront);

      for (const track of results) {
        const score = calculateMatchScore({ title, artist, album }, track);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = track;
        }
      }

      // If we found a very high confidence match, stop searching
      if (bestScore >= 0.85) break;
    } catch (error) {
      logger.warn(`Search query failed: "${query}"`, error);
    }
  }

  const matched = bestScore >= 0.6;

  if (matched) {
    logger.debug(
      `Matched: "${title}" by ${artist} → "${bestMatch?.attributes.name}" (${(bestScore * 100).toFixed(1)}%)`
    );
  } else {
    logger.warn(
      `No match: "${title}" by ${artist} (best score: ${(bestScore * 100).toFixed(1)}%)`
    );
  }

  return {
    appleMusicTrack: matched ? bestMatch : null,
    score: bestScore,
    matched,
  };
}

// Process a batch of tracks with progress callback
export async function matchTracks(
  spotifyTracks: SpotifyTrack[],
  developerToken: string,
  userToken: string,
  storefront: string = "us",
  onProgress?: (current: number, total: number, track: SpotifyTrack, result: MatchResult) => void
): Promise<MatchResult[]> {
  const results: MatchResult[] = [];

  for (let i = 0; i < spotifyTracks.length; i++) {
    const track = spotifyTracks[i];
    const result = await matchTrack(track, developerToken, userToken, storefront);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, spotifyTracks.length, track, result);
    }

    // Small delay between requests to avoid rate limiting
    if (i < spotifyTracks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  const matched = results.filter((r) => r.matched).length;
  logger.info(
    `Matching complete: ${matched}/${spotifyTracks.length} tracks matched`
  );

  return results;
}
