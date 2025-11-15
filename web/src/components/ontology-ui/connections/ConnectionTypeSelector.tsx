/**
 * ConnectionTypeSelector - Dropdown for selecting connection types
 *
 * Provides a categorized dropdown of all 25+ connection types
 * organized by category (Ownership, Social, Commerce, Organization).
 */

import type { ConnectionType } from "../types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getConnectionTypeDisplay } from "../utils";

export interface ConnectionTypeSelectorProps {
  value?: ConnectionType;
  onChange?: (value: ConnectionType) => void;
  disabled?: boolean;
  filter?: ConnectionType[];
  placeholder?: string;
  className?: string;
}

// Connection types organized by category
const CONNECTION_CATEGORIES = {
  Ownership: [
    "owns",
    "created",
  ] as ConnectionType[],

  Social: [
    "follows",
    "liked",
    "shared",
    "subscribed_to",
    "replied_to",
    "mentioned_in",
    "commented_on",
  ] as ConnectionType[],

  Commerce: [
    "purchased",
    "enrolled",
    "completed",
    "holds_tokens",
  ] as ConnectionType[],

  Organization: [
    "member_of",
    "assigned_to",
    "tagged_with",
  ] as ConnectionType[],

  Relationships: [
    "connected_to",
    "depends_on",
    "blocks",
    "duplicates",
    "relates_to",
    "parent_of",
    "child_of",
    "linked_to",
    "referenced_by",
  ] as ConnectionType[],
};

export function ConnectionTypeSelector({
  value,
  onChange,
  disabled = false,
  filter,
  placeholder = "Select connection type",
  className,
}: ConnectionTypeSelectorProps) {
  // Filter categories based on filter prop
  const filteredCategories = filter
    ? Object.entries(CONNECTION_CATEGORIES).reduce((acc, [category, types]) => {
        const filteredTypes = types.filter(type => filter.includes(type));
        if (filteredTypes.length > 0) {
          acc[category] = filteredTypes;
        }
        return acc;
      }, {} as Record<string, ConnectionType[]>)
    : CONNECTION_CATEGORIES;

  const handleValueChange = (newValue: string) => {
    onChange?.(newValue as ConnectionType);
  };

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {value ? getConnectionTypeDisplay(value) : placeholder}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {Object.entries(filteredCategories).map(([category, types]) => (
          <SelectGroup key={category}>
            <SelectLabel className="font-semibold text-xs uppercase text-muted-foreground">
              {category}
            </SelectLabel>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getConnectionIcon(type)}</span>
                  <span>{getConnectionTypeDisplay(type)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

// Helper function to get icon for connection type
function getConnectionIcon(type: ConnectionType): string {
  const icons: Record<ConnectionType, string> = {
    owns: "👑",
    created: "✨",
    follows: "👁️",
    purchased: "💳",
    enrolled: "📚",
    completed: "✅",
    holds_tokens: "🪙",
    member_of: "👥",
    assigned_to: "📌",
    tagged_with: "🏷️",
    commented_on: "💬",
    liked: "❤️",
    shared: "🔄",
    subscribed_to: "🔔",
    replied_to: "↩️",
    mentioned_in: "📢",
    connected_to: "🔗",
    depends_on: "⚠️",
    blocks: "🚫",
    duplicates: "📋",
    relates_to: "🔗",
    parent_of: "⬆️",
    child_of: "⬇️",
    linked_to: "🔗",
    referenced_by: "📎",
  };
  return icons[type] || "🔗";
}
