/**
 * StreamingCard - Card component with real-time Convex updates
 *
 * Automatically refreshes when Convex data changes, with loading and error states.
 */

import { useQuery } from "convex/react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { OntologyComponentProps } from "../types";

export interface StreamingCardProps extends OntologyComponentProps {
  /**
   * Convex query path (e.g., "queries.things.list")
   */
  queryPath: any;

  /**
   * Arguments to pass to the query
   */
  args?: Record<string, any>;

  /**
   * Custom refresh interval in milliseconds (optional)
   */
  refreshInterval?: number;

  /**
   * Title to display in card header
   */
  title?: string;

  /**
   * Description to display in card header
   */
  description?: string;

  /**
   * Custom render function for the data
   */
  renderData?: (data: any) => React.ReactNode;
}

/**
 * StreamingCard - Real-time data card
 *
 * @example
 * ```tsx
 * <StreamingCard
 *   queryPath={api.queries.things.list}
 *   args={{ groupId: "g_123", type: "product" }}
 *   title="Products"
 *   description="Live product inventory"
 *   renderData={(products) => (
 *     <div>{products.length} products</div>
 *   )}
 * />
 * ```
 */
export function StreamingCard({
  queryPath,
  args = {},
  refreshInterval,
  title,
  description,
  renderData,
  className,
}: StreamingCardProps) {
  // Real-time Convex query (auto-updates on data changes)
  const data = useQuery(queryPath, args);

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent>
        {/* Loading state */}
        {data === undefined && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {/* Error state */}
        {data === null && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load data. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Data loaded */}
        {data !== undefined && data !== null && (
          <>
            {renderData ? (
              renderData(data)
            ) : (
              <pre className="text-xs overflow-auto max-h-64 bg-muted p-3 rounded">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
