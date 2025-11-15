/**
 * ThingMetadata - Metadata panel showing thing properties
 *
 * Displays all metadata key-value pairs and system information
 */

import type { Thing } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime } from "../utils";

interface ThingMetadataProps {
  thing: Thing;
  showSystem?: boolean;
  className?: string;
}

export function ThingMetadata({
  thing,
  showSystem = true,
  className,
}: ThingMetadataProps) {
  const hasMetadata = thing.metadata && Object.keys(thing.metadata).length > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Custom Metadata */}
        {hasMetadata ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Properties
            </h3>
            <div className="space-y-1">
              {Object.entries(thing.metadata!).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <span className="text-sm font-medium">{key}</span>
                  <span className="text-sm text-muted-foreground">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No custom metadata
          </div>
        )}

        {/* System Information */}
        {showSystem && (
          <>
            {hasMetadata && <Separator />}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                System Information
              </h3>
              <div className="space-y-1">
                {/* Type */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Type</span>
                  <Badge variant="outline">{thing.type}</Badge>
                </div>

                {/* Status */}
                {thing.status && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="secondary">{thing.status}</Badge>
                  </div>
                )}

                {/* Tags */}
                {thing.tags && thing.tags.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm">Tags</span>
                    <div className="flex flex-wrap justify-end gap-1">
                      {thing.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-2" />

                {/* IDs */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Thing ID</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {thing._id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Group ID</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {thing.groupId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Owner ID</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {thing.ownerId}
                  </span>
                </div>

                <Separator className="my-2" />

                {/* Timestamps */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Created</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(thing.createdAt)}
                  </span>
                </div>

                {thing.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Updated</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(thing.updatedAt)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm">Creation Time</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(thing._creationTime)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
