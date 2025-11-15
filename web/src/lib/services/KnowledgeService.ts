/**
 * Cycle 31: KnowledgeService - Effect.ts service for knowledge/search
 *
 * Provides knowledge management with semantic search and categorization.
 * Uses Effect.ts for error handling, logging, and caching.
 */

import { Context, Effect, Layer, pipe, Cache, Duration } from "effect";
import type {
  Knowledge,
  CreateKnowledgeInput,
  KnowledgeFilter,
} from "@/lib/ontology/types";
import { OntologyErrors } from "@/lib/ontology/errors";
import type {
  KnowledgeNotFoundError,
  ValidationError,
  ThingNotFoundError,
} from "@/lib/ontology/errors";

// ============================================================================
// Knowledge Types
// ============================================================================

export interface SearchResult extends Knowledge {
  score: number;
  highlights?: string[];
}

export interface Category {
  label: string;
  count: number;
  things: string[];
}

// ============================================================================
// Service Interface
// ============================================================================

export interface IKnowledgeService {
  /**
   * Add a label to a thing
   */
  addLabel(
    input: CreateKnowledgeInput
  ): Effect.Effect<Knowledge, ValidationError | ThingNotFoundError>;

  /**
   * Search knowledge by label
   */
  search(
    query: string,
    groupId: string,
    limit?: number
  ): Effect.Effect<SearchResult[], never>;

  /**
   * Vector search (semantic search)
   */
  vectorSearch(
    embedding: number[],
    groupId: string,
    limit?: number
  ): Effect.Effect<SearchResult[], never>;

  /**
   * Get all categories for a group
   */
  getCategories(groupId: string): Effect.Effect<Category[], never>;

  /**
   * Read knowledge by ID
   */
  read(id: string): Effect.Effect<Knowledge, KnowledgeNotFoundError>;

  /**
   * List knowledge with optional filtering
   */
  list(filter?: KnowledgeFilter): Effect.Effect<Knowledge[], never>;

  /**
   * Delete knowledge entry
   */
  delete(id: string): Effect.Effect<void, KnowledgeNotFoundError>;

  /**
   * Generate embedding for text (mock implementation)
   */
  generateEmbedding(text: string): Effect.Effect<number[], never>;

  /**
   * Get related things by label
   */
  getRelated(
    thingId: string,
    limit?: number
  ): Effect.Effect<string[], never>;
}

// ============================================================================
// Service Context Tag
// ============================================================================

export class KnowledgeService extends Context.Tag("KnowledgeService")<
  KnowledgeService,
  IKnowledgeService
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

export const makeKnowledgeService = (): IKnowledgeService => {
  // In-memory store for demo (replace with actual backend)
  const knowledge = new Map<string, Knowledge>();

  // Cache for embeddings
  let embeddingCache: Cache.Cache<string, number[]> | null = null;

  return {
    addLabel: (input: CreateKnowledgeInput) =>
      Effect.gen(function* () {
        yield* Effect.log("KnowledgeService.addLabel", {
          thingId: input.thingId,
          label: input.label,
        });

        // Validate input
        if (!input.thingId) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "thingId",
              input.thingId,
              "Thing ID is required"
            )
          );
        }

        if (!input.label || input.label.trim() === "") {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "label",
              input.label,
              "Label cannot be empty"
            )
          );
        }

        if (!input.groupId) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "groupId",
              input.groupId,
              "Group ID is required"
            )
          );
        }

        // Generate embedding if text provided
        let embedding = input.embedding;
        if (!embedding && input.metadata?.text) {
          embedding = yield* Effect.succeed(
            Array.from(
              { length: 384 },
              () => Math.random() * 2 - 1
            )
          );
        }

        // Create knowledge entry
        const entry: Knowledge = {
          _id: \`knowledge_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          groupId: input.groupId,
          thingId: input.thingId,
          label: input.label,
          embedding,
          metadata: input.metadata,
          createdAt: Date.now(),
        };

        knowledge.set(entry._id, entry);

        yield* Effect.log("KnowledgeService.addLabel.success", {
          knowledgeId: entry._id,
          label: entry.label,
        });

        return entry;
      }),

    search: (query: string, groupId: string, limit = 10) =>
      Effect.gen(function* () {
        yield* Effect.log("KnowledgeService.search", {
          query,
          groupId,
          limit,
        });

        const queryLower = query.toLowerCase();
        const results: SearchResult[] = [];

        for (const entry of knowledge.values()) {
          if (entry.groupId !== groupId) continue;

          // Search in label
          const labelMatch = entry.label.toLowerCase().includes(queryLower);

          // Search in metadata
          const metadataMatch =
            entry.metadata &&
            JSON.stringify(entry.metadata).toLowerCase().includes(queryLower);

          if (labelMatch || metadataMatch) {
            // Calculate relevance score
            let score = 0;

            if (labelMatch) {
              score += entry.label.toLowerCase() === queryLower ? 1.0 : 0.5;
            }

            if (metadataMatch) {
              score += 0.3;
            }

            results.push({
              ...entry,
              score,
              highlights: labelMatch ? [entry.label] : [],
            });
          }
        }

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);

        // Apply limit
        const limited = results.slice(0, limit);

        yield* Effect.log("KnowledgeService.search.success", {
          query,
          count: limited.length,
        });

        return limited;
      }),

    vectorSearch: (embedding: number[], groupId: string, limit = 10) =>
      Effect.gen(function* () {
        yield* Effect.log("KnowledgeService.vectorSearch", {
          groupId,
          limit,
          embeddingDim: embedding.length,
        });

        const results: SearchResult[] = [];

        for (const entry of knowledge.values()) {
          if (entry.groupId !== groupId || !entry.embedding) continue;

          // Calculate cosine similarity
          const similarity = cosineSimilarity(embedding, entry.embedding);

          results.push({
            ...entry,
            score: similarity,
          });
        }

        // Sort by similarity descending
        results.sort((a, b) => b.score - a.score);

        // Apply limit
        const limited = results.slice(0, limit);

        yield* Effect.log("KnowledgeService.vectorSearch.success", {
          count: limited.length,
        });

        return limited;
      }),

    getCategories: (groupId: string) =>
      Effect.gen(function* () {
        yield* Effect.log("KnowledgeService.getCategories", { groupId });

        const categoryMap = new Map<string, Category>();

        for (const entry of knowledge.values()) {
          if (entry.groupId !== groupId) continue;

          const category = categoryMap.get(entry.label);
          if (category) {
            category.count++;
            if (!category.things.includes(entry.thingId)) {
              category.things.push(entry.thingId);
            }
          } else {
            categoryMap.set(entry.label, {
              label: entry.label,
              count: 1,
              things: [entry.thingId],
            });
          }
        }

        const categories = Array.from(categoryMap.values()).sort(
          (a, b) => b.count - a.count
        );

        yield* Effect.log("KnowledgeService.getCategories.success", {
          groupId,
          count: categories.length,
        });

        return categories;
      }),

    read: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("KnowledgeService.read", { id });

        const entry = knowledge.get(id);
        if (!entry) {
          return yield* Effect.fail(OntologyErrors.knowledgeNotFound(id));
        }

        yield* Effect.log("KnowledgeService.read.success", { id });
        return entry;
      }),

    list: (filter?: KnowledgeFilter) =>
      Effect.gen(function* () {
        yield* Effect.log("KnowledgeService.list", { filter });

        let result = Array.from(knowledge.values());

        // Apply filters
        if (filter?.groupId) {
          result = result.filter((k) => k.groupId === filter.groupId);
        }

        if (filter?.thingId) {
          result = result.filter((k) => k.thingId === filter.thingId);
        }

        if (filter?.label) {
          result = result.filter((k) => k.label === filter.label);
        }

        // Apply sorting
        if (filter?.sortBy) {
          const sortBy = filter.sortBy as keyof Knowledge;
          const sortOrder = filter.sortOrder || "asc";

          result.sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];

            if (aVal === bVal) return 0;
            if (aVal === undefined) return 1;
            if (bVal === undefined) return -1;

            const comparison = aVal < bVal ? -1 : 1;
            return sortOrder === "asc" ? comparison : -comparison;
          });
        }

        // Apply pagination
        if (filter?.offset !== undefined) {
          result = result.slice(filter.offset);
        }

        if (filter?.limit !== undefined) {
          result = result.slice(0, filter.limit);
        }

        yield* Effect.log("KnowledgeService.list.success", {
          count: result.length,
        });

        return result;
      }),

    delete: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("KnowledgeService.delete", { id });

        const entry = knowledge.get(id);
        if (!entry) {
          return yield* Effect.fail(OntologyErrors.knowledgeNotFound(id));
        }

        knowledge.delete(id);

        yield* Effect.log("KnowledgeService.delete.success", { id });
      }),

    generateEmbedding: (text: string) =>
      Effect.gen(function* () {
        yield* Effect.log("KnowledgeService.generateEmbedding", {
          textLength: text.length,
        });

        // Mock embedding generation (replace with actual API call)
        // In production, use OpenAI, Cohere, or local models
        const embedding = Array.from({ length: 384 }, (_, i) => {
          // Pseudo-random based on text content
          const hash = text.split("").reduce((acc, char, idx) => {
            return acc + char.charCodeAt(0) * (i + idx + 1);
          }, 0);
          return (Math.sin(hash) + 1) / 2 - 0.5;
        });

        yield* Effect.log("KnowledgeService.generateEmbedding.success", {
          dimension: embedding.length,
        });

        return embedding;
      }),

    getRelated: (thingId: string, limit = 10) =>
      Effect.gen(function* () {
        yield* Effect.log("KnowledgeService.getRelated", { thingId, limit });

        // Get all labels for this thing
        const thingLabels = Array.from(knowledge.values())
          .filter((k) => k.thingId === thingId)
          .map((k) => k.label);

        if (thingLabels.length === 0) {
          return [];
        }

        // Find other things with the same labels
        const relatedThings = new Map<string, number>();

        for (const entry of knowledge.values()) {
          if (entry.thingId === thingId) continue;

          if (thingLabels.includes(entry.label)) {
            const score = relatedThings.get(entry.thingId) || 0;
            relatedThings.set(entry.thingId, score + 1);
          }
        }

        // Sort by score and return top N
        const sorted = Array.from(relatedThings.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([thingId]) => thingId);

        yield* Effect.log("KnowledgeService.getRelated.success", {
          thingId,
          count: sorted.length,
        });

        return sorted;
      }),
  };
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ============================================================================
// Service Layer
// ============================================================================

export const KnowledgeServiceLive = Layer.succeed(
  KnowledgeService,
  makeKnowledgeService()
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Run a KnowledgeService effect with live dependencies
 */
export const runKnowledgeService = <E, A>(
  effect: Effect.Effect<A, E, KnowledgeService>
): Promise<A> =>
  pipe(effect, Effect.provide(KnowledgeServiceLive), Effect.runPromise);
