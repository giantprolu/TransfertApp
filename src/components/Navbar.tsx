"use client";

interface NavbarProps {
  user: {
    name: string;
    email: string;
    spotifyConnected: boolean;
    appleMusicConnected: boolean;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1DB954] to-[#FC3C44] rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">
              Music Transfer
            </span>
          </a>

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user.spotifyConnected && (
                  <span className="px-2 py-1 text-xs rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
                    Spotify ✓
                  </span>
                )}
                {user.appleMusicConnected && (
                  <span className="px-2 py-1 text-xs rounded-full bg-[#FC3C44]/20 text-[#FC3C44] border border-[#FC3C44]/30">
                    Apple Music ✓
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-400">{user.name}</div>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
