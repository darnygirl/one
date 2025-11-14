/**
 * ThingTypeSelector - Helper component for selecting thing types
 *
 * Used in ThingCreator for type selection step.
 */

import type { ThingType } from "../types";
import { getThingTypeDisplay, getThingTypeIcon, getThingTypeColor, cn } from "../utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ThingTypeSelectorProps {
  selectedType?: ThingType;
  onSelect: (type: ThingType) => void;
  className?: string;
}

const thingTypeGroups: Record<string, ThingType[]> = {
  "Content": ["content", "course", "lesson", "video", "quiz", "post", "comment", "note"],
  "Commerce": ["product", "service", "payment", "invoice", "transaction", "subscription"],
  "People": ["creator", "user", "team", "organization", "role", "permission"],
  "Digital Assets": ["token", "nft", "wallet"],
  "Work": ["project", "task", "file", "folder", "bookmark"],
  "Integration": ["agent", "webhook", "integration", "api_key"],
};

export function ThingTypeSelector({ selectedType, onSelect, className }: ThingTypeSelectorProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Object.entries(thingTypeGroups).map(([category, types]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{category}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {types.map((type) => {
              const icon = getThingTypeIcon(type);
              const display = getThingTypeDisplay(type);
              const color = getThingTypeColor(type);
              const isSelected = selectedType === type;

              return (
                <Card
                  key={type}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    isSelected && "ring-2 ring-primary shadow-md"
                  )}
                  onClick={() => onSelect(type)}
                >
                  <div className="p-3 flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium truncate">{display}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
