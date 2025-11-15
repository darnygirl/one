/**
 * TeamCard Component
 *
 * Card for displaying team information with member avatars
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Group, Person, CardProps } from "../types";
import { cn, pluralize } from "../utils";

export interface TeamCardProps extends CardProps {
  team: Group;
  members: Person[];
  maxAvatars?: number;
  showMemberCount?: boolean;
  onViewTeam?: () => void;
}

export function TeamCard({
  team,
  members,
  maxAvatars = 3,
  showMemberCount = true,
  onViewTeam,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: TeamCardProps) {
  const visibleMembers = members.slice(0, maxAvatars);
  const remainingCount = Math.max(0, members.length - maxAvatars);

  const handleClick = () => {
    onClick?.();
    onViewTeam?.();
  };

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        interactive && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{team.name}</CardTitle>
            {team.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {team.description}
              </CardDescription>
            )}
          </div>
          {showMemberCount && (
            <Badge variant="secondary" className="ml-2">
              {pluralize(members.length, "member")}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Member Avatars */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {visibleMembers.map((member) => {
              const initials = member.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <Avatar
                  key={member._id}
                  className="h-8 w-8 border-2 border-background ring-2 ring-background transition-transform hover:scale-110 hover:z-10"
                  title={member.name}
                >
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              );
            })}

            {remainingCount > 0 && (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background"
                title={`${remainingCount} more member${remainingCount !== 1 ? "s" : ""}`}
              >
                +{remainingCount}
              </div>
            )}
          </div>

          {members.length === 0 && (
            <p className="text-sm text-muted-foreground">No members yet</p>
          )}
        </div>

        {/* Team Metadata */}
        {team.metadata && Object.keys(team.metadata).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {team.metadata.department && (
              <Badge variant="outline" className="text-xs">
                {team.metadata.department as string}
              </Badge>
            )}
            {team.metadata.location && (
              <Badge variant="outline" className="text-xs">
                📍 {team.metadata.location as string}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
