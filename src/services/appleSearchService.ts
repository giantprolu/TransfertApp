/**
 * Clean a Spotify track title for Apple Music search.
 * Removes noise like "- Radio Edit", "(Remastered)", "feat.", etc.
 */
function cleanTitle(title: string): string {
  return (
    title
      // Remove everything after " - " (Radio Edit, Remastered, Deluxe, etc.)
      .replace(/\s*-\s*.+$/, "")
      // Remove parenthesized noise (feat., Remastered, Bonus Track, Live, etc.)
      .replace(/\s*\((?:feat\.?|ft\.?|with|remaster|deluxe|bonus|live|remix|radio|edit|version|original|anniversary|mono|stereo|acoustic|explicit|clean|extended|short|single)[^)]*\)/gi, "")
      // Remove bracketed noise [Remastered], [Deluxe], etc.
      .replace(/\s*\[(?:feat\.?|ft\.?|remaster|deluxe|bonus|live|remix|radio|edit|version|original|anniversary|mono|stereo|acoustic|explicit|clean|extended|short|single)[^\]]*\]/gi, "")
      // Remove standalone "feat." / "ft." mentions
      .replace(/\s*(?:feat\.?|ft\.?)\s+.+$/i, "")
      .trim()
  );
}

/**
 * Clean artist name — take only the first/main artist.
 */
function cleanArtist(artist: string): string {
  return artist
    .split(/,|&|;|\bx\b|\bX\b/)[0]
    .trim();
}

/**
 * Generates an Apple Music search URL for a given track.
 * Format: https://music.apple.com/search?term=ARTIST+TITLE
 * Artist first gives better results on Apple Music.
 */
export function getAppleMusicSearchUrl(
  title: string,
  artist: string
): string {
  const cleanedTitle = cleanTitle(title);
  const cleanedArtist = cleanArtist(artist);
  const term = `${cleanedArtist} ${cleanedTitle}`.trim();
  return `https://music.apple.com/search?term=${encodeURIComponent(term)}`;
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
