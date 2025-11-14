/**
 * CollaborativeWhiteboard - Streaming Component (Cycle 25)
 *
 * Multi-user whiteboard with real-time cursor tracking and drawing
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  Square,
  Circle as CircleIcon,
  Type,
  Image as ImageIcon,
  Eraser,
  Undo,
  Redo,
  Download,
  Trash2,
  MousePointer,
} from "lucide-react";

export type DrawingTool =
  | "pen"
  | "rectangle"
  | "circle"
  | "text"
  | "image"
  | "eraser"
  | "select";

export interface DrawingElement {
  id: string;
  type: DrawingTool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  points?: Array<{ x: number; y: number }>;
  userId: string;
}

export interface Cursor {
  userId: string;
  userName: string;
  userColor: string;
  userAvatar?: string;
  x: number;
  y: number;
}

export interface CollaborativeWhiteboardProps {
  elements?: DrawingElement[];
  cursors?: Cursor[];
  currentUserId: string;
  currentUserName: string;
  currentUserColor?: string;
  onElementAdd?: (element: DrawingElement) => void;
  onElementUpdate?: (element: DrawingElement) => void;
  onElementDelete?: (elementId: string) => void;
  onCursorMove?: (x: number, y: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onExport?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

export function CollaborativeWhiteboard({
  elements = [],
  cursors = [],
  currentUserId,
  currentUserName,
  currentUserColor = "#3b82f6",
  onElementAdd,
  onElementUpdate,
  onElementDelete,
  onCursorMove,
  onUndo,
  onRedo,
  onClear,
  onExport,
  canUndo = false,
  canRedo = false,
  className,
}: CollaborativeWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<DrawingTool>("pen");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);

  // Draw elements on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach((element) => {
      drawElement(ctx, element);
    });

    // Draw current element being created
    if (currentElement) {
      drawElement(ctx, currentElement);
    }
  }, [elements, currentElement]);

  // Draw a single element
  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (element.type) {
      case "pen":
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;

      case "rectangle":
        if (element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        break;

      case "circle":
        if (element.radius) {
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case "text":
        if (element.text) {
          ctx.font = `${element.strokeWidth * 10}px sans-serif`;
          ctx.fillStyle = element.color;
          ctx.fillText(element.text, element.x, element.y);
        }
        break;

      case "eraser":
        if (element.points && element.points.length > 1) {
          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
        }
        break;
    }
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    const newElement: DrawingElement = {
      id: `${Date.now()}-${Math.random()}`,
      type: selectedTool,
      x,
      y,
      color,
      strokeWidth,
      userId: currentUserId,
      points: selectedTool === "pen" || selectedTool === "eraser" ? [{ x, y }] : undefined,
    };

    setCurrentElement(newElement);
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update cursor position
    onCursorMove?.(x, y);

    if (!isDrawing || !currentElement) return;

    // Update current element based on tool
    switch (selectedTool) {
      case "pen":
      case "eraser":
        setCurrentElement({
          ...currentElement,
          points: [...(currentElement.points || []), { x, y }],
        });
        break;

      case "rectangle":
        setCurrentElement({
          ...currentElement,
          width: x - currentElement.x,
          height: y - currentElement.y,
        });
        break;

      case "circle":
        const radius = Math.sqrt(
          Math.pow(x - currentElement.x, 2) + Math.pow(y - currentElement.y, 2)
        );
        setCurrentElement({
          ...currentElement,
          radius,
        });
        break;
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (currentElement) {
      onElementAdd?.(currentElement);
      setCurrentElement(null);
    }
    setIsDrawing(false);
  };

  // Export canvas as image
  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `whiteboard-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const tools: Array<{ tool: DrawingTool; icon: React.ReactNode; label: string }> = [
    { tool: "select", icon: <MousePointer className="h-4 w-4" />, label: "Select" },
    { tool: "pen", icon: <Pencil className="h-4 w-4" />, label: "Pen" },
    { tool: "rectangle", icon: <Square className="h-4 w-4" />, label: "Rectangle" },
    { tool: "circle", icon: <CircleIcon className="h-4 w-4" />, label: "Circle" },
    { tool: "text", icon: <Type className="h-4 w-4" />, label: "Text" },
    { tool: "image", icon: <ImageIcon className="h-4 w-4" />, label: "Image" },
    { tool: "eraser", icon: <Eraser className="h-4 w-4" />, label: "Eraser" },
  ];

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
  ];

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Tools */}
          <div className="flex items-center gap-2">
            {tools.map(({ tool, icon, label }) => (
              <Button
                key={tool}
                variant={selectedTool === tool ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTool(tool)}
                title={label}
              >
                {icon}
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Colors */}
          <div className="flex items-center gap-2">
            {colors.map((c) => (
              <button
                key={c}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                  color === c ? "border-primary scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Stroke Width */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Width:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm w-8">{strokeWidth}px</span>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              title="Export"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              title="Clear"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Canvas Container */}
      <div className="relative flex-1 bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Collaborative Cursors */}
        <AnimatePresence>
          {cursors
            .filter((cursor) => cursor.userId !== currentUserId)
            .map((cursor) => (
              <motion.div
                key={cursor.userId}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                style={{
                  position: "absolute",
                  left: cursor.x,
                  top: cursor.y,
                  pointerEvents: "none",
                }}
              >
                {/* Cursor Pointer */}
                <div
                  className="w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: cursor.userColor }}
                />

                {/* User Label */}
                <Badge
                  className="ml-2 mt-1"
                  style={{
                    backgroundColor: cursor.userColor,
                    color: "white",
                  }}
                >
                  {cursor.userName}
                </Badge>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Active Users */}
      <div className="flex items-center gap-2 mt-4 p-4 border rounded-lg">
        <span className="text-sm text-muted-foreground">Active users:</span>
        <div className="flex -space-x-2">
          {/* Current user */}
          <Avatar className="h-8 w-8 border-2 border-background">
            <AvatarFallback style={{ backgroundColor: currentUserColor }}>
              {currentUserName[0]}
            </AvatarFallback>
          </Avatar>

          {/* Other users */}
          {cursors
            .filter((cursor) => cursor.userId !== currentUserId)
            .map((cursor) => (
              <Avatar
                key={cursor.userId}
                className="h-8 w-8 border-2 border-background"
              >
                {cursor.userAvatar ? (
                  <AvatarImage src={cursor.userAvatar} />
                ) : (
                  <AvatarFallback style={{ backgroundColor: cursor.userColor }}>
                    {cursor.userName[0]}
                  </AvatarFallback>
                )}
              </Avatar>
            ))}
        </div>
      </div>
    </div>
  );
}
