/**
 * GroupCard Component
 *
 * Display group information with metadata
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Group, CardProps } from "../types";
import { cn, formatDate, formatNumber } from "../utils";

export interface GroupCardProps extends CardProps {
  group: Group;
  showMembers?: boolean;
  showMetadata?: boolean;
  memberCount?: number;
}

export function GroupCard({
  group,
  showMembers = true,
  showMetadata = false,
  memberCount,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: GroupCardProps) {
  const isNested = !!group.parentGroupId;

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        interactive && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              <span>{group.name}</span>
            </CardTitle>
            {group.description && (
              <CardDescription className="mt-1">{group.description}</CardDescription>
            )}
          </div>
          {isNested && (
            <Badge variant="outline" className="ml-2">
              Nested
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {showMembers && memberCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>👥</span>
            <span>{formatNumber(memberCount)} members</span>
          </div>
        )}

        {showMetadata && group.metadata && (
          <div className="space-y-1">
            {Object.entries(group.metadata).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-mono">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <span>Created {formatDate(group.createdAt)}</span>
          {interactive && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              View details →
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
