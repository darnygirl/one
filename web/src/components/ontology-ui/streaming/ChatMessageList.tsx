/**
 * ChatMessageList Component
 *
 * Scrollable message list with virtualization for performance
 * Auto-scrolls to bottom on new messages
 * Load more on scroll up with scroll position persistence
 */

import { useEffect, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import type { ChatMessageData } from "./ChatMessage";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { cn } from "../utils";

interface ChatMessageListProps {
  messages: ChatMessageData[];
  currentUserId?: string;
  height?: number;
  itemHeight?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onReact?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  className?: string;
}

export function ChatMessageList({
  messages,
  currentUserId,
  height = 600,
  itemHeight = 80,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onReact,
  onDelete,
  onEdit,
  className,
}: ChatMessageListProps) {
  const listRef = useRef<FixedSizeList>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const previousMessageCount = useRef(messages.length);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > previousMessageCount.current && isAtBottom) {
      scrollToBottom();
    }
    previousMessageCount.current = messages.length;
  }, [messages.length, isAtBottom]);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollToItem(messages.length - 1, "end");
      setShowScrollButton(false);
      setIsAtBottom(true);
    }
  };

  // Handle scroll events
  const handleScroll = ({ scrollOffset, scrollUpdateWasRequested }: any) => {
    if (!containerRef.current) return;

    const maxScroll = messages.length * itemHeight - height;
    const scrollPercentage = (scrollOffset / maxScroll) * 100;

    // Show scroll button when not at bottom
    const atBottom = scrollPercentage > 95;
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom && messages.length > 10);

    // Load more when scrolling near the top
    if (scrollPercentage < 10 && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  };

  // Render individual message row
  const MessageRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const message = messages[index];
    if (!message) return null;

    return (
      <div style={style}>
        <ChatMessage
          message={message}
          currentUserId={currentUserId}
          onReact={onReact}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Loading indicator at top */}
      {hasMore && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur p-2 text-center">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Loading messages...
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={onLoadMore}>
              Load older messages
            </Button>
          )}
        </div>
      )}

      {/* Message list with virtualization */}
      {messages.length === 0 ? (
        <div
          className="flex items-center justify-center text-muted-foreground"
          style={{ height }}
        >
          No messages yet
        </div>
      ) : (
        <FixedSizeList
          ref={listRef}
          height={height}
          itemCount={messages.length}
          itemSize={itemHeight}
          width="100%"
          onScroll={handleScroll}
          className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        >
          {MessageRow}
        </FixedSizeList>
      )}

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="default"
          size="sm"
          className="absolute bottom-4 right-4 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-4 w-4 mr-1" />
          Jump to latest
        </Button>
      )}
    </div>
  );
}

/**
 * Non-virtualized version for smaller message lists
 * Better for lists with < 100 messages
 */
export function SimpleChatMessageList({
  messages,
  currentUserId,
  height = 600,
  onReact,
  onDelete,
  onEdit,
  className,
}: Omit<ChatMessageListProps, "itemHeight" | "onLoadMore" | "hasMore" | "isLoading">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - clientHeight < 100;

      if (isNearBottom) {
        containerRef.current.scrollTop = scrollHeight;
      }
    }
  }, [messages.length]);

  // Handle scroll
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isAtBottom);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        style={{ height }}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <ChatMessage
                key={message._id}
                message={message}
                currentUserId={currentUserId}
                onReact={onReact}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="default"
          size="sm"
          className="absolute bottom-4 right-4 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-4 w-4 mr-1" />
          Jump to latest
        </Button>
      )}
    </div>
  );
}
