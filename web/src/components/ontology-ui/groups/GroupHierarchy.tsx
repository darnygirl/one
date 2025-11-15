/**
 * GroupHierarchy Component
 *
 * Visual hierarchy diagram
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { GroupHierarchy as GroupHierarchyType } from "../types";
import { cn } from "../utils";

export interface GroupHierarchyProps {
  root: GroupHierarchyType;
  onGroupClick?: (group: GroupHierarchyType) => void;
  className?: string;
}

function HierarchyNode({
  group,
  onGroupClick,
  isLast,
}: {
  group: GroupHierarchyType;
  onGroupClick?: (group: GroupHierarchyType) => void;
  isLast: boolean;
}) {
  const hasChildren = group.children && group.children.length > 0;

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent cursor-pointer transition-colors border",
          "max-w-xs"
        )}
        onClick={() => onGroupClick?.(group)}
      >
        <span>🏢</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{group.name}</p>
          {group.description && (
            <p className="text-xs text-muted-foreground truncate">
              {group.description}
            </p>
          )}
        </div>
      </div>

      {hasChildren && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 border-border pl-4">
          {group.children!.map((child, index) => (
            <HierarchyNode
              key={child._id}
              group={child}
              onGroupClick={onGroupClick}
              isLast={index === group.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GroupHierarchy({
  root,
  onGroupClick,
  className,
}: GroupHierarchyProps) {
  const countDescendants = (group: GroupHierarchyType): number => {
    if (!group.children || group.children.length === 0) return 0;
    return group.children.reduce(
      (sum, child) => sum + 1 + countDescendants(child),
      0
    );
  };

  const totalGroups = 1 + countDescendants(root);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🌳</span>
          Group Hierarchy
        </CardTitle>
        <p className="text-sm text-muted-foreground">{totalGroups} total groups</p>
      </CardHeader>

      <CardContent>
        <HierarchyNode group={root} onGroupClick={onGroupClick} isLast={true} />
      </CardContent>
    </Card>
  );
}
