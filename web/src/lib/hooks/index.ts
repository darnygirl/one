/**
 * Hooks Index - Exports all React hooks
 *
 * Phase 2: React hooks wrapping Effect.ts services (Cycle 46+)
 */

// ============================================================================
// ONTOLOGY HOOKS (6-Dimension Model)
// ============================================================================

// Group Hooks (Cycle 46)
export {
  useGroup,
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useGroupHierarchy,
} from "./useGroup";

// Person Hooks (Cycle 47)
export {
  usePerson,
  usePeople,
  useUpdatePerson,
  useInvite,
  usePersonPermissions,
  useCreatePerson,
} from "./usePerson";

// Thing Hooks (Cycle 48)
export {
  useThing,
  useThings,
  useCreateThing,
  useUpdateThing,
  useSearchThings,
  useCourses,
  useProducts,
  usePosts,
} from "./useThing";

// Connection Hooks (Cycle 49)
export {
  useConnection,
  useConnections,
  useCreateConnection,
  useNetwork,
  useOutgoingConnections,
  useIncomingConnections,
  useConnectionExists,
} from "./useConnection";

// Event Hooks (Cycle 50)
export {
  useEvent,
  useEvents,
  useLogEvent,
  useEventTimeline,
  useAuditLog,
  useEventStats,
  useEventStream,
  useEventsByType,
} from "./useEvent";

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Existing hooks
export { useMediaQuery } from "./useMediaQuery";
export { useVideoPlayer } from "./useVideoPlayer";
