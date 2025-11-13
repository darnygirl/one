/**
 * TagList Component
 * Renders a list of tags with optional tooltip for overflow
 */

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TagListProps {
  tags: string[];
  max?: number;
  color?: string;
  moreLabel?: string;
}

export function TagList({
  tags,
  max = 3,
  color = "default",
  moreLabel = "+{count} more",
}: TagListProps) {
  if (!tags || tags.length === 0) return null;

  const visibleTags = tags.slice(0, max);
  const hiddenTags = tags.slice(max);

  return (
    <div className="flex flex-wrap gap-1">
      {visibleTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}

      {hiddenTags.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-help">
                {moreLabel.replace("{count}", hiddenTags.length.toString())}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-wrap gap-1 max-w-xs">
                {hiddenTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
