import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Milestone, Flag } from "lucide-react";

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress?: number;
  dependencies?: string[];
  milestone?: boolean;
  status?: "pending" | "in-progress" | "completed" | "blocked";
  assignee?: string;
  data?: Record<string, unknown>;
}

export interface GanttChartProps {
  tasks: GanttTask[];
  title?: string;
  showProgress?: boolean;
  showDependencies?: boolean;
  showMilestones?: boolean;
  enableDrag?: boolean;
  onTaskClick?: (task: GanttTask) => void;
  onTaskDrag?: (taskId: string, newStart: Date, newEnd: Date) => void;
}

const STATUS_COLORS = {
  pending: "hsl(var(--muted))",
  "in-progress": "hsl(var(--chart-3))",
  completed: "hsl(var(--chart-2))",
  blocked: "hsl(var(--destructive))",
};

export function GanttChart({
  tasks,
  title = "Gantt Chart",
  showProgress = true,
  showDependencies = true,
  showMilestones = true,
  enableDrag = true,
  onTaskClick,
  onTaskDrag,
}: GanttChartProps) {
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Calculate timeline range
  const allDates = tasks.flatMap((t) => [t.start, t.end]);
  const minDate = startOfMonth(new Date(Math.min(...allDates.map((d) => d.getTime()))));
  const maxDate = endOfMonth(new Date(Math.max(...allDates.map((d) => d.getTime()))));

  const totalDays = differenceInDays(maxDate, minDate);
  const dayWidth = 30; // pixels per day
  const taskHeight = 40;
  const taskPadding = 10;

  // Generate month markers
  const monthMarkers: Date[] = [];
  let currentMonth = minDate;
  while (currentMonth <= maxDate) {
    monthMarkers.push(currentMonth);
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  }

  const getTaskPosition = (task: GanttTask) => {
    const startOffset = differenceInDays(task.start, minDate);
    const duration = differenceInDays(task.end, task.start);

    return {
      x: startOffset * dayWidth,
      width: Math.max(duration * dayWidth, 20),
    };
  };

  const handleTaskClick = (task: GanttTask) => {
    setSelectedTask(task);
    onTaskClick?.(task);
  };

  const handleDragStart = (taskId: string) => {
    if (enableDrag) {
      setDraggedTask(taskId);
    }
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const milestones = tasks.filter((t) => t.milestone);
  const regularTasks = tasks.filter((t) => !t.milestone);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </Badge>
            {showMilestones && milestones.length > 0 && (
              <Badge variant="secondary">
                <Flag className="h-3 w-3 mr-1" />
                {milestones.length} milestone{milestones.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Timeline header */}
            <div className="flex items-center h-12 border-b mb-4">
              <div className="w-48 px-4 font-medium text-sm">Task Name</div>
              <div className="flex-1 relative">
                {monthMarkers.map((month, index) => {
                  const monthStart = differenceInDays(month, minDate);
                  const nextMonth =
                    index < monthMarkers.length - 1
                      ? monthMarkers[index + 1]
                      : maxDate;
                  const monthWidth =
                    differenceInDays(nextMonth, month) * dayWidth;

                  return (
                    <div
                      key={index}
                      className="absolute top-0 h-12 border-l px-2 text-xs text-muted-foreground"
                      style={{
                        left: `${monthStart * dayWidth}px`,
                        width: `${monthWidth}px`,
                      }}
                    >
                      {format(month, "MMM yyyy")}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {regularTasks.map((task, index) => {
                const position = getTaskPosition(task);
                const isDragging = draggedTask === task.id;

                return (
                  <div
                    key={task.id}
                    className="flex items-center"
                    style={{ height: taskHeight + taskPadding }}
                  >
                    {/* Task name */}
                    <div className="w-48 px-4 text-sm truncate">
                      {task.name}
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 relative h-full">
                      {/* Dependencies */}
                      {showDependencies &&
                        task.dependencies?.map((depId) => {
                          const depTask = tasks.find((t) => t.id === depId);
                          if (!depTask) return null;

                          const depPos = getTaskPosition(depTask);
                          const depIndex = tasks.indexOf(depTask);

                          return (
                            <svg
                              key={depId}
                              className="absolute top-0 left-0 pointer-events-none"
                              style={{
                                width: "100%",
                                height: "100%",
                              }}
                            >
                              <line
                                x1={depPos.x + depPos.width}
                                y1={(depIndex - index) * (taskHeight + taskPadding) + taskHeight / 2}
                                x2={position.x}
                                y2={taskHeight / 2}
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth="2"
                                strokeDasharray="4"
                              />
                            </svg>
                          );
                        })}

                      {/* Task bar */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 rounded-lg cursor-pointer transition-all ${
                          isDragging ? "opacity-50" : "hover:opacity-80"
                        }`}
                        style={{
                          left: `${position.x}px`,
                          width: `${position.width}px`,
                          height: taskHeight - 8,
                          backgroundColor: STATUS_COLORS[task.status || "pending"],
                        }}
                        onClick={() => handleTaskClick(task)}
                        draggable={enableDrag}
                        onDragStart={() => handleDragStart(task.id)}
                        onDragEnd={handleDragEnd}
                      >
                        {/* Progress bar */}
                        {showProgress && task.progress !== undefined && (
                          <div
                            className="absolute inset-0 rounded-lg bg-foreground/20"
                            style={{ width: `${task.progress * 100}%` }}
                          />
                        )}

                        {/* Task label */}
                        <div className="absolute inset-0 flex items-center px-2 text-xs text-background font-medium truncate">
                          {task.name}
                        </div>

                        {/* Progress percentage */}
                        {showProgress && task.progress !== undefined && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-background font-bold">
                            {Math.round(task.progress * 100)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Milestones */}
              {showMilestones &&
                milestones.map((milestone) => {
                  const position = getTaskPosition(milestone);

                  return (
                    <div
                      key={milestone.id}
                      className="flex items-center"
                      style={{ height: taskHeight + taskPadding }}
                    >
                      <div className="w-48 px-4 text-sm truncate flex items-center gap-2">
                        <Milestone className="h-4 w-4 text-muted-foreground" />
                        {milestone.name}
                      </div>
                      <div className="flex-1 relative h-full">
                        <div
                          className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
                          style={{ left: `${position.x}px` }}
                          onClick={() => handleTaskClick(milestone)}
                        >
                          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[16px] border-b-primary" />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Selected task details */}
        {selectedTask && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="font-medium mb-3 flex items-center gap-2">
              {selectedTask.milestone && (
                <Milestone className="h-4 w-4" />
              )}
              {selectedTask.name}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Start Date</div>
                <div className="font-medium">
                  {format(selectedTask.start, "MMM dd, yyyy")}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">End Date</div>
                <div className="font-medium">
                  {format(selectedTask.end, "MMM dd, yyyy")}
                </div>
              </div>
              {selectedTask.status && (
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <Badge variant="outline">{selectedTask.status}</Badge>
                </div>
              )}
              {selectedTask.progress !== undefined && (
                <div>
                  <div className="text-muted-foreground">Progress</div>
                  <div className="font-medium">
                    {Math.round(selectedTask.progress * 100)}%
                  </div>
                </div>
              )}
              {selectedTask.assignee && (
                <div>
                  <div className="text-muted-foreground">Assignee</div>
                  <div className="font-medium">{selectedTask.assignee}</div>
                </div>
              )}
              {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
                <div className="col-span-2">
                  <div className="text-muted-foreground mb-1">Dependencies</div>
                  <div className="flex gap-1 flex-wrap">
                    {selectedTask.dependencies.map((depId) => {
                      const depTask = tasks.find((t) => t.id === depId);
                      return (
                        <Badge key={depId} variant="secondary" className="text-xs">
                          {depTask?.name || depId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex gap-4 flex-wrap text-sm">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{status.replace("-", " ")}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
