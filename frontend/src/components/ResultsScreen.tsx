import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PHASES } from '../types';
import type { PhaseResult, TripPreferences } from '../types';
import { SummaryBar } from './SummaryBar';
import { ActionBar } from './ActionBar';
import { ChatSidebar } from './ChatSidebar';

interface Props {
  results: Record<string, PhaseResult>;
  prefs: TripPreferences;
  totalSearches: number;
  sessionId: string;
  onNewTrip: () => void;
  onRegenerate: () => void;
}

export function ResultsScreen({ results, prefs, totalSearches, sessionId, onNewTrip, onRegenerate }: Props) {
  const [activeTab, setActiveTab] = useState(PHASES[0].id);
  const [chatOpen, setChatOpen] = useState(false);

  const activeResult = results[activeTab];

  return (
    <div className="min-h-screen flex">
      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${chatOpen ? 'mr-[380px]' : 'mr-[60px]'}`}>
        <div className="max-w-5xl mx-auto p-6">
          {/* Summary */}
          <SummaryBar prefs={prefs} totalSearches={totalSearches} results={results} />

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-800 overflow-x-auto pb-px">
            {PHASES.map((phase) => {
              const isActive = activeTab === phase.id;
              const hasResult = !!results[phase.id];
              return (
                <button
                  key={phase.id}
                  onClick={() => hasResult && setActiveTab(phase.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px cursor-pointer ${
                    isActive
                      ? 'border-current text-white'
                      : hasResult
                        ? 'border-transparent text-gray-400 hover:text-gray-200'
                        : 'border-transparent text-gray-600 cursor-not-allowed'
                  }`}
                  style={isActive ? { color: phase.color, borderColor: phase.color } : {}}
                >
                  <span>{phase.icon}</span>
                  <span className="hidden sm:inline">{phase.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Markdown content */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 min-h-[400px]">
            {activeResult ? (
              <div className="prose-dark">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                  }}
                >
                  {activeResult.markdown}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-20">No results for this phase</div>
            )}
          </div>

          {/* Actions */}
          <ActionBar sessionId={sessionId} onNewTrip={onNewTrip} onRegenerate={onRegenerate} />
        </div>
      </div>

      {/* Chat sidebar */}
      <ChatSidebar sessionId={sessionId} isOpen={chatOpen} onToggle={() => setChatOpen((o) => !o)} />
    </div>
  );
}
