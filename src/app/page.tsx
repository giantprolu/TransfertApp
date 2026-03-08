"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function HomeContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="max-w-2xl text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 text-6xl">
          <span>🎵</span>
          <span className="text-gray-500">→</span>
          <span>🍎</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Spotify → Apple&nbsp;Music
        </h1>

        <p className="text-lg text-gray-400 max-w-lg mx-auto">
          Transfer your Liked Songs from Spotify to Apple Music.
          Generate search links, export CSV / JSON, and migrate your library
          — <span className="text-white font-medium">for free</span>.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            Authentication failed. Please try again.
          </div>
        )}

        {/* Connect button */}
        <a
          href="/api/auth/spotify"
          className="inline-flex items-center gap-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold py-4 px-8 rounded-full text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#1DB954]/20"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Connect Spotify
        </a>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-left">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 space-y-2">
            <div className="text-2xl">🔗</div>
            <h3 className="font-semibold">Apple Music Links</h3>
            <p className="text-sm text-gray-400">
              One-click links to find each song on Apple Music.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 space-y-2">
            <div className="text-2xl">📄</div>
            <h3 className="font-semibold">Export CSV / JSON</h3>
            <p className="text-sm text-gray-400">
              Download your library in multiple formats.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 space-y-2">
            <div className="text-2xl">📋</div>
            <h3 className="font-semibold">Playlists Too</h3>
            <p className="text-sm text-gray-400">
              Import Liked Songs or any of your playlists.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-sm text-gray-600">
        No Apple Developer account needed. 100% free.
      </footer>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
