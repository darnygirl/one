/**
 * InboxLayout Component (Cycle 83)
 *
 * 3-panel resizable layout for email management
 * - Navigation panel (folders, labels)
 * - Email list panel
 * - Detail/preview panel
 *
 * Features:
 * - Resizable panels with smart defaults
 * - Mobile-responsive (stacks panels)
 * - State persistence (localStorage)
 * - Keyboard navigation
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";

interface InboxLayoutProps {
  /** Navigation panel (folders, labels, accounts) */
  nav: React.ReactNode;
  /** Email list panel */
  list: React.ReactNode;
  /** Email detail/preview panel */
  detail: React.ReactNode;
  /** Default panel sizes [nav, list, detail] */
  defaultLayout?: number[];
  /** Whether nav panel starts collapsed */
  defaultCollapsed?: boolean;
  /** Size of collapsed nav panel */
  navCollapsedSize?: number;
  /** Layout persistence key (for localStorage) */
  storageKey?: string;
  /** Mobile breakpoint */
  mobileBreakpoint?: string;
  /** Show detail view on mobile (controlled) */
  mobileShowDetail?: boolean;
  /** Callback when mobile detail view changes */
  onMobileDetailChange?: (show: boolean) => void;
}

export function InboxLayout({
  nav,
  list,
  detail,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize = 4,
  storageKey = "inbox-layout",
  mobileBreakpoint = "(max-width: 768px)",
  mobileShowDetail = false,
  onMobileDetailChange,
}: InboxLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const isMobile = useMediaQuery(mobileBreakpoint);

  // Load saved layout from localStorage
  const [savedLayout, setSavedLayout] = React.useState<number[] | undefined>(
    () => {
      if (typeof window === "undefined") return undefined;
      const saved = localStorage.getItem(`${storageKey}:sizes`);
      return saved ? JSON.parse(saved) : undefined;
    }
  );

  // Load saved collapse state
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(`${storageKey}:collapsed`);
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, [storageKey]);

  // Save layout changes
  const handleLayoutChange = (sizes: number[]) => {
    setSavedLayout(sizes);
    if (typeof window !== "undefined") {
      localStorage.setItem(`${storageKey}:sizes`, JSON.stringify(sizes));
    }
  };

  // Save collapse state
  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    if (typeof window !== "undefined") {
      localStorage.setItem(`${storageKey}:collapsed`, JSON.stringify(collapsed));
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle nav panel: Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }

      // Focus navigation: Ctrl/Cmd + 1
      if ((e.ctrlKey || e.metaKey) && e.key === "1") {
        e.preventDefault();
        // TODO: Focus nav panel
      }

      // Focus list: Ctrl/Cmd + 2
      if ((e.ctrlKey || e.metaKey) && e.key === "2") {
        e.preventDefault();
        // TODO: Focus list panel
      }

      // Focus detail: Ctrl/Cmd + 3
      if ((e.ctrlKey || e.metaKey) && e.key === "3") {
        e.preventDefault();
        // TODO: Focus detail panel
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mobile layout - stack panels vertically
  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex h-full flex-col">
          {!mobileShowDetail ? (
            // Show nav + list
            <div className="flex h-full flex-col">
              {/* Mobile nav (collapsible header) */}
              <div className="flex-shrink-0 border-b">{nav}</div>
              {/* List fills remaining space */}
              <div className="flex-1 overflow-hidden">{list}</div>
            </div>
          ) : (
            // Show detail only
            <div className="flex h-full flex-col overflow-hidden">{detail}</div>
          )}
        </div>
      </TooltipProvider>
    );
  }

  // Desktop layout - resizable 3-panel
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={handleLayoutChange}
        className="h-full items-stretch"
      >
        {/* Navigation Panel */}
        <ResizablePanel
          defaultSize={savedLayout?.[0] ?? defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={25}
          onCollapse={() => handleCollapse(true)}
          onExpand={() => handleCollapse(false)}
          className={cn(
            "transition-all duration-300 ease-in-out",
            isCollapsed && "min-w-[50px]"
          )}
        >
          <div className="h-full overflow-hidden">{nav}</div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* List Panel */}
        <ResizablePanel
          defaultSize={savedLayout?.[1] ?? defaultLayout[1]}
          minSize={25}
          maxSize={50}
        >
          <div className="h-full overflow-hidden">{list}</div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Detail Panel */}
        <ResizablePanel
          defaultSize={savedLayout?.[2] ?? defaultLayout[2]}
          minSize={30}
        >
          <div className="h-full overflow-hidden">{detail}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}

/**
 * Usage Example:
 *
 * ```tsx
 * import { InboxLayout } from '@/components/ontology-ui/mail/InboxLayout';
 * import { MailNav } from './MailNav';
 * import { MailList } from './MailList';
 * import { MailDetail } from './MailDetail';
 *
 * export function EmailApp() {
 *   return (
 *     <InboxLayout
 *       nav={<MailNav />}
 *       list={<MailList />}
 *       detail={<MailDetail />}
 *       defaultLayout={[20, 32, 48]}
 *       storageKey="my-inbox"
 *     />
 *   );
 * }
 * ```
 *
 * Keyboard Shortcuts:
 * - Cmd/Ctrl + B: Toggle navigation panel
 * - Cmd/Ctrl + 1: Focus navigation
 * - Cmd/Ctrl + 2: Focus email list
 * - Cmd/Ctrl + 3: Focus detail view
 */
