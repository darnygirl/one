/**
 * EventTypeSelector Component
 *
 * Helper component for selecting event types
 */

import type { EventType } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getEventTypeDisplay } from "../utils";

interface EventTypeSelectorProps {
  value?: EventType;
  onValueChange?: (value: EventType) => void;
  placeholder?: string;
  showBadge?: boolean;
}

// All available event types
const EVENT_TYPES: EventType[] = [
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

// Categorize event types for better organization
const EVENT_CATEGORIES: Record<string, EventType[]> = {
  "Content": ["created", "updated", "deleted", "uploaded", "downloaded", "viewed"],
  "Social": ["followed", "unfollowed", "liked", "unliked", "commented", "shared", "tagged", "untagged"],
  "Learning": ["enrolled", "started", "paused", "resumed", "stopped", "completed"],
  "Workflow": ["submitted", "approved", "rejected"],
  "Team": ["invited", "joined", "left", "promoted", "demoted"],
  "Security": ["logged_in", "logged_out", "failed_login", "password_reset", "email_verified", "banned", "unbanned"],
  "Profile": ["profile_updated", "settings_changed"],
  "Financial": ["purchased", "payment_received", "payment_failed", "refund_issued"],
  "Subscription": ["subscription_started", "subscription_renewed", "subscription_cancelled"],
  "Tokens": ["token_minted", "token_transferred", "token_burned"],
};

export function EventTypeSelector({
  value,
  onValueChange,
  placeholder = "Select event type...",
  showBadge = true
}: EventTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {value && (
            <div className="flex items-center gap-2">
              <span>{getEventTypeDisplay(value)}</span>
              {showBadge && (
                <Badge variant="outline" className="font-mono text-xs">
                  {value}
                </Badge>
              )}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {Object.entries(EVENT_CATEGORIES).map(([category, types]) => (
          <div key={category}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {category}
            </div>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center gap-2">
                  <span>{getEventTypeDisplay(type)}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {type}
                  </span>
                </div>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
