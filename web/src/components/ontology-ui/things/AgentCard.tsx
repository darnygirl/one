/**
 * AgentCard Component
 *
 * Display AI agent information with status and capabilities
 * Part of THINGS dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Thing, CardProps } from "../types";
import { cn } from "../utils";

export interface AgentCardProps extends CardProps {
  agent: Thing;
  status?: "active" | "idle" | "offline";
}

export function AgentCard({
  agent,
  status,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: AgentCardProps) {
  const agentStatus = status ?? (agent.metadata?.status as "active" | "idle" | "offline") ?? "idle";
  const capabilities = agent.metadata?.capabilities as string[] | undefined;
  const model = agent.metadata?.model as string;
  const tasks = agent.metadata?.tasks as number;

  const statusColors: Record<string, string> = {
    active: "bg-green-500 text-white",
    idle: "bg-yellow-500 text-white",
    offline: "bg-gray-500 text-white",
  };

  const statusIcons: Record<string, string> = {
    active: "🟢",
    idle: "🟡",
    offline: "⚫",
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
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="line-clamp-1">{agent.name}</span>
            </CardTitle>
            {agent.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {agent.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span>{statusIcons[agentStatus]}</span>
            <Badge className={statusColors[agentStatus]}>
              {agentStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {model && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Model:</span>
            <code className="text-xs font-mono bg-secondary px-2 py-1 rounded">
              {model}
            </code>
          </div>
        )}

        {tasks !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tasks Completed</span>
            <span className="font-bold">{tasks}</span>
          </div>
        )}

        {capabilities && capabilities.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Capabilities</span>
            <div className="flex flex-wrap gap-1">
              {capabilities.slice(0, 6).map((capability, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {capability}
                </Badge>
              ))}
              {capabilities.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{capabilities.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {agent.metadata?.lastActive && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2">
            <span>⏱️</span>
            <span>Last active: {new Date(agent.metadata.lastActive as number).toLocaleString()}</span>
          </div>
        )}

        {interactive && (
          <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity border-t pt-2">
            View agent details →
          </div>
        )}
      </CardContent>
    </Card>
  );
}
