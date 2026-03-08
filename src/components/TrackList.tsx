"use client";

interface Track {
  id: string;
  spotifyTitle: string;
  spotifyArtist: string;
  appleMusicTitle?: string | null;
  appleMusicArtist?: string | null;
  matchScore?: number | null;
  status: string;
}

interface TrackListProps {
  tracks: Track[];
  showMatching?: boolean;
}

export default function TrackList({ tracks, showMatching = false }: TrackListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MATCHED":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            Matched
          </span>
        );
      case "NOT_FOUND":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            Not Found
          </span>
        );
      case "FAILED":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="divide-y divide-gray-700/50">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="py-3 px-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-lg"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {track.spotifyTitle}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {track.spotifyArtist}
            </p>
          </div>

          {showMatching && track.appleMusicTitle && (
            <div className="flex-1 min-w-0 mx-4 text-right">
              <p className="text-sm text-gray-300 truncate">
                → {track.appleMusicTitle}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {track.appleMusicArtist}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 ml-4">
            {showMatching && track.matchScore != null && (
              <span className="text-xs text-gray-500">
                {(track.matchScore * 100).toFixed(0)}%
              </span>
            )}
            {showMatching && getStatusBadge(track.status)}
          </div>
        </div>
      ))}
    </div>
  );
}
