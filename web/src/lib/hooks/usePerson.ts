/**
 * Cycle 47: usePerson Hook - React hook wrapping PersonService
 *
 * Provides React hooks for person/user management with Effect.ts integration.
 * Includes loading/error states and optimistic updates.
 */

import { useState, useEffect, useCallback } from "react";
import { Effect } from "effect";
import type { Person, PersonFilter, CreatePersonInput, UpdatePersonInput } from "@/lib/ontology/types";
import { PersonService, runPersonService, type Role } from "@/lib/services/PersonService";
import type { OntologyError } from "@/lib/ontology/errors";

// ============================================================================
// Hook Types
// ============================================================================

interface UsePersonResult {
  person: Person | null;
  loading: boolean;
  error: OntologyError | null;
  refetch: () => Promise<void>;
}

interface UsePeopleResult {
  people: Person[];
  loading: boolean;
  error: OntologyError | null;
  refetch: () => Promise<void>;
}

interface UseUpdatePersonResult {
  updatePerson: (id: string, input: UpdatePersonInput) => Promise<Person | null>;
  loading: boolean;
  error: OntologyError | null;
}

interface UseInviteResult {
  invitePerson: (email: string, groupId: string, role: Role) => Promise<Person | null>;
  loading: boolean;
  error: OntologyError | null;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch a single person by ID
 *
 * @example
 * ```tsx
 * const { person, loading, error } = usePerson("person_123");
 * ```
 */
export function usePerson(id: string | null): UsePersonResult {
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchPerson = useCallback(async () => {
    if (!id) {
      setPerson(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* PersonService;
        return yield* service.read(id);
      });

      const result = await runPersonService(program);
      setPerson(result);
    } catch (err) {
      setError(err as OntologyError);
      setPerson(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPerson();
  }, [fetchPerson]);

  return { person, loading, error, refetch: fetchPerson };
}

/**
 * Hook to fetch multiple people with optional filtering
 *
 * @example
 * ```tsx
 * const { people, loading } = usePeople({ groupId: "group_123", role: "org_user" });
 * ```
 */
export function usePeople(filter?: PersonFilter): UsePeopleResult {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* PersonService;
        return yield* service.list(filter);
      });

      const result = await runPersonService(program);
      setPeople(result);
    } catch (err) {
      setError(err as OntologyError);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  return { people, loading, error, refetch: fetchPeople };
}

/**
 * Hook to update a person
 *
 * @example
 * ```tsx
 * const { updatePerson, loading } = useUpdatePerson();
 * await updatePerson("person_123", { name: "John Doe" });
 * ```
 */
export function useUpdatePerson(): UseUpdatePersonResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const updatePerson = useCallback(async (id: string, input: UpdatePersonInput) => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* PersonService;
        return yield* service.update(id, input);
      });

      const result = await runPersonService(program);
      return result;
    } catch (err) {
      setError(err as OntologyError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updatePerson, loading, error };
}

/**
 * Hook to invite a person to a group
 *
 * @example
 * ```tsx
 * const { invitePerson, loading } = useInvite();
 * await invitePerson("user@example.com", "group_123", "org_user");
 * ```
 */
export function useInvite(): UseInviteResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const invitePerson = useCallback(async (email: string, groupId: string, role: Role) => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* PersonService;
        return yield* service.invite(email, groupId, role);
      });

      const result = await runPersonService(program);
      return result;
    } catch (err) {
      setError(err as OntologyError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { invitePerson, loading, error };
}

/**
 * Hook to get permissions for a person
 *
 * @example
 * ```tsx
 * const { permissions, loading } = usePersonPermissions("person_123");
 * ```
 */
export function usePersonPermissions(id: string | null) {
  const [permissions, setPermissions] = useState<{ action: string; resource: string; scope: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!id) {
      setPermissions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* PersonService;
        return yield* service.getPermissions(id);
      });

      const result = await runPersonService(program);
      setPermissions(result);
    } catch (err) {
      setError(err as OntologyError);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return { permissions, loading, error, refetch: fetchPermissions };
}

/**
 * Hook to create a new person
 *
 * @example
 * ```tsx
 * const { createPerson, loading } = useCreatePerson();
 * await createPerson({ email: "user@example.com", groupId: "group_123", role: "org_user" });
 * ```
 */
export function useCreatePerson() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const createPerson = useCallback(async (input: CreatePersonInput) => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* PersonService;
        return yield* service.create(input);
      });

      const result = await runPersonService(program);
      return result;
    } catch (err) {
      setError(err as OntologyError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPerson, loading, error };
}
