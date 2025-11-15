/**
 * Ontology UI - Shared TypeScript Types
 *
 * Core types for the 6-dimension ontology UI components
 */

import type { Id } from "convex/_generated/dataModel";

// ============================================================================
// 1. GROUPS Dimension Types
// ============================================================================

export interface Group {
  _id: Id<"groups">;
  _creationTime: number;
  name: string;
  description?: string;
  parentGroupId?: Id<"groups">;
  metadata?: Record<string, any>;
  settings?: Record<string, any>;
  createdBy: Id<"things">; // Creator userId
  createdAt: number;
  updatedAt?: number;
}

export interface GroupHierarchy extends Group {
  children?: GroupHierarchy[];
  depth: number;
  path: string[];
}

// ============================================================================
// 2. PEOPLE Dimension Types (represented as Things)
// ============================================================================

export type UserRole = "platform_owner" | "org_owner" | "org_user" | "customer";

export interface Person {
  _id: Id<"things">;
  type: "creator" | "user";
  name: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  groupId: Id<"groups">;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt?: number;
}

export interface Permission {
  resource: string;
  action: "create" | "read" | "update" | "delete";
  granted: boolean;
}

// ============================================================================
// 3. THINGS Dimension Types
// ============================================================================

export type ThingType =
  | "creator"
  | "user"
  | "agent"
  | "content"
  | "course"
  | "lesson"
  | "video"
  | "quiz"
  | "token"
  | "nft"
  | "product"
  | "service"
  | "post"
  | "comment"
  | "file"
  | "folder"
  | "project"
  | "task"
  | "note"
  | "bookmark"
  | "subscription"
  | "payment"
  | "invoice"
  | "transaction"
  | "wallet"
  | "organization"
  | "team"
  | "role"
  | "permission"
  | "webhook"
  | "integration"
  | "api_key";

export interface Thing {
  _id: Id<"things">;
  _creationTime: number;
  type: ThingType;
  name: string;
  description?: string;
  groupId: Id<"groups">;
  ownerId: Id<"things">; // Owner userId
  metadata?: Record<string, any>;
  tags?: string[];
  status?: string;
  createdAt: number;
  updatedAt?: number;
}

// ============================================================================
// 4. CONNECTIONS Dimension Types
// ============================================================================

export type ConnectionType =
  | "owns"
  | "created"
  | "follows"
  | "purchased"
  | "enrolled"
  | "completed"
  | "holds_tokens"
  | "member_of"
  | "assigned_to"
  | "tagged_with"
  | "commented_on"
  | "liked"
  | "shared"
  | "subscribed_to"
  | "replied_to"
  | "mentioned_in"
  | "connected_to"
  | "depends_on"
  | "blocks"
  | "duplicates"
  | "relates_to"
  | "parent_of"
  | "child_of"
  | "linked_to"
  | "referenced_by";

export interface Connection {
  _id: Id<"connections">;
  _creationTime: number;
  type: ConnectionType;
  fromId: Id<"things">;
  toId: Id<"things">;
  groupId: Id<"groups">;
  metadata?: Record<string, any>;
  strength?: number; // 0-100
  createdAt: number;
  updatedAt?: number;
}

// ============================================================================
// 5. EVENTS Dimension Types
// ============================================================================

export type EventType =
  | "created"
  | "updated"
  | "deleted"
  | "purchased"
  | "completed"
  | "enrolled"
  | "followed"
  | "unfollowed"
  | "liked"
  | "unliked"
  | "commented"
  | "shared"
  | "tagged"
  | "untagged"
  | "uploaded"
  | "downloaded"
  | "viewed"
  | "started"
  | "paused"
  | "resumed"
  | "stopped"
  | "submitted"
  | "approved"
  | "rejected"
  | "invited"
  | "joined"
  | "left"
  | "promoted"
  | "demoted"
  | "banned"
  | "unbanned"
  | "logged_in"
  | "logged_out"
  | "failed_login"
  | "password_reset"
  | "email_verified"
  | "profile_updated"
  | "settings_changed"
  | "payment_received"
  | "payment_failed"
  | "refund_issued"
  | "subscription_started"
  | "subscription_renewed"
  | "subscription_cancelled"
  | "token_minted"
  | "token_transferred"
  | "token_burned";

export interface Event {
  _id: Id<"events">;
  _creationTime: number;
  type: EventType;
  actorId: Id<"things">; // Who performed the action
  targetId?: Id<"things">; // What was affected
  groupId: Id<"groups">;
  metadata?: Record<string, any>;
  timestamp: number;
}

// ============================================================================
// 6. KNOWLEDGE Dimension Types
// ============================================================================

export interface Label {
  _id: Id<"knowledge">;
  _creationTime: number;
  type: "label";
  thingId: Id<"things">;
  groupId: Id<"groups">;
  label: string;
  category?: string;
  confidence?: number; // 0-1
  metadata?: Record<string, any>;
  createdAt: number;
}

export interface Vector {
  _id: Id<"knowledge">;
  _creationTime: number;
  type: "vector";
  thingId: Id<"things">;
  groupId: Id<"groups">;
  embedding: number[];
  text: string;
  metadata?: Record<string, any>;
  createdAt: number;
}

export interface SearchResult {
  _id: Id<"things"> | Id<"knowledge">;
  score: number;
  type: ThingType | "label" | "vector";
  name: string;
  description?: string;
  highlights?: string[];
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface OntologyComponentProps {
  groupId?: Id<"groups">;
  userId?: Id<"things">;
  className?: string;
}

export interface CardProps extends OntologyComponentProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
}

export interface ListProps extends OntologyComponentProps {
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
}

export interface FormProps extends OntologyComponentProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  mode?: "create" | "edit";
}

// ============================================================================
// Utility Types
// ============================================================================

export type Dimension = "groups" | "people" | "things" | "connections" | "events" | "knowledge";

export interface DimensionMetadata {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const DIMENSIONS: Record<Dimension, DimensionMetadata> = {
  groups: {
    name: "Groups",
    description: "Multi-tenant containers",
    icon: "🏢",
    color: "blue",
  },
  people: {
    name: "People",
    description: "Authorization & roles",
    icon: "👥",
    color: "purple",
  },
  things: {
    name: "Things",
    description: "All entities",
    icon: "📦",
    color: "green",
  },
  connections: {
    name: "Connections",
    description: "All relationships",
    icon: "🔗",
    color: "orange",
  },
  events: {
    name: "Events",
    description: "Complete audit trail",
    icon: "📅",
    color: "red",
  },
  knowledge: {
    name: "Knowledge",
    description: "Labels + vectors",
    icon: "🧠",
    color: "indigo",
  },
};

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterConfig {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "startsWith" | "endsWith";
  value: any;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "date";
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: any;
}
