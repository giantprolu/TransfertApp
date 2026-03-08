/**
 * Clean a Spotify track title for Apple Music search.
 * Removes parentheses, brackets, feat/ft mentions, suffixes, special chars.
 */
function cleanTitle(title: string): string {
  let cleaned = title;
  // Remove everything between parentheses or brackets
  cleaned = cleaned.replace(/\(.*?\)|\[.*?\]/g, "");
  // Remove everything after " - "
  cleaned = cleaned.replace(/\s*-\s*.+$/, "");
  // Remove "feat." / "ft." followed by names
  cleaned = cleaned.replace(/feat\.?\s+[\w\s]+/gi, "");
  cleaned = cleaned.replace(/ft\.?\s+[\w\s]+/gi, "");
  // Collapse multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

/**
 * Clean artist name — take only the first/main artist.
 */
function cleanArtist(artist: string): string {
  return artist
    .split(/,|&|;/)[0]
    .trim();
}

/**
 * Generates an Apple Music search URL for a given track.
 * Format: https://music.apple.com/us/search?term=ARTIST%20TITLE
 */
export function getAppleMusicSearchUrl(
  title: string,
  artist: string
): string {
  const cleanedTitle = cleanTitle(title);
  const cleanedArtist = cleanArtist(artist);
  const term = `${cleanedArtist} ${cleanedTitle}`
    .replace(/\+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `https://music.apple.com/fr/search?term=${encodeURIComponent(term)}`;
}

export interface TrackWithLink {
  title: string;
  artist: string;
  album: string;
  appleMusicUrl: string;
}

/**
 * Enrich a list of tracks with Apple Music search links.
 */
export function enrichTracksWithLinks(
  tracks: { name: string; artists: { name: string }[]; album: { name: string } }[]
): TrackWithLink[] {
  return tracks.map((t) => {
    const title = t.name;
    const artist = t.artists.map((a) => a.name).join(", ");
    const album = t.album.name;
    return {
      title,
      artist,
      album,
      appleMusicUrl: getAppleMusicSearchUrl(title, artist),
    };
  });
}
