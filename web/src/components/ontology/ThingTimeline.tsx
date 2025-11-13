/**
 * ThingTimeline Component
 * Displays a timeline of events related to a thing
 */

import { type Thing, type Event } from "@/lib/ontology/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import { useState, useEffect } from "react";

interface ThingTimelineProps {
  thing: Thing;
  maxEvents?: number;
  className?: string;
}

export function ThingTimeline({
  thing,
  maxEvents = 10,
  className,
}: ThingTimelineProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch events from backend
    // For now, simulate with empty array
    setTimeout(() => {
      setEvents([]);
      setLoading(false);
    }, 500);
  }, [thing._id]);

  if (loading) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">Loading timeline...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">No events yet</p>
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      created: "✨",
      updated: "✏️",
      published: "🚀",
      purchased: "💰",
      completed: "✅",
      enrolled: "📚",
      commented: "💬",
      liked: "❤️",
      shared: "🔗",
    };
    return icons[type] || "📌";
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, "default" | "secondary" | "destructive"> = {
      created: "default",
      updated: "secondary",
      published: "default",
      purchased: "default",
      completed: "default",
      deleted: "destructive",
    };
    return colors[type] || "secondary";
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>

      <div className="space-y-4">
        {events.slice(0, maxEvents).map((event, index) => (
          <div key={event._id} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <span>{getEventIcon(event.type)}</span>
              </div>
              {index < events.length - 1 && (
                <Separator orientation="vertical" className="h-full mt-2" />
              )}
            </div>

            {/* Event content */}
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getEventColor(event.type)}>
                      {event.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event._creationTime), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(event._creationTime), "PPp")}
                  </span>
                </div>

                {event.metadata && (
                  <div className="text-sm space-y-1">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span>{" "}
                        <span className="text-muted-foreground">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {events.length > maxEvents && (
        <div className="text-center mt-4">
          <Button variant="outline" size="sm">
            Show More
          </Button>
        </div>
      )}
    </div>
  );
}
