/**
 * ChatThreadList - Streaming Component (Cycle 20)
 *
 * List of chat threads with previews, unread badges, and search
 */

import { useState } from "react";
import { formatRelativeTime } from "../utils";
import { cn } from "../utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageCircle } from "lucide-react";

export interface ChatMessage {
  _id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: number;
}

export interface ChatThread {
  _id: string;
  title: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: number;
}

export interface ChatThreadListProps {
  threads: ChatThread[];
  selectedThreadId?: string;
  onSelectThread?: (threadId: string) => void;
  searchable?: boolean;
  className?: string;
}

export function ChatThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  searchable = true,
  className,
}: ChatThreadListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter threads by search query
  const filteredThreads = threads.filter((thread) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      thread.title.toLowerCase().includes(query) ||
      thread.lastMessage?.content.toLowerCase().includes(query) ||
      thread.participants.some((p) => p.name.toLowerCase().includes(query))
    );
  });

  // Sort by most recent
  const sortedThreads = [...filteredThreads].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Thread List */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {sortedThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
              <p>No threads found</p>
            </div>
          ) : (
            sortedThreads.map((thread) => (
              <ThreadItem
                key={thread._id}
                thread={thread}
                isSelected={thread._id === selectedThreadId}
                onClick={() => onSelectThread?.(thread._id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ThreadItemProps {
  thread: ChatThread;
  isSelected: boolean;
  onClick: () => void;
}

function ThreadItem({ thread, isSelected, onClick }: ThreadItemProps) {
  const { title, participants, lastMessage, unreadCount, updatedAt } = thread;

  // Get first participant for avatar (or first non-current user)
  const displayParticipant = participants[0];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 text-left transition-colors hover:bg-muted/50",
        isSelected && "bg-muted"
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={displayParticipant?.avatar} />
          <AvatarFallback>{displayParticipant?.name?.[0] || "?"}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and timestamp */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold truncate">{title}</h3>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatRelativeTime(updatedAt)}
            </span>
          </div>

          {/* Last message preview */}
          {lastMessage && (
            <p className="text-sm text-muted-foreground truncate mb-1">
              {lastMessage.senderName}: {lastMessage.content}
            </p>
          )}

          {/* Participants count and unread badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {participants.length} {participants.length === 1 ? "participant" : "participants"}
            </span>
            {unreadCount > 0 && (
              <Badge variant="default" className="h-5 px-2 text-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
