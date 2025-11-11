/**
 * Message List Component
 *
 * Beautiful message display with animations and auto-scroll
 */

import { useEffect, useRef } from 'react';
import type { Message as AIMessage } from '@ai-sdk/react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MessageListProps {
  messages: AIMessage[];
  isLoading?: boolean;
  error?: Error;
}

export function MessageList({ messages, isLoading, error }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
          <span className="text-4xl">💬</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 gradient-text-animated">
          Start a Conversation
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-6">
          Choose a suggestion below or type your own message to begin chatting with AI
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
            ✨ 30+ AI Models
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
            🚀 Real-time Streaming
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
            💡 Smart Suggestions
          </span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertDescription>
            <strong>Error:</strong> {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      {messages.map((message, index) => (
        <Message
          key={message.id || index}
          message={message}
          isLatest={index === messages.length - 1}
        />
      ))}

      {/* Typing Indicator */}
      {isLoading && (
        <div className="flex justify-start animate-in fade-in slide-in-from-left-2">
          <TypingIndicator />
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
