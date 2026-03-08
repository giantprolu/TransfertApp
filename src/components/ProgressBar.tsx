"use client";

interface ProgressBarProps {
  progress: number;
  matchedTracks: number;
  failedTracks: number;
  totalTracks: number;
  status: string;
}

export default function ProgressBar({
  progress,
  matchedTracks,
  failedTracks,
  totalTracks,
  status,
}: ProgressBarProps) {
  const getStatusColor = () => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "PENDING":
        return "Waiting...";
      case "IN_PROGRESS":
        return "Transferring...";
      case "COMPLETED":
        return "Complete!";
      case "FAILED":
        return "Failed";
      default:
        return status;
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">
          {getStatusText()}
        </span>
        <span className="text-sm text-gray-400">{progress}%</span>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getStatusColor()}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-gray-300">
            Matched: <strong className="text-white">{matchedTracks}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-gray-300">
            Not found: <strong className="text-white">{failedTracks}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
          <span className="text-gray-300">
            Total: <strong className="text-white">{totalTracks}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
