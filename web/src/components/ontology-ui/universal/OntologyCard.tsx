/**
 * OntologyCard - Universal card component that adapts to any dimension
 *
 * Automatically detects the dimension and renders the appropriate card component.
 * This is the single entry point for rendering any ontology entity as a card.
 */

import type { Dimension, Group, Person, Thing, Connection, Event, Label, CardProps } from "../types";
import { GroupCard } from "../groups/GroupCard";
import { UserCard } from "../people/UserCard";
import { ThingCard } from "../things/ThingCard";
import { ConnectionCard } from "../connections/ConnectionCard";
import { EventCard } from "../events/EventCard";
import { LabelCard } from "../knowledge/LabelCard";

type OntologyData = Group | Person | Thing | Connection | Event | Label;

export interface OntologyCardProps extends CardProps {
  data: OntologyData;
  dimension: Dimension;
  // Dimension-specific props
  showType?: boolean;
  showRole?: boolean;
  showEmail?: boolean;
  showMembers?: boolean;
  showMetadata?: boolean;
  showActor?: boolean;
  showTarget?: boolean;
  expandable?: boolean;
}

/**
 * Universal card component that adapts to any of the 6 dimensions
 *
 * @example
 * ```tsx
 * // Renders a GroupCard
 * <OntologyCard data={group} dimension="groups" />
 *
 * // Renders a ThingCard
 * <OntologyCard data={product} dimension="things" />
 *
 * // Renders an EventCard
 * <OntologyCard data={event} dimension="events" />
 * ```
 */
export function OntologyCard({
  data,
  dimension,
  showType = true,
  showRole = true,
  showEmail = true,
  showMembers = true,
  showMetadata = false,
  showActor = true,
  showTarget = true,
  expandable = true,
  variant = "default",
  size = "md",
  interactive = false,
  onClick,
  className,
}: OntologyCardProps) {
  // Delegate to dimension-specific card components
  switch (dimension) {
    case "groups":
      return (
        <GroupCard
          group={data as Group}
          showMembers={showMembers}
          showMetadata={showMetadata}
          variant={variant}
          size={size}
          interactive={interactive}
          onClick={onClick}
          className={className}
        />
      );

    case "people":
      return (
        <UserCard
          user={data as Person}
          showRole={showRole}
          showEmail={showEmail}
          variant={variant}
          size={size}
          interactive={interactive}
          onClick={onClick}
          className={className}
        />
      );

    case "things":
      return (
        <ThingCard
          thing={data as Thing}
          showType={showType}
          variant={variant}
          size={size}
          interactive={interactive}
          onClick={onClick}
          className={className}
        />
      );

    case "connections":
      return (
        <ConnectionCard
          connection={data as Connection}
          variant={variant}
          size={size}
          interactive={interactive}
          onClick={onClick}
          className={className}
        />
      );

    case "events":
      return (
        <EventCard
          event={data as Event}
          showActor={showActor}
          showTarget={showTarget}
          expandable={expandable}
          variant={variant}
          size={size}
          interactive={interactive}
          onClick={onClick}
          className={className}
        />
      );

    case "knowledge":
      return (
        <LabelCard
          label={data as Label}
          variant={variant}
          size={size}
          interactive={interactive}
          onClick={onClick}
          className={className}
        />
      );

    default:
      // Fallback for unknown dimensions
      const _exhaustive: never = dimension;
      return null;
  }
}
