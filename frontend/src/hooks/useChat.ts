import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { sendChatMessage } from '../api';

export function useChat(sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(async (question: string) => {
    if (!sessionId || !question.trim()) return;

    setMessages((msgs) => [...msgs, { role: 'user', content: question }]);
    setIsLoading(true);

    try {
      const answer = await sendChatMessage(sessionId, question);
      setMessages((msgs) => [...msgs, { role: 'assistant', content: answer }]);
    } catch (e: any) {
      setMessages((msgs) => [
        ...msgs,
        { role: 'assistant', content: `Error: ${e.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, isLoading, send, clear };
}
