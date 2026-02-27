import { useState, useCallback, useRef } from 'react';
import type { TripPreferences, SearchEvent, PhaseResult } from '../types';
import { startResearch, connectSSE } from '../api';
import { PHASES } from '../types';

export type PhaseStatus = 'pending' | 'running' | 'complete' | 'error';

export interface ResearchState {
  sessionId: string | null;
  phaseStatuses: Record<string, PhaseStatus>;
  currentPhase: string | null;
  searchLogs: SearchEvent[];
  totalSearches: number;
  results: Record<string, PhaseResult>;
  isComplete: boolean;
  error: string | null;
}

const initialPhaseStatuses = (): Record<string, PhaseStatus> =>
  Object.fromEntries(PHASES.map((p) => [p.id, 'pending' as PhaseStatus]));

export function useResearch() {
  const [state, setState] = useState<ResearchState>({
    sessionId: null,
    phaseStatuses: initialPhaseStatuses(),
    currentPhase: null,
    searchLogs: [],
    totalSearches: 0,
    results: {},
    isComplete: false,
    error: null,
  });

  const esRef = useRef<EventSource | null>(null);

  const start = useCallback(async (prefs: TripPreferences) => {
    // Reset state
    setState({
      sessionId: null,
      phaseStatuses: initialPhaseStatuses(),
      currentPhase: null,
      searchLogs: [],
      totalSearches: 0,
      results: {},
      isComplete: false,
      error: null,
    });

    try {
      const sessionId = await startResearch(prefs);
      setState((s) => ({ ...s, sessionId }));

      const es = connectSSE(sessionId, {
        onPhaseStart: (data) => {
          setState((s) => ({
            ...s,
            currentPhase: data.phase_id,
            phaseStatuses: { ...s.phaseStatuses, [data.phase_id]: 'running' },
          }));
        },
        onSearch: (data) => {
          setState((s) => ({
            ...s,
            searchLogs: [...s.searchLogs, data],
            totalSearches: data.count + (s.searchLogs.length > 0
              ? s.searchLogs.filter((l) => l.phase_id !== data.phase_id).reduce((max, l) => Math.max(max, l.count), 0)
              : 0),
          }));
        },
        onPhaseComplete: (data) => {
          setState((s) => ({
            ...s,
            phaseStatuses: { ...s.phaseStatuses, [data.phase_id]: 'complete' },
            results: {
              ...s.results,
              [data.phase_id]: {
                phase_id: data.phase_id,
                markdown: data.markdown,
                searches: data.searches,
              },
            },
          }));
        },
        onPhaseError: (data) => {
          setState((s) => ({
            ...s,
            phaseStatuses: { ...s.phaseStatuses, [data.phase_id]: 'error' },
          }));
        },
        onResearchComplete: (data) => {
          setState((s) => ({
            ...s,
            isComplete: true,
            totalSearches: data.total_searches,
            currentPhase: null,
          }));
        },
        onError: () => {
          setState((s) => ({ ...s, error: 'Connection lost' }));
        },
      });

      esRef.current = es;
    } catch (e: any) {
      setState((s) => ({ ...s, error: e.message }));
    }
  }, []);

  const reset = useCallback(() => {
    if (esRef.current) esRef.current.close();
    setState({
      sessionId: null,
      phaseStatuses: initialPhaseStatuses(),
      currentPhase: null,
      searchLogs: [],
      totalSearches: 0,
      results: {},
      isComplete: false,
      error: null,
    });
  }, []);

  return { ...state, start, reset };
}
