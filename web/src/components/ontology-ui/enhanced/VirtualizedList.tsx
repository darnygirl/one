/**
 * VirtualizedList - DISABLED (react-window incompatible with SSR)
 *
 * This component has been temporarily disabled due to SSR build compatibility issues.
 * Use standard list rendering instead.
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  title?: string;
  className?: string;
  [key: string]: any;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  title,
  className,
}: VirtualizedListProps<T>) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto space-y-2">
          {items.map((item, index) => (
            <div key={index}>{renderItem(item, index)}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
