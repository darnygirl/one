/**
 * Cycle 97: ChatToComponent
 *
 * Stream chat AI responses into ontology components
 * - Parse AI output to extract structured data
 * - Render appropriate ontology-ui component
 * - Handle errors gracefully
 * - Support all 6 dimensions
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

export interface ChatToComponentProps {
  /** AI response stream */
  stream: ReadableStream<string> | string;
  /** Expected component type */
  expectedType?: Dimension;
  /** Callback when component is rendered */
  onComponentRendered?: (component: any) => void;
  /** Callback when parsing fails */
  onError?: (error: Error) => void;
  /** Custom parser for specific formats */
  customParser?: (text: string) => ParsedComponent | null;
}

export interface ParsedComponent {
  dimension: Dimension;
  data: Thing | Person | Event | Connection | Group | Label;
  metadata?: Record<string, any>;
}

/**
 * ChatToComponent - Converts AI chat responses into ontology components
 *
 * @example
 * ```tsx
 * <ChatToComponent
 *   stream={aiResponse}
 *   expectedType="things"
 *   onComponentRendered={(component) => console.log('Rendered:', component)}
 * />
 * ```
 */
export function ChatToComponent({
  stream,
  expectedType,
  onComponentRendered,
  onError,
  customParser,
}: ChatToComponentProps) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [parsedComponent, setParsedComponent] = useState<ParsedComponent | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Stream content
  useEffect(() => {
    if (typeof stream === "string") {
      setContent(stream);
      setIsStreaming(false);
      parseContent(stream);
    } else {
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      async function readStream() {
        try {
          let accumulated = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              setIsStreaming(false);
              parseContent(accumulated);
              break;
            }
            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;
            setContent(accumulated);
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setIsStreaming(false);
          onError?.(error);
        }
      }

      readStream();
    }
  }, [stream]);

  // Parse content into component
  function parseContent(text: string) {
    try {
      // Try custom parser first
      if (customParser) {
        const result = customParser(text);
        if (result) {
          setParsedComponent(result);
          onComponentRendered?.(result);
          return;
        }
      }

      // Try JSON parsing
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        const component = detectAndParse(parsed);
        if (component) {
          setParsedComponent(component);
          onComponentRendered?.(component);
          return;
        }
      }

      // Try extracting key-value pairs
      const component = parseKeyValue(text);
      if (component) {
        setParsedComponent(component);
        onComponentRendered?.(component);
        return;
      }

      throw new Error("Could not parse AI response into component");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    }
  }

  // Detect component type from data
  function detectAndParse(data: any): ParsedComponent | null {
    // Check for Thing
    if (data.type && data.name && data.groupId) {
      return {
        dimension: "things",
        data: data as Thing,
      };
    }

    // Check for Person
    if (data.role && data.email) {
      return {
        dimension: "people",
        data: data as Person,
      };
    }

    // Check for Event
    if (data.type && data.actorId && data.timestamp) {
      return {
        dimension: "events",
        data: data as Event,
      };
    }

    // Check for Connection
    if (data.fromId && data.toId && data.type) {
      return {
        dimension: "connections",
        data: data as Connection,
      };
    }

    // Check for Group
    if (data.name && !data.type) {
      return {
        dimension: "groups",
        data: data as Group,
      };
    }

    // Check for Label
    if (data.label && data.thingId) {
      return {
        dimension: "knowledge",
        data: data as Label,
      };
    }

    return null;
  }

  // Parse key-value format
  function parseKeyValue(text: string): ParsedComponent | null {
    const lines = text.split("\n");
    const data: Record<string, any> = {};

    for (const line of lines) {
      const match = line.match(/^([A-Za-z_]+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        data[key.toLowerCase()] = value.trim();
      }
    }

    if (Object.keys(data).length > 0) {
      return detectAndParse(data);
    }

    return null;
  }

  // Render appropriate component
  function renderComponent() {
    if (!parsedComponent) return null;

    const { dimension, data } = parsedComponent;

    switch (dimension) {
      case "things":
        return <ThingCard thing={data as Thing} type={(data as Thing).type} />;
      case "people":
        return <UserCard user={data as Person} />;
      case "events":
        return <EventCard event={data as Event} />;
      case "connections":
        return <ConnectionCard connection={data as Connection} />;
      case "groups":
        return <GroupCard group={data as Group} />;
      case "knowledge":
        return <LabelCard label={data as Label} />;
      default:
        return null;
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          <strong>Error parsing AI response:</strong> {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isStreaming) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Streaming...</Badge>
            {expectedType && <span className="text-sm text-muted-foreground">{expectedType}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm font-mono whitespace-pre-wrap">{content}</div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (parsedComponent) {
    return (
      <div className="space-y-2">
        <Badge variant="default">{parsedComponent.dimension}</Badge>
        {renderComponent()}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Response</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm font-mono whitespace-pre-wrap bg-muted p-4 rounded">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
