/**
 * LiveActivityFeed Component
 *
 * Real-time activity stream with infinite scroll
 * Groups events by time (today, yesterday, etc.)
 * Shows "new activity" badge and smooth animations
 */

import { useState, useEffect, useRef } from "react";
import type { Event } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EventCard } from "../events/EventCard";
import { cn, formatDate } from "../utils";

interface LiveActivityFeedProps {
  events: Event[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function LiveActivityFeed({
  events,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
}: LiveActivityFeedProps) {
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(events.length);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Check for new activity
  useEffect(() => {
    if (events.length > lastSeenCount) {
      setHasNewActivity(true);
    }
  }, [events.length, lastSeenCount]);

  // Show new activity
  const showNewActivity = () => {
    setHasNewActivity(false);
    setLastSeenCount(events.length);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Set up infinite scroll observer
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, onLoadMore, isLoading]);

  // Group events by time period
  const groupEventsByTime = (events: Event[]) => {
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const yesterday = today - 86400000;
    const lastWeek = today - 604800000;

    const grouped: Record<string, Event[]> = {
      Today: [],
      Yesterday: [],
      "Last 7 days": [],
      Earlier: [],
    };

    events.forEach((event) => {
      const eventDate = new Date(event.timestamp).setHours(0, 0, 0, 0);

      if (eventDate === today) {
        grouped["Today"].push(event);
      } else if (eventDate === yesterday) {
        grouped["Yesterday"].push(event);
      } else if (eventDate >= lastWeek) {
        grouped["Last 7 days"].push(event);
      } else {
        grouped["Earlier"].push(event);
      }
    });

    // Filter out empty groups
    return Object.entries(grouped).filter(([_, events]) => events.length > 0);
  };

  const groupedEvents = groupEventsByTime(events);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Live Activity
            <Badge variant="secondary" className="text-xs">
              {events.length}
            </Badge>
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
        <div
          ref={scrollContainerRef}
          className="max-h-[600px] overflow-y-auto space-y-6"
        >
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity yet
            </div>
          ) : (
            <>
              {groupedEvents.map(([period, periodEvents], groupIndex) => (
                <div key={period}>
                  {/* Time period header */}
                  <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      {period}
                    </h3>
                    <Separator className="mt-2" />
                  </div>

                  {/* Events for this period */}
                  <div className="space-y-2 mt-2">
                    {periodEvents.map((event, index) => (
                      <div
                        key={event._id}
                        className="animate-in fade-in slide-in-from-top-2 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <EventCard event={event} compact />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Infinite scroll trigger */}
              {hasMore && (
                <div
                  ref={(el) => {
                    if (el && observerRef.current) {
                      observerRef.current.observe(el);
                    }
                  }}
                  className="py-4 text-center"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading more...
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={onLoadMore}
                      className="w-full"
                    >
                      Load more
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
