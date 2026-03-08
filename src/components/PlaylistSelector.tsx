"use client";

interface Playlist {
  id: string;
  name: string;
  description: string;
  trackCount: number;
  image: string | null;
}

interface PlaylistSelectorProps {
  playlists: Playlist[];
  onSelect: (playlist: Playlist) => void;
  selectedId?: string;
}

export default function PlaylistSelector({
  playlists,
  onSelect,
  selectedId,
}: PlaylistSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {playlists.map((playlist) => (
        <button
          key={playlist.id}
          onClick={() => onSelect(playlist)}
          className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-[1.02] ${
            selectedId === playlist.id
              ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
              : "border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800"
          }`}
        >
          <div className="w-14 h-14 rounded-lg bg-gray-700 flex-shrink-0 overflow-hidden">
            {playlist.image ? (
              <img
                src={playlist.image}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {playlist.name}
            </p>
            <p className="text-xs text-gray-400">
              {playlist.trackCount} tracks
            </p>
          </div>
          {selectedId === playlist.id && (
            <svg
              className="w-5 h-5 text-blue-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
