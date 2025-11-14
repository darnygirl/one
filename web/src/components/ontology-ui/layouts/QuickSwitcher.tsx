/**
 * QuickSwitcher - Quick switcher for entities
 *
 * Keyboard-driven switcher (⌘J) for quickly switching between things.
 * Supports search, recent items, and favorites.
 */

import { useState, useEffect, useCallback } from "react";
import type { Thing, ThingType } from "../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown, Check, Star, Clock } from "lucide-react";
import { cn, getThingTypeIcon } from "../utils";

export interface QuickSwitcherProps {
  things: Thing[];
  value?: string;
  onChange?: (thingId: string) => void;
  placeholder?: string;
  recentThings?: Thing[];
  favoriteThings?: Thing[];
  className?: string;
}

export function QuickSwitcher({
  things,
  value,
  onChange,
  placeholder = "Switch to...",
  recentThings = [],
  favoriteThings = [],
  className,
}: QuickSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Listen for ⌘J keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Clear search when popover closes
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const selectedThing = things.find((thing) => thing._id === value);

  const handleSelect = useCallback(
    (thingId: string) => {
      onChange?.(thingId);
      setOpen(false);
    },
    [onChange]
  );

  // Filter things based on search
  const filteredThings = things.filter((thing) =>
    thing.name.toLowerCase().includes(search.toLowerCase()) ||
    thing.type.toLowerCase().includes(search.toLowerCase()) ||
    thing.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Group things by type
  const thingsByType = filteredThings.reduce((acc, thing) => {
    if (!acc[thing.type]) {
      acc[thing.type] = [];
    }
    acc[thing.type].push(thing);
    return acc;
  }, {} as Record<ThingType, Thing[]>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedThing ? (
            <div className="flex items-center gap-2">
              <span>{getThingTypeIcon(selectedThing.type)}</span>
              <span>{selectedThing.name}</span>
              <Badge variant="outline" className="ml-1 text-xs">
                {selectedThing.type}
              </Badge>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search things..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No things found.</CommandEmpty>

            {/* Favorites */}
            {favoriteThings.length > 0 && !search && (
              <>
                <CommandGroup heading="Favorites">
                  {favoriteThings.slice(0, 5).map((thing) => (
                    <CommandItem
                      key={thing._id}
                      value={thing._id}
                      onSelect={() => handleSelect(thing._id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === thing._id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <Star className="mr-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="mr-2">{getThingTypeIcon(thing.type)}</span>
                      <span className="flex-1">{thing.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {thing.type}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Recent */}
            {recentThings.length > 0 && !search && (
              <>
                <CommandGroup heading="Recent">
                  {recentThings.slice(0, 5).map((thing) => (
                    <CommandItem
                      key={thing._id}
                      value={thing._id}
                      onSelect={() => handleSelect(thing._id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === thing._id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="mr-2">{getThingTypeIcon(thing.type)}</span>
                      <span className="flex-1">{thing.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {thing.type}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* All things grouped by type */}
            {Object.entries(thingsByType)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([type, items]) => (
                <CommandGroup key={type} heading={type}>
                  {items.slice(0, search ? 10 : 5).map((thing) => (
                    <CommandItem
                      key={thing._id}
                      value={thing._id}
                      onSelect={() => handleSelect(thing._id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === thing._id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="mr-2">{getThingTypeIcon(thing.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium">{thing.name}</div>
                        {thing.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {thing.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  {items.length > (search ? 10 : 5) && (
                    <CommandItem disabled>
                      <span className="text-xs text-muted-foreground ml-6">
                        +{items.length - (search ? 10 : 5)} more...
                      </span>
                    </CommandItem>
                  )}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>

        {/* Keyboard shortcut hint */}
        <div className="border-t px-3 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Quick switch</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium opacity-100">
              <span className="text-xs">⌘</span>J
            </kbd>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
