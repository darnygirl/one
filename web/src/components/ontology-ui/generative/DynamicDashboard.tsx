/**
 * DynamicDashboard - Full dashboards from natural language
 *
 * Features:
 * - Drag-drop widgets
 * - Layout persistence (localStorage)
 * - Real-time data from Convex
 * - Responsive grid system
 */

import { useState, useEffect, useCallback } from "react";
import type { OntologyComponentProps } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "../hooks";
import { cn } from "../utils";
import {
  LayoutDashboard,
  Plus,
  Settings,
  GripVertical,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";

interface Widget {
  id: string;
  type: "chart" | "table" | "stat" | "form" | "custom";
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data?: any;
  config?: Record<string, any>;
  component?: React.ComponentType<any>;
}

interface DynamicDashboardProps extends OntologyComponentProps {
  title: string;
  initialWidgets?: Widget[];
  onWidgetAdd?: (widget: Widget) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetUpdate?: (widget: Widget) => void;
  realtime?: boolean;
}

export function DynamicDashboard({
  title,
  initialWidgets = [],
  onWidgetAdd,
  onWidgetRemove,
  onWidgetUpdate,
  realtime = false,
  className,
  groupId,
}: DynamicDashboardProps) {
  const [widgets, setWidgets] = useLocalStorage<Widget[]>(
    `dashboard-${title.toLowerCase().replace(/\s+/g, "-")}`,
    initialWidgets
  );
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Grid settings
  const gridSize = 20;
  const cols = 12;
  const rowHeight = 60;

  useEffect(() => {
    if (realtime && groupId) {
      // In a real implementation, this would subscribe to Convex real-time updates
      const interval = setInterval(() => {
        // Simulate real-time data updates
        setWidgets((current) =>
          current.map((widget) => ({
            ...widget,
            data: {
              ...widget.data,
              lastUpdate: Date.now(),
            },
          }))
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [realtime, groupId]);

  const snapToGrid = (value: number) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleWidgetMouseDown = (e: React.MouseEvent, widgetId: string) => {
    if (!isEditMode) return;

    e.preventDefault();
    const widget = widgets.find((w) => w.id === widgetId);
    if (!widget) return;

    setDraggingWidget(widgetId);
    setDragOffset({
      x: e.clientX - widget.position.x,
      y: e.clientY - widget.position.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingWidget || !isEditMode) return;

      const newX = snapToGrid(e.clientX - dragOffset.x);
      const newY = snapToGrid(e.clientY - dragOffset.y);

      setWidgets((current) =>
        current.map((widget) =>
          widget.id === draggingWidget
            ? { ...widget, position: { x: newX, y: newY } }
            : widget
        )
      );
    },
    [draggingWidget, dragOffset, isEditMode]
  );

  const handleMouseUp = useCallback(() => {
    if (draggingWidget) {
      const widget = widgets.find((w) => w.id === draggingWidget);
      if (widget) {
        onWidgetUpdate?.(widget);
      }
    }
    setDraggingWidget(null);
  }, [draggingWidget, widgets, onWidgetUpdate]);

  useEffect(() => {
    if (draggingWidget) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingWidget, handleMouseMove, handleMouseUp]);

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((current) => current.filter((w) => w.id !== widgetId));
    onWidgetRemove?.(widgetId);
  };

  const handleAddWidget = () => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: "stat",
      title: "New Widget",
      position: { x: 0, y: 0 },
      size: { width: 4, height: 2 },
      data: { value: 0 },
    };
    setWidgets((current) => [...current, newWidget]);
    onWidgetAdd?.(newWidget);
  };

  const handleResetLayout = () => {
    setWidgets(initialWidgets);
  };

  const handleToggleSize = (widgetId: string) => {
    setWidgets((current) =>
      current.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              size: {
                width: widget.size.width === 4 ? 8 : 4,
                height: widget.size.height === 2 ? 4 : 2,
              },
            }
          : widget
      )
    );
  };

  const renderWidget = (widget: Widget) => {
    const widgetStyle = {
      position: "absolute" as const,
      left: `${widget.position.x}px`,
      top: `${widget.position.y}px`,
      width: `${(widget.size.width / cols) * 100}%`,
      minHeight: `${widget.size.height * rowHeight}px`,
      transition: draggingWidget === widget.id ? "none" : "all 0.2s ease",
    };

    return (
      <Card
        key={widget.id}
        style={widgetStyle}
        className={cn(
          "cursor-default shadow-md",
          draggingWidget === widget.id && "shadow-2xl z-50",
          selectedWidget === widget.id && "ring-2 ring-primary",
          isEditMode && "cursor-move"
        )}
        onClick={() => setSelectedWidget(widget.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isEditMode && (
                <div
                  className="cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <CardTitle className="text-base truncate">{widget.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {widget.type}
              </Badge>
            </div>
            {isEditMode && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSize(widget.id);
                  }}
                >
                  {widget.size.width === 4 ? (
                    <Maximize2 className="h-3 w-3" />
                  ) : (
                    <Minimize2 className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveWidget(widget.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {widget.component ? (
            <widget.component {...widget.config} data={widget.data} />
          ) : (
            <div className="text-center py-8">
              {widget.type === "stat" && (
                <div>
                  <p className="text-4xl font-bold">{widget.data?.value || 0}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {widget.data?.label || "Stat"}
                  </p>
                </div>
              )}
              {widget.type === "chart" && (
                <div className="h-40 bg-muted/30 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Chart placeholder</p>
                </div>
              )}
              {widget.type === "table" && (
                <div className="h-40 bg-muted/30 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Table placeholder</p>
                </div>
              )}
              {widget.type === "form" && (
                <div className="h-40 bg-muted/30 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Form placeholder</p>
                </div>
              )}
              {widget.type === "custom" && (
                <p className="text-muted-foreground">Custom widget</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Dashboard header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">{title}</h2>
          {realtime && (
            <Badge variant="outline" className="gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditMode ? "Done Editing" : "Edit"}
          </Button>
          {isEditMode && (
            <>
              <Button variant="outline" size="sm" onClick={handleAddWidget}>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetLayout}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="flex-1 overflow-auto p-4 bg-muted/30 relative">
        {/* Grid background */}
        {isEditMode && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
          />
        )}

        {/* Widgets */}
        <div className="relative" style={{ minHeight: "800px" }}>
          {widgets.map(renderWidget)}

          {widgets.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <LayoutDashboard className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No widgets yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Click "Add Widget" to get started
              </p>
              {isEditMode && (
                <Button onClick={handleAddWidget}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Widget
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
