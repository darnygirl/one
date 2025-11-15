/**
 * ActivityFeed Component
 *
 * Real-time activity stream with live updates
 */

import { useState, useEffect, useRef } from "react";
import type { Event, Person, Thing } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "./EventCard";
import { formatRelativeTime, cn } from "../utils";

interface ActivityFeedProps {
  events: Event[];
  maxItems?: number;
  autoRefresh?: boolean;
  className?: string;
}

export function ActivityFeed({
  events,
  maxItems = 20,
  autoRefresh = false,
  className
}: ActivityFeedProps) {
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const [loadedCount, setLoadedCount] = useState(maxItems);
  const previousEventsRef = useRef<Event[]>(events);

  // Initialize displayed events
  useEffect(() => {
    setDisplayedEvents(events.slice(0, loadedCount));
  }, [events, loadedCount]);

  // Check for new activity
  useEffect(() => {
    if (autoRefresh && events.length > previousEventsRef.current.length) {
      setHasNewActivity(true);
    }
    previousEventsRef.current = events;
  }, [events, autoRefresh]);

  // Load more events
  const loadMore = () => {
    const newCount = loadedCount + maxItems;
    setLoadedCount(newCount);
    setDisplayedEvents(events.slice(0, newCount));
  };

  // Show new activity
  const showNewActivity = () => {
    setDisplayedEvents(events.slice(0, loadedCount));
    setHasNewActivity(false);
  };

  const hasMore = events.length > displayedEvents.length;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Activity Feed
            {displayedEvents.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {displayedEvents.length} of {events.length}
              </Badge>
            )}
          </CardTitle>

          {/* New activity badge */}
          {hasNewActivity && (
            <Button
              variant="outline"
              size="sm"
              onClick={showNewActivity}
              className="animate-pulse"
            >
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                New activity
              </span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Event list */}
        {displayedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity yet
          </div>
        ) : (
          <div className="space-y-2">
            {displayedEvents.map((event, index) => (
              <EventCard
                key={event._id}
                event={event}
                compact={index > 5} // Compact view after first 5 items
              />
            ))}
          </div>
        )}

        {/* Load more button */}
        {hasMore && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={loadMore}
              className="w-full"
            >
              Load more ({events.length - displayedEvents.length} remaining)
            </Button>
          </div>
        )}

        {/* Auto-refresh indicator */}
        {autoRefresh && (
          <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
            <span className="flex items-center justify-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Auto-refreshing
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
