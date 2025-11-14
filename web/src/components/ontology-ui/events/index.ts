/**
 * EVENTS Dimension Components
 *
 * Export all event-related components
 */

// Core Event Components
export { EventCard } from "./EventCard";

export { EventDetails } from "./EventDetails";
export type { EventDetailsProps } from "./EventDetails";

export { EventSearch } from "./EventSearch";
export type { EventSearchProps } from "./EventSearch";

export { EventList } from "./EventList";
export type { EventListProps } from "./EventList";

export { EventTimeline } from "./EventTimeline";
export type { EventTimelineProps } from "./EventTimeline";

export { EventFilter } from "./EventFilter";

export { EventTypeSelector } from "./EventTypeSelector";

// Activity & History Components
export { ActivityFeed } from "./ActivityFeed";

export { ChangeHistory } from "./ChangeHistory";
export type { ChangeHistoryProps } from "./ChangeHistory";

export { AuditLog } from "./AuditLog";

// Notification Components
export { NotificationCard } from "./NotificationCard";
export type { NotificationCardProps } from "./NotificationCard";

export { NotificationList } from "./NotificationList";
export type { NotificationListProps } from "./NotificationList";

export { NotificationCenter } from "./NotificationCenter";
export type { NotificationCenterProps } from "./NotificationCenter";

// Type exports for convenience
export type { Event, EventType } from "../types";
