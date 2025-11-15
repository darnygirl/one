/**
 * EventSearch Component
 *
 * Real-time search component for events with grouping and keyboard navigation
 * Part of EVENTS dimension (ontology-ui)
 */

import React, { useState, useEffect } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import type { Event, EventType } from "../types";
import { getEventTypeDisplay, formatRelativeTime, cn, groupBy } from "../utils";

export interface EventSearchProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
  placeholder?: string;
  groupByType?: boolean;
  className?: string;
}

export function EventSearch({
  events,
  onEventSelect,
  placeholder = "Search events...",
  groupByType = true,
  className,
}: EventSearchProps) {
  const [query, setQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);

  // Real-time search across event type, actor, target, and metadata
  useEffect(() => {
    if (!query.trim()) {
      setFilteredEvents(events);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = events.filter((event) => {
      // Search event type
      if (getEventTypeDisplay(event.type).toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search actor ID
      if (event.actorId.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search target ID
      if (event.targetId?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search metadata
      if (event.metadata) {
        const metadataString = JSON.stringify(event.metadata).toLowerCase();
        if (metadataString.includes(lowerQuery)) {
          return true;
        }
      }

      return false;
    });

    setFilteredEvents(filtered);
  }, [query, events]);

  // Group events by type if enabled
  const groupedEvents = groupByType
    ? groupBy(filteredEvents, "type")
    : { all: filteredEvents };

  return (
    <Command className={cn("rounded-lg border shadow-md", className)}>
      <CommandInput
        placeholder={placeholder}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No events found.</CommandEmpty>
        {Object.entries(groupedEvents).map(([type, events]) => (
          <CommandGroup
            key={type}
            heading={type === "all" ? "All Events" : getEventTypeDisplay(type as EventType)}
          >
            {events.map((event) => (
              <CommandItem
                key={event._id}
                value={event._id}
                onSelect={() => onEventSelect?.(event)}
                className="flex items-start gap-3 py-3"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {getEventTypeDisplay(event.type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Actor: <code className="text-xs">{event.actorId}</code>
                    {event.targetId && (
                      <>
                        {" "}• Target: <code className="text-xs">{event.targetId}</code>
                      </>
                    )}
                  </div>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {Object.keys(event.metadata).length} metadata field(s)
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
