/**
 * OntologyGrid - Universal grid component that adapts to any dimension
 *
 * Renders items in a responsive grid layout using the universal OntologyCard.
 * Automatically adapts columns based on screen size.
 */

import type { Dimension } from "../types";
import { OntologyCard } from "./OntologyCard";
import { cn } from "../utils";

export interface OntologyGridProps {
  items: any[];
  dimension: Dimension;
  columns?: number;
  onItemClick?: (item: any) => void;
  className?: string;
  // Card display options
  showType?: boolean;
  showRole?: boolean;
  showEmail?: boolean;
  showMembers?: boolean;
  showMetadata?: boolean;
  interactive?: boolean;
  cardSize?: "sm" | "md" | "lg";
}

/**
 * Universal grid component that renders any ontology data in a responsive grid
 *
 * @example
 * ```tsx
 * // 3-column grid of products
 * <OntologyGrid
 *   items={products}
 *   dimension="things"
 *   columns={3}
 *   interactive
 *   onItemClick={(product) => router.push(`/products/${product._id}`)}
 * />
 *
 * // Responsive grid of users with smaller cards
 * <OntologyGrid
 *   items={users}
 *   dimension="people"
 *   cardSize="sm"
 *   showEmail={false}
 * />
 * ```
 */
export function OntologyGrid({
  items,
  dimension,
  columns = 3,
  onItemClick,
  className,
  showType = true,
  showRole = true,
  showEmail = true,
  showMembers = true,
  showMetadata = false,
  interactive = true,
  cardSize = "md",
}: OntologyGridProps) {
  // Responsive column classes
  const gridClasses = cn(
    "grid gap-4",
    {
      // 1 column (always on mobile)
      "grid-cols-1": true,
      // Tablet breakpoint
      "sm:grid-cols-2": columns >= 2,
      // Desktop breakpoint
      "md:grid-cols-3": columns >= 3,
      "lg:grid-cols-4": columns >= 4,
      "xl:grid-cols-5": columns >= 5,
      "2xl:grid-cols-6": columns >= 6,
    },
    className
  );

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No items to display
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {items.map((item, index) => (
        <OntologyCard
          key={item._id || index}
          data={item}
          dimension={dimension}
          showType={showType}
          showRole={showRole}
          showEmail={showEmail}
          showMembers={showMembers}
          showMetadata={showMetadata}
          size={cardSize}
          interactive={interactive}
          onClick={onItemClick ? () => onItemClick(item) : undefined}
        />
      ))}
    </div>
  );
}
