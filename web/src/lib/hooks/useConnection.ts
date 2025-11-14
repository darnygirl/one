/**
 * Cycle 49: useConnection Hook - React hook wrapping ConnectionService
 *
 * Provides React hooks for relationship/connection management with Effect.ts integration.
 * Includes network graph queries, loading/error states, and real-time updates.
 */

import { useState, useEffect, useCallback } from "react";
import { Effect } from "effect";
import type { Connection, ConnectionFilter, CreateConnectionInput } from "@/lib/ontology/types";
import { ConnectionService, runConnectionService } from "@/lib/services/ConnectionService";
import type { OntologyError } from "@/lib/ontology/errors";

// ============================================================================
// Hook Types
// ============================================================================

interface UseConnectionResult {
  connection: Connection | null;
  loading: boolean;
  error: OntologyError | null;
  refetch: () => Promise<void>;
}

interface UseConnectionsResult {
  connections: Connection[];
  loading: boolean;
  error: OntologyError | null;
  refetch: () => Promise<void>;
}

interface UseCreateConnectionResult {
  createConnection: (input: CreateConnectionInput) => Promise<Connection | null>;
  loading: boolean;
  error: OntologyError | null;
}

interface UseNetworkResult {
  incoming: Connection[];
  outgoing: Connection[];
  total: number;
  loading: boolean;
  error: OntologyError | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch a single connection by ID
 *
 * @example
 * ```tsx
 * const { connection, loading, error } = useConnection("conn_123");
 * ```
 */
export function useConnection(id: string | null): UseConnectionResult {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchConnection = useCallback(async () => {
    if (!id) {
      setConnection(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ConnectionService;
        return yield* service.read(id);
      });

      const result = await runConnectionService(program);
      setConnection(result);
    } catch (err) {
      setError(err as OntologyError);
      setConnection(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  return { connection, loading, error, refetch: fetchConnection };
}

/**
 * Hook to fetch multiple connections with optional filtering
 *
 * @example
 * ```tsx
 * const { connections, loading } = useConnections({ groupId: "group_123", relationshipType: "owns" });
 * ```
 */
export function useConnections(filter?: ConnectionFilter): UseConnectionsResult {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ConnectionService;
        return yield* service.list(filter);
      });

      const result = await runConnectionService(program);
      setConnections(result);
    } catch (err) {
      setError(err as OntologyError);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return { connections, loading, error, refetch: fetchConnections };
}

/**
 * Hook to create a new connection
 *
 * @example
 * ```tsx
 * const { createConnection, loading } = useCreateConnection();
 * await createConnection({
 *   groupId: "group_123",
 *   fromThingId: "thing_1",
 *   toThingId: "thing_2",
 *   relationshipType: "owns"
 * });
 * ```
 */
export function useCreateConnection(): UseCreateConnectionResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const createConnection = useCallback(async (input: CreateConnectionInput) => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ConnectionService;
        return yield* service.create(input);
      });

      const result = await runConnectionService(program);
      return result;
    } catch (err) {
      setError(err as OntologyError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createConnection, loading, error };
}

/**
 * Hook to get network graph for a thing (all connections)
 *
 * @example
 * ```tsx
 * const { incoming, outgoing, total, loading } = useNetwork("thing_123");
 * ```
 */
export function useNetwork(thingId: string | null): UseNetworkResult {
  const [incoming, setIncoming] = useState<Connection[]>([]);
  const [outgoing, setOutgoing] = useState<Connection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchNetwork = useCallback(async () => {
    if (!thingId) {
      setIncoming([]);
      setOutgoing([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ConnectionService;
        return yield* service.getNetwork(thingId);
      });

      const result = await runConnectionService(program);
      setIncoming(result.incoming);
      setOutgoing(result.outgoing);
      setTotal(result.total);
    } catch (err) {
      setError(err as OntologyError);
      setIncoming([]);
      setOutgoing([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [thingId]);

  useEffect(() => {
    fetchNetwork();
  }, [fetchNetwork]);

  return { incoming, outgoing, total, loading, error, refetch: fetchNetwork };
}

/**
 * Hook to get outgoing connections from a thing
 *
 * @example
 * ```tsx
 * const { connections, loading } = useOutgoingConnections("thing_123", "owns");
 * ```
 */
export function useOutgoingConnections(thingId: string | null, relationshipType?: string) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!thingId) {
      setConnections([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ConnectionService;
        return yield* service.getOutgoing(thingId, relationshipType);
      });

      const result = await runConnectionService(program);
      setConnections(result);
    } catch (err) {
      setError(err as OntologyError);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, [thingId, relationshipType]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return { connections, loading, error, refetch: fetchConnections };
}

/**
 * Hook to get incoming connections to a thing
 *
 * @example
 * ```tsx
 * const { connections, loading } = useIncomingConnections("thing_123", "purchased");
 * ```
 */
export function useIncomingConnections(thingId: string | null, relationshipType?: string) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!thingId) {
      setConnections([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ConnectionService;
        return yield* service.getIncoming(thingId, relationshipType);
      });

      const result = await runConnectionService(program);
      setConnections(result);
    } catch (err) {
      setError(err as OntologyError);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, [thingId, relationshipType]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return { connections, loading, error, refetch: fetchConnections };
}

/**
 * Hook to check if a connection exists
 *
 * @example
 * ```tsx
 * const { exists, loading } = useConnectionExists("thing_1", "thing_2", "owns");
 * ```
 */
export function useConnectionExists(
  fromThingId: string | null,
  toThingId: string | null,
  relationshipType: string
) {
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const checkExists = useCallback(async () => {
    if (!fromThingId || !toThingId) {
      setExists(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ConnectionService;
        return yield* service.exists(fromThingId, toThingId, relationshipType);
      });

      const result = await runConnectionService(program);
      setExists(result);
    } catch (err) {
      setError(err as OntologyError);
      setExists(false);
    } finally {
      setLoading(false);
    }
  }, [fromThingId, toThingId, relationshipType]);

  useEffect(() => {
    checkExists();
  }, [checkExists]);

  return { exists, loading, error, refetch: checkExists };
}
