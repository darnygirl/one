/**
 * SplitPane - Resizable split pane layout
 *
 * Features:
 * - Horizontal/vertical modes
 * - Min/max constraints
 * - Collapse/expand buttons
 * - State persistence with localStorage
 * - Touch support for mobile
 */

import { useState, useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { cn } from "../utils";

interface SplitPaneProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  top?: React.ReactNode;
  bottom?: React.ReactNode;
  direction?: "horizontal" | "vertical";
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  persistKey?: string;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
  topClassName?: string;
  bottomClassName?: string;
}

export function SplitPane({
  left,
  right,
  top,
  bottom,
  direction = "horizontal",
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  collapsible = true,
  persistKey,
  className,
  leftClassName,
  rightClassName,
  topClassName,
  bottomClassName,
}: SplitPaneProps) {
  const [isFirstCollapsed, setIsFirstCollapsed] = useState(false);
  const [isSecondCollapsed, setIsSecondCollapsed] = useState(false);
  const [savedSize, setSavedSize] = useState<number>(defaultSize);

  // Load saved size from localStorage
  useEffect(() => {
    if (!persistKey) return;

    const stored = localStorage.getItem(`split-pane-${persistKey}`);
    if (stored) {
      try {
        const { size, firstCollapsed, secondCollapsed } = JSON.parse(stored);
        setSavedSize(size || defaultSize);
        setIsFirstCollapsed(firstCollapsed || false);
        setIsSecondCollapsed(secondCollapsed || false);
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [persistKey, defaultSize]);

  // Save size to localStorage
  const handleSizeChange = (sizes: number[]) => {
    const newSize = sizes[0];
    setSavedSize(newSize);

    if (persistKey) {
      localStorage.setItem(
        `split-pane-${persistKey}`,
        JSON.stringify({
          size: newSize,
          firstCollapsed: isFirstCollapsed,
          secondCollapsed: isSecondCollapsed,
        })
      );
    }
  };

  // Toggle first pane
  const toggleFirst = () => {
    setIsFirstCollapsed(!isFirstCollapsed);
    if (persistKey) {
      localStorage.setItem(
        `split-pane-${persistKey}`,
        JSON.stringify({
          size: savedSize,
          firstCollapsed: !isFirstCollapsed,
          secondCollapsed: isSecondCollapsed,
        })
      );
    }
  };

  // Toggle second pane
  const toggleSecond = () => {
    setIsSecondCollapsed(!isSecondCollapsed);
    if (persistKey) {
      localStorage.setItem(
        `split-pane-${persistKey}`,
        JSON.stringify({
          size: savedSize,
          firstCollapsed: isFirstCollapsed,
          secondCollapsed: !isSecondCollapsed,
        })
      );
    }
  };

  // Horizontal layout (left/right)
  if (direction === "horizontal") {
    return (
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={handleSizeChange}
        className={cn("min-h-[400px] rounded-lg border", className)}
      >
        {/* Left pane */}
        <ResizablePanel
          defaultSize={isFirstCollapsed ? 0 : savedSize}
          minSize={isFirstCollapsed ? 0 : minSize}
          maxSize={maxSize}
          collapsible={collapsible}
          className={cn("relative", leftClassName)}
        >
          {collapsible && !isFirstCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFirst}
              className="absolute top-2 right-2 z-10"
            >
              ◀
            </Button>
          )}
          {!isFirstCollapsed && (left || <div className="p-4">Left pane</div>)}
        </ResizablePanel>

        {/* Handle */}
        {!isFirstCollapsed && !isSecondCollapsed && (
          <ResizableHandle withHandle />
        )}

        {/* Collapsed left button */}
        {isFirstCollapsed && collapsible && (
          <div className="flex items-center justify-center w-12 border-r">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFirst}
              className="rotate-90"
            >
              ▶
            </Button>
          </div>
        )}

        {/* Right pane */}
        <ResizablePanel
          defaultSize={isSecondCollapsed ? 0 : 100 - savedSize}
          minSize={isSecondCollapsed ? 0 : minSize}
          maxSize={maxSize}
          collapsible={collapsible}
          className={cn("relative", rightClassName)}
        >
          {collapsible && !isSecondCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSecond}
              className="absolute top-2 right-2 z-10"
            >
              ▶
            </Button>
          )}
          {!isSecondCollapsed && (right || <div className="p-4">Right pane</div>)}
        </ResizablePanel>

        {/* Collapsed right button */}
        {isSecondCollapsed && collapsible && (
          <div className="flex items-center justify-center w-12 border-l">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSecond}
              className="rotate-90"
            >
              ◀
            </Button>
          </div>
        )}
      </ResizablePanelGroup>
    );
  }

  // Vertical layout (top/bottom)
  return (
    <ResizablePanelGroup
      direction="vertical"
      onLayout={handleSizeChange}
      className={cn("min-h-[400px] rounded-lg border", className)}
    >
      {/* Top pane */}
      <ResizablePanel
        defaultSize={isFirstCollapsed ? 0 : savedSize}
        minSize={isFirstCollapsed ? 0 : minSize}
        maxSize={maxSize}
        collapsible={collapsible}
        className={cn("relative", topClassName)}
      >
        {collapsible && !isFirstCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFirst}
            className="absolute top-2 right-2 z-10"
          >
            ▲
          </Button>
        )}
        {!isFirstCollapsed && (top || <div className="p-4">Top pane</div>)}
      </ResizablePanel>

      {/* Handle */}
      {!isFirstCollapsed && !isSecondCollapsed && (
        <ResizableHandle withHandle />
      )}

      {/* Collapsed top button */}
      {isFirstCollapsed && collapsible && (
        <div className="flex items-center justify-center h-12 border-b">
          <Button variant="ghost" size="sm" onClick={toggleFirst}>
            ▼
          </Button>
        </div>
      )}

      {/* Bottom pane */}
      <ResizablePanel
        defaultSize={isSecondCollapsed ? 0 : 100 - savedSize}
        minSize={isSecondCollapsed ? 0 : minSize}
        maxSize={maxSize}
        collapsible={collapsible}
        className={cn("relative", bottomClassName)}
      >
        {collapsible && !isSecondCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSecond}
            className="absolute top-2 right-2 z-10"
          >
            ▼
          </Button>
        )}
        {!isSecondCollapsed && (bottom || <div className="p-4">Bottom pane</div>)}
      </ResizablePanel>

      {/* Collapsed bottom button */}
      {isSecondCollapsed && collapsible && (
        <div className="flex items-center justify-center h-12 border-t">
          <Button variant="ghost" size="sm" onClick={toggleSecond}>
            ▲
          </Button>
        </div>
      )}
    </ResizablePanelGroup>
  );
}

/**
 * Preset layouts for common use cases
 */
export const SplitPanePresets = {
  /**
   * Code editor layout (left: file tree, right: editor)
   */
  CodeEditor: ({
    fileTree,
    editor,
  }: {
    fileTree: React.ReactNode;
    editor: React.ReactNode;
  }) => (
    <SplitPane
      left={fileTree}
      right={editor}
      direction="horizontal"
      defaultSize={25}
      minSize={15}
      maxSize={40}
      persistKey="code-editor"
    />
  ),

  /**
   * Dashboard layout (top: metrics, bottom: details)
   */
  Dashboard: ({
    metrics,
    details,
  }: {
    metrics: React.ReactNode;
    details: React.ReactNode;
  }) => (
    <SplitPane
      top={metrics}
      bottom={details}
      direction="vertical"
      defaultSize={40}
      minSize={20}
      maxSize={60}
      persistKey="dashboard"
    />
  ),

  /**
   * Email layout (left: inbox, right: message)
   */
  Email: ({
    inbox,
    message,
  }: {
    inbox: React.ReactNode;
    message: React.ReactNode;
  }) => (
    <SplitPane
      left={inbox}
      right={message}
      direction="horizontal"
      defaultSize={35}
      minSize={25}
      maxSize={50}
      persistKey="email"
    />
  ),

  /**
   * Settings layout (left: menu, right: content)
   */
  Settings: ({
    menu,
    content,
  }: {
    menu: React.ReactNode;
    content: React.ReactNode;
  }) => (
    <SplitPane
      left={menu}
      right={content}
      direction="horizontal"
      defaultSize={20}
      minSize={15}
      maxSize={30}
      persistKey="settings"
    />
  ),
};
