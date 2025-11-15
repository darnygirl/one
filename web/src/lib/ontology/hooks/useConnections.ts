/**
 * useConnections Hook
 *
 * Fetches connections for a given thing.
 * This hook will integrate with Convex queries when the backend is ready.
 */

import { type Connection } from "../types";
import { useState, useEffect } from "react";

/**
 * Mock connection data for development
 * Replace with actual Convex query when backend is ready
 */
const mockConnections: Record<string, any[]> = {};

/**
 * Fetch connections for a thing
 *
 * @param thingId - The ID of the thing to get connections for
 * @returns Array of connections (empty for now - mock data)
 *
 * @example
 * ```tsx
 * const connections = useConnections(thing._id);
 * console.log(connections); // [{ relationshipType: "enrolled_in", ... }]
 * ```
 */
export function useConnections(thingId: string): any[] {
  const [connections, setConnections] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Replace with Convex query
    // const query = useQuery(api.connections.list, { thingId });
    // setConnections(query || []);

    // For now, return mock data
    setConnections(mockConnections[thingId] || []);
  }, [thingId]);

  return connections;
}
