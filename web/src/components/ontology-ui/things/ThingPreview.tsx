/**
 * ThingPreview - Preview modal for things
 *
 * Displays full thing details in a modal dialog with actions
 */

import type { Thing } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getThingTypeDisplay, getThingTypeIcon, formatDateTime } from "../utils";

interface ThingPreviewProps {
  thing: Thing;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ThingPreview({
  thing,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ThingPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getThingTypeIcon(thing.type)}</span>
              <DialogTitle className="text-2xl">{thing.name}</DialogTitle>
            </div>
            <Badge variant="outline">{getThingTypeDisplay(thing.type)}</Badge>
          </div>
          {thing.description && (
            <DialogDescription className="text-base">
              {thing.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status */}
          {thing.status && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Status</h3>
              <Badge>{thing.status}</Badge>
            </div>
          )}

          {/* Tags */}
          {thing.tags && thing.tags.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {thing.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {thing.metadata && Object.keys(thing.metadata).length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Metadata</h3>
              <div className="space-y-1 rounded-md border p-3">
                {Object.entries(thing.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {key}:
                    </span>
                    <span className="text-sm">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* System Information */}
          <div>
            <h3 className="mb-2 text-sm font-medium">System Information</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Thing ID:</span>
                <span className="font-mono text-xs">{thing._id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Group ID:</span>
                <span className="font-mono text-xs">{thing.groupId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Owner ID:</span>
                <span className="font-mono text-xs">{thing.ownerId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDateTime(thing.createdAt)}</span>
              </div>
              {thing.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{formatDateTime(thing.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {(onEdit || onDelete) && (
            <>
              <Separator />
              <div className="flex justify-end gap-2">
                {onEdit && (
                  <Button onClick={onEdit} variant="default">
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button onClick={onDelete} variant="destructive">
                    Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
