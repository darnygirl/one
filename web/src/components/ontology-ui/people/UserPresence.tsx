/**
 * UserPresence Component
 *
 * Real-time presence indicator with status colors and animations
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import type { Person } from "../types";
import { cn } from "../utils";

export type PresenceStatus = "online" | "offline" | "away" | "busy";

export interface UserPresenceProps {
  user?: Person;
  status: PresenceStatus;
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<
  PresenceStatus,
  { color: string; label: string; animate: boolean }
> = {
  online: {
    color: "bg-green-500",
    label: "Online",
    animate: true,
  },
  offline: {
    color: "bg-gray-400",
    label: "Offline",
    animate: false,
  },
  away: {
    color: "bg-yellow-500",
    label: "Away",
    animate: false,
  },
  busy: {
    color: "bg-red-500",
    label: "Busy",
    animate: false,
  },
};

export function UserPresence({
  user,
  status,
  showLabel = false,
  className,
}: UserPresenceProps) {
  const config = statusConfig[status];

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="relative">
        <span
          className={cn(
            "block h-2.5 w-2.5 rounded-full",
            config.color,
            config.animate && "animate-pulse"
          )}
        />
        {config.animate && (
          <span
            className={cn(
              "absolute inset-0 h-2.5 w-2.5 rounded-full",
              config.color,
              "animate-ping opacity-75"
            )}
          />
        )}
      </div>

      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {user?.name ? `${user.name} - ${config.label}` : config.label}
        </span>
      )}
    </div>
  );
}
