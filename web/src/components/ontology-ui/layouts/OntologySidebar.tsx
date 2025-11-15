/**
 * OntologySidebar - Sidebar with dimension navigation
 *
 * Collapsible sidebar featuring:
 * - Dimension navigation
 * - User profile section
 * - Group selector
 * - Open/closed states
 */

import { useState } from "react";
import type { Dimension, Group, Person } from "../types";
import { DIMENSIONS } from "../types";
import { getDimensionIcon, getDimensionColor, cn } from "../utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DimensionSwitcher } from "./DimensionSwitcher";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

interface OntologySidebarProps {
  currentDimension: Dimension;
  currentGroup?: Group;
  currentUser?: Person;
  onDimensionChange?: (dimension: Dimension) => void;
  className?: string;
}

export function OntologySidebar({
  currentDimension,
  currentGroup,
  currentUser,
  onDimensionChange,
  className,
}: OntologySidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const dimensions = Object.keys(DIMENSIONS) as Dimension[];

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r bg-background transition-all duration-300",
        isOpen ? "w-64" : "w-16",
        className
      )}
    >
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-4 border-b">
        {isOpen ? (
          <>
            <h2 className="font-semibold text-lg">Ontology</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Collapse sidebar</span>
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="h-8 w-8 mx-auto"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Expand sidebar</span>
          </Button>
        )}
      </div>

      {/* User profile section */}
      {currentUser && (
        <>
          <div className="p-4">
            {isOpen ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold">
                      {currentUser.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="w-full justify-center">
                  {currentUser.role}
                </Badge>
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-lg font-semibold">
                  {currentUser.name[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Group selector */}
      {currentGroup && isOpen && (
        <>
          <div className="p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Current Group
              </p>
              <div className="flex items-center gap-2 p-2 rounded bg-accent">
                <span className="text-lg">🏢</span>
                <span className="font-medium truncate">{currentGroup.name}</span>
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Dimension navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {isOpen ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Dimensions
            </p>
            {dimensions.map((dimension) => {
              const meta = DIMENSIONS[dimension];
              const isActive = currentDimension === dimension;
              const color = getDimensionColor(dimension);
              const icon = getDimensionIcon(dimension);

              return (
                <Button
                  key={dimension}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-colors",
                    isActive &&
                      `bg-${color}-100 dark:bg-${color}-950 text-${color}-700 dark:text-${color}-300`
                  )}
                  onClick={() => onDimensionChange?.(dimension)}
                >
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{meta.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {meta.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className={cn("h-2 w-2 rounded-full", `bg-${color}-500`)} />
                  )}
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {dimensions.map((dimension) => {
              const isActive = currentDimension === dimension;
              const color = getDimensionColor(dimension);
              const icon = getDimensionIcon(dimension);

              return (
                <Button
                  key={dimension}
                  variant={isActive ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "w-full h-12 transition-colors",
                    isActive &&
                      `bg-${color}-100 dark:bg-${color}-950 text-${color}-700 dark:text-${color}-300`
                  )}
                  onClick={() => onDimensionChange?.(dimension)}
                  title={DIMENSIONS[dimension].name}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="sr-only">{DIMENSIONS[dimension].name}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with dimension switcher (when open) */}
      {isOpen && (
        <>
          <Separator />
          <div className="p-4">
            <DimensionSwitcher
              value={currentDimension}
              onChange={onDimensionChange}
              className="w-full"
            />
          </div>
        </>
      )}
    </aside>
  );
}
