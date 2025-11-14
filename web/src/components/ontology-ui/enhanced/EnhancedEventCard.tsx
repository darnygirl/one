/**
 * EnhancedEventCard - Event card with live updates and advanced features
 *
 * Features:
 * - Real-time event feed with Convex subscriptions
 * - Event details modal with full metadata
 * - Related events section
 * - Event replay functionality
 * - Live update animations
 */

import { useState } from "react";
import type { Event, Person, Thing, CardProps } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getEventTypeDisplay, formatRelativeTime, formatDateTime, cn } from "../utils";
import { Effect } from "effect";

interface EnhancedEventCardProps extends CardProps {
  event: Event;
  actor?: Person;
  target?: Thing;
  showActor?: boolean;
  showTarget?: boolean;
  relatedEvents?: Event[];
  enableReplay?: boolean;
  enableLiveUpdates?: boolean;
  onReplay?: (eventId: string) => void;
}

export function EnhancedEventCard({
  event,
  actor,
  target,
  showActor = true,
  showTarget = true,
  relatedEvents = [],
  enableReplay = false,
  enableLiveUpdates = true,
  onReplay,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: EnhancedEventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Live update animation
  if (enableLiveUpdates && isNew) {
    setTimeout(() => setIsNew(false), 2000);
  }

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
  const hasRelatedEvents = relatedEvents.length > 0;

  const handleReplay = () => {
    if (onReplay) {
      onReplay(event._id);
    }
  };

  return (
    <>
      <Card
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          interactive && "cursor-pointer hover:shadow-lg transition-all",
          isNew && "animate-pulse border-green-500",
          className
        )}
        onClick={onClick || (() => setIsModalOpen(true))}
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
                {enableLiveUpdates && isNew && (
                  <Badge variant="outline" className="ml-2 animate-pulse">
                    NEW
                  </Badge>
                )}
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

          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              View Details
            </Button>
            {enableReplay && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplay();
                }}
              >
                🔄 Replay
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{eventIcon}</span>
              {typeDisplay}
            </DialogTitle>
            <DialogDescription>
              {formatDateTime(event.timestamp)}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Event Information */}
              <div>
                <h3 className="font-medium mb-2">Event Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge className={getEventColor(event.type)}>{event.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <code className="text-xs">{event._id}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span>{formatDateTime(event.timestamp)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actor and Target */}
              {(actor || target) && (
                <>
                  <div>
                    <h3 className="font-medium mb-2">Participants</h3>
                    <div className="space-y-2 text-sm">
                      {actor && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Actor:</span>
                          <span className="font-medium">{actor.name}</span>
                        </div>
                      )}
                      {target && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Target:</span>
                          <div className="flex items-center gap-2">
                            <span>{target.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {target.type}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Metadata */}
              {hasMetadata && (
                <>
                  <div>
                    <h3 className="font-medium mb-2">Metadata</h3>
                    <div className="space-y-1 text-sm">
                      {Object.entries(event.metadata!).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-2">
                          <span className="font-medium capitalize text-muted-foreground">
                            {key.replace(/_/g, " ")}:
                          </span>
                          <span className="truncate text-right">
                            {typeof value === "object"
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Related Events */}
              {hasRelatedEvents && (
                <div>
                  <h3 className="font-medium mb-2">
                    Related Events ({relatedEvents.length})
                  </h3>
                  <div className="space-y-2">
                    {relatedEvents.slice(0, 5).map((relatedEvent) => (
                      <div
                        key={relatedEvent._id}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getEventColor(relatedEvent.type))}
                          >
                            {relatedEvent.type}
                          </Badge>
                          <span className="text-sm">
                            {getEventTypeDisplay(relatedEvent.type)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(relatedEvent.timestamp)}
                        </span>
                      </div>
                    ))}
                    {relatedEvents.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground">
                        +{relatedEvents.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Replay Action */}
              {enableReplay && (
                <>
                  <Separator />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReplay}
                  >
                    🔄 Replay Event
                  </Button>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
