/**
 * ChatInput Component
 *
 * Input field with typing indicators and rich features
 * Multi-line support with Shift+Enter for new lines
 * @ mentions autocomplete and file attachment support
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Send, Paperclip, Code, Smile } from "lucide-react";
import { cn } from "../utils";

export interface TypingUser {
  userId: string;
  userName: string;
}

interface ChatInputProps {
  onSend: (message: string, type?: "text" | "code") => void;
  onTyping?: () => void;
  typingUsers?: TypingUser[];
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  onAttachment?: (file: File) => void;
  mentions?: Array<{ id: string; name: string }>;
  className?: string;
}

export function ChatInput({
  onSend,
  onTyping,
  typingUsers = [],
  placeholder = "Type a message...",
  maxLength = 5000,
  disabled = false,
  onAttachment,
  mentions = [],
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"text" | "code">("text");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle message change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Trigger typing indicator
    if (onTyping) {
      onTyping();
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        // Stop typing indicator after 3 seconds of inactivity
      }, 3000);
    }

    // Check for @ mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex !== -1 && atIndex === cursorPosition - 1) {
      setShowMentions(true);
      setMentionPosition(atIndex);
      setMentionSearch("");
    } else if (atIndex !== -1) {
      const searchTerm = textBeforeCursor.substring(atIndex + 1);
      if (!searchTerm.includes(" ")) {
        setShowMentions(true);
        setMentionSearch(searchTerm);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Close mentions on Escape
    if (e.key === "Escape" && showMentions) {
      setShowMentions(false);
    }
  };

  // Send message
  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed, messageType);
    setMessage("");
    setMessageType("text");
    textareaRef.current?.focus();
  };

  // Insert mention
  const insertMention = (mention: { id: string; name: string }) => {
    const before = message.substring(0, mentionPosition);
    const after = message.substring(mentionPosition + mentionSearch.length + 1);
    const newMessage = `${before}@${mention.name} ${after}`;

    setMessage(newMessage);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  // Handle file attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAttachment) {
      onAttachment(file);
    }
  };

  // Filter mentions based on search
  const filteredMentions = mentions.filter((m) =>
    m.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className={cn("border-t bg-background", className)}>
      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </span>
            {typingUsers.length === 1
              ? `${typingUsers[0].userName} is typing...`
              : `${typingUsers.length} people are typing...`}
          </span>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-4">
        {/* Mention autocomplete */}
        {showMentions && filteredMentions.length > 0 && (
          <div className="absolute bottom-full left-4 mb-2 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredMentions.map((mention) => (
              <button
                key={mention.id}
                onClick={() => insertMention(mention)}
                className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-sm"
              >
                @{mention.name}
              </button>
            ))}
          </div>
        )}

        {/* Attachment button */}
        {onAttachment && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Textarea */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={cn(
              "min-h-[60px] max-h-[200px] resize-none",
              messageType === "code" && "font-mono text-sm"
            )}
          />

          {/* Character count */}
          {message.length > maxLength * 0.8 && (
            <Badge
              variant={message.length >= maxLength ? "destructive" : "secondary"}
              className="absolute bottom-2 right-2 text-xs"
            >
              {message.length}/{maxLength}
            </Badge>
          )}
        </div>

        {/* Message type toggle */}
        <Button
          variant={messageType === "code" ? "default" : "ghost"}
          size="icon"
          onClick={() =>
            setMessageType((prev) => (prev === "text" ? "code" : "text"))
          }
          disabled={disabled}
          title="Toggle code block"
        >
          <Code className="h-5 w-5" />
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
