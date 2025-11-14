/**
 * OntologyPanel - Enhanced ResizablePanel for ontology dimensions
 *
 * Cycle 76: Production-ready resizable panel with:
 * - Smart min/max sizes based on dimension
 * - Collapse/expand with keyboard shortcuts
 * - State persistence per dimension
 * - Smooth animations
 * - Memory of last size for each dimension
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Panel, type ImperativePanelHandle } from 'react-resizable-panels';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Dimension } from '../types';

interface OntologyPanelProps {
  dimension: Dimension;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  children: React.ReactNode;
  className?: string;
  onCollapse?: (collapsed: boolean) => void;
}

// Smart defaults based on dimension
const DIMENSION_DEFAULTS: Record<Dimension, { min: number; max: number; default: number }> = {
  groups: { min: 15, max: 25, default: 20 },
  people: { min: 20, max: 35, default: 25 },
  things: { min: 25, max: 40, default: 30 },
  connections: { min: 25, max: 40, default: 30 },
  events: { min: 20, max: 35, default: 25 },
  knowledge: { min: 25, max: 40, default: 30 },
};

const STORAGE_PREFIX = 'ontology-panel';

export function OntologyPanel({
  dimension,
  defaultSize,
  minSize,
  maxSize,
  collapsible = true,
  children,
  className,
  onCollapse,
}: OntologyPanelProps) {
  const defaults = DIMENSION_DEFAULTS[dimension];
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [size, setSize] = useState(defaultSize || defaults.default);

  // Persist panel state
  const storageKey = `${STORAGE_PREFIX}:${dimension}`;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const { size: storedSize, collapsed } = JSON.parse(stored);
        setSize(storedSize);
        setIsCollapsed(collapsed);
      } catch (e) {
        // Ignore invalid stored data
      }
    }
  }, [storageKey]);

  const handleResize = useCallback((newSize: number) => {
    setSize(newSize);
    localStorage.setItem(storageKey, JSON.stringify({ size: newSize, collapsed: isCollapsed }));
  }, [storageKey, isCollapsed]);

  const handleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem(storageKey, JSON.stringify({ size, collapsed: newCollapsed }));
    onCollapse?.(newCollapsed);
  }, [isCollapsed, size, storageKey, onCollapse]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // [/] to toggle collapse (when not in input)
      if (
        e.key === '[' &&
        !isInputFocused() &&
        collapsible
      ) {
        e.preventDefault();
        handleCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleCollapse, collapsible]);

  return (
    <Panel
      defaultSize={size}
      minSize={minSize || defaults.min}
      maxSize={maxSize || defaults.max}
      collapsible={collapsible}
      collapsedSize={4}
      onResize={handleResize}
      className={cn(
        'relative transition-all duration-300 ease-in-out',
        isCollapsed && 'min-w-[50px]',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Collapse button */}
        {collapsible && (
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCollapse}
              className="h-6 w-6"
              title={isCollapsed ? 'Expand panel ([)' : 'Collapse panel ([)'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isCollapsed ? 'Expand' : 'Collapse'} {dimension} panel
              </span>
            </Button>
          </div>
        )}

        {/* Content */}
        <div className={cn(
          'flex-1 overflow-hidden transition-opacity duration-200',
          isCollapsed && 'opacity-0 pointer-events-none'
        )}>
          {children}
        </div>
      </div>
    </Panel>
  );
}

// Helper to check if an input is focused
function isInputFocused(): boolean {
  const active = document.activeElement;
  return (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active?.getAttribute('contenteditable') === 'true'
  );
}
