/**
 * RelatedThings Component
 * Shows related or recommended things
 */

import { type Thing } from "@/lib/ontology/types";
import { Card } from "./Card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface RelatedThingsProps {
  thing: Thing;
  maxItems?: number;
  title?: string;
  className?: string;
}

export function RelatedThings({
  thing,
  maxItems = 4,
  title = "Related Items",
  className,
}: RelatedThingsProps) {
  const [relatedThings, setRelatedThings] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement actual related things query
    // For now, return empty array after delay
    const timer = setTimeout(() => {
      setRelatedThings([]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [thing._id]);

  if (loading) {
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: maxItems }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (relatedThings.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedThings.slice(0, maxItems).map((relatedThing) => (
          <Card key={relatedThing._id} thing={relatedThing} view="card" />
        ))}
      </div>
    </div>
  );
}
