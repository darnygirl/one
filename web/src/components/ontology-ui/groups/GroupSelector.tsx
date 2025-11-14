/**
 * GroupSelector Component
 *
 * Dropdown selector for choosing groups
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Group } from "../types";
import { cn } from "../utils";

export interface GroupSelectorProps {
  groups: Group[];
  value?: string;
  onChange?: (groupId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function GroupSelector({
  groups,
  value,
  onChange,
  placeholder = "Select a group",
  disabled = false,
  className,
}: GroupSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) => (
          <SelectItem key={group._id} value={group._id}>
            <div className="flex items-center gap-2">
              <span>🏢</span>
              <span>{group.name}</span>
              {group.parentGroupId && (
                <span className="text-xs text-muted-foreground">(nested)</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
