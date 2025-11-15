/**
 * JourneyStageFilter - Filter by customer journey stages
 *
 * Cycle 79: Production-ready journey stage filter with:
 * - Chip/pill interface for 9 journey stages
 * - Multi-select capability
 * - Clear all button
 * - Smart suggestions based on context
 * - Smooth animations and transitions
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export type JourneyStage =
  | 'unaware'
  | 'aware'
  | 'interested'
  | 'considering'
  | 'evaluating'
  | 'trial'
  | 'customer'
  | 'advocate'
  | 'promoter';

interface JourneyStageFilterProps {
  selectedStages: JourneyStage[];
  onStagesChange: (stages: JourneyStage[]) => void;
  counts?: Partial<Record<JourneyStage, number>>;
  suggestions?: JourneyStage[];
  className?: string;
}

const JOURNEY_STAGES: Record<
  JourneyStage,
  {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    description: string;
  }
> = {
  unaware: {
    label: 'Unaware',
    color: 'gray',
    bgColor: 'bg-gray-100 dark:bg-gray-900',
    textColor: 'text-gray-700 dark:text-gray-300',
    description: 'Not aware of the product/service',
  },
  aware: {
    label: 'Aware',
    color: 'blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    textColor: 'text-blue-700 dark:text-blue-300',
    description: 'Aware but not engaged',
  },
  interested: {
    label: 'Interested',
    color: 'cyan',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    description: 'Showing interest',
  },
  considering: {
    label: 'Considering',
    color: 'teal',
    bgColor: 'bg-teal-100 dark:bg-teal-900',
    textColor: 'text-teal-700 dark:text-teal-300',
    description: 'Actively considering purchase',
  },
  evaluating: {
    label: 'Evaluating',
    color: 'yellow',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    description: 'Comparing options',
  },
  trial: {
    label: 'Trial',
    color: 'orange',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
    textColor: 'text-orange-700 dark:text-orange-300',
    description: 'In trial or demo',
  },
  customer: {
    label: 'Customer',
    color: 'green',
    bgColor: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-700 dark:text-green-300',
    description: 'Active customer',
  },
  advocate: {
    label: 'Advocate',
    color: 'purple',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
    textColor: 'text-purple-700 dark:text-purple-300',
    description: 'Recommends to others',
  },
  promoter: {
    label: 'Promoter',
    color: 'pink',
    bgColor: 'bg-pink-100 dark:bg-pink-900',
    textColor: 'text-pink-700 dark:text-pink-300',
    description: 'Actively promotes brand',
  },
};

const STAGE_ORDER = Object.keys(JOURNEY_STAGES) as JourneyStage[];

export function JourneyStageFilter({
  selectedStages,
  onStagesChange,
  counts = {},
  suggestions = [],
  className,
}: JourneyStageFilterProps) {
  const toggleStage = (stage: JourneyStage) => {
    if (selectedStages.includes(stage)) {
      onStagesChange(selectedStages.filter((s) => s !== stage));
    } else {
      onStagesChange([...selectedStages, stage]);
    }
  };

  const clearAll = () => {
    onStagesChange([]);
  };

  const hasSelections = selectedStages.length > 0;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Selected count and clear button */}
      {hasSelections && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-muted-foreground">
            {selectedStages.length} stage{selectedStages.length !== 1 && 's'} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}

      {/* Journey stage chips */}
      <div className="flex flex-wrap gap-2">
        {STAGE_ORDER.map((stage) => {
          const config = JOURNEY_STAGES[stage];
          const isSelected = selectedStages.includes(stage);
          const isSuggested = suggestions.includes(stage);
          const count = counts[stage];

          return (
            <button
              key={stage}
              onClick={() => toggleStage(stage)}
              className={cn(
                'group relative inline-flex items-center gap-2 rounded-full px-4 py-2',
                'text-sm font-semibold transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'hover:shadow-md active:scale-95',
                isSelected
                  ? [config.bgColor, config.textColor, 'shadow-sm ring-2 ring-offset-2', `ring-${config.color}-400`]
                  : 'bg-background text-foreground border border-border hover:border-foreground/50',
                isSuggested && !isSelected && 'border-dashed border-2 border-primary/50'
              )}
              title={config.description}
            >
              <span>{config.label}</span>

              {count !== undefined && count > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'h-5 min-w-5 px-1.5 text-xs font-bold tabular-nums',
                    isSelected && 'bg-white/30 dark:bg-black/30'
                  )}
                >
                  {count > 99 ? '99+' : count}
                </Badge>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
              )}

              {/* Suggestion indicator */}
              {isSuggested && !isSelected && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary/60 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Suggestions hint */}
      {suggestions.length > 0 && (
        <p className="text-xs text-muted-foreground px-1">
          💡 Suggested stages are highlighted
        </p>
      )}
    </div>
  );
}
