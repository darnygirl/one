/**
 * PresenceIndicator - Real-time presence tracking
 *
 * Shows online/offline/away status with "last seen" timestamp.
 */

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { OntologyComponentProps } from "../types";
import { formatRelativeTime } from "../utils";

export type PresenceStatus = "online" | "offline" | "away" | "busy";

export interface PresenceIndicatorProps extends OntologyComponentProps {
  /**
   * User/person ID to track
   */
  userId: string;

  /**
   * Convex query path for presence data
   */
  queryPath?: any;

  /**
   * User name
   */
  name?: string;

  /**
   * Avatar URL
   */
  avatarUrl?: string;

  /**
   * Show name alongside avatar
   */
  showName?: boolean;

  /**
   * Show last seen timestamp
   */
  showLastSeen?: boolean;

  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";

  /**
   * Manual status override (if not using Convex)
   */
  status?: PresenceStatus;

  /**
   * Last seen timestamp (if not using Convex)
   */
  lastSeen?: number;
}

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
};

const statusLabels = {
  online: "Online",
  offline: "Offline",
  away: "Away",
  busy: "Busy",
};

const sizeClasses = {
  sm: {
    avatar: "h-8 w-8",
    dot: "h-2.5 w-2.5",
    text: "text-xs",
  },
  md: {
    avatar: "h-10 w-10",
    dot: "h-3 w-3",
    text: "text-sm",
  },
  lg: {
    avatar: "h-14 w-14",
    dot: "h-4 w-4",
    text: "text-base",
  },
};

/**
 * PresenceIndicator - Real-time user presence
 *
 * @example
 * ```tsx
 * <PresenceIndicator
 *   userId="user_123"
 *   queryPath={api.queries.presence.get}
 *   name="John Doe"
 *   avatarUrl="/avatars/john.jpg"
 *   showName
 *   showLastSeen
 *   size="md"
 * />
 * ```
 */
export function PresenceIndicator({
  userId,
  queryPath,
  name,
  avatarUrl,
  showName = false,
  showLastSeen = false,
  size = "md",
  status: manualStatus,
  lastSeen: manualLastSeen,
  className,
}: PresenceIndicatorProps) {
  // Real-time presence query (if queryPath provided)
  const presenceData = queryPath ? useQuery(queryPath, { userId }) : null;

  // Use manual status or query data
  const status: PresenceStatus = manualStatus || presenceData?.status || "offline";
  const lastSeen = manualLastSeen || presenceData?.lastSeen;
  const displayName = name || presenceData?.name || "Unknown";
  const avatar = avatarUrl || presenceData?.avatarUrl;

  const sizes = sizeClasses[size];

  // Loading state
  if (queryPath && presenceData === undefined) {
    return (
      <div className={`flex items-center gap-2 ${className || ''}`}>
        <Skeleton className={`rounded-full ${sizes.avatar}`} />
        {showName && <Skeleton className="h-4 w-24" />}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      {/* Avatar with status dot */}
      <div className="relative">
        <Avatar className={sizes.avatar}>
          <AvatarImage src={avatar} alt={displayName} />
          <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        {/* Animated status dot */}
        <motion.div
          className={`absolute bottom-0 right-0 ${sizes.dot} rounded-full border-2 border-background ${statusColors[status]}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {status === "online" && (
            <motion.div
              className="absolute inset-0 rounded-full bg-green-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Name and status */}
      {(showName || showLastSeen) && (
        <div className="flex flex-col">
          {showName && (
            <div className="flex items-center gap-2">
              <span className={`font-medium ${sizes.text}`}>{displayName}</span>
              <Badge
                variant={status === "online" ? "default" : "outline"}
                className={`${sizes.text} ${
                  status === "online" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
                  status === "away" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" :
                  status === "busy" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" :
                  ""
                }`}
              >
                {statusLabels[status]}
              </Badge>
            </div>
          )}

          {showLastSeen && lastSeen && status !== "online" && (
            <span className={`text-muted-foreground ${sizes.text}`}>
              Last seen {formatRelativeTime(lastSeen)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
