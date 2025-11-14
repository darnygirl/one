/**
 * OntologyBreadcrumb - Multi-level breadcrumb navigation
 *
 * Displays hierarchical navigation path with dimension-aware colors.
 * Format: Home > Dimension > Item > SubItem
 * Truncates long paths to maintain readability.
 */

import type { Dimension } from "../types";
import { getDimensionColor, cn, truncate } from "../utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  dimension?: Dimension;
  href?: string;
  onClick?: () => void;
}

interface OntologyBreadcrumbProps {
  items: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  className?: string;
  maxLabelLength?: number;
}

export function OntologyBreadcrumb({
  items,
  onItemClick,
  className,
  maxLabelLength = 25,
}: OntologyBreadcrumbProps) {
  const handleClick = (item: BreadcrumbItem, index: number) => {
    if (item.onClick) {
      item.onClick();
    } else if (onItemClick) {
      onItemClick(item, index);
    }
  };

  return (
    <nav
      className={cn(
        "flex items-center gap-1 overflow-x-auto text-sm",
        className
      )}
      aria-label="Breadcrumb"
    >
      {/* Home icon */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleClick({ label: "Home" }, -1)}
        className="h-8 px-2"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const color = item.dimension ? getDimensionColor(item.dimension) : "gray";
        const truncatedLabel = truncate(item.label, maxLabelLength);

        return (
          <div key={index} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />

            {isLast ? (
              <span
                className={cn(
                  "px-2 py-1 font-medium rounded",
                  item.dimension &&
                    `text-${color}-700 dark:text-${color}-300 bg-${color}-50 dark:bg-${color}-950`
                )}
                aria-current="page"
              >
                {truncatedLabel}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClick(item, index)}
                className={cn(
                  "h-8 px-2 font-normal hover:bg-accent",
                  item.dimension &&
                    `text-${color}-600 dark:text-${color}-400 hover:text-${color}-700 dark:hover:text-${color}-300`
                )}
              >
                {truncatedLabel}
              </Button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
