/**
 * DimensionNav - Navigation component for 6 dimensions
 *
 * Cycle 77: Production-ready dimension navigation with:
 * - Active state highlighting
 * - Badge counts from Convex (real-time)
 * - Keyboard shortcuts (1-6 for dimensions)
 * - Icon + label with collapse mode
 * - Smooth transitions and animations
 */

'use client';

import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getDimensionIcon, getDimensionColor } from '../utils';
import type { Dimension } from '../types';
import { DIMENSIONS } from '../types';

interface DimensionNavProps {
  activeDimension: Dimension;
  onDimensionChange: (dimension: Dimension) => void;
  counts?: Partial<Record<Dimension, number>>;
  collapsed?: boolean;
  className?: string;
}

const DIMENSION_ORDER: Dimension[] = [
  'people',
  'things',
  'connections',
  'events',
  'knowledge',
  'groups',
];

const KEYBOARD_SHORTCUTS: Record<string, Dimension> = {
  '1': 'people',
  '2': 'things',
  '3': 'connections',
  '4': 'events',
  '5': 'knowledge',
  '6': 'groups',
};

export function DimensionNav({
  activeDimension,
  onDimensionChange,
  counts = {},
  collapsed = false,
  className,
}: DimensionNavProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const dimension = KEYBOARD_SHORTCUTS[e.key];
      if (dimension) {
        e.preventDefault();
        onDimensionChange(dimension);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onDimensionChange]);

  return (
    <nav
      className={cn(
        'flex flex-col gap-1 p-2',
        className
      )}
      aria-label="Dimension navigation"
    >
      {DIMENSION_ORDER.map((dimension, index) => {
        const meta = DIMENSIONS[dimension];
        const isActive = activeDimension === dimension;
        const color = getDimensionColor(dimension);
        const icon = getDimensionIcon(dimension);
        const count = counts[dimension];
        const shortcut = String(index + 1);

        return (
          <Button
            key={dimension}
            variant={isActive ? 'default' : 'ghost'}
            size={collapsed ? 'icon' : 'default'}
            onClick={() => onDimensionChange(dimension)}
            className={cn(
              'justify-start gap-3 transition-all duration-200',
              collapsed && 'w-12 justify-center',
              isActive && [
                'shadow-sm',
                color === 'blue' && 'bg-blue-600 hover:bg-blue-700',
                color === 'purple' && 'bg-purple-600 hover:bg-purple-700',
                color === 'green' && 'bg-green-600 hover:bg-green-700',
                color === 'orange' && 'bg-orange-600 hover:bg-orange-700',
                color === 'red' && 'bg-red-600 hover:bg-red-700',
                color === 'indigo' && 'bg-indigo-600 hover:bg-indigo-700',
              ]
            )}
            title={collapsed ? `${meta.name} (${shortcut})` : undefined}
          >
            <span className="text-lg shrink-0">{icon}</span>

            {!collapsed && (
              <>
                <span className="flex-1 text-left font-medium">
                  {meta.name}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  {count !== undefined && count > 0 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'font-semibold tabular-nums',
                        isActive && 'bg-white/20 text-white'
                      )}
                    >
                      {count > 99 ? '99+' : count}
                    </Badge>
                  )}

                  <kbd
                    className={cn(
                      'hidden md:inline-flex h-5 w-5 items-center justify-center rounded border text-xs font-medium',
                      isActive
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-border bg-muted text-muted-foreground'
                    )}
                  >
                    {shortcut}
                  </kbd>
                </div>
              </>
            )}

            <span className="sr-only">
              View {meta.name} ({meta.description})
              {count !== undefined && ` - ${count} items`}
              {` - Keyboard shortcut: ${shortcut}`}
            </span>
          </Button>
        );
      })}
    </nav>
  );
}
