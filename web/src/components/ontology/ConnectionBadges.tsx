/**
 * ConnectionBadges Component
 * Renders connection badges showing relationships to other things
 */

import { type Thing, type ConnectionUI } from "@/lib/ontology/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConnections } from "@/lib/ontology/hooks/useConnections";

interface ConnectionBadgesProps {
  thing: Thing;
  config: Record<string, ConnectionUI>;
}

export function ConnectionBadges({ thing, config }: ConnectionBadgesProps) {
  // Get connections for this thing
  const connections = useConnections(thing._id);

  const badges = Object.entries(config).map(([type, connectionConfig]) => {
    // Filter connections by type
    const items = connections.filter((c) => c.relationshipType === type);
    if (items.length === 0) return null;

    // Format label with count or name
    const label = connectionConfig.label
      .replace("{count}", items.length.toString())
      .replace("{name}", items[0]?.name || "");

    // Render based on display type
    switch (connectionConfig.display) {
      case "badge":
        return (
          <Badge key={type} variant="secondary" className="text-xs">
            {label}
          </Badge>
        );

      case "avatar":
        return (
          <div key={type} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={items[0]?.avatar} />
              <AvatarFallback>
                {items[0]?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        );

      case "inline":
        return (
          <span key={type} className="text-sm text-muted-foreground">
            {label}
          </span>
        );

      case "list":
        return (
          <div key={type} className="flex flex-wrap gap-1">
            {items.slice(0, connectionConfig.max || 5).map((item) => (
              <Badge key={item._id} variant="outline" className="text-xs">
                {item.name}
              </Badge>
            ))}
          </div>
        );

      default:
        return null;
    }
  });

  const validBadges = badges.filter(Boolean);
  if (validBadges.length === 0) return null;

  return <div className="flex flex-wrap items-center gap-2">{validBadges}</div>;
}
