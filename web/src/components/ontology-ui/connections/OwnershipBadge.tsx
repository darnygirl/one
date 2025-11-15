/**
 * OwnershipBadge Component
 *
 * Badge showing ownership relationship
 * Part of CONNECTIONS dimension (ontology-ui)
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import type { Person } from "../types";
import { cn } from "../utils";

export type OwnershipBadgeSize = "sm" | "md" | "lg";

export interface OwnershipBadgeProps {
  owner: Person;
  size?: OwnershipBadgeSize;
  showAvatar?: boolean;
  className?: string;
}

const sizeClasses: Record<OwnershipBadgeSize, { badge: string; avatar: string; text: string; icon: string }> = {
  sm: {
    badge: "h-6 px-2 gap-1",
    avatar: "h-4 w-4",
    text: "text-xs",
    icon: "h-3 w-3",
  },
  md: {
    badge: "h-8 px-3 gap-2",
    avatar: "h-6 w-6",
    text: "text-sm",
    icon: "h-4 w-4",
  },
  lg: {
    badge: "h-10 px-4 gap-2",
    avatar: "h-8 w-8",
    text: "text-base",
    icon: "h-5 w-5",
  },
};

export function OwnershipBadge({
  owner,
  size = "md",
  showAvatar = true,
  className,
}: OwnershipBadgeProps) {
  const sizes = sizeClasses[size];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center font-medium",
        sizes.badge,
        className
      )}
    >
      <Crown className={cn("text-amber-500 flex-shrink-0", sizes.icon)} />

      {showAvatar && (
        <Avatar className={cn("flex-shrink-0", sizes.avatar)}>
          <AvatarImage src={owner.avatar} alt={owner.name} />
          <AvatarFallback className={cn("text-xs", size === "sm" && "text-[8px]")}>
            {owner.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <span className={cn("truncate", sizes.text)}>
        {owner.name}
      </span>
    </Badge>
  );
}
