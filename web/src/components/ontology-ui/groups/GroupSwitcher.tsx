/**
 * GroupSwitcher Component
 *
 * Quick switcher between groups
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Group } from "../types";
import { cn } from "../utils";

export interface GroupSwitcherProps {
  groups: Group[];
  currentGroupId?: string;
  onGroupChange?: (groupId: string) => void;
  className?: string;
}

export function GroupSwitcher({
  groups,
  currentGroupId,
  onGroupChange,
  className,
}: GroupSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  const currentGroup = groups.find((g) => g._id === currentGroupId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <span className="flex items-center gap-2">
            <span>🏢</span>
            {currentGroup ? currentGroup.name : "Select group..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search groups..." />
          <CommandEmpty>No group found.</CommandEmpty>
          <CommandGroup>
            {groups.map((group) => (
              <CommandItem
                key={group._id}
                value={group.name}
                onSelect={() => {
                  onGroupChange?.(group._id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentGroupId === group._id ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="mr-2">🏢</span>
                <div className="flex-1">
                  <p className="font-medium">{group.name}</p>
                  {group.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {group.description}
                    </p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
