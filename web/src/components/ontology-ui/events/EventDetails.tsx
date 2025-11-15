/**
 * EventDetails Component
 *
 * Detailed view of event data with actor, target, and metadata
 * Part of EVENTS dimension (ontology-ui)
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Event, Person, Thing } from "../types";
import { formatDateTime, getEventTypeDisplay, cn } from "../utils";

export interface EventDetailsProps {
  event: Event;
  actor?: Person;
  target?: Thing;
  className?: string;
}

export function EventDetails({
  event,
  actor,
  target,
  className,
}: EventDetailsProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">Event Details</CardTitle>
          <Badge variant="outline">{getEventTypeDisplay(event.type)}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Event Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Event Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Event ID</span>
              <p className="font-mono text-sm">{event._id}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Timestamp</span>
              <p className="text-sm">{formatDateTime(event.timestamp)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Group ID</span>
              <p className="font-mono text-sm">{event.groupId}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Created At</span>
              <p className="text-sm">{formatDateTime(event._creationTime)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actor Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Actor</h3>
          {actor ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={actor.avatar} alt={actor.name} />
                <AvatarFallback>{actor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{actor.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{event.actorId}</p>
              </div>
            </div>
          ) : (
            <p className="font-mono text-sm">{event.actorId}</p>
          )}
        </div>

        {/* Target Information */}
        {event.targetId && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Target</h3>
              {target ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{target.name}</p>
                    <Badge variant="secondary">{target.type}</Badge>
                  </div>
                  {target.description && (
                    <p className="text-sm text-muted-foreground">{target.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono">{event.targetId}</p>
                </div>
              ) : (
                <p className="font-mono text-sm">{event.targetId}</p>
              )}
            </div>
          </>
        )}

        {/* Metadata */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Metadata</h3>
              <div className="rounded-lg bg-muted p-4 overflow-auto max-h-64">
                <pre className="text-xs font-mono">
                  {JSON.stringify(event.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
