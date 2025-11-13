/**
 * InfiniteScroll Component
 * Automatically loads more things as user scrolls
 */

import { type Thing } from "@/lib/ontology/types";
import { Card } from "./Card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

interface InfiniteScrollProps {
  things: Thing[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  view?: "card" | "list";
  threshold?: number; // Pixels from bottom to trigger load
  className?: string;
}

export function InfiniteScroll({
  things,
  hasMore,
  loading,
  onLoadMore,
  view = "card",
  threshold = 500,
  className,
}: InfiniteScrollProps) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        setIsVisible(first.isIntersecting);
      },
      { threshold: 0.1, rootMargin: `${threshold}px` }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [threshold]);

  useEffect(() => {
    if (isVisible && hasMore && !loading) {
      onLoadMore();
    }
  }, [isVisible, hasMore, loading, onLoadMore]);

  return (
    <div className={className}>
      <div
        className={
          view === "card"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {things.map((thing) => (
          <Card key={thing._id} thing={thing} view={view} />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div
          className={
            view === "card"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
              : "space-y-4 mt-4"
          }
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {/* Sentinel element for intersection observer */}
      <div ref={loaderRef} className="h-10" />

      {/* End of results message */}
      {!hasMore && things.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You've reached the end of the list</p>
        </div>
      )}
    </div>
  );
}
