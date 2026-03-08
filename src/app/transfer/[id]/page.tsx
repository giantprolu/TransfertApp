"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import TrackList from "@/components/TrackList";

interface TransferData {
  id: string;
  status: string;
  source: string;
  sourcePlaylist: string | null;
  targetPlaylist: string | null;
  totalTracks: number;
  matchedTracks: number;
  failedTracks: number;
  errorMessage: string | null;
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  tracks: {
    id: string;
    spotifyTitle: string;
    spotifyArtist: string;
    appleMusicTitle: string | null;
    appleMusicArtist: string | null;
    matchScore: number | null;
    status: string;
  }[];
}

export default function TransferProgressPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, loading: userLoading } = useUser();
  const [data, setData] = useState<TransferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "matched" | "failed">("all");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/transfer/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch transfer status:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Poll for updates
  useEffect(() => {
    fetchStatus();

    const interval = setInterval(() => {
      fetchStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Stop polling when complete
  useEffect(() => {
    if (data?.status === "COMPLETED" || data?.status === "FAILED") {
      // Final fetch after a delay
      const timeout = setTimeout(fetchStatus, 3000);
      return () => clearTimeout(timeout);
    }
  }, [data?.status, fetchStatus]);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} />
        <main className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-400">Transfer not found.</p>
          <a href="/dashboard" className="text-blue-400 hover:underline mt-4 inline-block">
            ← Back to Dashboard
          </a>
        </main>
      </div>
    );
  }

  const filteredTracks = data.tracks.filter((t) => {
    if (filter === "matched") return t.status === "MATCHED";
    if (filter === "failed") return t.status === "NOT_FOUND" || t.status === "FAILED";
    return true;
  });

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back link */}
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </a>

        {/* Header */}
        <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-1">
            {data.sourcePlaylist || "Transfer"}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {data.source === "spotify_liked" ? "Liked Songs" : "Playlist"} →{" "}
            {data.targetPlaylist || "Apple Music"}
          </p>

          <ProgressBar
            progress={data.progress}
            matchedTracks={data.matchedTracks}
            failedTracks={data.failedTracks}
            totalTracks={data.totalTracks}
            status={data.status}
          />

          {data.errorMessage && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
              {data.errorMessage}
            </div>
          )}

          {data.status === "COMPLETED" && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400">
              Transfer complete! {data.matchedTracks} tracks were added to your
              Apple Music playlist.
            </div>
          )}
        </div>

        {/* Track List */}
        {data.tracks.length > 0 && (
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Tracks</h2>
              <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg">
                {(["all", "matched", "failed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      filter === f
                        ? "bg-white text-gray-900"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {f === "all"
                      ? `All (${data.tracks.length})`
                      : f === "matched"
                      ? `Matched (${data.matchedTracks})`
                      : `Failed (${data.failedTracks})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              <TrackList tracks={filteredTracks} showMatching />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
