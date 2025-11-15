/**
 * CONNECTIONS Dimension Components
 *
 * Export all connection-related components
 */

export { ConnectionCard } from "./ConnectionCard";
export type { ConnectionCardProps } from "./ConnectionCard";

export { ConnectionCreator } from "./ConnectionCreator";
export type { ConnectionCreatorProps } from "./ConnectionCreator";

export { ConnectionGraph } from "./ConnectionGraph";
export type { ConnectionGraphProps } from "./ConnectionGraph";

export { ConnectionList } from "./ConnectionList";
export type { ConnectionListProps } from "./ConnectionList";

export { ConnectionStrength, ConnectionStrengthBadge } from "./ConnectionStrength";
export type { ConnectionStrengthProps, ConnectionStrengthBadgeProps } from "./ConnectionStrength";

export { ConnectionTimeline } from "./ConnectionTimeline";
export type { ConnectionTimelineProps } from "./ConnectionTimeline";

export { ConnectionTypeSelector } from "./ConnectionTypeSelector";
export type { ConnectionTypeSelectorProps } from "./ConnectionTypeSelector";

export { FollowButton } from "./FollowButton";
export type { FollowButtonProps } from "./FollowButton";

export { OwnershipBadge } from "./OwnershipBadge";
export type { OwnershipBadgeProps } from "./OwnershipBadge";

export { RelationshipTree } from "./RelationshipTree";
export type { RelationshipTreeProps } from "./RelationshipTree";

export { RelationshipViewer } from "./RelationshipViewer";
export type { RelationshipViewerProps } from "./RelationshipViewer";

export { NetworkGraph } from "./NetworkGraph";
export type { NetworkGraphProps } from "./NetworkGraph";

// Re-export connection types for convenience
export type { Connection, ConnectionType } from "../types";
