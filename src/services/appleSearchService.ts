/**
 * Generates an Apple Music search URL for a given track.
 * Format: https://music.apple.com/search?term=TITLE+ARTIST
 */
export function getAppleMusicSearchUrl(
  title: string,
  artist: string
): string {
  const term = `${title} ${artist}`
    .trim()
    .replace(/\s+/g, "+")
    .replace(/[^\w+\-'.]/g, "");
  return `https://music.apple.com/search?term=${encodeURIComponent(
    term.replace(/\+/g, " ")
  ).replace(/%20/g, "+")}`;
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
