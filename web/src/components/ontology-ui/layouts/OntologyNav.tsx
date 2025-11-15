/**
 * OntologyNav - Navigation with dimension switching
 *
 * Horizontal navigation bar displaying all 6 dimensions with icons.
 * Highlights the current dimension and allows switching between them.
 */

import type { Dimension } from "../types";
import { DIMENSIONS } from "../types";
import { getDimensionIcon, getDimensionColor, cn } from "../utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OntologyNavProps {
  currentDimension: Dimension;
  onDimensionChange?: (dimension: Dimension) => void;
  className?: string;
}

export function OntologyNav({
  currentDimension,
  onDimensionChange,
  className,
}: OntologyNavProps) {
  const dimensions = Object.keys(DIMENSIONS) as Dimension[];

  return (
    <nav
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-2",
        "md:flex-row flex-col md:gap-3",
        className
      )}
    >
      {dimensions.map((dimension) => {
        const meta = DIMENSIONS[dimension];
        const isActive = currentDimension === dimension;
        const color = getDimensionColor(dimension);
        const icon = getDimensionIcon(dimension);

        return (
          <Button
            key={dimension}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onDimensionChange?.(dimension)}
            className={cn(
              "flex items-center gap-2 min-w-fit transition-all",
              isActive && `bg-${color}-500 hover:bg-${color}-600 dark:bg-${color}-600 dark:hover:bg-${color}-700`
            )}
          >
            <span className="text-lg">{icon}</span>
            <span className="font-medium">{meta.name}</span>
            {isActive && (
              <Badge variant="secondary" className="ml-1 bg-white/20 text-white dark:bg-black/20">
                Active
              </Badge>
            )}
          </Button>
        );
      })}
    </nav>
  );
}
