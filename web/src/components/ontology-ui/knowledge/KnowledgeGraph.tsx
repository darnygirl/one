/**
 * KnowledgeGraph Component
 *
 * Visual knowledge graph showing things, connections, and labels
 * Part of the KNOWLEDGE dimension
 */

import { useEffect, useRef, useState } from "react";
import type { Thing, Connection, Label } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KnowledgeGraphProps {
  things: Thing[];
  connections: Connection[];
  labels: Label[];
  centerThing?: Thing;
  className?: string;
}

interface Node {
  id: string;
  x: number;
  y: number;
  radius: number;
  thing: Thing;
  labels: Label[];
  color: string;
}

interface Edge {
  from: string;
  to: string;
  connection: Connection;
}

// Label category colors
const CATEGORY_COLORS: Record<string, string> = {
  product: "#3b82f6",     // blue
  course: "#8b5cf6",      // purple
  user: "#10b981",        // green
  content: "#f59e0b",     // amber
  agent: "#ef4444",       // red
  token: "#06b6d4",       // cyan
  default: "#6b7280",     // gray
};

export function KnowledgeGraph({
  things,
  connections,
  labels,
  centerThing,
  className = ""
}: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Build graph data
  const nodes: Node[] = things.map((thing, index) => {
    const thingLabels = labels.filter(l => l.thingId === thing._id);
    const primaryLabel = thingLabels[0];
    const color = primaryLabel?.category
      ? CATEGORY_COLORS[primaryLabel.category] || CATEGORY_COLORS.default
      : CATEGORY_COLORS[thing.type] || CATEGORY_COLORS.default;

    // Simple circular layout
    const angle = (index / things.length) * 2 * Math.PI;
    const radius = 150;

    return {
      id: thing._id,
      x: 300 + radius * Math.cos(angle),
      y: 200 + radius * Math.sin(angle),
      radius: centerThing?._id === thing._id ? 20 : 12,
      thing,
      labels: thingLabels,
      color,
    };
  });

  const edges: Edge[] = connections.map(conn => ({
    from: conn.fromId,
    to: conn.toId,
    connection: conn,
  }));

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply zoom and pan
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw edges (connections)
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);

      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = edge.connection.strength ? edge.connection.strength / 50 : 1;
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
        const arrowSize = 8;
        ctx.beginPath();
        ctx.moveTo(
          toNode.x - toNode.radius * Math.cos(angle),
          toNode.y - toNode.radius * Math.sin(angle)
        );
        ctx.lineTo(
          toNode.x - toNode.radius * Math.cos(angle) - arrowSize * Math.cos(angle - Math.PI / 6),
          toNode.y - toNode.radius * Math.sin(angle) - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          toNode.x - toNode.radius * Math.cos(angle) - arrowSize * Math.cos(angle + Math.PI / 6),
          toNode.y - toNode.radius * Math.sin(angle) - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = "#e5e7eb";
        ctx.fill();
      }
    });

    // Draw nodes (things)
    nodes.forEach(node => {
      const isHovered = hoveredNode?.id === node.id;
      const isCentered = centerThing?._id === node.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();

      if (isHovered || isCentered) {
        ctx.strokeStyle = isCentered ? "#fbbf24" : "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = "#1f2937";
      ctx.font = isHovered ? "bold 12px sans-serif" : "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        node.thing.name.length > 20
          ? node.thing.name.slice(0, 17) + "..."
          : node.thing.name,
        node.x,
        node.y + node.radius + 15
      );

      // Show labels on hover
      if (isHovered && node.labels.length > 0) {
        ctx.fillStyle = "#6b7280";
        ctx.font = "10px sans-serif";
        node.labels.slice(0, 2).forEach((label, idx) => {
          ctx.fillText(
            label.label,
            node.x,
            node.y + node.radius + 30 + (idx * 12)
          );
        });
      }
    });

    ctx.restore();
  }, [nodes, edges, zoom, pan, hoveredNode, centerThing]);

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan({ x: pan.x + dx, y: pan.y + dy });
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const hovered = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });

    setHoveredNode(hovered || null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Knowledge Graph
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              title="Reset view"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{things.length} nodes</Badge>
          <Badge variant="secondary">{connections.length} edges</Badge>
          <Badge variant="secondary">{labels.length} labels</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="border rounded-lg bg-white dark:bg-gray-950 cursor-move"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* Hover tooltip */}
          {hoveredNode && (
            <div className="absolute top-2 left-2 bg-background border rounded-lg shadow-lg p-3 max-w-xs">
              <h4 className="font-medium text-sm mb-1">{hoveredNode.thing.name}</h4>
              {hoveredNode.thing.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {hoveredNode.thing.description}
                </p>
              )}
              {hoveredNode.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {hoveredNode.labels.slice(0, 3).map(label => (
                    <Badge key={label._id} variant="outline" className="text-xs">
                      {label.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 p-3 border rounded-lg bg-muted/50">
            <p className="text-xs font-medium mb-2">Graph Legend</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-yellow-400" />
                <span className="text-muted-foreground">Center node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-gray-300" />
                <span className="text-muted-foreground">Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Product</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">Course</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click and drag to pan • Use zoom controls to navigate
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
