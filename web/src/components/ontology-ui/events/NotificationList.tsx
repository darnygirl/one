/**
 * NotificationList Component
 *
 * List of notifications with grouping and filtering
 * Part of EVENTS dimension (ontology-ui)
 */

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { Event, ListProps } from "../types";
import { NotificationCard } from "./NotificationCard";
import { cn } from "../utils";

export interface NotificationListProps extends ListProps {
  notifications: Event[];
  onNotificationClick?: (notification: Event) => void;
  onMarkAllRead?: () => void;
  onRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  showGrouping?: boolean;
}

export function NotificationList({
  notifications,
  onNotificationClick,
  onMarkAllRead,
  onRead,
  onDismiss,
  showGrouping = true,
  className,
}: NotificationListProps) {
  const { unreadNotifications, readNotifications } = useMemo(() => {
    const unread = notifications.filter(
      (n) => n.metadata?.unread === true || n.metadata?.unread === undefined
    );
    const read = notifications.filter((n) => n.metadata?.unread === false);

    return {
      unreadNotifications: unread,
      readNotifications: read,
    };
  }, [notifications]);

  const hasUnread = unreadNotifications.length > 0;

  if (notifications.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4",
          className
        )}
      >
        <div className="text-4xl mb-4">📭</div>
        <p className="text-lg font-medium text-muted-foreground">
          No notifications
        </p>
        <p className="text-sm text-muted-foreground">
          You're all caught up!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Mark All Read button */}
      {hasUnread && onMarkAllRead && (
        <div className="flex items-center justify-between pb-2 border-b">
          <p className="text-sm font-medium">
            {unreadNotifications.length} unread notification
            {unreadNotifications.length !== 1 ? "s" : ""}
          </p>
          <Button size="sm" variant="ghost" onClick={onMarkAllRead}>
            Mark all as read
          </Button>
        </div>
      )}

      {/* Unread notifications */}
      {showGrouping && hasUnread && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Unread</h3>
          <div className="space-y-2">
            {unreadNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                unread={true}
                onClick={() => onNotificationClick?.(notification)}
                onRead={onRead}
                onDismiss={onDismiss}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Read notifications */}
      {showGrouping && readNotifications.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Earlier
          </h3>
          <div className="space-y-2">
            {readNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                unread={false}
                onClick={() => onNotificationClick?.(notification)}
                onRead={onRead}
                onDismiss={onDismiss}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* No grouping - show all */}
      {!showGrouping && (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              unread={
                notification.metadata?.unread === true ||
                notification.metadata?.unread === undefined
              }
              onClick={() => onNotificationClick?.(notification)}
              onRead={onRead}
              onDismiss={onDismiss}
              size="sm"
            />
          ))}
        </div>
      )}
    </div>
  );
}
