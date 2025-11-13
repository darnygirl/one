/**
 * Card Component - Universal Thing Renderer
 *
 * Generic card component that renders ANY thing type from the ontology.
 * Reads UI configuration from the ontology registry and renders fields,
 * actions, and connections accordingly.
 *
 * @example
 * ```tsx
 * <Card thing={course} />
 * <Card thing={product} view="list" />
 * <Card thing={post} onClick={(thing) => navigate(`/posts/${thing._id}`)} />
 * ```
 */

import { type Thing } from "@/lib/ontology/types";
import { useThingConfig } from "@/lib/ontology/hooks/useThingConfig";
import {
  Card as ShadCard,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Field } from "./Field";
import { Actions } from "./Actions";
import { ConnectionBadges } from "./ConnectionBadges";
import { cn } from "@/lib/utils";

export interface CardProps {
  /** The thing to render */
  thing: Thing;

  /** View type (card, list, detail) */
  view?: "card" | "list" | "detail";

  /** Custom click handler */
  onClick?: (thing: Thing) => void;

  /** Show action buttons */
  showActions?: boolean;

  /** Show connection badges */
  showConnections?: boolean;

  /** Custom className */
  className?: string;
}

export function Card({
  thing,
  view = "card",
  onClick,
  showActions = true,
  showConnections = true,
  className,
}: CardProps) {
  // Get UI config from ontology registry
  const config = useThingConfig(thing.type);

  // Get view configuration
  const viewConfig = config.ui.views[view];
  if (!viewConfig) {
    console.warn(`View "${view}" not defined for type "${thing.type}"`);
    return null;
  }

  // Get fields to display
  const fields =
    viewConfig.fields === "*"
      ? Object.keys(config.properties)
      : viewConfig.fields;

  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick(thing);
    }
  };

  return (
    <ShadCard
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg",
        onClick && "cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      {/* Header: Typically thumbnail + title */}
      <CardHeader className="space-y-0 pb-3">
        {fields.slice(0, 2).map((fieldName) => {
          const fieldConfig = config.ui.fields[fieldName];
          if (!fieldConfig || fieldConfig.hidden) return null;

          return (
            <Field
              key={fieldName}
              name={fieldName}
              value={thing.properties[fieldName]}
              config={fieldConfig}
              thing={thing}
            />
          );
        })}
      </CardHeader>

      {/* Body: Description, price, badges, etc. */}
      {fields.length > 2 && (
        <CardContent className="space-y-3">
          {fields.slice(2).map((fieldName) => {
            const fieldConfig = config.ui.fields[fieldName];
            if (!fieldConfig || fieldConfig.hidden) return null;
            if (fieldConfig.showOnlyIf && !thing.properties[fieldConfig.showOnlyIf])
              return null;

            return (
              <Field
                key={fieldName}
                name={fieldName}
                value={thing.properties[fieldName]}
                config={fieldConfig}
                thing={thing}
              />
            );
          })}
        </CardContent>
      )}

      {/* Connection badges */}
      {showConnections && config.ui.connections && (
        <>
          <Separator />
          <CardContent className="pt-3">
            <ConnectionBadges thing={thing} config={config.ui.connections} />
          </CardContent>
        </>
      )}

      {/* Actions */}
      {showActions &&
        (config.ui.actions.primary || config.ui.actions.secondary) && (
          <>
            <Separator />
            <CardFooter className="pt-3">
              <Actions
                thing={thing}
                primary={config.ui.actions.primary}
                secondary={config.ui.actions.secondary}
                context={config.ui.actions.context}
              />
            </CardFooter>
          </>
        )}
    </ShadCard>
  );
}
