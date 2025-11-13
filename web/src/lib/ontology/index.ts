/**
 * Ontology Library - Public API
 *
 * Export all ontology types, configs, and hooks.
 *
 * @example
 * ```tsx
 * import { useThingConfig, getThingConfig } from "@/lib/ontology";
 * import type { Thing, ThingConfig } from "@/lib/ontology";
 * ```
 */

// Types
export * from "./types";

// Configuration
export * from "./config";

// Hooks
export * from "./hooks/useThingConfig";
export * from "./hooks/useConnections";
export * from "./hooks/useAction";
