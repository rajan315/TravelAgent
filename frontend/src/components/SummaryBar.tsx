import type { TripPreferences, PhaseResult } from '../types';

interface Props {
  prefs: TripPreferences;
  totalSearches: number;
  results: Record<string, PhaseResult>;
}

export function SummaryBar({ prefs, totalSearches, results }: Props) {
  // Try to extract total cost from itinerary markdown
  const itinerary = results.itinerary?.markdown || '';
  const costMatch = itinerary.match(/\*\*(?:Total|Grand Total)\*\*\s*\|\s*\*\*([^*]+)\*\*/i)
    || itinerary.match(/Total[^|]*\|\s*[^$]*(\$[\d,]+(?:\s*-\s*\$[\d,]+)?)/i);
  const estimatedCost = costMatch ? costMatch[1].trim() : null;

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
      <SummaryItem label="Destination" value={prefs.destination} />
      <Divider />
      <SummaryItem label="Duration" value={`${prefs.days} days`} />
      <Divider />
      <SummaryItem label="Budget" value={prefs.budget} />
      <Divider />
      <SummaryItem label="Searches" value={String(totalSearches)} />
      {estimatedCost && (
        <>
          <Divider />
          <SummaryItem label="Est. Cost" value={estimatedCost} highlight />
        </>
      )}
    </div>
  );
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-semibold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-gray-800 hidden sm:block" />;
}
