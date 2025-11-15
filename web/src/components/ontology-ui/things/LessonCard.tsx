/**
 * LessonCard Component
 *
 * Display lesson information with completion status
 * Part of THINGS dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Thing, CardProps } from "../types";
import { cn } from "../utils";

export interface LessonCardProps extends CardProps {
  lesson: Thing;
  completed?: boolean;
  duration?: string;
  locked?: boolean;
}

export function LessonCard({
  lesson,
  completed = false,
  duration,
  locked = false,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: LessonCardProps) {
  const lessonDuration = duration ?? (lesson.metadata?.duration as string);
  const isCompleted = completed ?? (lesson.metadata?.completed as boolean) ?? false;
  const isLocked = locked ?? (lesson.metadata?.locked as boolean) ?? false;

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        interactive && !isLocked && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        isLocked && "opacity-60",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
      onClick={!isLocked ? onClick : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">
                {isLocked ? "🔒" : isCompleted ? "✅" : "📖"}
              </span>
              <span className="line-clamp-1">{lesson.name}</span>
            </CardTitle>
            {lesson.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {lesson.description}
              </CardDescription>
            )}
          </div>
          {isCompleted && (
            <Badge variant="default" className="bg-green-500">
              Completed
            </Badge>
          )}
          {isLocked && (
            <Badge variant="secondary">
              Locked
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {lessonDuration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>⏱️</span>
            <span>{lessonDuration}</span>
          </div>
        )}

        {lesson.metadata?.type && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {lesson.metadata.type === "video" && "🎥"}
              {lesson.metadata.type === "reading" && "📄"}
              {lesson.metadata.type === "quiz" && "❓"}
              {lesson.metadata.type === "assignment" && "✍️"}
            </span>
            <span className="capitalize">{lesson.metadata.type as string}</span>
          </div>
        )}

        {isLocked && (
          <p className="text-xs text-muted-foreground italic">
            Complete previous lessons to unlock
          </p>
        )}

        {!isLocked && interactive && (
          <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity border-t pt-2">
            {isCompleted ? "Review lesson →" : "Start lesson →"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
