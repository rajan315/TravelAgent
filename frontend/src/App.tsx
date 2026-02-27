import { useState, useCallback } from 'react';
import type { TripPreferences, AppScreen } from './types';
import { useResearch } from './hooks/useResearch';
import { FormScreen } from './components/FormScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultsScreen } from './components/ResultsScreen';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('form');
  const [prefs, setPrefs] = useState<TripPreferences | null>(null);
  const research = useResearch();

  const handleSubmit = useCallback(async (p: TripPreferences) => {
    setPrefs(p);
    setScreen('loading');
    await research.start(p);
  }, [research.start]);

  // Transition to results when research completes
  if (screen === 'loading' && research.isComplete) {
    requestAnimationFrame(() => setScreen('results'));
  }

  const handleNewTrip = useCallback(() => {
    research.reset();
    setPrefs(null);
    setScreen('form');
  }, [research.reset]);

  const handleRegenerate = useCallback(() => {
    if (prefs) {
      setScreen('loading');
      research.start(prefs);
    }
  }, [prefs, research.start]);

  switch (screen) {
    case 'form':
      return <FormScreen onSubmit={handleSubmit} />;

    case 'loading':
      return (
        <LoadingScreen
          phaseStatuses={research.phaseStatuses}
          searchLogs={research.searchLogs}
          totalSearches={research.totalSearches}
        />
      );

    case 'results':
      return (
        <ResultsScreen
          results={research.results}
          prefs={prefs!}
          totalSearches={research.totalSearches}
          sessionId={research.sessionId!}
          onNewTrip={handleNewTrip}
          onRegenerate={handleRegenerate}
        />
      );
  }
}
