/**
 * ThingDetail Component
 * Renders a single thing in detail view
 */

import { type Thing } from "@/lib/ontology/types";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface ThingDetailProps {
  thing: Thing;
  className?: string;
}

export function ThingDetail({ thing, className }: ThingDetailProps) {
  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Card
        thing={thing}
        view="detail"
        showActions={true}
        showConnections={true}
      />
    </div>
  );
}
