/**
 * ChatMessageList - DISABLED (react-window incompatible with SSR)
 *
 * This component has been temporarily disabled due to SSR build compatibility issues.
 * Use standard list rendering with scroll instead.
 */

import type { ChatMessageData } from "./ChatMessage";
import { ChatMessage } from "./ChatMessage";
import { useEffect, useRef } from "react";

interface ChatMessageListProps {
  messages: ChatMessageData[];
  currentUserId?: string;
  height?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export function ChatMessageList({
  messages,
  currentUserId,
  height = 600,
  onLoadMore,
  hasMore,
  className,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`flex flex-col overflow-y-auto space-y-4 p-4 ${className}`}
      style={{ height }}
    >
      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="text-sm text-blue-600 hover:underline mb-4"
        >
          Load more messages
        </button>
      )}
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          isOwnMessage={message.userId === currentUserId}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
