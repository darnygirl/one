/**
 * BulkActions Component
 * Perform actions on multiple selected things
 */

import { type Thing } from "@/lib/ontology/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Trash2, Archive, Download, Tag } from "lucide-react";

interface BulkActionsProps {
  selectedThings: Thing[];
  onSelectAll?: (selected: boolean) => void;
  onDelete?: (things: Thing[]) => void;
  onArchive?: (things: Thing[]) => void;
  onExport?: (things: Thing[]) => void;
  onTag?: (things: Thing[]) => void;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    action: (things: Thing[]) => void;
    variant?: "default" | "destructive";
  }>;
}

export function BulkActions({
  selectedThings,
  onSelectAll,
  onDelete,
  onArchive,
  onExport,
  onTag,
  customActions = [],
}: BulkActionsProps) {
  const selectedCount = selectedThings.length;

  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-2">
        {onSelectAll && (
          <Checkbox
            onCheckedChange={(checked) => onSelectAll(checked as boolean)}
          />
        )}
        <span className="text-sm text-muted-foreground">Select items</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {onSelectAll && (
        <Checkbox
          checked={true}
          onCheckedChange={(checked) => onSelectAll(checked as boolean)}
        />
      )}

      <Badge variant="secondary" className="gap-1">
        {selectedCount} selected
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            Actions
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {onTag && (
            <DropdownMenuItem onClick={() => onTag(selectedThings)}>
              <Tag className="h-4 w-4 mr-2" />
              Add Tags
            </DropdownMenuItem>
          )}
          {onExport && (
            <DropdownMenuItem onClick={() => onExport(selectedThings)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
          )}
          {onArchive && (
            <DropdownMenuItem onClick={() => onArchive(selectedThings)}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
          )}

          {customActions.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {customActions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.action(selectedThings)}
                  className={
                    action.variant === "destructive" ? "text-destructive" : ""
                  }
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </>
          )}

          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(selectedThings)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
