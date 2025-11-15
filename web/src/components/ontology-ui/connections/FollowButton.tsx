/**
 * FollowButton Component
 *
 * Button for follow/unfollow actions
 * Part of CONNECTIONS dimension (ontology-ui)
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, UserPlus } from "lucide-react";
import type { Thing } from "../types";
import { cn } from "../utils";

export interface FollowButtonProps {
  thing: Thing;
  isFollowing: boolean;
  onFollow?: (thingId: string) => void | Promise<void>;
  onUnfollow?: (thingId: string) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function FollowButton({
  thing,
  isFollowing: initialFollowing,
  onFollow,
  onUnfollow,
  disabled = false,
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      if (isFollowing) {
        await onUnfollow?.(thing._id);
        setIsFollowing(false);
      } else {
        await onFollow?.(thing._id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Follow/unfollow error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Loading...";
    if (isFollowing && isHovered) return "Unfollow";
    if (isFollowing) return "Following";
    return "Follow";
  };

  const getButtonVariant = () => {
    if (isFollowing && isHovered) return "outline" as const;
    if (isFollowing) return "secondary" as const;
    return "default" as const;
  };

  return (
    <Button
      variant={getButtonVariant()}
      size="sm"
      disabled={disabled || isLoading}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "transition-all duration-200",
        isFollowing && isHovered && "text-destructive hover:text-destructive",
        className
      )}
      aria-label={isFollowing ? "Unfollow" : "Follow"}
    >
      {isFollowing ? (
        <Check className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      <span className="min-w-[70px] text-center">{getButtonText()}</span>
    </Button>
  );
}
