/**
 * EmptyState Component
 * Displays an empty state with icon, message, and optional action button
 */

import { type EmptyStateConfig } from "@/lib/ontology/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  config: EmptyStateConfig;
  onAction?: () => void;
}

export function EmptyState({ config, onAction }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
          {/* Icon placeholder - use lucide-react in production */}
          <div className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="text-xl font-semibold mb-2">{config.title}</h3>

        <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
          {config.description}
        </p>

        {config.action && (
          <Button
            variant={config.action.variant || "default"}
            onClick={onAction}
          >
            {config.action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
