/**
 * ChangeHistory Component
 *
 * Timeline of changes to an entity with before/after diffs
 * Part of EVENTS dimension (ontology-ui)
 */

import React, { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Event, Thing } from "../types";
import { formatRelativeTime, getEventTypeDisplay, cn } from "../utils";

export interface ChangeHistoryProps {
  thing: Thing;
  events: Event[];
  showDiff?: boolean;
  className?: string;
}

// Change-related event types
const CHANGE_EVENTS = new Set([
  "created",
  "updated",
  "deleted",
  "settings_changed",
  "profile_updated",
]);

export function ChangeHistory({
  thing,
  events,
  showDiff = false,
  className,
}: ChangeHistoryProps) {
  // Filter to only change events and sort by timestamp (newest first)
  const changeEvents = useMemo(() => {
    return events
      .filter((event) => CHANGE_EVENTS.has(event.type))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [events]);

  // Get event color based on type
  const getEventColor = (type: string) => {
    switch (type) {
      case "created":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "updated":
      case "settings_changed":
      case "profile_updated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "deleted":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Extract before/after values from metadata
  const getDiffData = (event: Event) => {
    if (!event.metadata) return null;

    const { before, after, changes } = event.metadata as {
      before?: Record<string, any>;
      after?: Record<string, any>;
      changes?: Array<{ field: string; from: any; to: any }>;
    };

    return { before, after, changes };
  };

  if (changeEvents.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Change History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No changes recorded</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Change History</CardTitle>
          <Badge variant="secondary">{changeEvents.length} changes</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {changeEvents.map((event, index) => {
            const diffData = showDiff ? getDiffData(event) : null;

            return (
              <div key={event._id}>
                {/* Timeline item */}
                <div className="flex gap-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        event.type === "created" && "bg-green-500",
                        (event.type === "updated" ||
                          event.type === "settings_changed" ||
                          event.type === "profile_updated") &&
                          "bg-blue-500",
                        event.type === "deleted" && "bg-red-500"
                      )}
                    />
                    {index < changeEvents.length - 1 && (
                      <div className="w-px h-full min-h-[2rem] bg-border" />
                    )}
                  </div>

                  {/* Event details */}
                  <div className="flex-1 pb-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getEventColor(event.type)}>
                        {getEventTypeDisplay(event.type)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Actor: <code className="text-xs">{event.actorId}</code>
                    </div>

                    {/* Show diff if enabled and available */}
                    {showDiff && diffData && (
                      <div className="mt-3 space-y-2">
                        {diffData.changes && diffData.changes.length > 0 ? (
                          <div className="space-y-2">
                            {diffData.changes.map((change, i) => (
                              <div
                                key={i}
                                className="rounded-lg border bg-muted/50 p-3 text-xs"
                              >
                                <div className="font-semibold mb-1">{change.field}</div>
                                <div className="space-y-1">
                                  <div className="flex items-start gap-2">
                                    <span className="text-red-600 dark:text-red-400">−</span>
                                    <code className="text-red-600 dark:text-red-400 flex-1">
                                      {JSON.stringify(change.from)}
                                    </code>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400">+</span>
                                    <code className="text-green-600 dark:text-green-400 flex-1">
                                      {JSON.stringify(change.to)}
                                    </code>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (diffData.before || diffData.after) && (
                          <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                            {diffData.before && (
                              <div>
                                <div className="text-xs font-semibold text-muted-foreground mb-1">
                                  Before
                                </div>
                                <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                                  {JSON.stringify(diffData.before, null, 2)}
                                </pre>
                              </div>
                            )}
                            {diffData.before && diffData.after && <Separator />}
                            {diffData.after && (
                              <div>
                                <div className="text-xs font-semibold text-muted-foreground mb-1">
                                  After
                                </div>
                                <pre className="text-xs text-green-600 dark:text-green-400 overflow-auto">
                                  {JSON.stringify(diffData.after, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
