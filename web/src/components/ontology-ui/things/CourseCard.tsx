/**
 * CourseCard Component
 *
 * Display course information with price and progress
 * Part of THINGS dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Thing, CardProps } from "../types";
import { cn, formatCurrency } from "../utils";

export interface CourseCardProps extends CardProps {
  course: Thing;
  showPrice?: boolean;
  showProgress?: boolean;
  progress?: number;
  price?: number;
  onEnroll?: () => void;
}

export function CourseCard({
  course,
  showPrice = true,
  showProgress = false,
  progress = 0,
  price,
  onEnroll,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: CourseCardProps) {
  const coursePrice = price ?? (course.metadata?.price as number);
  const courseProgress = progress ?? (course.metadata?.progress as number) ?? 0;

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
              <span className="text-2xl">📚</span>
              <span className="line-clamp-1">{course.name}</span>
            </CardTitle>
            {course.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {course.description}
              </CardDescription>
            )}
          </div>
          {course.status && (
            <Badge variant="outline" className="ml-2">
              {course.status}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {showPrice && coursePrice !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="text-lg font-bold">{formatCurrency(coursePrice)}</span>
          </div>
        )}

        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{courseProgress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
          </div>
        )}

        {course.metadata?.lessons && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>📖</span>
            <span>{course.metadata.lessons as number} lessons</span>
          </div>
        )}

        {course.metadata?.duration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>⏱️</span>
            <span>{course.metadata.duration as string}</span>
          </div>
        )}
      </CardContent>

      {onEnroll && (
        <CardFooter>
          <Button onClick={onEnroll} className="w-full">
            Enroll Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
