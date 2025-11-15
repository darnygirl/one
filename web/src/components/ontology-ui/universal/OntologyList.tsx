/**
 * OntologyList - Universal list component that adapts to any dimension
 *
 * Renders a list with search, filter, sort, and pagination capabilities.
 * Delegates to dimension-specific list components.
 */

import type { Dimension, ListProps } from "../types";
import { GroupList } from "../groups/GroupList";
import { UserList } from "../people/UserList";
import { ThingList } from "../things/ThingList";
import { ConnectionList } from "../connections/ConnectionList";
import { EventList } from "../events/EventList";
import { LabelList } from "../knowledge/LabelList";

export interface OntologyListProps extends ListProps {
  items: any[];
  dimension: Dimension;
  onItemClick?: (item: any) => void;
  // Display options
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  compact?: boolean;
}

/**
 * Universal list component that adapts to any of the 6 dimensions
 *
 * @example
 * ```tsx
 * // Renders a GroupList with search and pagination
 * <OntologyList
 *   items={groups}
 *   dimension="groups"
 *   searchable
 *   paginated
 *   pageSize={20}
 * />
 *
 * // Renders a ThingList with filtering
 * <OntologyList
 *   items={products}
 *   dimension="things"
 *   filterable
 *   onItemClick={(product) => console.log(product)}
 * />
 * ```
 */
export function OntologyList({
  items,
  dimension,
  onItemClick,
  showSearch = true,
  showFilters = false,
  showSort = false,
  compact = false,
  searchable = true,
  filterable = false,
  sortable = false,
  paginated = true,
  pageSize = 10,
  groupId,
  userId,
  className,
}: OntologyListProps) {
  // Delegate to dimension-specific list components
  switch (dimension) {
    case "groups":
      return (
        <GroupList
          groups={items}
          onGroupClick={onItemClick}
          searchable={searchable}
          filterable={filterable}
          sortable={sortable}
          paginated={paginated}
          pageSize={pageSize}
          groupId={groupId}
          userId={userId}
          className={className}
        />
      );

    case "people":
      return (
        <UserList
          users={items}
          onUserClick={onItemClick}
          searchable={searchable}
          filterable={filterable}
          sortable={sortable}
          paginated={paginated}
          pageSize={pageSize}
          groupId={groupId}
          userId={userId}
          className={className}
        />
      );

    case "things":
      return (
        <ThingList
          things={items}
          onThingClick={onItemClick}
          searchable={searchable}
          filterable={filterable}
          sortable={sortable}
          paginated={paginated}
          pageSize={pageSize}
          groupId={groupId}
          userId={userId}
          className={className}
        />
      );

    case "connections":
      return (
        <ConnectionList
          connections={items}
          onConnectionClick={onItemClick}
          searchable={searchable}
          filterable={filterable}
          sortable={sortable}
          paginated={paginated}
          pageSize={pageSize}
          groupId={groupId}
          userId={userId}
          className={className}
        />
      );

    case "events":
      return (
        <EventList
          events={items}
          onEventClick={onItemClick}
          searchable={searchable}
          filterable={filterable}
          sortable={sortable}
          paginated={paginated}
          pageSize={pageSize}
          groupId={groupId}
          userId={userId}
          className={className}
        />
      );

    case "knowledge":
      return (
        <LabelList
          labels={items}
          onLabelClick={onItemClick}
          searchable={searchable}
          filterable={filterable}
          sortable={sortable}
          paginated={paginated}
          pageSize={pageSize}
          groupId={groupId}
          userId={userId}
          className={className}
        />
      );

    default:
      // Fallback for unknown dimensions
      const _exhaustive: never = dimension;
      return null;
  }
}
