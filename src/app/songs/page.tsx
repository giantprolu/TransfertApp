"use client";

import { useState, useEffect, useMemo } from "react";

interface TrackWithLink {
  title: string;
  artist: string;
  album: string;
  appleMusicUrl: string;
}

interface Playlist {
  id: string;
  name: string;
  trackCount: number;
  image: string | null;
}

type Source = "liked" | string; // "liked" or playlist id

export default function SongsPage() {
  const [tracks, setTracks] = useState<TrackWithLink[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [source, setSource] = useState<Source>("liked");
  const [loading, setLoading] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch playlists on mount
  useEffect(() => {
    fetch("/api/spotify/playlists")
      .then((r) => r.json())
      .then((data) => {
        if (data.playlists) setPlaylists(data.playlists);
      })
      .catch(() => {})
      .finally(() => setLoadingPlaylists(false));
  }, []);

  // Fetch tracks when source changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setTracks([]);
    setProgress("Fetching tracks...");

    const url =
      source === "liked"
        ? "/api/spotify/tracks"
        : `/api/spotify/playlists/${source}/tracks`;

    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to fetch tracks");
        return r.json();
      })
      .then((data) => {
        setTracks(data.tracks || []);
        setProgress(null);
      })
      .catch((err) => {
        setError(err.message);
        setProgress(null);
      })
      .finally(() => setLoading(false));
  }, [source]);

  // Filter tracks by search query
  const filtered = useMemo(() => {
    if (!search.trim()) return tracks;
    const q = search.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );
  }, [tracks, search]);

  // Export handler
  async function handleExport(format: "csv" | "json" | "text") {
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracks: filtered, format }),
    });

    if (!res.ok) return;

    const blob = await res.blob();
    const ext = format === "text" ? "txt" : format;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `spotify-tracks.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Open all Apple Music links
  function openAllLinks() {
    // Open in batches to avoid popup blocking
    const batch = filtered.slice(0, 20); // limit to 20 at a time
    batch.forEach((t, i) => {
      setTimeout(() => window.open(t.appleMusicUrl, "_blank"), i * 300);
    });
    if (filtered.length > 20) {
      alert(
        `Opened the first 20 links. You have ${filtered.length} total tracks — use the export feature for the complete list.`
      );
    }
  }

  // Logout
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <a href="/" className="text-lg font-bold">
            🎵 Music Transfer
          </a>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Source selector */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="space-y-1">
            <label className="text-sm text-gray-400 font-medium">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="block bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DB954] min-w-[220px]"
            >
              <option value="liked">❤️ Liked Songs</option>
              {!loadingPlaylists &&
                playlists.map((p) => (
                  <option key={p.id} value={p.id}>
                    📋 {p.name} ({p.trackCount})
                  </option>
                ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 space-y-1 w-full sm:w-auto">
            <label className="text-sm text-gray-400 font-medium">Search</label>
            <input
              type="text"
              placeholder="Search by title, artist, or album..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            />
          </div>
        </div>

        {/* Progress bar */}
        {loading && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">
                {progress || "Loading..."}
              </span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#1DB954] rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Action bar */}
        {tracks.length > 0 && (
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm text-gray-400">
              {filtered.length} / {tracks.length} tracks
            </span>
            <div className="flex-1" />
            <button
              onClick={() => handleExport("csv")}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              📄 Export CSV
            </button>
            <button
              onClick={() => handleExport("json")}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              📦 Export JSON
            </button>
            <button
              onClick={() => handleExport("text")}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              📝 Export Text
            </button>
            <button
              onClick={openAllLinks}
              className="px-4 py-2 bg-[#FC3C44] hover:bg-[#e0353c] rounded-lg text-sm font-medium text-white transition-colors"
            >
              🍎 Open All in Apple Music
            </button>
          </div>
        )}

        {/* Track list */}
        {!loading && tracks.length > 0 && (
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-gray-900/70 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span>Title</span>
              <span>Artist</span>
              <span>Album</span>
              <span className="text-right">Link</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-800/50 max-h-[60vh] overflow-y-auto">
              {filtered.map((t, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-4 py-3 hover:bg-gray-900/40 transition-colors items-center text-sm"
                >
                  <span className="truncate font-medium">{t.title}</span>
                  <span className="truncate text-gray-400">{t.artist}</span>
                  <span className="truncate text-gray-500">{t.album}</span>
                  <a
                    href={t.appleMusicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FC3C44] hover:text-[#ff5c64] text-xs font-medium whitespace-nowrap transition-colors"
                  >
                    Open →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && tracks.length === 0 && !error && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-4">🎶</div>
            <p>No tracks loaded yet. Select a source above.</p>
          </div>
        )}
      </main>
    </div>
  );
}
