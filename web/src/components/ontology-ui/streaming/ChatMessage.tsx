/**
 * ChatMessage Component
 *
 * Individual chat message with rich content support
 * Supports text, code blocks, and markdown
 * User avatar, timestamp, and reactions
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreVertical, Smile, Trash2 } from "lucide-react";
import { cn, formatRelativeTime } from "../utils";
import { useClipboard } from "../hooks";

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface ChatMessageData {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
  type?: "text" | "code" | "markdown";
  language?: string; // For code blocks
  reactions?: Reaction[];
  isEdited?: boolean;
  isDeleted?: boolean;
}

interface ChatMessageProps {
  message: ChatMessageData;
  currentUserId?: string;
  onReact?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  className?: string;
}

export function ChatMessage({
  message,
  currentUserId,
  onReact,
  onDelete,
  onEdit,
  className,
}: ChatMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { copied, copy } = useClipboard();

  const isOwnMessage = currentUserId === message.userId;

  // Copy message content
  const handleCopy = () => {
    copy(message.content);
  };

  // Delete message
  const handleDelete = () => {
    if (onDelete) {
      onDelete(message._id);
    }
  };

  // Render message content based on type
  const renderContent = () => {
    if (message.isDeleted) {
      return (
        <div className="italic text-muted-foreground">
          This message was deleted
        </div>
      );
    }

    switch (message.type) {
      case "code":
        return (
          <pre className="bg-muted p-3 rounded-lg overflow-x-auto">
            <code className="text-sm font-mono">{message.content}</code>
          </pre>
        );

      case "markdown":
        // Simple markdown rendering (you can enhance with a library like react-markdown)
        return (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        );

      case "text":
      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex gap-3 px-4 py-2 hover:bg-muted/50 transition-colors",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={message.userAvatar} />
        <AvatarFallback>{message.userName[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm">{message.userName}</span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(message.timestamp)}
          </span>
          {message.isEdited && (
            <Badge variant="secondary" className="text-xs">
              edited
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="text-foreground">{renderContent()}</div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction, index) => {
              const hasReacted = currentUserId
                ? reaction.userIds.includes(currentUserId)
                : false;

              return (
                <Button
                  key={index}
                  variant={hasReacted ? "default" : "outline"}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => onReact?.(message._id, reaction.emoji)}
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      {isHovered && !message.isDeleted && (
        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* React button */}
          {onReact && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onReact(message._id, "👍")}
            >
              <Smile className="h-4 w-4" />
            </Button>
          )}

          {/* Copy button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>

          {/* More actions */}
          {isOwnMessage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => {}}>
                    Edit message
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete message
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </motion.div>
  );
}
