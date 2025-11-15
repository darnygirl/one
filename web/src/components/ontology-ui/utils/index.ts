/**
 * Ontology UI - Shared Utilities
 *
 * Helper functions for ontology-aware components
 */

import type {
  ThingType,
  ConnectionType,
  EventType,
  UserRole,
  Dimension,
} from "../types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// CSS Utilities
// ============================================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Date Utilities
// ============================================================================

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

// ============================================================================
// String Utilities
// ============================================================================

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function titleCase(text: string): string {
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + "s"}`;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isThingType(value: string): value is ThingType {
  const thingTypes: ThingType[] = [
    "creator",
    "user",
    "agent",
    "content",
    "course",
    "lesson",
    "video",
    "quiz",
    "token",
    "nft",
    "product",
    "service",
    "post",
    "comment",
    "file",
    "folder",
    "project",
    "task",
    "note",
    "bookmark",
    "subscription",
    "payment",
    "invoice",
    "transaction",
    "wallet",
    "organization",
    "team",
    "role",
    "permission",
    "webhook",
    "integration",
    "api_key",
  ];
  return thingTypes.includes(value as ThingType);
}

export function isConnectionType(value: string): value is ConnectionType {
  const connectionTypes: ConnectionType[] = [
    "owns",
    "created",
    "follows",
    "purchased",
    "enrolled",
    "completed",
    "holds_tokens",
    "member_of",
    "assigned_to",
    "tagged_with",
    "commented_on",
    "liked",
    "shared",
    "subscribed_to",
    "replied_to",
    "mentioned_in",
    "connected_to",
    "depends_on",
    "blocks",
    "duplicates",
    "relates_to",
    "parent_of",
    "child_of",
    "linked_to",
    "referenced_by",
  ];
  return connectionTypes.includes(value as ConnectionType);
}

export function isEventType(value: string): value is EventType {
  const eventTypes: EventType[] = [
    "created",
    "updated",
    "deleted",
    "purchased",
    "completed",
    "enrolled",
    "followed",
    "unfollowed",
    "liked",
    "unliked",
    "commented",
    "shared",
    "tagged",
    "untagged",
    "uploaded",
    "downloaded",
    "viewed",
    "started",
    "paused",
    "resumed",
    "stopped",
    "submitted",
    "approved",
    "rejected",
    "invited",
    "joined",
    "left",
    "promoted",
    "demoted",
    "banned",
    "unbanned",
    "logged_in",
    "logged_out",
    "failed_login",
    "password_reset",
    "email_verified",
    "profile_updated",
    "settings_changed",
    "payment_received",
    "payment_failed",
    "refund_issued",
    "subscription_started",
    "subscription_renewed",
    "subscription_cancelled",
    "token_minted",
    "token_transferred",
    "token_burned",
  ];
  return eventTypes.includes(value as EventType);
}

// ============================================================================
// Display Name Utilities
// ============================================================================

export function getThingTypeDisplay(type: ThingType): string {
  const displayNames: Record<ThingType, string> = {
    creator: "Creator",
    user: "User",
    agent: "AI Agent",
    content: "Content",
    course: "Course",
    lesson: "Lesson",
    video: "Video",
    quiz: "Quiz",
    token: "Token",
    nft: "NFT",
    product: "Product",
    service: "Service",
    post: "Post",
    comment: "Comment",
    file: "File",
    folder: "Folder",
    project: "Project",
    task: "Task",
    note: "Note",
    bookmark: "Bookmark",
    subscription: "Subscription",
    payment: "Payment",
    invoice: "Invoice",
    transaction: "Transaction",
    wallet: "Wallet",
    organization: "Organization",
    team: "Team",
    role: "Role",
    permission: "Permission",
    webhook: "Webhook",
    integration: "Integration",
    api_key: "API Key",
  };
  return displayNames[type] || titleCase(type);
}

export function getConnectionTypeDisplay(type: ConnectionType): string {
  const displayNames: Record<ConnectionType, string> = {
    owns: "Owns",
    created: "Created",
    follows: "Follows",
    purchased: "Purchased",
    enrolled: "Enrolled in",
    completed: "Completed",
    holds_tokens: "Holds Tokens",
    member_of: "Member of",
    assigned_to: "Assigned to",
    tagged_with: "Tagged with",
    commented_on: "Commented on",
    liked: "Liked",
    shared: "Shared",
    subscribed_to: "Subscribed to",
    replied_to: "Replied to",
    mentioned_in: "Mentioned in",
    connected_to: "Connected to",
    depends_on: "Depends on",
    blocks: "Blocks",
    duplicates: "Duplicates",
    relates_to: "Relates to",
    parent_of: "Parent of",
    child_of: "Child of",
    linked_to: "Linked to",
    referenced_by: "Referenced by",
  };
  return displayNames[type] || titleCase(type.replace(/_/g, " "));
}

export function getEventTypeDisplay(type: EventType): string {
  return titleCase(type.replace(/_/g, " "));
}

export function getRoleDisplay(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    platform_owner: "Platform Owner",
    org_owner: "Organization Owner",
    org_user: "Organization User",
    customer: "Customer",
  };
  return displayNames[role] || titleCase(role.replace(/_/g, " "));
}

// ============================================================================
// Color Utilities
// ============================================================================

export function getDimensionColor(dimension: Dimension): string {
  const colors: Record<Dimension, string> = {
    groups: "blue",
    people: "purple",
    things: "green",
    connections: "orange",
    events: "red",
    knowledge: "indigo",
  };
  return colors[dimension];
}

export function getThingTypeColor(type: ThingType): string {
  const colors: Record<ThingType, string> = {
    creator: "purple",
    user: "blue",
    agent: "indigo",
    content: "green",
    course: "emerald",
    lesson: "teal",
    video: "cyan",
    quiz: "sky",
    token: "amber",
    nft: "orange",
    product: "lime",
    service: "yellow",
    post: "pink",
    comment: "rose",
    file: "slate",
    folder: "gray",
    project: "violet",
    task: "fuchsia",
    note: "purple",
    bookmark: "indigo",
    subscription: "blue",
    payment: "green",
    invoice: "emerald",
    transaction: "teal",
    wallet: "cyan",
    organization: "sky",
    team: "amber",
    role: "orange",
    permission: "red",
    webhook: "pink",
    integration: "rose",
    api_key: "slate",
  };
  return colors[type] || "gray";
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    platform_owner: "red",
    org_owner: "orange",
    org_user: "blue",
    customer: "green",
  };
  return colors[role];
}

// ============================================================================
// Icon Utilities
// ============================================================================

export function getThingTypeIcon(type: ThingType): string {
  const icons: Record<ThingType, string> = {
    creator: "👤",
    user: "👥",
    agent: "🤖",
    content: "📄",
    course: "📚",
    lesson: "📖",
    video: "🎥",
    quiz: "❓",
    token: "🪙",
    nft: "🖼️",
    product: "🛍️",
    service: "⚙️",
    post: "📝",
    comment: "💬",
    file: "📎",
    folder: "📁",
    project: "🗂️",
    task: "✅",
    note: "📌",
    bookmark: "🔖",
    subscription: "🔄",
    payment: "💳",
    invoice: "🧾",
    transaction: "💸",
    wallet: "👛",
    organization: "🏢",
    team: "👥",
    role: "🎭",
    permission: "🔒",
    webhook: "🔔",
    integration: "🔌",
    api_key: "🔑",
  };
  return icons[type] || "📦";
}

export function getDimensionIcon(dimension: Dimension): string {
  const icons: Record<Dimension, string> = {
    groups: "🏢",
    people: "👥",
    things: "📦",
    connections: "🔗",
    events: "📅",
    knowledge: "🧠",
  };
  return icons[dimension];
}

// ============================================================================
// Number Utilities
// ============================================================================

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function abbreviateNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

// ============================================================================
// Array Utilities
// ============================================================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const group = String(item[key]);
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================================
// Validation Utilities
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidGroupId(id: string): boolean {
  return id.length > 0 && id.startsWith("g_");
}

export function isValidThingId(id: string): boolean {
  return id.length > 0 && id.startsWith("t_");
}

// ============================================================================
// ID Utilities
// ============================================================================

export function generateId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

export function extractIdType(id: string): "group" | "thing" | "connection" | "event" | "knowledge" | "unknown" {
  if (id.startsWith("g_")) return "group";
  if (id.startsWith("t_")) return "thing";
  if (id.startsWith("c_")) return "connection";
  if (id.startsWith("e_")) return "event";
  if (id.startsWith("k_")) return "knowledge";
  return "unknown";
}
