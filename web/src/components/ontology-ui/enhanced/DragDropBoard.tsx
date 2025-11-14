/**
 * DragDropBoard - Drag and drop component with @dnd-kit
 *
 * Features:
 * - @dnd-kit integration for smooth drag and drop
 * - Persistence with Effect.ts
 * - Multi-list support (Kanban-style)
 * - Undo/redo functionality
 * - Touch support for mobile
 */

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "../utils";
import { Effect } from "effect";

interface DragDropItem {
  id: string;
  content: React.ReactNode;
  listId: string;
  metadata?: Record<string, any>;
}

interface DragDropList {
  id: string;
  title: string;
  items: DragDropItem[];
  maxItems?: number;
}

interface DragDropBoardProps {
  lists: DragDropList[];
  onItemMove?: (itemId: string, fromListId: string, toListId: string, newIndex: number) => void;
  onListReorder?: (lists: DragDropList[]) => void;
  enableUndo?: boolean;
  persistKey?: string;
  className?: string;
}

// Sortable item component
function SortableItem({
  id,
  content,
  isDragging,
}: {
  id: string;
  content: React.ReactNode;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-3 bg-card border rounded-lg cursor-grab active:cursor-grabbing",
        "hover:shadow-md transition-shadow",
        isDragging && "opacity-50"
      )}
    >
      {content}
    </div>
  );
}

// History entry for undo/redo
interface HistoryEntry {
  lists: DragDropList[];
  timestamp: number;
}

export function DragDropBoard({
  lists: initialLists,
  onItemMove,
  onListReorder,
  enableUndo = true,
  persistKey,
  className,
}: DragDropBoardProps) {
  const [lists, setLists] = useState<DragDropList[]>(initialLists);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([{ lists: initialLists, timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get active item for drag overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    for (const list of lists) {
      const item = list.items.find((item) => item.id === activeId);
      if (item) return item;
    }
    return null;
  }, [activeId, lists]);

  // Save to history
  const saveToHistory = useCallback((newLists: DragDropList[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, { lists: newLists, timestamp: Date.now() }];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Persist to localStorage using Effect.ts
  const persistState = useCallback(
    (newLists: DragDropList[]) => {
      if (!persistKey) return;

      const persistEffect = Effect.tryPromise({
        try: async () => {
          localStorage.setItem(persistKey, JSON.stringify(newLists));
        },
        catch: (error) => ({
          _tag: "PersistError" as const,
          message: String(error),
        }),
      });

      Effect.runPromise(persistEffect).catch(console.error);
    },
    [persistKey]
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the lists containing the active and over items
    const activeList = lists.find((list) =>
      list.items.some((item) => item.id === activeId)
    );
    const overList = lists.find((list) =>
      list.items.some((item) => item.id === overId) || list.id === overId
    );

    if (!activeList || !overList) {
      setActiveId(null);
      return;
    }

    const newLists = lists.map((list) => {
      if (list.id === activeList.id && list.id === overList.id) {
        // Same list - reorder
        const oldIndex = list.items.findIndex((item) => item.id === activeId);
        const newIndex = list.items.findIndex((item) => item.id === overId);
        return {
          ...list,
          items: arrayMove(list.items, oldIndex, newIndex),
        };
      } else if (list.id === activeList.id) {
        // Remove from source list
        return {
          ...list,
          items: list.items.filter((item) => item.id !== activeId),
        };
      } else if (list.id === overList.id) {
        // Add to destination list
        const activeItem = activeList.items.find((item) => item.id === activeId);
        if (!activeItem) return list;

        const newItem = { ...activeItem, listId: list.id };
        const newIndex = list.items.findIndex((item) => item.id === overId);

        const newItems = [...list.items];
        newItems.splice(newIndex === -1 ? newItems.length : newIndex, 0, newItem);

        return {
          ...list,
          items: newItems,
        };
      }
      return list;
    });

    setLists(newLists);
    saveToHistory(newLists);
    persistState(newLists);

    if (activeList.id !== overList.id && onItemMove) {
      const newIndex = overList.items.findIndex((item) => item.id === overId);
      onItemMove(activeId, activeList.id, overList.id, newIndex);
    }

    setActiveId(null);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLists(history[newIndex].lists);
      persistState(history[newIndex].lists);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLists(history[newIndex].lists);
      persistState(history[newIndex].lists);
    }
  };

  const canUndo = enableUndo && historyIndex > 0;
  const canRedo = enableUndo && historyIndex < history.length - 1;

  return (
    <div className={cn("w-full", className)}>
      {/* Controls */}
      {enableUndo && (
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
          >
            ↶ Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
          >
            ↷ Redo
          </Button>
          <span className="text-xs text-muted-foreground ml-auto">
            {historyIndex + 1} / {history.length}
          </span>
        </div>
      )}

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {lists.map((list) => (
            <Card key={list.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{list.title}</CardTitle>
                  <Badge variant="secondary">
                    {list.items.length}
                    {list.maxItems && ` / ${list.maxItems}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-[200px]">
                <SortableContext
                  items={list.items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {list.items.map((item) => (
                      <SortableItem
                        key={item.id}
                        id={item.id}
                        content={item.content}
                        isDragging={activeId === item.id}
                      />
                    ))}
                    {list.items.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                        Drop items here
                      </div>
                    )}
                  </div>
                </SortableContext>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem ? (
            <div className="p-3 bg-card border rounded-lg shadow-lg opacity-90">
              {activeItem.content}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
