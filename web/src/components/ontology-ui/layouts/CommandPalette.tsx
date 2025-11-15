/**
 * CommandPalette - Quick command/search palette
 *
 * Keyboard-driven command palette (⌘K) for quick search and actions.
 * Searches things across all dimensions and provides quick actions.
 */

import { useEffect, useState, useCallback } from "react";
import type { Thing, Dimension } from "../types";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Settings,
  Home,
  Clock,
  FileText,
  User,
  Folder,
} from "lucide-react";
import { getThingTypeIcon, cn } from "../utils";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  things?: Thing[];
  recentThings?: Thing[];
  onThingSelect?: (thing: Thing) => void;
  onCommand?: (command: string) => void;
  className?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  things = [],
  recentThings = [],
  onThingSelect,
  onCommand,
  className,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  // Listen for ⌘K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange?.(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const handleSelect = useCallback(
    (callback: () => void) => {
      callback();
      onOpenChange?.(false);
    },
    [onOpenChange]
  );

  // Filter things based on search
  const filteredThings = things.filter((thing) =>
    thing.name.toLowerCase().includes(search.toLowerCase()) ||
    thing.description?.toLowerCase().includes(search.toLowerCase()) ||
    thing.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className={cn("rounded-lg border shadow-md", className)}>
        <CommandInput
          placeholder="Search things, commands, or jump to..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => handleSelect(() => onCommand?.("create"))}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Thing</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>N
              </kbd>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onCommand?.("navigate-home"))}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Go to Dashboard</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>H
              </kbd>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onCommand?.("settings"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>,
              </kbd>
            </CommandItem>
          </CommandGroup>

          {/* Recent Items */}
          {recentThings.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recent">
                {recentThings.slice(0, 5).map((thing) => (
                  <CommandItem
                    key={thing._id}
                    onSelect={() => handleSelect(() => onThingSelect?.(thing))}
                  >
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="mr-2">{getThingTypeIcon(thing.type)}</span>
                    <span className="flex-1">{thing.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {thing.type}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Search Results */}
          {search && filteredThings.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Search Results">
                {filteredThings.slice(0, 10).map((thing) => (
                  <CommandItem
                    key={thing._id}
                    onSelect={() => handleSelect(() => onThingSelect?.(thing))}
                  >
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="mr-2">{getThingTypeIcon(thing.type)}</span>
                    <div className="flex-1">
                      <div className="font-medium">{thing.name}</div>
                      {thing.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {thing.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {thing.type}
                    </Badge>
                  </CommandItem>
                ))}
                {filteredThings.length > 10 && (
                  <CommandItem disabled>
                    <span className="text-xs text-muted-foreground">
                      +{filteredThings.length - 10} more results...
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            </>
          )}

          {/* Navigation */}
          <CommandSeparator />
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => handleSelect(() => onCommand?.("groups"))}>
              <Folder className="mr-2 h-4 w-4" />
              <span>Groups</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => onCommand?.("people"))}>
              <User className="mr-2 h-4 w-4" />
              <span>People</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => onCommand?.("things"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Things</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
