import { useEffect, useRef } from 'react';
import { PHASES } from '../types';
import type { SearchEvent } from '../types';
import type { PhaseStatus } from '../hooks/useResearch';

interface Props {
  phaseStatuses: Record<string, PhaseStatus>;
  searchLogs: SearchEvent[];
  totalSearches: number;
}

export function LoadingScreen({ phaseStatuses, searchLogs, totalSearches }: Props) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [searchLogs.length]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Researching your trip...</h2>
          <p className="text-gray-400 text-sm">
            AI is searching the web across 5 research phases
          </p>
        </div>

        {/* Phase pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {PHASES.map((phase) => {
            const status = phaseStatuses[phase.id];
            return (
              <PhasePill
                key={phase.id}
                icon={phase.icon}
                title={phase.title}
                color={phase.color}
                status={status}
              />
            );
          })}
        </div>

        {/* Search counter */}
        <div className="text-center mb-4">
          <span className="text-5xl font-bold text-indigo-400 tabular-nums">{totalSearches}</span>
          <p className="text-gray-400 text-sm mt-1">web searches performed</p>
        </div>

        {/* Search log */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 h-64 overflow-y-auto">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
            Live Search Log
          </div>
          {searchLogs.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-600">
              <Spinner /> <span className="ml-2">Waiting for searches...</span>
            </div>
          ) : (
            searchLogs.map((log, i) => (
              <div key={i} className="search-log-item flex items-start gap-2 py-1.5 text-sm border-b border-gray-800/50 last:border-0">
                <span className="text-green-400 shrink-0">🔍</span>
                <span className="text-gray-300">{log.query}</span>
                <span className="ml-auto text-gray-600 text-xs shrink-0">
                  {PHASES.find((p) => p.id === log.phase_id)?.icon}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}

function PhasePill({ icon, title, color, status }: {
  icon: string; title: string; color: string; status: PhaseStatus;
}) {
  const short = title.split(' ')[0];
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
        status === 'running'
          ? 'border-current bg-gray-800 shadow-lg'
          : status === 'complete'
            ? 'border-green-700/50 bg-green-900/30 text-green-300'
            : status === 'error'
              ? 'border-red-700/50 bg-red-900/30 text-red-300'
              : 'border-gray-700 bg-gray-800/50 text-gray-500'
      }`}
      style={status === 'running' ? { color, borderColor: color, boxShadow: `0 0 12px ${color}33` } : {}}
    >
      {status === 'running' ? <Spinner /> : status === 'complete' ? <span>✓</span> : status === 'error' ? <span>✗</span> : null}
      <span>{icon}</span>
      <span>{short}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="spinner w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}
