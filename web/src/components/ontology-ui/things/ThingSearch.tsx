/**
 * ThingSearch Component
 *
 * Search component for finding things with real-time filtering
 * Part of THINGS dimension (ontology-ui)
 */

import React, { useState, useMemo } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import type { Thing, ThingType } from "../types";
import { getThingTypeIcon, getThingTypeDisplay, groupBy } from "../utils";

export interface ThingSearchProps {
  things: Thing[];
  onThingSelect?: (thing: Thing) => void;
  placeholder?: string;
  groupByType?: boolean;
  className?: string;
}

export function ThingSearch({
  things,
  onThingSelect,
  placeholder = "Search things...",
  groupByType = true,
  className,
}: ThingSearchProps) {
  const [search, setSearch] = useState("");

  // Filter things based on search query
  const filteredThings = useMemo(() => {
    if (!search) return things;

    const query = search.toLowerCase();
    return things.filter((thing) => {
      // Search in name
      if (thing.name.toLowerCase().includes(query)) return true;

      // Search in description
      if (thing.description?.toLowerCase().includes(query)) return true;

      // Search in tags
      if (thing.tags?.some((tag) => tag.toLowerCase().includes(query))) return true;

      return false;
    });
  }, [things, search]);

  // Group things by type if enabled
  const groupedThings = useMemo(() => {
    if (!groupByType) {
      return { all: filteredThings };
    }

    return groupBy(filteredThings, "type");
  }, [filteredThings, groupByType]);

  const handleSelect = (thing: Thing) => {
    onThingSelect?.(thing);
    setSearch("");
  };

  return (
    <Command className={className}>
      <CommandInput
        placeholder={placeholder}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No things found.</CommandEmpty>

        {Object.entries(groupedThings).map(([type, items]) => (
          <CommandGroup
            key={type}
            heading={
              groupByType
                ? `${getThingTypeIcon(type as ThingType)} ${getThingTypeDisplay(type as ThingType)}`
                : undefined
            }
          >
            {items.map((thing) => (
              <CommandItem
                key={thing._id}
                value={`${thing.name}-${thing._id}`}
                onSelect={() => handleSelect(thing)}
                className="flex items-start gap-2 cursor-pointer"
              >
                <span className="text-lg mt-0.5">
                  {getThingTypeIcon(thing.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{thing.name}</div>
                  {thing.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {thing.description}
                    </div>
                  )}
                  {thing.tags && thing.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {thing.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 bg-muted rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {thing.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{thing.tags.length - 3}
                        </span>
                      )}
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
