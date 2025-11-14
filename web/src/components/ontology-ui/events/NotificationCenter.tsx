/**
 * NotificationCenter Component
 *
 * Dropdown notification center with tabs and filtering
 * Part of EVENTS dimension (ontology-ui)
 */

import React, { useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Event } from "../types";
import { NotificationList } from "./NotificationList";
import { cn } from "../utils";

export interface NotificationCenterProps {
  notifications: Event[];
  unreadCount: number;
  onNotificationClick?: (notification: Event) => void;
  onMarkAllRead?: () => void;
  onRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function NotificationCenter({
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAllRead,
  onRead,
  onDismiss,
  className,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { allNotifications, unreadNotifications, mentionNotifications } =
    useMemo(() => {
      const all = notifications;
      const unread = notifications.filter(
        (n) => n.metadata?.unread === true || n.metadata?.unread === undefined
      );
      const mentions = notifications.filter(
        (n) => n.type === "mentioned_in" || n.metadata?.mention === true
      );

      return {
        allNotifications: all,
        unreadNotifications: unread,
        mentionNotifications: mentions,
      };
    }, [notifications]);

  const handleNotificationClick = (notification: Event) => {
    onNotificationClick?.(notification);
    // Optionally close popover on notification click
    // setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label="Notifications"
        >
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[400px] p-0"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && onMarkAllRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onMarkAllRead}
                  className="text-xs"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-4 pt-3 pb-1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="text-xs">
                  All
                  {allNotifications.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {allNotifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread
                  {unreadNotifications.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="mentions" className="text-xs">
                  Mentions
                  {mentionNotifications.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {mentionNotifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content */}
            <ScrollArea className="h-[400px]">
              <TabsContent value="all" className="m-0 px-4 py-3">
                <NotificationList
                  notifications={allNotifications}
                  onNotificationClick={handleNotificationClick}
                  onMarkAllRead={onMarkAllRead}
                  onRead={onRead}
                  onDismiss={onDismiss}
                  showGrouping={true}
                />
              </TabsContent>

              <TabsContent value="unread" className="m-0 px-4 py-3">
                <NotificationList
                  notifications={unreadNotifications}
                  onNotificationClick={handleNotificationClick}
                  onMarkAllRead={onMarkAllRead}
                  onRead={onRead}
                  onDismiss={onDismiss}
                  showGrouping={false}
                />
              </TabsContent>

              <TabsContent value="mentions" className="m-0 px-4 py-3">
                <NotificationList
                  notifications={mentionNotifications}
                  onNotificationClick={handleNotificationClick}
                  onRead={onRead}
                  onDismiss={onDismiss}
                  showGrouping={false}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Footer (optional - for settings link) */}
          <div className="px-4 py-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setOpen(false);
                // Navigate to notification settings
              }}
            >
              Notification Settings
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
