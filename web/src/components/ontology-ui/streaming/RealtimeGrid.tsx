/**
 * RealtimeGrid - Grid layout with automatic updates and animations
 *
 * Supports add/remove/update animations with Framer Motion.
 */

import { useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { OntologyComponentProps } from "../types";

export interface RealtimeGridProps extends OntologyComponentProps {
  /**
   * Convex query path
   */
  queryPath: any;

  /**
   * Query arguments
   */
  args?: Record<string, any>;

  /**
   * Number of columns (responsive)
   */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Gap between items
   */
  gap?: "sm" | "md" | "lg";

  /**
   * Render function for each grid item
   */
  renderItem: (item: any, index: number) => React.ReactNode;

  /**
   * Empty state content
   */
  emptyState?: React.ReactNode;

  /**
   * Animation variant
   */
  animationVariant?: "fade" | "scale" | "slide";
}

const gapClasses = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
};

const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  slide: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
};

/**
 * RealtimeGrid - Animated grid with live updates
 *
 * @example
 * ```tsx
 * <RealtimeGrid
 *   queryPath={api.queries.things.list}
 *   args={{ groupId, type: "product" }}
 *   columns={3}
 *   gap="md"
 *   animationVariant="scale"
 *   renderItem={(product) => (
 *     <ProductCard product={product} />
 *   )}
 * />
 * ```
 */
export function RealtimeGrid({
  queryPath,
  args = {},
  columns = 3,
  gap = "md",
  renderItem,
  emptyState,
  animationVariant = "scale",
  className,
}: RealtimeGridProps) {
  // Real-time Convex query
  const data = useQuery(queryPath, args);

  const items = Array.isArray(data) ? data : [];
  const animation = animations[animationVariant];

  // Loading state
  if (data === undefined) {
    return (
      <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className || ''}`}>
        {Array.from({ length: columns * 2 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={className}>
        {emptyState || (
          <Card className="p-12 text-center text-muted-foreground">
            No items to display
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className || ''}`}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={item._id || index}
            layout
            initial={animation.initial}
            animate={animation.animate}
            exit={animation.exit}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
