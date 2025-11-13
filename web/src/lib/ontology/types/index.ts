/**
 * ONE Platform - Ontology Type Definitions
 *
 * These types define the 6-dimension ontology that powers the universal UI system.
 * Every entity in ONE maps to these types, enabling a single Card component to render
 * all 66+ thing types with consistent, accessible UI.
 *
 * @see one/things/components/card.md
 * @see one/things/products/ontology-ui-shadcn.md
 */

// ============================================================================
// Core Ontology Types
// ============================================================================

/**
 * Thing Types - All 66+ entity types in the ONE ontology
 * Extensible to infinity - just add a new type string
 */
export type ThingType =
  // Core Content
  | "course"
  | "lesson"
  | "module"
  | "quiz"
  | "assignment"
  | "certificate"
  // Commerce
  | "product"
  | "service"
  | "subscription"
  | "payment"
  | "invoice"
  | "order"
  // Social & Community
  | "post"
  | "comment"
  | "message"
  | "notification"
  | "discussion"
  | "forum"
  // People & Identity
  | "user"
  | "creator"
  | "customer"
  | "team_member"
  | "student"
  | "instructor"
  // Digital Assets
  | "nft"
  | "token"
  | "wallet"
  | "collection"
  // AI & Agents
  | "agent"
  | "ai_model"
  | "prompt"
  | "workflow"
  | "automation"
  // Media
  | "video"
  | "audio"
  | "podcast"
  | "image"
  | "document"
  | "file"
  // Organization
  | "organization"
  | "project"
  | "task"
  | "milestone"
  | "sprint"
  // Events
  | "event"
  | "webinar"
  | "meeting"
  | "appointment"
  // Knowledge
  | "article"
  | "guide"
  | "tutorial"
  | "documentation"
  | "wiki_page"
  // Marketing
  | "campaign"
  | "email"
  | "landing_page"
  | "form"
  | "survey"
  // Add more types as needed...
  | string;

/**
 * Thing - Universal entity type
 * All entities (users, products, courses, agents, etc.) are "things"
 * with different types and properties
 */
export interface Thing {
  _id: string;
  _creationTime: number;
  type: ThingType;
  name: string;
  groupId: string;
  properties: Record<string, any>;
}

/**
 * Connection - Relationships between things
 */
export interface Connection {
  _id: string;
  _creationTime: number;
  fromThingId: string;
  toThingId: string;
  relationshipType: string;
  metadata?: Record<string, any>;
  groupId: string;
}

/**
 * Event - Audit trail of what happened
 */
export interface Event {
  _id: string;
  _creationTime: number;
  type: string;
  actorId: string;
  targetId: string;
  metadata?: Record<string, any>;
  groupId: string;
}

// ============================================================================
// UI Configuration Types
// ============================================================================

/**
 * Field component types - maps to shadcn/ui components
 */
export type FieldComponentType =
  | "Heading"
  | "Text"
  | "Price"
  | "Image"
  | "Badge"
  | "TagList"
  | "Date"
  | "Avatar"
  | "Link"
  | "Checkbox"
  | "Switch"
  | "Progress"
  | "Separator"
  | "Skeleton"
  | "Markdown"
  | "ImageGallery"
  | "Video"
  | "SocialLinks";

/**
 * Field UI Configuration
 * Defines how a field should be rendered
 */
export interface FieldUI {
  component: FieldComponentType;
  label?: string;
  hidden?: boolean;
  showOnlyIf?: string; // Field name to check for truthy value

  // Format function
  format?: (value: any, thing: Thing) => any;

  // Component-specific props
  [key: string]: any;

  // Heading props
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  truncate?: boolean;

  // Text props
  lines?: number; // Clamp to N lines
  color?: string;
  icon?: string;
  italic?: boolean;
  expandable?: boolean;

  // Price props
  currency?: string;
  badge?: boolean;
  strikethrough?: boolean;
  free?: { label: string; badge: boolean };

  // Image props
  aspect?: "square" | "video" | "wide" | "portrait";
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
  sizes?: string;

  // Badge props
  colors?: Record<string, string>;
  labels?: Record<string, string>;

  // TagList props
  max?: number;
  moreLabel?: string;

  // Date props
  format?: "relative" | "full" | "short";

  // Avatar props
  fallback?: string | "initials";

  // Link props
  external?: boolean;
}

/**
 * Action Configuration
 * Defines buttons and their behavior
 */
export interface ActionConfig {
  action: string; // Action identifier (e.g., "enroll", "purchase", "edit")
  label: string;
  icon?: string;
  variant?: "default" | "ghost" | "danger" | "outline";
  confirm?: string; // Confirmation message if needed
}

/**
 * View Configuration
 * Defines which fields to show in different views
 */
export interface ViewConfig {
  fields: string[] | "*"; // Field names or "*" for all
  layout?: "vertical" | "horizontal" | "grid";
}

/**
 * Connection UI Configuration
 * Defines how to display relationships
 */
export interface ConnectionUI {
  label: string; // e.g., "{count} students" or "Created by {name}"
  display: "badge" | "avatar" | "inline" | "list";
  icon?: string;
  link?: string;
  max?: number; // Max items to show (for list display)
}

/**
 * Empty State Configuration
 */
export interface EmptyStateConfig {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    icon?: string;
    variant?: "default" | "outline";
  };
}

/**
 * Layout Configuration
 */
export interface LayoutConfig {
  columns: number;
  gap: "sm" | "md" | "lg";
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Complete UI Configuration for a Thing Type
 * This is the master config that defines how to render any thing type
 */
export interface ThingUIConfig {
  type: ThingType;

  // Field configurations
  fields: Record<string, FieldUI>;

  // View configurations (card, list, detail, table)
  views: {
    card?: ViewConfig;
    list?: ViewConfig;
    detail?: ViewConfig;
    table?: ViewConfig;
  };

  // Actions (buttons)
  actions: {
    primary?: ActionConfig;
    secondary?: ActionConfig[];
    context?: ActionConfig[]; // Context menu actions
  };

  // Connection displays
  connections?: Record<string, ConnectionUI>;

  // Empty state
  empty: EmptyStateConfig;

  // Layout configurations
  layouts?: {
    grid?: LayoutConfig;
    list?: LayoutConfig;
  };
}

/**
 * Complete Thing Configuration
 * Includes both schema properties and UI configuration
 */
export interface ThingConfig {
  type: ThingType;
  properties: Record<string, any>; // Property schema/defaults
  ui: ThingUIConfig;
}

// ============================================================================
// Registry Type
// ============================================================================

/**
 * Ontology UI Registry
 * Maps thing types to their UI configurations
 */
export type OntologyUIRegistry = Record<ThingType, ThingConfig>;
