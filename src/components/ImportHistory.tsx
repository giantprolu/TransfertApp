"use client";

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

interface ImportHistoryProps {
  imports: ImportRecord[];
  onViewDetails: (id: string) => void;
}

export default function ImportHistory({
  imports,
  onViewDetails,
}: ImportHistoryProps) {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
      FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
      IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      PENDING: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };

    return (
      <span
        className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
          styles[status] || styles.PENDING
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (imports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p>No imports yet</p>
        <p className="text-sm mt-1">Start by transferring your music!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {imports.map((imp) => (
        <div
          key={imp.id}
          className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-medium text-white truncate">
                  {imp.sourcePlaylist || "Unknown"}
                </h3>
                {getStatusBadge(imp.status)}
              </div>
              <p className="text-xs text-gray-400">
                {formatDate(imp.createdAt)}
              </p>
              {imp.targetPlaylist && (
                <p className="text-xs text-gray-500 mt-1">
                  → {imp.targetPlaylist}
                </p>
              )}
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-sm text-white">
                <span className="text-green-400">{imp.matchedTracks}</span>
                <span className="text-gray-500"> / {imp.totalTracks}</span>
              </p>
              <p className="text-xs text-gray-500">matched</p>
            </div>
          </div>

          {imp.errorMessage && (
            <p className="text-xs text-red-400 mt-2 bg-red-500/10 rounded-lg p-2">
              {imp.errorMessage}
            </p>
          )}

          <button
            onClick={() => onViewDetails(imp.id)}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Details →
          </button>
        </div>
      ))}
    </div>
  );
}
