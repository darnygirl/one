/**
 * LiveKanban - Streaming Component (Cycle 22)
 *
 * Kanban board with real-time collaboration and drag-and-drop
 */

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { cn } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, MoreVertical, User } from "lucide-react";

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  labels?: string[];
  priority?: "low" | "medium" | "high";
  columnId: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  limit?: number;
  color?: string;
}

export interface LiveKanbanProps {
  columns: KanbanColumn[];
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  onCardAdd?: (columnId: string) => void;
  onCardEdit?: (card: KanbanCard) => void;
  onCardDelete?: (cardId: string) => void;
  showCollaborators?: boolean;
  collaborators?: Array<{
    id: string;
    name: string;
    avatar?: string;
    color: string;
  }>;
  className?: string;
}

export function LiveKanban({
  columns,
  onCardMove,
  onCardClick,
  onCardAdd,
  onCardEdit,
  onCardDelete,
  showCollaborators = true,
  collaborators = [],
  className,
}: LiveKanbanProps) {
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = columns
      .flatMap((col) => col.cards)
      .find((card) => card.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCard = columns
      .flatMap((col) => col.cards)
      .find((card) => card.id === active.id);

    if (!activeCard) return;

    // Find target column
    let targetColumnId: string | null = null;

    // Check if dropped on a column
    const targetColumn = columns.find((col) => col.id === over.id);
    if (targetColumn) {
      targetColumnId = targetColumn.id;
    } else {
      // Check if dropped on a card
      const targetCard = columns
        .flatMap((col) => col.cards)
        .find((card) => card.id === over.id);
      if (targetCard) {
        targetColumnId = targetCard.columnId;
      }
    }

    if (targetColumnId && targetColumnId !== activeCard.columnId) {
      onCardMove?.(activeCard.id, activeCard.columnId, targetColumnId);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Collaborators */}
      {showCollaborators && collaborators.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-4 border-b">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active collaborators:</span>
          <div className="flex -space-x-2">
            {collaborators.map((collab) => (
              <Avatar
                key={collab.id}
                className="h-8 w-8 border-2"
                style={{ borderColor: collab.color }}
              >
                <AvatarImage src={collab.avatar} />
                <AvatarFallback>{collab.name[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="flex-1">
          <div className="flex gap-4 p-4 min-h-full">
            {columns.map((column) => (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                onCardClick={onCardClick}
                onCardAdd={onCardAdd}
                onCardEdit={onCardEdit}
                onCardDelete={onCardDelete}
              />
            ))}
          </div>
        </ScrollArea>

        <DragOverlay>
          {activeCard ? (
            <div className="opacity-80">
              <KanbanCardComponent card={activeCard} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

interface KanbanColumnComponentProps {
  column: KanbanColumn;
  onCardClick?: (card: KanbanCard) => void;
  onCardAdd?: (columnId: string) => void;
  onCardEdit?: (card: KanbanCard) => void;
  onCardDelete?: (cardId: string) => void;
}

function KanbanColumnComponent({
  column,
  onCardClick,
  onCardAdd,
  onCardEdit,
  onCardDelete,
}: KanbanColumnComponentProps) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "column" },
  });

  const isOverLimit = column.limit && column.cards.length >= column.limit;

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col w-80 shrink-0 bg-muted/30 rounded-lg"
    >
      {/* Column Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{column.title}</h3>
          <Badge variant="secondary">{column.cards.length}</Badge>
        </div>
        {column.limit && (
          <div className="text-xs text-muted-foreground">
            Limit: {column.cards.length}/{column.limit}
            {isOverLimit && <span className="text-destructive ml-1">(Over limit!)</span>}
          </div>
        )}
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 p-4">
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {column.cards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                onClick={() => onCardClick?.(card)}
                onEdit={() => onCardEdit?.(card)}
                onDelete={() => onCardDelete?.(card.id)}
              />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>

      {/* Add Card Button */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => onCardAdd?.(column.id)}
          disabled={isOverLimit}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>
    </div>
  );
}

interface SortableCardProps {
  card: KanbanCard;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function SortableCard({ card, onClick, onEdit, onDelete }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCardComponent
        card={card}
        isDragging={isDragging}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

interface KanbanCardComponentProps {
  card: KanbanCard;
  isDragging?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function KanbanCardComponent({
  card,
  isDragging,
  onClick,
  onEdit,
  onDelete,
}: KanbanCardComponentProps) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-shadow",
          isDragging && "opacity-50"
        )}
        onClick={onClick}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {card.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {card.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            {/* Labels and Priority */}
            <div className="flex items-center gap-2 flex-wrap">
              {card.priority && (
                <Badge className={cn("text-xs", priorityColors[card.priority])}>
                  {card.priority}
                </Badge>
              )}
              {card.labels?.slice(0, 2).map((label) => (
                <Badge key={label} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>

            {/* Assignee */}
            {card.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={card.assignee.avatar} />
                <AvatarFallback className="text-xs">
                  {card.assignee.name[0]}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
