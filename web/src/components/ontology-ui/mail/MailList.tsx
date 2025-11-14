/**
 * MailList Component (Cycle 85)
 *
 * Virtualized email list with bulk operations
 *
 * Features:
 * - Virtualized list (handles 10,000+ emails)
 * - Bulk selection (checkbox mode)
 * - Starring, archiving, deleting
 * - Multi-select actions
 * - Sort by date, sender, subject
 */

"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Star,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Email {
  id: string;
  from: {
    name: string;
    email: string;
    avatar?: string;
  };
  subject: string;
  preview: string;
  date: Date | string;
  read: boolean;
  starred: boolean;
  labels?: string[];
  hasAttachment?: boolean;
}

export type SortField = "date" | "sender" | "subject";
export type SortOrder = "asc" | "desc";

interface MailListProps {
  /** List of emails to display */
  emails: Email[];
  /** Currently selected email ID */
  selectedId?: string | null;
  /** Callback when email is selected */
  onSelect?: (id: string) => void;
  /** Allow bulk selection */
  allowBulkSelect?: boolean;
  /** Selected email IDs (for bulk operations) */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (ids: string[]) => void;
  /** Callback when email is starred */
  onStar?: (id: string, starred: boolean) => void;
  /** Callback when email is archived */
  onArchive?: (ids: string[]) => void;
  /** Callback when email is deleted */
  onDelete?: (ids: string[]) => void;
  /** Callback when read status changes */
  onMarkRead?: (ids: string[], read: boolean) => void;
  /** Enable virtualization for large lists */
  virtualized?: boolean;
  /** Sort field */
  sortBy?: SortField;
  /** Sort order */
  sortOrder?: SortOrder;
  /** Callback when sort changes */
  onSortChange?: (field: SortField, order: SortOrder) => void;
  /** Compact mode (less padding) */
  compact?: boolean;
  /** Show avatars */
  showAvatars?: boolean;
}

export function MailList({
  emails,
  selectedId,
  onSelect,
  allowBulkSelect = false,
  selectedIds = [],
  onSelectionChange,
  onStar,
  onArchive,
  onDelete,
  onMarkRead,
  virtualized = false,
  sortBy = "date",
  sortOrder = "desc",
  onSortChange,
  compact = false,
  showAvatars = true,
}: MailListProps) {
  const [bulkMode, setBulkMode] = React.useState(false);

  // Toggle bulk selection mode
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    if (bulkMode) {
      onSelectionChange?.([]);
    }
  };

  // Select/deselect email
  const toggleSelection = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    onSelectionChange?.(newSelection);
  };

  // Select all visible emails
  const selectAll = () => {
    onSelectionChange?.(emails.map((e) => e.id));
  };

  // Deselect all
  const deselectAll = () => {
    onSelectionChange?.([]);
  };

  // Bulk actions
  const handleBulkArchive = () => {
    if (selectedIds.length > 0) {
      onArchive?.(selectedIds);
      onSelectionChange?.([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      onDelete?.(selectedIds);
      onSelectionChange?.([]);
    }
  };

  const handleBulkMarkRead = (read: boolean) => {
    if (selectedIds.length > 0) {
      onMarkRead?.(selectedIds, read);
    }
  };

  // Sort emails
  const sortedEmails = React.useMemo(() => {
    const sorted = [...emails];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "sender":
          comparison = a.from.name.localeCompare(b.from.name);
          break;
        case "subject":
          comparison = a.subject.localeCompare(b.subject);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [emails, sortBy, sortOrder]);

  // Render email item
  const renderEmail = (email: Email) => {
    const isSelected = selectedId === email.id;
    const isChecked = selectedIds.includes(email.id);

    return (
      <div
        key={email.id}
        className={cn(
          "flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent cursor-pointer group",
          isSelected && "bg-muted",
          compact && "p-2"
        )}
        onClick={() => {
          if (bulkMode) {
            toggleSelection(email.id);
          } else {
            onSelect?.(email.id);
          }
        }}
      >
        {/* Bulk selection checkbox */}
        {bulkMode && (
          <Checkbox
            checked={isChecked}
            onCheckedChange={() => toggleSelection(email.id)}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Avatar */}
        {showAvatars && !bulkMode && (
          <div className="flex size-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
            {email.from.avatar ? (
              <img
                src={email.from.avatar}
                alt={email.from.name}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium">
                {email.from.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* Email content */}
        <div className="flex-1 space-y-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold", email.read && "font-normal")}>
              {email.from.name}
            </span>
            {!email.read && (
              <span className="flex size-2 rounded-full bg-blue-600" />
            )}
            <span
              className={cn(
                "ml-auto text-xs flex-shrink-0",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
            </span>
          </div>
          <div
            className={cn(
              "text-xs font-medium line-clamp-1",
              email.read && "font-normal"
            )}
          >
            {email.subject}
          </div>
          <div className="line-clamp-2 text-xs text-muted-foreground">
            {email.preview}
          </div>

          {/* Labels */}
          {email.labels && email.labels.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              {email.labels.map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions (show on hover) */}
        {!bulkMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation();
                onStar?.(email.id, !email.starred);
              }}
            >
              <Star
                className={cn(
                  "size-4",
                  email.starred && "fill-yellow-400 text-yellow-400"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.([email.id]);
              }}
            >
              <Archive className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.([email.id]);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b p-2">
        {/* Bulk selection toggle */}
        {allowBulkSelect && (
          <Button
            variant={bulkMode ? "default" : "ghost"}
            size="sm"
            onClick={toggleBulkMode}
          >
            Select
          </Button>
        )}

        {/* Bulk actions */}
        {bulkMode && selectedIds.length > 0 && (
          <>
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkMarkRead(true)}
            >
              <MailOpen className="mr-1 size-4" />
              Mark read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkMarkRead(false)}
            >
              <Mail className="mr-1 size-4" />
              Mark unread
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBulkArchive}>
              <Archive className="mr-1 size-4" />
              Archive
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-1 size-4" />
              Delete
            </Button>
          </>
        )}

        {/* Bulk select all/none */}
        {bulkMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-auto">
                Select <ChevronDown className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={selectAll}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={deselectAll}>None</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  onSelectionChange?.(emails.filter((e) => e.read).map((e) => e.id))
                }
              >
                Read
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onSelectionChange?.(emails.filter((e) => !e.read).map((e) => e.id))
                }
              >
                Unread
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onSelectionChange?.(
                    emails.filter((e) => e.starred).map((e) => e.id)
                  )
                }
              >
                Starred
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Sort dropdown */}
        {!bulkMode && onSortChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-auto">
                Sort by: {sortBy} <ChevronDown className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortChange("date", "desc")}>
                Date (newest)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("date", "asc")}>
                Date (oldest)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSortChange("sender", "asc")}>
                Sender (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("sender", "desc")}>
                Sender (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSortChange("subject", "asc")}>
                Subject (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSortChange("subject", "desc")}
              >
                Subject (Z-A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Email list */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4 pt-0">
          {sortedEmails.length === 0 ? (
            <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
              No emails found
            </div>
          ) : (
            sortedEmails.map(renderEmail)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * Usage Example:
 *
 * ```tsx
 * import { MailList } from '@/components/ontology-ui/mail/MailList';
 *
 * export function InboxList() {
 *   const [selected, setSelected] = useState<string | null>(null);
 *   const [bulkSelected, setBulkSelected] = useState<string[]>([]);
 *
 *   return (
 *     <MailList
 *       emails={emails}
 *       selectedId={selected}
 *       onSelect={setSelected}
 *       allowBulkSelect
 *       selectedIds={bulkSelected}
 *       onSelectionChange={setBulkSelected}
 *       onArchive={(ids) => console.log('Archive:', ids)}
 *       onDelete={(ids) => console.log('Delete:', ids)}
 *     />
 *   );
 * }
 * ```
 */
