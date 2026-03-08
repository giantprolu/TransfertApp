"use client";

import SpotifyConnectButton from "@/components/SpotifyConnectButton";
import { useUser } from "@/hooks/useUser";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function HomeContent() {
  const { user, loading } = useUser();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (user) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="w-16 h-16 bg-[#1DB954] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="w-16 h-16 bg-gradient-to-br from-[#FC3C44] to-[#FA2D55] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FC3C44]/20">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.8.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03c.525 0 1.048-.034 1.57-.1.823-.104 1.604-.318 2.31-.768 1.053-.67 1.752-1.612 2.13-2.79.166-.518.244-1.05.283-1.59.033-.413.053-.828.06-1.244V6.124zM17.34 17.17c-.31.47-.79.705-1.3.705-.24 0-.49-.053-.73-.172-2.37-1.16-5.06-1.34-7.68-.67a4.6 4.6 0 01-.35.083c-.61.116-1.1-.32-1.15-.87a.934.934 0 01.73-1.02c3.06-.78 6.21-.58 9 .78.6.31.85.95.48 1.16zm1.12-2.96a1.21 1.21 0 01-1.63.56c-2.63-1.62-6.64-2.09-9.76-1.14-.464.14-.96-.13-1.1-.592a1.133 1.133 0 01.59-1.37c3.55-1.08 7.96-.555 10.99 1.3.38.218.55.71.31 1.24zm.1-3.083c-3.15-1.87-8.35-2.04-11.36-1.13-.483.146-1-.13-1.15-.61-.146-.482.13-.99.613-1.14 3.44-1.04 9.17-.84 12.79 1.3.443.263.59.85.326 1.29-.264.444-.85.59-1.22.29z" />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#1DB954] via-white to-[#FC3C44] bg-clip-text text-transparent">
              Music Transfer
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
            Transfer your Liked Songs and playlists from{" "}
            <span className="text-[#1DB954] font-medium">Spotify</span> to{" "}
            <span className="text-[#FC3C44] font-medium">Apple Music</span>{" "}
            with intelligent matching.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              Authentication failed. Please try again.
            </div>
          )}

          <div className="pt-4">
            <SpotifyConnectButton />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-left">
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Liked Songs</h3>
              <p className="text-sm text-gray-400">
                Transfer all your Spotify Liked Songs in one click.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Playlists</h3>
              <p className="text-sm text-gray-400">
                Import any Spotify playlist to Apple Music.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Smart Match</h3>
              <p className="text-sm text-gray-400">
                Intelligent matching using title, artist & album similarity.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-600">
        Built with Next.js, Spotify API & Apple Music API
      </footer>
    </div>
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
