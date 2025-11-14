/**
 * StatusFilter - Filter by entity status
 *
 * Cycle 78: Production-ready status filter with:
 * - Tab interface or dropdown mode
 * - Count badges per status
 * - Keyboard shortcuts (a/d/w/e/b/r)
 * - Persisted selection in localStorage
 * - Real-time count updates
 */

'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Circle,
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
  Archive,
} from 'lucide-react';

export type Status = 'active' | 'done' | 'waiting' | 'deferred' | 'blocked' | 'archived';

interface StatusFilterProps {
  activeStatus: Status;
  onStatusChange: (status: Status) => void;
  counts?: Partial<Record<Status, number>>;
  mode?: 'tabs' | 'dropdown';
  persistKey?: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    shortcut: string;
  }
> = {
  active: {
    label: 'Active',
    icon: Circle,
    color: 'text-blue-600',
    shortcut: 'a',
  },
  done: {
    label: 'Done',
    icon: CheckCircle2,
    color: 'text-green-600',
    shortcut: 'd',
  },
  waiting: {
    label: 'Waiting',
    icon: Clock,
    color: 'text-yellow-600',
    shortcut: 'w',
  },
  deferred: {
    label: 'Deferred',
    icon: PauseCircle,
    color: 'text-gray-600',
    shortcut: 'e',
  },
  blocked: {
    label: 'Blocked',
    icon: XCircle,
    color: 'text-red-600',
    shortcut: 'b',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    color: 'text-purple-600',
    shortcut: 'r',
  },
};

const STATUSES = Object.keys(STATUS_CONFIG) as Status[];

export function StatusFilter({
  activeStatus,
  onStatusChange,
  counts = {},
  mode = 'tabs',
  persistKey = 'status-filter',
  className,
}: StatusFilterProps) {
  // Persist selection
  useEffect(() => {
    localStorage.setItem(persistKey, activeStatus);
  }, [activeStatus, persistKey]);

  // Load persisted selection
  useEffect(() => {
    const stored = localStorage.getItem(persistKey);
    if (stored && STATUSES.includes(stored as Status)) {
      onStatusChange(stored as Status);
    }
  }, [persistKey, onStatusChange]);

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

      const status = STATUSES.find(
        (s) => STATUS_CONFIG[s].shortcut === e.key.toLowerCase()
      );

      if (status) {
        e.preventDefault();
        onStatusChange(status);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onStatusChange]);

  if (mode === 'dropdown') {
    return (
      <Select value={activeStatus} onValueChange={(v) => onStatusChange(v as Status)}>
        <SelectTrigger className={cn('w-[180px]', className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            const count = counts[status];

            return (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', config.color)} />
                  <span>{config.label}</span>
                  {count !== undefined && count > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {count}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Tabs value={activeStatus} onValueChange={(v) => onStatusChange(v as Status)} className={className}>
      <TabsList className="w-full justify-start overflow-x-auto">
        {STATUSES.map((status) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const count = counts[status];
          const isActive = activeStatus === status;

          return (
            <TabsTrigger
              key={status}
              value={status}
              className="gap-2 data-[state=active]:shadow-sm"
              title={`${config.label} (${config.shortcut})`}
            >
              <Icon className={cn('h-4 w-4', isActive && config.color)} />
              <span className="hidden sm:inline">{config.label}</span>
              {count !== undefined && count > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'font-semibold tabular-nums',
                    isActive && 'bg-primary/10'
                  )}
                >
                  {count > 99 ? '99+' : count}
                </Badge>
              )}
              <kbd
                className={cn(
                  'hidden lg:inline-flex h-4 w-4 items-center justify-center rounded border text-[10px]',
                  isActive
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-border bg-muted'
                )}
              >
                {config.shortcut}
              </kbd>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
