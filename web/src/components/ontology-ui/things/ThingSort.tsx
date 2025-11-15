/**
 * ThingSort Component
 *
 * Sort controls for thing lists with direction toggle
 * Part of THINGS dimension (ontology-ui)
 */

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import type { SortConfig, SortDirection } from "../types";
import { cn } from "../utils";

export interface ThingSortProps {
  value?: SortConfig;
  onChange?: (sort: SortConfig | undefined) => void;
  className?: string;
}

const SORT_FIELDS = [
  { value: "name", label: "Name" },
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
  { value: "type", label: "Type" },
  { value: "status", label: "Status" },
] as const;

export function ThingSort({
  value,
  onChange,
  className,
}: ThingSortProps) {
  const handleFieldChange = (field: string) => {
    onChange?.({
      field,
      direction: value?.direction || "asc",
    });
  };

  const handleDirectionToggle = () => {
    if (!value) return;

    const newDirection: SortDirection = value.direction === "asc" ? "desc" : "asc";
    onChange?.({
      ...value,
      direction: newDirection,
    });
  };

  const handleClear = () => {
    onChange?.(undefined);
  };

  const DirectionIcon = !value
    ? ArrowUpDown
    : value.direction === "asc"
    ? ArrowUp
    : ArrowDown;

  const directionLabel = !value
    ? "Sort"
    : value.direction === "asc"
    ? "Ascending"
    : "Descending";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Sort Field Selector */}
      <Select
        value={value?.field || ""}
        onValueChange={handleFieldChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by...">
            {value && (
              <span className="flex items-center gap-2">
                <DirectionIcon className="h-4 w-4" />
                {SORT_FIELDS.find((f) => f.value === value.field)?.label || value.field}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SORT_FIELDS.map((field) => (
            <SelectItem key={field.value} value={field.value}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Direction Toggle Button */}
      {value && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleDirectionToggle}
          title={directionLabel}
          aria-label={`Toggle sort direction (currently ${directionLabel})`}
        >
          <DirectionIcon className="h-4 w-4" />
        </Button>
      )}

      {/* Clear Sort Button */}
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          title="Clear sort"
          aria-label="Clear sort"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
