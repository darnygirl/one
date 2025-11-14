/**
 * NetworkGraph - D3/Canvas network visualization
 *
 * Interactive force-directed graph showing connections between things
 * Features:
 * - Canvas-based rendering for performance
 * - Force simulation for natural layout
 * - Zoom and pan support
 * - Node click events
 * - Connection strength visualization
 */

import React, { useRef, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Connection, Thing } from "../types";
import { getThingTypeIcon, cn } from "../utils";

interface NetworkGraphProps {
  connections: Connection[];
  things: Thing[];
  interactive?: boolean;
  onNodeClick?: (thing: Thing) => void;
  className?: string;
}

interface Node {
  id: string;
  thing: Thing;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Edge {
  source: Node;
  target: Node;
  connection: Connection;
}

export function NetworkGraph({
  connections,
  things,
  interactive = true,
  onNodeClick,
  className,
}: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  // Initialize nodes and edges
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create nodes
    const nodeMap = new Map<string, Node>();
    things.forEach((thing) => {
      nodeMap.set(thing._id, {
        id: thing._id,
        thing,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
        radius: 20,
      });
    });

    // Create edges
    const edgeList: Edge[] = [];
    connections.forEach((conn) => {
      const source = nodeMap.get(conn.fromId);
      const target = nodeMap.get(conn.toId);
      if (source && target) {
        edgeList.push({ source, target, connection: conn });
      }
    });

    setNodes(Array.from(nodeMap.values()));
    setEdges(edgeList);
  }, [connections, things]);

  // Force simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulate = () => {
      // Apply forces
      nodes.forEach((node) => {
        // Reset forces
        node.vx *= 0.9; // Damping
        node.vy *= 0.9;

        // Centering force
        const centerX = (canvasRef.current?.width ?? 800) / 2;
        const centerY = (canvasRef.current?.height ?? 600) / 2;
        node.vx += (centerX - node.x) * 0.001;
        node.vy += (centerY - node.y) * 0.001;

        // Repulsion between nodes
        nodes.forEach((other) => {
          if (node === other) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 200 && distance > 0) {
            const force = -100 / (distance * distance);
            node.vx += (dx / distance) * force;
            node.vy += (dy / distance) * force;
          }
        });
      });

      // Spring force for edges
      edges.forEach(({ source, target, connection }) => {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetDistance = 150;
        const strength = (connection.strength ?? 50) / 100;

        if (distance > 0) {
          const force = (distance - targetDistance) * 0.01 * strength;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          source.vx += fx;
          source.vy += fy;
          target.vx -= fx;
          target.vy -= fy;
        }
      });

      // Update positions
      nodes.forEach((node) => {
        if (node !== dragNode) {
          node.x += node.vx;
          node.y += node.vy;

          // Boundary constraints
          const canvas = canvasRef.current;
          if (canvas) {
            node.x = Math.max(node.radius, Math.min(canvas.width - node.radius, node.x));
            node.y = Math.max(node.radius, Math.min(canvas.height - node.radius, node.y));
          }
        }
      });

      setNodes([...nodes]);
      animationFrameRef.current = requestAnimationFrame(simulate);
    };

    animationFrameRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes, edges, dragNode]);

  // Render to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transforms
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw edges
    edges.forEach(({ source, target, connection }) => {
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);

      // Opacity based on strength
      const opacity = (connection.strength ?? 50) / 100;
      ctx.strokeStyle = `rgba(156, 163, 175, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Arrow
      const angle = Math.atan2(target.y - source.y, target.x - source.x);
      const arrowX = target.x - Math.cos(angle) * target.radius;
      const arrowY = target.y - Math.sin(angle) * target.radius;

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - 10 * Math.cos(angle - Math.PI / 6),
        arrowY - 10 * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowX - 10 * Math.cos(angle + Math.PI / 6),
        arrowY - 10 * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = `rgba(156, 163, 175, ${opacity})`;
      ctx.fill();
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isHovered = hoveredNode === node;

      // Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "#3b82f6" : "#6366f1";
      ctx.fill();

      ctx.strokeStyle = isHovered ? "#1d4ed8" : "#4f46e5";
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.stroke();

      // Icon (emoji)
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.fillText(getThingTypeIcon(node.thing.type), node.x, node.y);

      // Label
      if (isHovered) {
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "#1f2937";
        ctx.fillText(node.thing.name, node.x, node.y + node.radius + 15);
      }
    });

    ctx.restore();
  }, [nodes, edges, hoveredNode, zoom, pan]);

  // Mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (isDragging && dragNode) {
      dragNode.x = x;
      dragNode.y = y;
      dragNode.vx = 0;
      dragNode.vy = 0;
      return;
    }

    // Check hover
    const hovered = nodes.find((node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    setHoveredNode(hovered || null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !hoveredNode) return;

    setIsDragging(true);
    setDragNode(hoveredNode);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragNode(null);
  };

  const handleClick = () => {
    if (hoveredNode && onNodeClick) {
      onNodeClick(hoveredNode.thing);
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Network Graph</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              +
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              −
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border rounded-lg w-full bg-gray-50 dark:bg-gray-900"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          style={{ cursor: interactive ? (hoveredNode ? "pointer" : "default") : "default" }}
        />

        {hoveredNode && (
          <div className="mt-4 p-3 bg-secondary rounded-lg">
            <p className="text-sm font-medium">{hoveredNode.thing.name}</p>
            <p className="text-xs text-muted-foreground">{hoveredNode.thing.type}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
