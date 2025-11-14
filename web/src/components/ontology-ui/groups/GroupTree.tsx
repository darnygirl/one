/**
 * GroupTree Component
 *
 * Hierarchical tree view of nested groups
 * Part of GROUPS dimension (ontology-ui)
 */

import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Group, GroupHierarchy } from "../types";
import { cn } from "../utils";

export interface GroupTreeProps {
  groups: GroupHierarchy[];
  onGroupClick?: (group: GroupHierarchy) => void;
  selectedGroupId?: string;
  className?: string;
}

function TreeNode({
  group,
  onGroupClick,
  selectedGroupId,
  level = 0,
}: {
  group: GroupHierarchy;
  onGroupClick?: (group: GroupHierarchy) => void;
  selectedGroupId?: string;
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = group.children && group.children.length > 0;
  const isSelected = group._id === selectedGroupId;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent cursor-pointer transition-colors",
          isSelected && "bg-primary/10 border-l-2 border-primary"
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={() => onGroupClick?.(group)}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="w-4" />
        )}

        <span className="text-lg">🏢</span>
        <span className="flex-1 font-medium">{group.name}</span>
        {hasChildren && (
          <span className="text-xs text-muted-foreground">
            {group.children!.length}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {group.children!.map((child) => (
            <TreeNode
              key={child._id}
              group={child}
              onGroupClick={onGroupClick}
              selectedGroupId={selectedGroupId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GroupTree({
  groups,
  onGroupClick,
  selectedGroupId,
  className,
}: GroupTreeProps) {
  return (
    <div className={cn("border rounded-lg p-2 bg-card", className)}>
      <div className="space-y-1">
        {groups.map((group) => (
          <TreeNode
            key={group._id}
            group={group}
            onGroupClick={onGroupClick}
            selectedGroupId={selectedGroupId}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
