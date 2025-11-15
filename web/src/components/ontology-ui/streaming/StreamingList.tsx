/**
 * StreamingList - List with live data streaming from Convex
 *
 * Supports pagination, optimistic updates, and auto-scroll to new items.
 */

import { useQuery, useMutation } from "convex/react";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { OntologyComponentProps } from "../types";

export interface StreamingListProps extends OntologyComponentProps {
  /**
   * Convex query path for fetching list data
   */
  queryPath: any;

  /**
   * Query arguments
   */
  args?: Record<string, any>;

  /**
   * Enable pagination
   */
  paginated?: boolean;

  /**
   * Items per page (if paginated)
   */
  pageSize?: number;

  /**
   * Auto-scroll to new items
   */
  autoScroll?: boolean;

  /**
   * Custom render function for each item
   */
  renderItem: (item: any, index: number) => React.ReactNode;

  /**
   * Optional header content
   */
  header?: React.ReactNode;

  /**
   * Optional footer content
   */
  footer?: React.ReactNode;

  /**
   * Empty state message
   */
  emptyMessage?: string;
}

/**
 * StreamingList - Real-time list with pagination
 *
 * @example
 * ```tsx
 * <StreamingList
 *   queryPath={api.queries.events.list}
 *   args={{ groupId }}
 *   paginated
 *   pageSize={10}
 *   autoScroll
 *   renderItem={(event) => (
 *     <EventItem event={event} />
 *   )}
 * />
 * ```
 */
export function StreamingList({
  queryPath,
  args = {},
  paginated = false,
  pageSize = 10,
  autoScroll = false,
  renderItem,
  header,
  footer,
  emptyMessage = "No items found",
  className,
}: StreamingListProps) {
  const [page, setPage] = useState(1);
  const [prevItemCount, setPrevItemCount] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Real-time Convex query
  const data = useQuery(queryPath, args);

  // Calculate pagination
  const items = Array.isArray(data) ? data : [];
  const totalItems = items.length;
  const totalPages = paginated ? Math.ceil(totalItems / pageSize) : 1;
  const startIndex = paginated ? (page - 1) * pageSize : 0;
  const endIndex = paginated ? startIndex + pageSize : totalItems;
  const displayedItems = items.slice(startIndex, endIndex);

  // Auto-scroll to new items
  useEffect(() => {
    if (autoScroll && items.length > prevItemCount) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    setPrevItemCount(items.length);
  }, [items.length, autoScroll, prevItemCount]);

  // Loading state
  if (data === undefined) {
    return (
      <div className={className}>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={listRef} className={className}>
      {/* Header */}
      {header && <div className="mb-4">{header}</div>}

      {/* Item count badge */}
      <div className="flex justify-between items-center mb-3">
        <Badge variant="outline">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </Badge>
        {autoScroll && totalItems > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            <ArrowDown className="h-4 w-4 mr-1" />
            Scroll to bottom
          </Button>
        )}
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {displayedItems.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {emptyMessage}
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayedItems.map((item, index) => (
              <motion.div
                key={item._id || index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
              >
                {renderItem(item, startIndex + index)}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
