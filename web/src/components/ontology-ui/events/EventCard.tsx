/**
 * EventCard - Card displaying a single event
 *
 * Renders an event with adaptive styling and optional actor/target information.
 * Supports expandable metadata for detailed event information.
 */

import { useState } from "react";
import type { Event, Person, Thing, CardProps } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEventTypeDisplay, formatRelativeTime, formatDateTime, cn } from "../utils";

interface EventCardProps extends CardProps {
  event: Event;
  actor?: Person;
  target?: Thing;
  showActor?: boolean;
  showTarget?: boolean;
  expandable?: boolean;
}

export function EventCard({
  event,
  actor,
  target,
  showActor = true,
  showTarget = true,
  expandable = true,
  variant = "default",
  size = "md",
  interactive = false,
  onClick,
  className,
}: EventCardProps) {
  const [expanded, setExpanded] = useState(false);

  const eventIcon = "📅";
  const typeDisplay = getEventTypeDisplay(event.type);

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const variantClasses = {
    default: "",
    outline: "border-2",
    ghost: "border-0 shadow-none",
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
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
  };

  const hasMetadata = event.metadata && Object.keys(event.metadata).length > 0;

  return (
    <Card
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        interactive && "cursor-pointer hover:shadow-lg transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl" aria-label="Event">
              {eventIcon}
            </span>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{typeDisplay}</CardTitle>
              <Badge className={cn("mt-1", getEventColor(event.type))}>
                {event.type}
              </Badge>
            </div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatRelativeTime(event.timestamp)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Actor → Target flow */}
        {(showActor || showTarget) && (
          <div className="flex items-center gap-2 text-sm">
            {showActor && actor && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium truncate">{actor.name}</span>
              </div>
            )}
            {showActor && showTarget && (
              <span className="text-muted-foreground">→</span>
            )}
            {showTarget && target && (
              <div className="flex items-center gap-1.5">
                <span className="truncate">{target.name}</span>
                <Badge variant="outline" className="text-xs">
                  {target.type}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Timestamp (full datetime) */}
        <CardDescription className="text-xs">
          {formatDateTime(event.timestamp)}
        </CardDescription>

        {/* Expandable metadata */}
        {hasMetadata && expandable && (
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="w-full justify-between text-xs"
            >
              <span>{expanded ? "Hide" : "Show"} Details</span>
              <span>{expanded ? "▲" : "▼"}</span>
            </Button>

            {expanded && (
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {Object.entries(event.metadata!).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-2">
                    <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                    <span className="truncate text-right">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Metadata preview (when not expandable) */}
        {hasMetadata && !expandable && (
          <div className="text-xs text-muted-foreground space-y-1">
            {Object.entries(event.metadata!).slice(0, 2).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                <span className="truncate ml-2">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
            {Object.keys(event.metadata!).length > 2 && (
              <p className="text-center text-muted-foreground">
                +{Object.keys(event.metadata!).length - 2} more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
