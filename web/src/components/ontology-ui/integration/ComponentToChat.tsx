/**
 * Cycle 98: ComponentToChat
 *
 * Embed interactive ontology components in chat messages
 * - Component state syncing
 * - Actions from components trigger chat updates
 * - Shareable component links
 * - Supports all 6 dimensions
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check } from "lucide-react";
import {
  ThingCard,
  UserCard,
  EventCard,
  ConnectionCard,
  GroupCard,
  LabelCard,
} from "../index";
import type {
  Thing,
  Person,
  Event,
  Connection,
  Group,
  Label,
  Dimension,
} from "../types";

export interface EmbeddedComponent {
  id: string;
  dimension: Dimension;
  data: Thing | Person | Event | Connection | Group | Label;
  messageId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ComponentToChatProps {
  /** The embedded component */
  component: EmbeddedComponent;
  /** Enable interactive features */
  interactive?: boolean;
  /** Callback when component action occurs */
  onAction?: (action: string, data: any) => void;
  /** Callback when component state changes */
  onStateChange?: (state: any) => void;
  /** Enable sharing */
  shareable?: boolean;
  /** Custom actions for this component */
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (component: EmbeddedComponent) => void;
  }>;
}

/**
 * ComponentToChat - Embeds interactive ontology components in chat messages
 *
 * @example
 * ```tsx
 * <ComponentToChat
 *   component={{
 *     id: "thing-123",
 *     dimension: "things",
 *     data: productData,
 *     timestamp: Date.now(),
 *   }}
 *   interactive
 *   shareable
 *   onAction={(action, data) => console.log('Action:', action, data)}
 * />
 * ```
 */
export function ComponentToChat({
  component,
  interactive = true,
  onAction,
  onStateChange,
  shareable = true,
  customActions = [],
}: ComponentToChatProps) {
  const [copied, setCopied] = useState(false);
  const [componentState, setComponentState] = useState<any>(null);

  // Handle component state change
  function handleStateChange(newState: any) {
    setComponentState(newState);
    onStateChange?.(newState);
  }

  // Generate shareable link
  function generateShareLink(): string {
    const base64 = btoa(JSON.stringify(component));
    return `${window.location.origin}/shared/component/${base64}`;
  }

  // Copy share link
  async function copyShareLink() {
    const link = generateShareLink();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onAction?.("share", { link, component });
  }

  // Render the appropriate component
  function renderComponent() {
    const { dimension, data } = component;

    const commonProps = {
      onClick: interactive
        ? () => onAction?.("click", component)
        : undefined,
    };

    switch (dimension) {
      case "things":
        return (
          <ThingCard
            thing={data as Thing}
            type={(data as Thing).type}
            {...commonProps}
          />
        );
      case "people":
        return <UserCard user={data as Person} {...commonProps} />;
      case "events":
        return <EventCard event={data as Event} {...commonProps} />;
      case "connections":
        return (
          <ConnectionCard connection={data as Connection} {...commonProps} />
        );
      case "groups":
        return <GroupCard group={data as Group} {...commonProps} />;
      case "knowledge":
        return <LabelCard label={data as Label} {...commonProps} />;
      default:
        return null;
    }
  }

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{component.dimension}</Badge>
            {componentState && (
              <Badge variant="outline">Interactive</Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Share button */}
            {shareable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyShareLink}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Custom actions */}
            {customActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => action.onClick(component)}
                className="h-8 px-2"
              >
                {action.icon}
                <span className="ml-1 text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {renderComponent()}

        {/* Component metadata */}
        {component.metadata && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              {Object.entries(component.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive actions */}
        {interactive && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction?.("view_details", component)}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction?.("open", component)}
            >
              Open
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * ComponentToChatList - List of embedded components in chat
 */
export interface ComponentToChatListProps {
  components: EmbeddedComponent[];
  interactive?: boolean;
  shareable?: boolean;
  onAction?: (action: string, data: any) => void;
}

export function ComponentToChatList({
  components,
  interactive,
  shareable,
  onAction,
}: ComponentToChatListProps) {
  return (
    <div className="space-y-4">
      {components.map((component) => (
        <ComponentToChat
          key={component.id}
          component={component}
          interactive={interactive}
          shareable={shareable}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
