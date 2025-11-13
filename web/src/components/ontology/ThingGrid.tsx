/**
 * ThingGrid Component
 * Renders things in a responsive grid layout
 */

import { type Thing } from "@/lib/ontology/types";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { useThingConfig } from "@/lib/ontology/hooks/useThingConfig";
import { cn } from "@/lib/utils";

interface ThingGridProps {
  things: Thing[];
  onThingClick?: (thing: Thing) => void;
  className?: string;
}

export function ThingGrid({ things, onThingClick, className }: ThingGridProps) {
  if (things.length === 0) {
    const config = useThingConfig(things[0]?.type || "course");
    return <EmptyState config={config.ui.empty} />;
  }

  const config = useThingConfig(things[0].type);
  const gridLayout = config.ui.layouts?.grid;

  const gridClass = gridLayout
    ? {
        gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))`,
      }
    : {};

  return (
    <div
      className={cn("grid gap-6", className)}
      style={gridClass}
    >
      {things.map((thing) => (
        <Card
          key={thing._id}
          thing={thing}
          view="card"
          onClick={onThingClick}
        />
      ))}
    </div>
  );
}
