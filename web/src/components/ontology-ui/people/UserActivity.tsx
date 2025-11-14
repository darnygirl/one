/**
 * UserActivity Component
 *
 * Activity feed for user actions
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Person, Event } from "../types";
import { formatRelativeTime, getEventTypeDisplay, cn } from "../utils";

export interface UserActivityProps {
  user: Person;
  events: Event[];
  maxItems?: number;
  className?: string;
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  created: "✨",
  updated: "🔄",
  deleted: "🗑️",
  purchased: "💳",
  completed: "✅",
  enrolled: "📚",
  followed: "👤",
  unfollowed: "👋",
  liked: "❤️",
  unliked: "💔",
  commented: "💬",
  shared: "📤",
  uploaded: "📤",
  downloaded: "📥",
  viewed: "👁️",
  logged_in: "🔐",
  logged_out: "🚪",
  profile_updated: "👤",
  settings_changed: "⚙️",
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  created: "text-green-600 dark:text-green-400",
  updated: "text-blue-600 dark:text-blue-400",
  deleted: "text-red-600 dark:text-red-400",
  purchased: "text-purple-600 dark:text-purple-400",
  completed: "text-emerald-600 dark:text-emerald-400",
  enrolled: "text-indigo-600 dark:text-indigo-400",
  logged_in: "text-cyan-600 dark:text-cyan-400",
  logged_out: "text-gray-600 dark:text-gray-400",
};

export function UserActivity({
  user,
  events,
  maxItems = 10,
  className,
}: UserActivityProps) {
  const displayedEvents = events.slice(0, maxItems);

  const getEventIcon = (type: string): string => {
    return EVENT_TYPE_ICONS[type] || "•";
  };

  const getEventColor = (type: string): string => {
    return EVENT_TYPE_COLORS[type] || "text-gray-600 dark:text-gray-400";
  };

  const getEventDescription = (event: Event): string => {
    // Check if metadata has a description
    if (event.metadata?.description) {
      return event.metadata.description as string;
    }

    // Generate default description based on event type
    const eventType = getEventTypeDisplay(event.type);
    if (event.targetId) {
      const targetName = event.metadata?.targetName || "item";
      return `${eventType} ${targetName}`;
    }

    return eventType;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <p className="text-sm text-muted-foreground">
          Recent activity for {user.name}
        </p>
      </CardHeader>
      <CardContent>
        {displayedEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity to display
          </p>
        ) : (
          <div className="space-y-4">
            {displayedEvents.map((event) => (
              <div
                key={event._id}
                className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full bg-muted text-lg",
                    getEventColor(event.type)
                  )}
                >
                  {getEventIcon(event.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getEventTypeDisplay(event.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm">{getEventDescription(event)}</p>

                  {event.metadata && Object.keys(event.metadata).length > 1 && (
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">
                        View details
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}

            {events.length > maxItems && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                Showing {maxItems} of {events.length} events
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
