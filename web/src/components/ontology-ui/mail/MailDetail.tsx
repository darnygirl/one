/**
 * MailDetail Component (Cycle 87)
 *
 * Email detail view with thread support
 *
 * Features:
 * - Email detail view
 * - Thread conversation view
 * - Quick reply inline
 * - Action buttons (reply, forward, archive, delete)
 * - Print/export options
 */

"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Trash2,
  MoreVertical,
  Star,
  Printer,
  Download,
  Paperclip,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Email, type EmailAttachment } from "./MailList";

export interface EmailThread extends Email {
  /** Thread messages (if part of conversation) */
  thread?: Email[];
  /** Email body HTML */
  bodyHtml?: string;
  /** Attachments */
  attachments?: EmailAttachment[];
}

interface MailDetailProps {
  /** Email to display (null = no selection) */
  email: EmailThread | null;
  /** Callback when reply is clicked */
  onReply?: (email: EmailThread) => void;
  /** Callback when reply all is clicked */
  onReplyAll?: (email: EmailThread) => void;
  /** Callback when forward is clicked */
  onForward?: (email: EmailThread) => void;
  /** Callback when archive is clicked */
  onArchive?: (email: EmailThread) => void;
  /** Callback when delete is clicked */
  onDelete?: (email: EmailThread) => void;
  /** Callback when star is toggled */
  onStar?: (email: EmailThread, starred: boolean) => void;
  /** Callback when quick reply is sent */
  onQuickReply?: (email: EmailThread, message: string) => void;
  /** Show quick reply input */
  showQuickReply?: boolean;
  /** Show thread view */
  showThread?: boolean;
}

export function MailDetail({
  email,
  onReply,
  onReplyAll,
  onForward,
  onArchive,
  onDelete,
  onStar,
  onQuickReply,
  showQuickReply = true,
  showThread = true,
}: MailDetailProps) {
  const [replyText, setReplyText] = React.useState("");
  const [expandedThreads, setExpandedThreads] = React.useState<Set<string>>(
    new Set()
  );

  // Toggle thread message expansion
  const toggleThread = (id: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Handle quick reply
  const handleQuickReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !replyText.trim()) return;

    onQuickReply?.(email, replyText);
    setReplyText("");
  };

  // Print email
  const handlePrint = () => {
    window.print();
  };

  // Download as EML
  const handleDownload = () => {
    if (!email) return;
    // TODO: Implement EML download
    console.log("Download email:", email.id);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Render email message
  const renderMessage = (message: EmailThread, isThread = false) => {
    const isExpanded = expandedThreads.has(message.id);

    return (
      <div key={message.id} className={cn("space-y-4", isThread && "ml-8")}>
        {/* Header */}
        <div
          className={cn(
            "flex items-start gap-4 p-4",
            isThread && "cursor-pointer hover:bg-accent rounded-lg"
          )}
          onClick={isThread ? () => toggleThread(message.id) : undefined}
        >
          <Avatar>
            <AvatarImage src={message.from.avatar} alt={message.from.name} />
            <AvatarFallback>
              {message.from.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{message.from.name}</span>
              {message.labels && message.labels.length > 0 && (
                <div className="flex gap-1">
                  {message.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              To: {message.from.email}
            </div>
            {isThread && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {message.preview}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.date), "PPpp")}
            </span>
            {isThread && (
              <Button variant="ghost" size="icon" className="size-6">
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Body (expanded or not thread) */}
        {(!isThread || isExpanded) && (
          <>
            {/* Email body */}
            <div className="px-4">
              {message.bodyHtml ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm">
                  {message.preview}
                </div>
              )}
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="px-4">
                <Separator className="mb-4" />
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Attachments ({message.attachments.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {message.attachments.map((attachment) => (
                      <Button
                        key={attachment.id}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Paperclip className="size-4" />
                        {attachment.name}
                        <span className="text-xs text-muted-foreground">
                          ({formatFileSize(attachment.size)})
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (!email) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
        No message selected
      </div>
    );
  }

  const hasThread = showThread && email.thread && email.thread.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Action toolbar */}
      <div className="flex items-center gap-2 border-b p-2">
        {/* Primary actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onReply?.(email)}
              >
                <Reply className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onReplyAll?.(email)}
              >
                <ReplyAll className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply all</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onForward?.(email)}
              >
                <Forward className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Secondary actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onArchive?.(email)}
              >
                <Archive className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete?.(email)}
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onStar?.(email, !email.starred)}
              >
                <Star
                  className={cn(
                    "size-4",
                    email.starred && "fill-yellow-400 text-yellow-400"
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {email.starred ? "Unstar" : "Star"}
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* More actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="mr-2 size-4" />
              Print
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 size-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Email content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Main email */}
          {renderMessage(email)}

          {/* Thread messages */}
          {hasThread && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="text-sm font-medium">
                  Thread ({email.thread!.length} messages)
                </div>
                {email.thread!.map((msg) => renderMessage(msg, true))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Quick reply */}
      {showQuickReply && (
        <>
          <Separator />
          <form onSubmit={handleQuickReply} className="p-4">
            <div className="space-y-3">
              <Textarea
                placeholder={`Reply to ${email.from.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Press Cmd/Ctrl + Enter to send
                </div>
                <Button type="submit" size="sm" disabled={!replyText.trim()}>
                  Send
                </Button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

/**
 * Usage Example:
 *
 * ```tsx
 * import { MailDetail } from '@/components/ontology-ui/mail/MailDetail';
 *
 * export function EmailView() {
 *   const [selectedEmail, setSelectedEmail] = useState<EmailThread | null>(null);
 *
 *   return (
 *     <MailDetail
 *       email={selectedEmail}
 *       onReply={(email) => console.log('Reply to:', email)}
 *       onArchive={(email) => console.log('Archive:', email)}
 *       onQuickReply={(email, message) => console.log('Quick reply:', message)}
 *       showQuickReply
 *       showThread
 *     />
 *   );
 * }
 * ```
 */
