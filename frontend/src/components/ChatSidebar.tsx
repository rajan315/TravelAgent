import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '../hooks/useChat';

interface Props {
  sessionId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ sessionId, isOpen, onToggle }: Props) {
  const { messages, isLoading, send } = useChat(sessionId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    send(input.trim());
    setInput('');
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-gray-900 border-l border-gray-800 transition-all duration-300 flex flex-col z-50 ${
        isOpen ? 'w-[380px]' : 'w-[60px]'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="p-4 text-gray-400 hover:text-white transition-colors border-b border-gray-800 cursor-pointer"
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <span className="font-semibold text-sm text-white">Ask about your trip</span>
            <span className="ml-auto text-gray-500">→</span>
          </div>
        ) : (
          <span className="text-xl">💬</span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-8">
                <p className="mb-2">Ask anything about your trip!</p>
                <p className="text-xs text-gray-600">
                  e.g. "Best rooftop bars?", "How to get from airport?"
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose-dark prose-xs">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-xl px-4 py-2 text-sm text-gray-400">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm transition-colors cursor-pointer"
              >
                ↑
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
