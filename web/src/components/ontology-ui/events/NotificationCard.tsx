/**
 * NotificationCard Component
 *
 * Card for displaying individual notifications
 * Part of EVENTS dimension (ontology-ui)
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event, CardProps } from "../types";
import { cn, formatRelativeTime, getEventTypeDisplay } from "../utils";

export interface NotificationCardProps extends CardProps {
  notification: Event;
  unread?: boolean;
  onRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  created: "✨",
  updated: "🔄",
  deleted: "🗑️",
  purchased: "💳",
  completed: "✅",
  enrolled: "📚",
  followed: "👤",
  unfollowed: "👋",
  liked: "❤️",
  unliked: "💔",
  commented: "💬",
  shared: "📤",
  tagged: "🏷️",
  untagged: "🏷️",
  uploaded: "📤",
  downloaded: "📥",
  viewed: "👁️",
  started: "▶️",
  paused: "⏸️",
  resumed: "▶️",
  stopped: "⏹️",
  submitted: "📨",
  approved: "✅",
  rejected: "❌",
  invited: "✉️",
  joined: "🎉",
  left: "👋",
  promoted: "⬆️",
  demoted: "⬇️",
  banned: "🚫",
  unbanned: "✅",
  logged_in: "🔐",
  logged_out: "🚪",
  failed_login: "⚠️",
  password_reset: "🔑",
  email_verified: "✉️",
  profile_updated: "👤",
  settings_changed: "⚙️",
  payment_received: "💰",
  payment_failed: "⚠️",
  refund_issued: "💸",
  subscription_started: "🔄",
  subscription_renewed: "🔄",
  subscription_cancelled: "❌",
  token_minted: "🪙",
  token_transferred: "↔️",
  token_burned: "🔥",
};

export function NotificationCard({
  notification,
  unread = false,
  onRead,
  onDismiss,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: NotificationCardProps) {
  const icon = EVENT_TYPE_ICONS[notification.type] || "📢";
  const displayType = getEventTypeDisplay(notification.type);

  const getMessage = (): string => {
    if (notification.metadata?.message) {
      return notification.metadata.message as string;
    }

    const targetName = notification.metadata?.targetName || "item";
    return `${displayType} ${targetName}`;
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
    if (unread && onRead) {
      onRead(notification._id);
    }
  };

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        interactive && "cursor-pointer hover:shadow-lg",
        unread && "border-l-4 border-l-blue-500",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="text-2xl">{icon}</div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base flex items-center gap-2">
                {getMessage()}
                {unread && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {displayType}
                  </Badge>
                  <span className="text-xs">
                    {formatRelativeTime(notification.timestamp)}
                  </span>
                </div>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      {(notification.metadata?.description || onRead || onDismiss) && (
        <CardContent className="space-y-3">
          {notification.metadata?.description && (
            <p className="text-sm text-muted-foreground">
              {notification.metadata.description as string}
            </p>
          )}

          {(onRead || onDismiss) && (
            <div className="flex gap-2">
              {unread && onRead && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRead(notification._id);
                  }}
                >
                  Mark as Read
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(notification._id);
                  }}
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
