/**
 * ThingList Component
 * Renders things in a vertical list layout
 */

import { type Thing } from "@/lib/ontology/types";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { useThingConfig } from "@/lib/ontology/hooks/useThingConfig";
import { cn } from "@/lib/utils";

interface ThingListProps {
  things: Thing[];
  onThingClick?: (thing: Thing) => void;
  className?: string;
}

export function ThingList({ things, onThingClick, className }: ThingListProps) {
  if (things.length === 0) {
    const config = useThingConfig(things[0]?.type || "course");
    return <EmptyState config={config.ui.empty} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {things.map((thing) => (
        <Card
          key={thing._id}
          thing={thing}
          view="list"
          onClick={onThingClick}
        />
      ))}
    </div>
  );
}
