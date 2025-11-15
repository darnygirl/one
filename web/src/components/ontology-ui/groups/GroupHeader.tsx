/**
 * GroupHeader Component
 *
 * Header component with group branding
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GroupBreadcrumb } from "./GroupBreadcrumb";
import type { Group } from "../types";
import { cn } from "../utils";

export interface GroupHeaderProps {
  group: Group;
  breadcrumbGroups?: Group[];
  onBreadcrumbClick?: (group: Group) => void;
  onSettings?: () => void;
  onMembers?: () => void;
  showActions?: boolean;
  className?: string;
}

export function GroupHeader({
  group,
  breadcrumbGroups,
  onBreadcrumbClick,
  onSettings,
  onMembers,
  showActions = true,
  className,
}: GroupHeaderProps) {
  const logoUrl = group.metadata?.logo as string | undefined;
  const coverUrl = group.metadata?.cover as string | undefined;

  return (
    <div className={cn("border-b bg-card", className)}>
      {/* Cover Image */}
      {coverUrl && (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        {breadcrumbGroups && breadcrumbGroups.length > 0 && (
          <GroupBreadcrumb
            groups={breadcrumbGroups}
            onGroupClick={onBreadcrumbClick}
            className="mb-4"
          />
        )}

        {/* Header Content */}
        <div className="flex items-start gap-4">
          {/* Logo */}
          <Avatar className="h-16 w-16 border-2 border-background">
            <AvatarImage src={logoUrl} alt={group.name} />
            <AvatarFallback className="text-2xl">
              {group.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground">{group.description}</p>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              {onMembers && (
                <Button variant="outline" onClick={onMembers}>
                  <span className="mr-2">👥</span>
                  Members
                </Button>
              )}
              {onSettings && (
                <Button variant="outline" onClick={onSettings}>
                  <span className="mr-2">⚙️</span>
                  Settings
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
