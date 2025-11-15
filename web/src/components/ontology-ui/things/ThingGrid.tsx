/**
 * ThingGrid - Responsive grid layout for things
 *
 * Simple grid display with configurable columns and responsive breakpoints.
 */

import type { Thing } from "../types";
import { ThingCard } from "./ThingCard";
import { cn } from "../utils";

interface ThingGridProps {
  things: Thing[];
  columns?: 1 | 2 | 3 | 4 | 6;
  onThingClick?: (thing: Thing) => void;
  className?: string;
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6",
};

export function ThingGrid({
  things,
  columns = 3,
  onThingClick,
  className,
}: ThingGridProps) {
  // Empty state
  if (things.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-lg text-muted-foreground">No things to display</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {things.map((thing) => (
        <ThingCard
          key={thing._id}
          thing={thing}
          interactive={!!onThingClick}
          onClick={() => onThingClick?.(thing)}
        />
      ))}
    </div>
  );
}
