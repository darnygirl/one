/**
 * OntologyHeader - Header with group/user context
 *
 * Displays logo, dimension switcher, group badge, user menu, and search trigger.
 * Responsive layout that adapts to mobile and desktop viewports.
 */

import type { Dimension, Group, Person } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { DimensionSwitcher } from "./DimensionSwitcher";
import { UserMenu } from "../people/UserMenu";
import { cn } from "../utils";

export interface OntologyHeaderProps {
  currentDimension: Dimension;
  currentGroup?: Group;
  currentUser?: Person;
  onDimensionChange?: (dimension: Dimension) => void;
  onSearchClick?: () => void;
  className?: string;
}

export function OntologyHeader({
  currentDimension,
  currentGroup,
  currentUser,
  onDimensionChange,
  onSearchClick,
  className,
}: OntologyHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left section: Logo + Dimension Switcher */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">
              ONE
            </div>
            <span className="hidden font-bold sm:inline-block">
              Platform
            </span>
          </a>

          {/* Dimension Switcher (hidden on mobile) */}
          <div className="hidden md:block">
            <DimensionSwitcher
              currentDimension={currentDimension}
              onDimensionChange={onDimensionChange}
            />
          </div>
        </div>

        {/* Center section: Group Badge (hidden on mobile) */}
        {currentGroup && (
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 px-2 py-1">
              <span className="text-xs">🏢</span>
              <span className="text-sm font-medium">{currentGroup.name}</span>
            </Badge>
          </div>
        )}

        {/* Right section: Search + User Menu */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchClick}
            className="hidden sm:flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">Search...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Mobile search icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            className="sm:hidden"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* User menu */}
          {currentUser && (
            <UserMenu
              user={currentUser}
              showName={false}
            />
          )}
        </div>
      </div>

      {/* Mobile dimension switcher */}
      <div className="md:hidden border-t px-4 py-2">
        <DimensionSwitcher
          currentDimension={currentDimension}
          onDimensionChange={onDimensionChange}
        />
      </div>
    </header>
  );
}
