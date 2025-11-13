/**
 * Markdown Component
 * Renders markdown content with optional line clamping
 */

import { cn } from "@/lib/utils";
import { useState } from "react";

interface MarkdownProps {
  content: string;
  className?: string;
  lines?: number;
  expandable?: boolean;
}

export function Markdown({
  content,
  className,
  lines,
  expandable = false,
}: MarkdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldClamp = lines && !isExpanded;

  // TODO: Use a markdown library like marked or react-markdown
  // For now, just render as HTML (dangerous - sanitize in production!)
  return (
    <div className="space-y-2">
      <div
        className={cn(
          "prose prose-sm max-w-none dark:prose-invert",
          shouldClamp && `line-clamp-${lines}`,
          className
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {expandable && lines && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-primary hover:underline"
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
