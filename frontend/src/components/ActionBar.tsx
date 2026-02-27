import { getDownloadUrl } from '../api';

interface Props {
  sessionId: string;
  onNewTrip: () => void;
  onRegenerate: () => void;
}

export function ActionBar({ sessionId, onNewTrip, onRegenerate }: Props) {
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <a
        href={getDownloadUrl(sessionId)}
        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
      >
        💾 Download Markdown
      </a>
      <button
        onClick={onRegenerate}
        className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors cursor-pointer"
      >
        🔄 Regenerate
      </button>
      <button
        onClick={onNewTrip}
        className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors cursor-pointer"
      >
        ✨ New Trip
      </button>
    </div>
  );
}
