/**
 * CollaborationCursor Component
 *
 * Multi-user cursor tracking in real-time
 * Shows other users' cursors with username labels
 * Color-coded per user for easy identification
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";

export interface CursorPosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

interface CollaborationCursorProps {
  cursors: CursorPosition[];
  onCursorMove?: (position: { x: number; y: number }) => void;
  showLabels?: boolean;
  cursorTimeout?: number; // ms before hiding inactive cursor
  className?: string;
}

export function CollaborationCursor({
  cursors,
  onCursorMove,
  showLabels = true,
  cursorTimeout = 5000,
  className,
}: CollaborationCursorProps) {
  const [activeCursors, setActiveCursors] = useState<CursorPosition[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter out stale cursors
  useEffect(() => {
    const now = Date.now();
    const active = cursors.filter((cursor) => now - cursor.timestamp < cursorTimeout);
    setActiveCursors(active);

    const interval = setInterval(() => {
      const currentTime = Date.now();
      setActiveCursors((prev) =>
        prev.filter((cursor) => currentTime - cursor.timestamp < cursorTimeout)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [cursors, cursorTimeout]);

  // Track local cursor movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onCursorMove || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onCursorMove({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full", className)}
      onMouseMove={handleMouseMove}
    >
      {/* Render remote cursors */}
      <AnimatePresence>
        {activeCursors.map((cursor) => (
          <motion.div
            key={cursor.userId}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute pointer-events-none z-50"
            style={{
              left: `${cursor.x}%`,
              top: `${cursor.y}%`,
            }}
          >
            {/* Cursor icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <path
                d="M5.5 3.5L19.5 17.5L14 15L11.5 20.5L8.5 19.5L11 14L5.5 3.5Z"
                fill={cursor.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* User label */}
            {showLabels && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="ml-6 -mt-2"
              >
                <div
                  className="px-2 py-1 rounded text-xs font-medium text-white shadow-lg whitespace-nowrap"
                  style={{ backgroundColor: cursor.color }}
                >
                  {cursor.userName}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Visual indicator when no cursors */}
      {activeCursors.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-muted-foreground text-sm">
            No active collaborators
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook for managing cursor broadcasting
 * Use with Convex real-time mutations
 */
export function useCursorBroadcast(
  userId: string,
  userName: string,
  color: string
) {
  const throttleRef = useRef<number>(0);
  const THROTTLE_MS = 50; // Throttle cursor updates to 20fps

  const broadcastCursor = (position: { x: number; y: number }) => {
    const now = Date.now();
    if (now - throttleRef.current < THROTTLE_MS) return;

    throttleRef.current = now;

    // Broadcast cursor position via Convex mutation
    // Example: await updateCursor({ userId, userName, x: position.x, y: position.y, color, timestamp: now })
  };

  return { broadcastCursor };
}
