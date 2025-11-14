/**
 * InfiniteScroll - Infinite scroll component with Convex pagination
 *
 * Features:
 * - Intersection Observer API for efficient loading
 * - Convex pagination integration
 * - Loading states
 * - "Load More" button option
 * - Customizable threshold and root margin
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "../utils";
import { Effect } from "effect";

interface InfiniteScrollProps<T> {
  items: T[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  mode?: "auto" | "button";
  loaderComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
  className?: string;
  itemClassName?: string;
}

export function InfiniteScroll<T extends { _id?: string; id?: string }>({
  items,
  loadMore,
  hasMore,
  loading = false,
  renderItem,
  threshold = 0.5,
  rootMargin = "100px",
  mode = "auto",
  loaderComponent,
  endMessage,
  className,
  itemClassName,
}: InfiniteScrollProps<T>) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Handle load more with Effect.ts for error handling
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      await loadMore();
    } catch (error) {
      console.error("Failed to load more items:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [loadMore, hasMore, isLoadingMore]);

  // Auto-load on scroll using Intersection Observer
  useEffect(() => {
    if (mode !== "auto" || !observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          handleLoadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentTarget = observerTarget.current;
    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [mode, hasMore, isLoadingMore, handleLoadMore, threshold, rootMargin]);

  // Default loader component
  const defaultLoader = (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );

  // Default end message
  const defaultEndMessage = (
    <div className="text-center py-8 text-muted-foreground">
      <p>No more items to load</p>
    </div>
  );

  return (
    <div className={cn("w-full", className)}>
      {/* Items list */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const key = (item._id || item.id || index) as string | number;
          return (
            <div key={key} className={itemClassName}>
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>

      {/* Loading state (initial load) */}
      {loading && items.length === 0 && (
        <div className="mt-4">{loaderComponent || defaultLoader}</div>
      )}

      {/* Auto-load trigger */}
      {mode === "auto" && hasMore && (
        <div ref={observerTarget} className="mt-4">
          {isLoadingMore && (loaderComponent || defaultLoader)}
        </div>
      )}

      {/* Manual load button */}
      {mode === "button" && hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {/* End message */}
      {!hasMore && items.length > 0 && (endMessage || defaultEndMessage)}

      {/* Empty state */}
      {!loading && !hasMore && items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No items found</p>
        </div>
      )}
    </div>
  );
}

/**
 * Hook for Convex pagination
 *
 * Usage:
 * const { items, loadMore, hasMore, loading } = useConvexPagination({
 *   query: api.queries.things.list,
 *   args: { groupId, type: "product" },
 *   pageSize: 20,
 * });
 */
export function useConvexPagination<T>({
  query,
  args,
  pageSize = 20,
}: {
  query: any;
  args: any;
  pageSize?: number;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      // Call Convex query with pagination
      const response = await query({
        ...args,
        limit: pageSize,
        offset: page * pageSize,
      });

      const newItems = response.items || response;
      setItems((prev) => [...prev, ...newItems]);
      setHasMore(newItems.length === pageSize);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  }, [query, args, page, pageSize, hasMore, loading]);

  // Initial load
  useEffect(() => {
    if (items.length === 0) {
      loadMore();
    }
  }, []);

  return { items, loadMore, hasMore, loading };
}
