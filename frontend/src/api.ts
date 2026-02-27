import type { TripPreferences } from './types';

// In dev, Vite proxies /api → localhost:8000. In production, point to Render backend.
const API_HOST = import.meta.env.VITE_API_URL || '';
const BASE = `${API_HOST}/api`;

export async function startResearch(prefs: TripPreferences): Promise<string> {
  const res = await fetch(`${BASE}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw new Error(`Failed to start research: ${res.statusText}`);
  const data = await res.json();
  return data.session_id;
}

export function connectSSE(sessionId: string, handlers: {
  onPhaseStart: (data: any) => void;
  onSearch: (data: any) => void;
  onPhaseComplete: (data: any) => void;
  onPhaseError: (data: any) => void;
  onResearchComplete: (data: any) => void;
  onError: (err: any) => void;
}): EventSource {
  const es = new EventSource(`${BASE}/research/${sessionId}/stream`);

  es.addEventListener('phase_start', (e) => handlers.onPhaseStart(JSON.parse(e.data)));
  es.addEventListener('search', (e) => handlers.onSearch(JSON.parse(e.data)));
  es.addEventListener('phase_complete', (e) => handlers.onPhaseComplete(JSON.parse(e.data)));
  es.addEventListener('phase_error', (e) => handlers.onPhaseError(JSON.parse(e.data)));
  es.addEventListener('research_complete', (e) => {
    handlers.onResearchComplete(JSON.parse(e.data));
    es.close();
  });
  es.addEventListener('heartbeat', () => {});
  es.onerror = (err) => {
    handlers.onError(err);
    es.close();
  };

  return es;
}

export async function sendChatMessage(sessionId: string, question: string): Promise<string> {
  const res = await fetch(`${BASE}/research/${sessionId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(`Chat error: ${res.statusText}`);
  const data = await res.json();
  return data.answer;
}

export function getDownloadUrl(sessionId: string): string {
  return `${BASE}/research/${sessionId}/download`;
}
