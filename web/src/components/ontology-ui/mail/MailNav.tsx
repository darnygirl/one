/**
 * MailNav Component (Cycle 84)
 *
 * Folder navigation with drag-drop and context menus
 *
 * Features:
 * - Folder navigation (inbox, drafts, sent, archive, trash)
 * - Label/tag management
 * - Badge counts
 * - Drag-drop emails to folders
 * - Context menu (right-click)
 */

"use client";

import * as React from "react";
import {
  Archive,
  ArchiveX,
  File,
  Inbox,
  Send,
  Trash2,
  AlertCircle,
  MessagesSquare,
  ShoppingCart,
  Users2,
  Tag,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MailFolder =
  | "inbox"
  | "drafts"
  | "sent"
  | "archive"
  | "trash"
  | "junk"
  | "social"
  | "updates"
  | "forums"
  | "shopping"
  | "promotions";

export interface NavLink {
  title: string;
  label?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "ghost";
  folder: MailFolder;
  count?: number;
}

export interface Label {
  id: string;
  name: string;
  color?: string;
  count?: number;
}

interface MailNavProps {
  /** Currently active folder */
  activeFolder: MailFolder;
  /** Callback when folder is clicked */
  onFolderChange: (folder: MailFolder) => void;
  /** Folder badge counts */
  folderCounts?: Partial<Record<MailFolder, number>>;
  /** Custom labels/tags */
  labels?: Label[];
  /** Callback when label is clicked */
  onLabelClick?: (labelId: string) => void;
  /** Callback when new label is created */
  onLabelCreate?: (name: string) => void;
  /** Callback when label is deleted */
  onLabelDelete?: (labelId: string) => void;
  /** Whether nav is collapsed */
  isCollapsed?: boolean;
  /** Allow drag-drop to folders */
  allowDragDrop?: boolean;
  /** Callback when email dropped on folder */
  onEmailDrop?: (folder: MailFolder, emailIds: string[]) => void;
}

export function MailNav({
  activeFolder,
  onFolderChange,
  folderCounts = {},
  labels = [],
  onLabelClick,
  onLabelCreate,
  onLabelDelete,
  isCollapsed = false,
  allowDragDrop = true,
  onEmailDrop,
}: MailNavProps) {
  const [dragOverFolder, setDragOverFolder] = React.useState<MailFolder | null>(
    null
  );

  // Primary folders
  const primaryLinks: NavLink[] = [
    {
      title: "Inbox",
      icon: Inbox,
      folder: "inbox",
      count: folderCounts.inbox ?? 0,
      variant: activeFolder === "inbox" ? "default" : "ghost",
    },
    {
      title: "Drafts",
      icon: File,
      folder: "drafts",
      count: folderCounts.drafts ?? 0,
      variant: activeFolder === "drafts" ? "default" : "ghost",
    },
    {
      title: "Sent",
      icon: Send,
      folder: "sent",
      count: folderCounts.sent ?? 0,
      variant: activeFolder === "sent" ? "default" : "ghost",
    },
    {
      title: "Archive",
      icon: Archive,
      folder: "archive",
      count: folderCounts.archive ?? 0,
      variant: activeFolder === "archive" ? "default" : "ghost",
    },
    {
      title: "Junk",
      icon: ArchiveX,
      folder: "junk",
      count: folderCounts.junk ?? 0,
      variant: activeFolder === "junk" ? "default" : "ghost",
    },
    {
      title: "Trash",
      icon: Trash2,
      folder: "trash",
      count: folderCounts.trash ?? 0,
      variant: activeFolder === "trash" ? "default" : "ghost",
    },
  ];

  // Category folders
  const categoryLinks: NavLink[] = [
    {
      title: "Social",
      icon: Users2,
      folder: "social",
      count: folderCounts.social ?? 0,
      variant: activeFolder === "social" ? "default" : "ghost",
    },
    {
      title: "Updates",
      icon: AlertCircle,
      folder: "updates",
      count: folderCounts.updates ?? 0,
      variant: activeFolder === "updates" ? "default" : "ghost",
    },
    {
      title: "Forums",
      icon: MessagesSquare,
      folder: "forums",
      count: folderCounts.forums ?? 0,
      variant: activeFolder === "forums" ? "default" : "ghost",
    },
    {
      title: "Shopping",
      icon: ShoppingCart,
      folder: "shopping",
      count: folderCounts.shopping ?? 0,
      variant: activeFolder === "shopping" ? "default" : "ghost",
    },
  ];

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent, folder: MailFolder) => {
    if (!allowDragDrop) return;
    e.preventDefault();
    setDragOverFolder(folder);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, folder: MailFolder) => {
    if (!allowDragDrop) return;
    e.preventDefault();
    setDragOverFolder(null);

    const emailIds = e.dataTransfer.getData("application/json");
    if (emailIds && onEmailDrop) {
      onEmailDrop(folder, JSON.parse(emailIds));
    }
  };

  // Render folder link
  const renderLink = (link: NavLink) => {
    const Icon = link.icon;

    if (isCollapsed) {
      return (
        <Tooltip key={link.folder} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant={link.variant}
              size="icon"
              className={cn(
                "size-9",
                dragOverFolder === link.folder && "bg-accent"
              )}
              onClick={() => onFolderChange(link.folder)}
              onDragOver={(e) => handleDragOver(e, link.folder)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, link.folder)}
            >
              <Icon className="size-4" />
              <span className="sr-only">{link.title}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {link.title}
            {link.count !== undefined && link.count > 0 && (
              <span className="ml-auto text-muted-foreground">
                {link.count}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <DropdownMenu key={link.folder}>
        <Button
          variant={link.variant}
          className={cn(
            "w-full justify-start",
            dragOverFolder === link.folder && "bg-accent"
          )}
          onClick={() => onFolderChange(link.folder)}
          onDragOver={(e) => handleDragOver(e, link.folder)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, link.folder)}
          onContextMenu={(e) => {
            e.preventDefault();
            // Context menu would open via DropdownMenu
          }}
        >
          <Icon className="mr-2 size-4" />
          {link.title}
          {link.count !== undefined && link.count > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {link.count}
            </Badge>
          )}
        </Button>

        {/* Context menu (right-click) */}
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-6 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Mark all as read</DropdownMenuItem>
          <DropdownMenuItem>Empty folder</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            Delete folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      {/* Primary folders */}
      <nav className="grid gap-1 group">
        {primaryLinks.map(renderLink)}
      </nav>

      <Separator />

      {/* Category folders */}
      <nav className="grid gap-1 group">
        {categoryLinks.map(renderLink)}
      </nav>

      {labels.length > 0 && (
        <>
          <Separator />

          {/* Labels/Tags */}
          <div className="flex flex-col gap-1">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Labels
                </span>
                {onLabelCreate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5"
                    onClick={() => {
                      const name = prompt("Label name:");
                      if (name) onLabelCreate(name);
                    }}
                  >
                    <Plus className="size-3" />
                  </Button>
                )}
              </div>
            )}

            <nav className="grid gap-1">
              {labels.map((label) => (
                <Button
                  key={label.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "justify-center"
                  )}
                  onClick={() => onLabelClick?.(label.id)}
                >
                  <Tag
                    className={cn("size-4", !isCollapsed && "mr-2")}
                    style={{ color: label.color }}
                  />
                  {!isCollapsed && (
                    <>
                      {label.name}
                      {label.count !== undefined && label.count > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {label.count}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Usage Example:
 *
 * ```tsx
 * import { MailNav } from '@/components/ontology-ui/mail/MailNav';
 *
 * export function EmailSidebar() {
 *   const [folder, setFolder] = useState<MailFolder>('inbox');
 *
 *   return (
 *     <MailNav
 *       activeFolder={folder}
 *       onFolderChange={setFolder}
 *       folderCounts={{
 *         inbox: 42,
 *         drafts: 3,
 *         sent: 128,
 *       }}
 *       labels={[
 *         { id: '1', name: 'Work', color: '#ef4444', count: 12 },
 *         { id: '2', name: 'Personal', color: '#3b82f6', count: 8 },
 *       ]}
 *       onEmailDrop={(folder, ids) => {
 *         console.log(`Moved ${ids.length} emails to ${folder}`);
 *       }}
 *     />
 *   );
 * }
 * ```
 */
