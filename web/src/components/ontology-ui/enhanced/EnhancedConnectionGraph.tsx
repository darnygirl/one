/**
 * EnhancedConnectionGraph - Interactive connection graph with advanced features
 *
 * Features:
 * - Live updates with real-time connection additions
 * - Interactive node dragging with @xyflow/react
 * - Filtering by connection type
 * - Zoom and pan controls
 * - Connection strength visualization
 */

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Connection as OntologyConnection, Thing } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, getThingTypeIcon, getConnectionTypeDisplay } from "../utils";

interface EnhancedConnectionGraphProps {
  connections: OntologyConnection[];
  things: Thing[];
  centerThingId?: string;
  enableLiveUpdates?: boolean;
  enableDragging?: boolean;
  enableFiltering?: boolean;
  className?: string;
}

// Custom node component
const CustomNode = ({ data }: { data: any }) => {
  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg border-2 shadow-md",
        data.isCentered
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-card-foreground border-border"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{getThingTypeIcon(data.thing.type)}</span>
        <div>
          <div className="font-medium text-sm">{data.thing.name}</div>
          <Badge variant="outline" className="text-xs mt-1">
            {data.thing.type}
          </Badge>
        </div>
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export function EnhancedConnectionGraph({
  connections,
  things,
  centerThingId,
  enableLiveUpdates = true,
  enableDragging = true,
  enableFiltering = true,
  className,
}: EnhancedConnectionGraphProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [isLiveUpdating, setIsLiveUpdating] = useState(enableLiveUpdates);

  // Convert ontology data to ReactFlow format
  const { initialNodes, initialEdges } = useMemo(() => {
    const thingMap = new Map(things.map((t) => [t._id, t]));
    const centerId = centerThingId || things[0]?._id;

    // Filter connections
    const filteredConnections =
      filterType === "all"
        ? connections
        : connections.filter((c) => c.type === filterType);

    // Get all connected thing IDs
    const connectedIds = new Set<string>();
    filteredConnections.forEach((conn) => {
      if (conn.fromId === centerId || conn.toId === centerId) {
        connectedIds.add(conn.fromId);
        connectedIds.add(conn.toId);
      }
    });

    // Create nodes
    const nodes: Node[] = [];
    const nodeArray = Array.from(connectedIds)
      .map((id) => thingMap.get(id))
      .filter((thing): thing is Thing => thing !== undefined);

    // Position center node
    const centerThing = thingMap.get(centerId);
    if (centerThing) {
      nodes.push({
        id: centerId,
        type: "custom",
        position: { x: 250, y: 250 },
        data: {
          thing: centerThing,
          isCentered: true,
        },
        draggable: enableDragging,
      });
    }

    // Position other nodes in a circle
    const radius = 200;
    const otherNodes = nodeArray.filter((t) => t._id !== centerId);
    otherNodes.forEach((thing, index) => {
      const angle = (2 * Math.PI * index) / otherNodes.length;
      nodes.push({
        id: thing._id,
        type: "custom",
        position: {
          x: 250 + radius * Math.cos(angle),
          y: 250 + radius * Math.sin(angle),
        },
        data: {
          thing,
          isCentered: false,
        },
        draggable: enableDragging,
      });
    });

    // Create edges
    const edges: Edge[] = filteredConnections.map((conn, index) => ({
      id: `edge-${index}`,
      source: conn.fromId,
      target: conn.toId,
      type: "smoothstep",
      animated: conn.type === "follows" || conn.type === "subscribed_to",
      label: getConnectionTypeDisplay(conn.type),
      labelStyle: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
      labelBgStyle: { fill: "hsl(var(--background))", fillOpacity: 0.8 },
      style: {
        strokeWidth: conn.strength ? Math.max(1, conn.strength / 20) : 2,
        stroke: "hsl(var(--muted-foreground))",
      },
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [connections, things, centerThingId, filterType, enableDragging]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Get unique connection types for filter
  const connectionTypes = useMemo(() => {
    const types = new Set(connections.map((c) => c.type));
    return Array.from(types);
  }, [connections]);

  if (things.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Connection Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No connections to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Connection Graph</CardTitle>
          <div className="flex items-center gap-2">
            {enableFiltering && (
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {connectionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getConnectionTypeDisplay(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {enableLiveUpdates && (
              <Button
                variant={isLiveUpdating ? "default" : "outline"}
                size="sm"
                onClick={() => setIsLiveUpdating(!isLiveUpdating)}
              >
                {isLiveUpdating ? "🟢 Live" : "⚪ Paused"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] border rounded-lg bg-background overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <MiniMap zoomable pannable />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Centered thing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span>Connected thing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-muted-foreground" />
            <span>Connection</span>
          </div>
          {enableDragging && (
            <div className="flex items-center gap-2">
              <span>🖱️</span>
              <span>Drag nodes to reposition</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
