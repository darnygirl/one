/**
 * EventTimeline - Timeline visualization of events
 *
 * Displays events in a vertical timeline format with optional date grouping.
 * Groups events by relative time periods (Today, Yesterday, This Week, etc.)
 */

import { useMemo } from "react";
import type { Event } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime, getEventTypeDisplay, formatDate } from "../utils";

export interface EventTimelineProps {
  events: Event[];
  groupByDate?: boolean;
  compact?: boolean;
  limit?: number;
  className?: string;
}

interface TimelineGroup {
  label: string;
  events: Event[];
}

export function EventTimeline({
  events,
  groupByDate = true,
  compact = false,
  limit,
  className,
}: EventTimelineProps) {
  // Sort events by timestamp (newest first)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.timestamp - a.timestamp);
  }, [events]);

  // Apply limit
  const displayEvents = limit ? sortedEvents.slice(0, limit) : sortedEvents;

  // Group events by relative date
  const groupedEvents = useMemo(() => {
    if (!groupByDate) {
      return [{ label: "All Events", events: displayEvents }];
    }

    const now = Date.now();
    const groups: Record<string, Event[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Earlier: [],
    };

    displayEvents.forEach((event) => {
      const diff = now - event.timestamp;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);

      if (days === 0) {
        groups["Today"].push(event);
      } else if (days === 1) {
        groups["Yesterday"].push(event);
      } else if (weeks < 1) {
        groups["This Week"].push(event);
      } else if (months < 1) {
        groups["This Month"].push(event);
      } else {
        groups["Earlier"].push(event);
      }
    });

    // Convert to array and filter empty groups
    return Object.entries(groups)
      .filter(([_, events]) => events.length > 0)
      .map(([label, events]) => ({ label, events }));
  }, [displayEvents, groupByDate]);

  const getEventIcon = (type: string) => {
    if (type.includes("created") || type.includes("started")) return "✨";
    if (type.includes("updated") || type.includes("changed")) return "🔄";
    if (type.includes("deleted") || type.includes("removed")) return "🗑️";
    if (type.includes("completed") || type.includes("finished")) return "✅";
    if (type.includes("purchased") || type.includes("payment")) return "💳";
    if (type.includes("uploaded") || type.includes("added")) return "📤";
    if (type.includes("downloaded")) return "📥";
    if (type.includes("failed") || type.includes("error")) return "❌";
    if (type.includes("approved")) return "✓";
    if (type.includes("rejected")) return "✗";
    if (type.includes("invited") || type.includes("joined")) return "👋";
    if (type.includes("left") || type.includes("banned")) return "👋";
    if (type.includes("login") || type.includes("logout")) return "🔐";
    return "📅";
  };

  const getEventColor = (type: string) => {
    if (type.includes("created") || type.includes("started")) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    }
    if (type.includes("updated") || type.includes("changed")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    }
    if (type.includes("deleted") || type.includes("failed")) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    }
    if (type.includes("completed") || type.includes("approved")) {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100";
    }
    if (type.includes("purchased") || type.includes("payment")) {
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
  };

  if (displayEvents.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          No events yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {!compact && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">⏱️</span>
            Event Timeline
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className={cn("space-y-6", compact && "pt-6")}>
        {groupedEvents.map((group) => (
          <div key={group.label} className="space-y-4">
            {/* Group label */}
            {groupByDate && (
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {group.label}
              </h3>
            )}

            {/* Timeline */}
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

              {/* Timeline items */}
              <div className="space-y-4">
                {group.events.map((event, index) => (
                  <div key={event._id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-primary flex-shrink-0">
                      <span className="text-sm" aria-label={event.type}>
                        {getEventIcon(event.type)}
                      </span>
                    </div>

                    {/* Event content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {getEventTypeDisplay(event.type)}
                            </span>
                            <Badge className={cn("text-xs", getEventColor(event.type))}>
                              {event.type}
                            </Badge>
                          </div>

                          {/* Metadata preview */}
                          {!compact && event.metadata && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {event.metadata.description ||
                               Object.entries(event.metadata)
                                 .slice(0, 2)
                                 .map(([k, v]) => `${k}: ${v}`)
                                 .join(", ")}
                            </p>
                          )}
                        </div>

                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>

                      {/* Full datetime (hover tooltip) */}
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(event.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Show more indicator */}
        {limit && events.length > limit && (
          <p className="text-sm text-center text-muted-foreground pt-2 border-t">
            +{events.length - limit} more events
          </p>
        )}
      </CardContent>
    </Card>
  );
}
