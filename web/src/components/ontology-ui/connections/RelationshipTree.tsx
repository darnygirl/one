/**
 * RelationshipTree Component
 *
 * Tree view of hierarchical relationships
 * Part of CONNECTIONS dimension (ontology-ui)
 */

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { Connection, Thing } from "../types";
import { cn, getConnectionTypeDisplay, getThingTypeIcon } from "../utils";

export interface RelationshipTreeProps {
  rootThing: Thing;
  connections: Connection[];
  things: Thing[];
  className?: string;
}

interface TreeNode {
  thing: Thing;
  children: TreeNode[];
  connection?: Connection;
}

function buildTree(
  rootThing: Thing,
  connections: Connection[],
  things: Thing[],
  visited: Set<string> = new Set()
): TreeNode {
  // Prevent infinite loops in circular relationships
  if (visited.has(rootThing._id)) {
    return { thing: rootThing, children: [] };
  }

  visited.add(rootThing._id);

  // Find all connections where this thing is the source
  const childConnections = connections.filter(
    (conn) =>
      conn.fromId === rootThing._id &&
      (conn.type === "parent_of" || conn.type === "owns" || conn.type === "created")
  );

  const children = childConnections
    .map((conn) => {
      const childThing = things.find((t) => t._id === conn.toId);
      if (!childThing) return null;

      return {
        thing: childThing,
        children: buildTree(childThing, connections, things, new Set(visited)).children,
        connection: conn,
      };
    })
    .filter((node): node is TreeNode => node !== null);

  return {
    thing: rootThing,
    children,
  };
}

function TreeNodeComponent({
  node,
  depth = 0,
}: {
  node: TreeNode;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent transition-colors",
          hasChildren && "cursor-pointer"
        )}
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          <button className="flex-shrink-0" aria-label={isExpanded ? "Collapse" : "Expand"}>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <span className="text-lg flex-shrink-0">{getThingTypeIcon(node.thing.type)}</span>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{node.thing.name}</div>
          {node.connection && (
            <div className="text-xs text-muted-foreground">
              {getConnectionTypeDisplay(node.connection.type)}
            </div>
          )}
        </div>

        {hasChildren && (
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {node.children.length} {node.children.length === 1 ? "child" : "children"}
          </span>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <TreeNodeComponent key={child.thing._id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function RelationshipTree({
  rootThing,
  connections,
  things,
  className,
}: RelationshipTreeProps) {
  const tree = buildTree(rootThing, connections, things);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🔗</span>
          <span>Relationship Tree</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <TreeNodeComponent node={tree} depth={0} />
      </CardContent>
    </Card>
  );
}
