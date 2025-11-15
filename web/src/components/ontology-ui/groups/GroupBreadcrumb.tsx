/**
 * GroupBreadcrumb Component
 *
 * Breadcrumb navigation through group hierarchy
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Group } from "../types";
import { cn } from "../utils";

export interface GroupBreadcrumbProps {
  groups: Group[]; // Ordered from root to current
  onGroupClick?: (group: Group) => void;
  className?: string;
}

export function GroupBreadcrumb({
  groups,
  onGroupClick,
  className,
}: GroupBreadcrumbProps) {
  if (groups.length === 0) return null;

  return (
    <nav className={cn("flex items-center gap-1 text-sm", className)} aria-label="Breadcrumb">
      {groups.map((group, index) => {
        const isLast = index === groups.length - 1;

        return (
          <React.Fragment key={group._id}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Button
              variant={isLast ? "default" : "ghost"}
              size="sm"
              onClick={() => onGroupClick?.(group)}
              disabled={isLast}
              className={cn(!isLast && "hover:underline")}
            >
              <span className="mr-1">🏢</span>
              {group.name}
            </Button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
