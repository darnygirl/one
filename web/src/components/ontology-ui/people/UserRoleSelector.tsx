/**
 * UserRoleSelector Component
 *
 * Dropdown for selecting user roles
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "../types";
import { getRoleDisplay } from "../utils";

export interface UserRoleSelectorProps {
  value?: UserRole;
  onChange?: (role: UserRole) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const USER_ROLES: UserRole[] = [
  "platform_owner",
  "org_owner",
  "org_user",
  "customer",
];

export function UserRoleSelector({
  value,
  onChange,
  disabled = false,
  placeholder = "Select a role...",
  className,
}: UserRoleSelectorProps) {
  const handleValueChange = (newValue: string) => {
    if (onChange && isUserRole(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {value ? getRoleDisplay(value) : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {USER_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {getRoleDisplay(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Type guard to ensure value is a valid UserRole
function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}
