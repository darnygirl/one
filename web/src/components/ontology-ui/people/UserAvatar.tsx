/**
 * UserAvatar Component
 *
 * Avatar component with status indicator
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Person } from "../types";
import { cn } from "../utils";

export type AvatarSize = "sm" | "md" | "lg";
export type UserStatus = "online" | "offline" | "away";

export interface UserAvatarProps {
  user: Person;
  size?: AvatarSize;
  showStatus?: boolean;
  status?: UserStatus;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

const statusColors: Record<UserStatus, string> = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
};

const statusSizes: Record<AvatarSize, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2.5 w-2.5",
  lg: "h-4 w-4",
};

export function UserAvatar({
  user,
  size = "md",
  showStatus = false,
  status = "offline",
  className,
}: UserAvatarProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-xs font-medium">
          {user.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full border-2 border-background",
            statusSizes[size],
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}
