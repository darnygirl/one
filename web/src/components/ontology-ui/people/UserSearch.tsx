/**
 * UserSearch Component
 *
 * Search component for finding users with keyboard navigation
 * Part of PEOPLE dimension (ontology-ui)
 */

import React, { useState, useMemo } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { UserAvatar } from "./UserAvatar";
import type { Person, SearchResult } from "../types";
import { cn, getRoleDisplay } from "../utils";

export interface UserSearchProps {
  users: Person[];
  onUserSelect?: (user: Person) => void;
  placeholder?: string;
  className?: string;
  groupByRole?: boolean;
  maxResults?: number;
}

export function UserSearch({
  users,
  onUserSelect,
  placeholder = "Search users...",
  className,
  groupByRole = false,
  maxResults = 50,
}: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users.slice(0, maxResults);
    }

    const query = searchQuery.toLowerCase();
    return users
      .filter((user) => {
        const nameMatch = user.name.toLowerCase().includes(query);
        const emailMatch = user.email?.toLowerCase().includes(query);
        const roleMatch = getRoleDisplay(user.role).toLowerCase().includes(query);
        return nameMatch || emailMatch || roleMatch;
      })
      .slice(0, maxResults);
  }, [users, searchQuery, maxResults]);

  // Group users by role if enabled
  const groupedUsers = useMemo(() => {
    if (!groupByRole) {
      return { all: filteredUsers };
    }

    return filteredUsers.reduce(
      (groups, user) => {
        const role = user.role;
        if (!groups[role]) {
          groups[role] = [];
        }
        groups[role].push(user);
        return groups;
      },
      {} as Record<string, Person[]>
    );
  }, [filteredUsers, groupByRole]);

  const handleUserSelect = (user: Person) => {
    onUserSelect?.(user);
    setSearchQuery(""); // Clear search after selection
  };

  return (
    <Command className={cn("rounded-lg border shadow-md", className)}>
      <CommandInput
        placeholder={placeholder}
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No users found.</CommandEmpty>

        {Object.entries(groupedUsers).map(([role, roleUsers]) => (
          <CommandGroup
            key={role}
            heading={groupByRole && role !== "all" ? getRoleDisplay(role as any) : undefined}
          >
            {roleUsers.map((user) => (
              <CommandItem
                key={user._id}
                value={user._id}
                onSelect={() => handleUserSelect(user)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <UserAvatar user={user} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.name}</div>
                  {user.email && (
                    <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                  )}
                </div>
                {!groupByRole && (
                  <div className="text-xs text-muted-foreground">{getRoleDisplay(user.role)}</div>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
