/**
 * MobileAppNav - Bottom navigation for mobile
 *
 * Cycle 82: Production-ready mobile navigation with:
 * - 5 tabs for main dimensions
 * - Badge counts for notifications
 * - Active state highlighting
 * - Smooth transitions and haptic feedback
 * - Accessible with proper labels
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getDimensionIcon, getDimensionColor } from '../utils';
import type { Dimension } from '../types';
import { DIMENSIONS } from '../types';

interface MobileAppNavProps {
  activeDimension: Dimension;
  onDimensionChange: (dimension: Dimension) => void;
  counts?: Partial<Record<Dimension, number>>;
  className?: string;
}

// Only show 5 main dimensions on mobile
const MOBILE_DIMENSIONS: Dimension[] = [
  'people',
  'things',
  'connections',
  'events',
  'knowledge',
];

export function MobileAppNav({
  activeDimension,
  onDimensionChange,
  counts = {},
  className,
}: MobileAppNavProps) {
  const handleClick = (dimension: Dimension) => {
    // Haptic feedback on iOS/Android
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onDimensionChange(dimension);
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        'safe-area-inset-bottom',
        className
      )}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_DIMENSIONS.map((dimension) => {
          const meta = DIMENSIONS[dimension];
          const isActive = activeDimension === dimension;
          const color = getDimensionColor(dimension);
          const icon = getDimensionIcon(dimension);
          const count = counts[dimension];

          return (
            <button
              key={dimension}
              onClick={() => handleClick(dimension)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1',
                'min-w-[56px] px-3 py-2 rounded-lg',
                'transition-all duration-200 active:scale-95',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive && [
                  'bg-primary/10',
                  color === 'blue' && 'text-blue-600',
                  color === 'purple' && 'text-purple-600',
                  color === 'green' && 'text-green-600',
                  color === 'orange' && 'text-orange-600',
                  color === 'red' && 'text-red-600',
                  color === 'indigo' && 'text-indigo-600',
                ],
                !isActive && 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
              aria-label={meta.name}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon with badge */}
              <div className="relative">
                <span className={cn('text-xl', isActive && 'scale-110 transition-transform')}>
                  {icon}
                </span>

                {count !== undefined && count > 0 && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      'absolute -top-2 -right-2 h-5 min-w-5 px-1',
                      'flex items-center justify-center',
                      'text-[10px] font-bold tabular-nums',
                      'animate-in fade-in zoom-in duration-200'
                    )}
                  >
                    {count > 99 ? '99+' : count}
                  </Badge>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] font-medium leading-none',
                  isActive && 'font-semibold'
                )}
              >
                {meta.name}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div
                  className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2',
                    'h-1 w-8 rounded-full',
                    'transition-all duration-200',
                    color === 'blue' && 'bg-blue-600',
                    color === 'purple' && 'bg-purple-600',
                    color === 'green' && 'bg-green-600',
                    color === 'orange' && 'bg-orange-600',
                    color === 'red' && 'bg-red-600',
                    color === 'indigo' && 'bg-indigo-600'
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Safe area spacer for iOS */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
