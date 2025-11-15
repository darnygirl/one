/**
 * LiveNotifications - Streaming notification system
 *
 * Real-time notifications with toast popups and badge counter.
 */

import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { OntologyComponentProps, Event } from "../types";
import { formatRelativeTime } from "../utils";

export interface LiveNotificationsProps extends OntologyComponentProps {
  /**
   * Convex query path for notifications
   */
  queryPath: any;

  /**
   * Query arguments
   */
  args?: Record<string, any>;

  /**
   * Mutation path for marking as read
   */
  markAsReadMutation?: any;

  /**
   * Show toast for new notifications
   */
  showToasts?: boolean;

  /**
   * Maximum notifications to display
   */
  limit?: number;

  /**
   * Position of notification panel
   */
  position?: "left" | "right";
}

interface Notification extends Event {
  read?: boolean;
  title?: string;
  message?: string;
}

/**
 * LiveNotifications - Real-time notification system
 *
 * @example
 * ```tsx
 * <LiveNotifications
 *   queryPath={api.queries.notifications.list}
 *   args={{ userId }}
 *   markAsReadMutation={api.mutations.notifications.markRead}
 *   showToasts
 *   limit={10}
 *   position="right"
 * />
 * ```
 */
export function LiveNotifications({
  queryPath,
  args = {},
  markAsReadMutation,
  showToasts = true,
  limit = 10,
  position = "right",
  className,
}: LiveNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prevNotificationIds, setPrevNotificationIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Real-time notifications query
  const notifications = useQuery(queryPath, args) as Notification[] | undefined;

  // Mark as read mutation
  const markAsRead = markAsReadMutation ? useMutation(markAsReadMutation) : null;

  // Track unread count
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Show toast for new notifications
  useEffect(() => {
    if (!showToasts || !notifications) return;

    const currentIds = new Set(notifications.map(n => n._id));
    const newNotifications = notifications.filter(
      n => !prevNotificationIds.has(n._id) && !n.read
    );

    if (newNotifications.length > 0 && prevNotificationIds.size > 0) {
      newNotifications.forEach(notification => {
        toast({
          title: notification.title || notification.type,
          description: notification.message || `New ${notification.type} event`,
        });
      });
    }

    setPrevNotificationIds(currentIds);
  }, [notifications, showToasts, toast, prevNotificationIds]);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    if (markAsRead) {
      await markAsRead({ notificationId });
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (markAsRead && notifications) {
      const unread = notifications.filter(n => !n.read);
      for (const notification of unread) {
        await markAsRead({ notificationId: notification._id });
      }
    }
  };

  const displayedNotifications = notifications?.slice(0, limit) || [];

  return (
    <div className={`relative ${className || ''}`}>
      {/* Notification bell button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge
              variant="destructive"
              className="h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          </motion.div>
        )}
      </Button>

      {/* Notification panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: position === "right" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: position === "right" ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-12 ${
                position === "right" ? "right-0" : "left-0"
              } z-50 w-80`}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="max-h-96 overflow-y-auto p-0">
                  {displayedNotifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y">
                      {displayedNotifications.map((notification) => (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-4 hover:bg-muted/50 transition-colors ${
                            !notification.read ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${
                                !notification.read ? "font-semibold" : "font-medium"
                              }`}>
                                {notification.title || notification.type}
                              </p>
                              {notification.message && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatRelativeTime(notification.timestamp)}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => handleMarkAsRead(notification._id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
