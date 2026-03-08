import { TrackWithLink } from "./appleSearchService";

/**
 * Export tracks as CSV string.
 * Columns: title, artist, album, apple_music_url
 */
export function exportCSV(tracks: TrackWithLink[]): string {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = "title,artist,album,apple_music_url";
  const rows = tracks.map(
    (t) =>
      `${escape(t.title)},${escape(t.artist)},${escape(t.album)},${escape(t.appleMusicUrl)}`
  );
  return [header, ...rows].join("\n");
}

/**
 * Export tracks as JSON string (pretty-printed).
 */
export function exportJSON(tracks: TrackWithLink[]): string {
  return JSON.stringify(tracks, null, 2);
}

/**
 * Export tracks as a readable plain text list.
 */
export function exportText(tracks: TrackWithLink[]): string {
  return tracks
    .map(
      (t, i) =>
        `${i + 1}. ${t.title} — ${t.artist} (${t.album})\n   ${t.appleMusicUrl}`
    )
    .join("\n\n");
}
