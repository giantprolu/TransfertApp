"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import Navbar from "@/components/Navbar";
import AppleMusicConnectButton from "@/components/AppleMusicConnectButton";
import PlaylistSelector from "@/components/PlaylistSelector";
import ImportHistory from "@/components/ImportHistory";

interface Playlist {
  id: string;
  name: string;
  description: string;
  trackCount: number;
  image: string | null;
}

interface ImportRecord {
  id: string;
  source: string;
  sourcePlaylist: string | null;
  targetPlaylist: string | null;
  status: string;
  totalTracks: number;
  matchedTracks: number;
  failedTracks: number;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading, refetch } = useUser();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [activeTab, setActiveTab] = useState<"transfer" | "history">("transfer");

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/";
    }
  }, [user, loading]);

  // Fetch playlists
  const fetchPlaylists = useCallback(async () => {
    setLoadingPlaylists(true);
    try {
      const res = await fetch("/api/spotify/playlists");
      const data = await res.json();
      setPlaylists(data.playlists || []);
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
    } finally {
      setLoadingPlaylists(false);
    }
  }, []);

  // Fetch import history
  const fetchImports = useCallback(async () => {
    try {
      const res = await fetch("/api/imports");
      const data = await res.json();
      setImports(data.imports || []);
    } catch (err) {
      console.error("Failed to fetch imports:", err);
    }
  }, []);

  useEffect(() => {
    if (user?.spotifyConnected) {
      fetchPlaylists();
      fetchImports();
    }
  }, [user, fetchPlaylists, fetchImports]);

  // Start transfer
  const startTransfer = async (source: "liked_songs" | "playlist") => {
    setTransferring(true);
    try {
      const body: Record<string, string> = { source };
      if (source === "playlist" && selectedPlaylist) {
        body.playlistId = selectedPlaylist.id;
        body.playlistName = selectedPlaylist.name;
      }

      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.importId) {
        window.location.href = `/transfer/${data.importId}`;
      }
    } catch (err) {
      console.error("Failed to start transfer:", err);
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Apple Music Connection */}
        {!user.appleMusicConnected && (
          <div className="mb-8 p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-2">
              Step 2: Connect Apple Music
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Authorize access to your Apple Music account to start transferring
              music.
            </p>
            <AppleMusicConnectButton onConnected={refetch} />
          </div>
        )}

        {/* Ready to transfer */}
        {user.spotifyConnected && user.appleMusicConnected && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-gray-900/50 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("transfer")}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "transfer"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Transfer
              </button>
              <button
                onClick={() => {
                  setActiveTab("history");
                  fetchImports();
                }}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "history"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                History
              </button>
            </div>

            {activeTab === "transfer" && (
              <div className="space-y-8">
                {/* Transfer Liked Songs */}
                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-1">
                        Transfer Liked Songs
                      </h2>
                      <p className="text-sm text-gray-400">
                        Transfer all your Spotify Liked Songs to a new Apple
                        Music playlist.
                      </p>
                    </div>
                    <button
                      onClick={() => startTransfer("liked_songs")}
                      disabled={transferring}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#1DB954] to-[#FC3C44] hover:opacity-90 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {transferring ? "Starting..." : "Transfer →"}
                    </button>
                  </div>
                </div>

                {/* Transfer Playlist */}
                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <h2 className="text-lg font-semibold text-white mb-1">
                    Transfer a Playlist
                  </h2>
                  <p className="text-sm text-gray-400 mb-6">
                    Select a Spotify playlist to transfer to Apple Music.
                  </p>

                  {loadingPlaylists ? (
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Loading playlists...
                    </div>
                  ) : playlists.length > 0 ? (
                    <>
                      <PlaylistSelector
                        playlists={playlists}
                        onSelect={setSelectedPlaylist}
                        selectedId={selectedPlaylist?.id}
                      />
                      {selectedPlaylist && (
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => startTransfer("playlist")}
                            disabled={transferring}
                            className="px-6 py-2.5 bg-gradient-to-r from-[#1DB954] to-[#FC3C44] hover:opacity-90 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                          >
                            {transferring
                              ? "Starting..."
                              : `Transfer "${selectedPlaylist.name}" →`}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">No playlists found.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Import History
                </h2>
                <ImportHistory
                  imports={imports}
                  onViewDetails={(id) => {
                    window.location.href = `/transfer/${id}`;
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* Not fully connected */}
        {user.spotifyConnected && !user.appleMusicConnected && (
          <div className="text-center py-12 text-gray-500">
            <p>Connect your Apple Music account above to start transferring.</p>
          </div>
        )}
      </main>
    </div>
  );
}
