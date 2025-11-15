/**
 * ContentCard - Card for content items
 *
 * Displays content with metadata like views, author, and creation date.
 * Supports different content types (article, video, podcast).
 */

import type { Thing, CardProps } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "../utils";

interface ContentCardProps extends CardProps {
  content: Thing;
  showViews?: boolean;
  views?: number;
  showAuthor?: boolean;
  author?: string;
}

export function ContentCard({
  content,
  showViews = false,
  views = 0,
  showAuthor = false,
  author,
  variant = "default",
  size = "md",
  interactive = false,
  onClick,
  className = "",
}: ContentCardProps) {
  // Extract content type from metadata or default to 'article'
  const contentType = (content.metadata?.contentType as string) || "article";

  // Content type badge variants
  const contentTypeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    article: "default",
    video: "secondary",
    podcast: "outline",
  };

  return (
    <Card
      className={`${interactive ? "cursor-pointer hover:shadow-lg transition-shadow" : ""} ${className}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <CardTitle className={size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"}>
              {content.name}
            </CardTitle>
          </div>
          <Badge variant={contentTypeVariants[contentType] || "default"}>
            {contentType}
          </Badge>
        </div>
        {content.description && (
          <CardDescription className="line-clamp-2">
            {content.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {showAuthor && author && (
            <div className="flex items-center gap-1">
              <span>👤</span>
              <span>{author}</span>
            </div>
          )}
          {showViews && (
            <div className="flex items-center gap-1">
              <span>👁️</span>
              <span>{formatNumber(views)} views</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{formatDate(content.createdAt)}</span>
          </div>
        </div>
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {content.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
