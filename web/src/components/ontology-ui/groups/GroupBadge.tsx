/**
 * GroupBadge Component
 *
 * Small badge showing group name/icon
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { Group } from "../types";
import { cn } from "../utils";

export interface GroupBadgeProps {
  group: Group;
  variant?: "default" | "outline" | "secondary";
  showIcon?: boolean;
  onClick?: () => void;
  className?: string;
}

export function GroupBadge({
  group,
  variant = "default",
  showIcon = true,
  onClick,
  className,
}: GroupBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      {showIcon && <span className="mr-1">🏢</span>}
      {group.name}
    </Badge>
  );
}
