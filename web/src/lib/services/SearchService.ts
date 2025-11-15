/**
 * SearchService - Effect.ts Semantic Search
 *
 * Provides semantic search capabilities with vector embeddings,
 * full-text search, and intelligent indexing.
 *
 * Features:
 * - Vector embedding generation
 * - Semantic similarity search
 * - Document indexing/deletion
 * - Parallel search execution
 * - Type-safe error handling
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { SearchService } from "@/lib/services/SearchService";
 *
 * const program = Effect.gen(function* () {
 *   const searchService = yield* SearchService;
 *
 *   // Index a document
 *   yield* searchService.indexDocument({
 *     id: "doc-1",
 *     text: "AI-powered semantic search",
 *     metadata: { type: "article" }
 *   });
 *
 *   // Search with semantic similarity
 *   const results = yield* searchService.search("artificial intelligence", {
 *     limit: 10,
 *     threshold: 0.8
 *   });
 *
 *   return results;
 * });
 * ```
 */

import { Effect, Context } from "effect";

// ============================================================================
// ERROR TYPES
// ============================================================================

export class SearchIndexError {
  readonly _tag = "SearchIndexError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class SearchQueryError {
  readonly _tag = "SearchQueryError";
  constructor(
    readonly query: string,
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class EmbeddingGenerationError {
  readonly _tag = "EmbeddingGenerationError";
  constructor(
    readonly text: string,
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class DocumentNotFoundError {
  readonly _tag = "DocumentNotFoundError";
  constructor(readonly id: string) {}
}

export type SearchError =
  | SearchIndexError
  | SearchQueryError
  | EmbeddingGenerationError
  | DocumentNotFoundError;

// ============================================================================
// TYPES
// ============================================================================

export interface SearchDocument {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
}

export interface SearchResult {
  id: string;
  text: string;
  score: number;
  metadata?: Record<string, unknown>;
  highlights?: string[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  threshold?: number;
  filters?: Record<string, unknown>;
  includeHighlights?: boolean;
  searchType?: "semantic" | "fulltext" | "hybrid";
}

export interface IndexOptions {
  generateEmbedding?: boolean;
  embeddingModel?: string;
  chunkSize?: number;
  overwrite?: boolean;
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface ISearchService {
  /**
   * Search documents by query
   *
   * Performs semantic or full-text search based on options
   *
   * @param query - Search query string
   * @param options - Search configuration
   * @returns Array of search results
   */
  search: (
    query: string,
    options?: SearchOptions
  ) => Effect.Effect<SearchResult[], SearchError>;

  /**
   * Index a document for search
   *
   * Adds a document to the search index with optional embedding
   *
   * @param document - Document to index
   * @param options - Indexing configuration
   * @returns Document ID
   */
  indexDocument: (
    document: SearchDocument,
    options?: IndexOptions
  ) => Effect.Effect<string, SearchError>;

  /**
   * Delete a document from the index
   *
   * @param id - Document ID to delete
   * @returns void
   */
  deleteDocument: (id: string) => Effect.Effect<void, SearchError>;

  /**
   * Generate embedding for text
   *
   * Creates a vector embedding using configured model
   *
   * @param text - Text to embed
   * @param model - Embedding model name (optional)
   * @returns Embedding vector
   */
  generateEmbedding: (
    text: string,
    model?: string
  ) => Effect.Effect<number[], EmbeddingGenerationError>;

  /**
   * Batch search multiple queries in parallel
   *
   * Executes multiple searches concurrently for better performance
   *
   * @param queries - Array of search queries
   * @param options - Search configuration
   * @returns Array of search result arrays
   */
  batchSearch: (
    queries: string[],
    options?: SearchOptions
  ) => Effect.Effect<SearchResult[][], SearchError>;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export class SearchServiceImpl implements ISearchService {
  constructor(
    private readonly embeddingEndpoint?: string,
    private readonly searchEndpoint?: string
  ) {}

  search = (
    query: string,
    options: SearchOptions = {}
  ): Effect.Effect<SearchResult[], SearchError> =>
    Effect.gen(this, function* () {
      const {
        limit = 10,
        offset = 0,
        threshold = 0.7,
        searchType = "hybrid",
        includeHighlights = false,
      } = options;

      try {
        // For semantic/hybrid search, generate query embedding
        let queryEmbedding: number[] | undefined;
        if (searchType === "semantic" || searchType === "hybrid") {
          queryEmbedding = yield* this.generateEmbedding(query);
        }

        // Execute search (placeholder - integrate with actual search backend)
        const results: SearchResult[] = yield* this._executeSearch({
          query,
          queryEmbedding,
          limit,
          offset,
          threshold,
          searchType,
          includeHighlights,
          filters: options.filters,
        });

        return results;
      } catch (error) {
        return yield* Effect.fail(
          new SearchQueryError(
            query,
            error instanceof Error ? error.message : "Search failed",
            error
          )
        );
      }
    });

  indexDocument = (
    document: SearchDocument,
    options: IndexOptions = {}
  ): Effect.Effect<string, SearchError> =>
    Effect.gen(this, function* () {
      const { generateEmbedding = true, embeddingModel, overwrite = false } = options;

      try {
        // Generate embedding if requested and not provided
        let embedding = document.embedding;
        if (generateEmbedding && !embedding) {
          embedding = yield* this.generateEmbedding(document.text, embeddingModel);
        }

        // Index document (placeholder - integrate with actual search backend)
        yield* this._indexDocument({
          ...document,
          embedding,
          overwrite,
        });

        return document.id;
      } catch (error) {
        return yield* Effect.fail(
          new SearchIndexError(
            error instanceof Error ? error.message : "Indexing failed",
            error
          )
        );
      }
    });

  deleteDocument = (id: string): Effect.Effect<void, SearchError> =>
    Effect.gen(this, function* () {
      try {
        // Delete from index (placeholder - integrate with actual search backend)
        yield* this._deleteDocument(id);
      } catch (error) {
        return yield* Effect.fail(
          new SearchIndexError(
            error instanceof Error ? error.message : "Delete failed",
            error
          )
        );
      }
    });

  generateEmbedding = (
    text: string,
    model: string = "text-embedding-3-small"
  ): Effect.Effect<number[], EmbeddingGenerationError> =>
    Effect.gen(this, function* () {
      try {
        // Call embedding API (placeholder - integrate with OpenAI/etc)
        const endpoint = this.embeddingEndpoint || "/api/embeddings";

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text, model }),
            }),
          catch: (error) =>
            new EmbeddingGenerationError(
              text,
              error instanceof Error ? error.message : "Network error",
              error
            ),
        });

        if (!response.ok) {
          return yield* Effect.fail(
            new EmbeddingGenerationError(
              text,
              `HTTP ${response.status}: ${response.statusText}`
            )
          );
        }

        const data = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) =>
            new EmbeddingGenerationError(
              text,
              "Failed to parse response",
              error
            ),
        });

        return data.embedding as number[];
      } catch (error) {
        return yield* Effect.fail(
          new EmbeddingGenerationError(
            text,
            error instanceof Error ? error.message : "Unknown error",
            error
          )
        );
      }
    });

  batchSearch = (
    queries: string[],
    options?: SearchOptions
  ): Effect.Effect<SearchResult[][], SearchError> =>
    Effect.gen(this, function* () {
      // Execute searches in parallel using Effect.all
      const searchEffects = queries.map((query) => this.search(query, options));

      return yield* Effect.all(searchEffects, { concurrency: 5 });
    });

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private _executeSearch = (params: {
    query: string;
    queryEmbedding?: number[];
    limit: number;
    offset: number;
    threshold: number;
    searchType: string;
    includeHighlights: boolean;
    filters?: Record<string, unknown>;
  }): Effect.Effect<SearchResult[], SearchError> =>
    Effect.gen(this, function* () {
      // TODO: Integrate with actual search backend (Convex, Algolia, etc.)
      // For now, return placeholder results
      console.log("Executing search:", params);

      return [
        {
          id: "1",
          text: "Sample search result",
          score: 0.95,
          metadata: { type: "document" },
          highlights: params.includeHighlights
            ? [`...${params.query} found...`]
            : undefined,
        },
      ];
    });

  private _indexDocument = (params: {
    id: string;
    text: string;
    embedding?: number[];
    metadata?: Record<string, unknown>;
    overwrite: boolean;
  }): Effect.Effect<void, SearchError> =>
    Effect.gen(this, function* () {
      // TODO: Integrate with actual search backend
      console.log("Indexing document:", params);
    });

  private _deleteDocument = (id: string): Effect.Effect<void, SearchError> =>
    Effect.gen(this, function* () {
      // TODO: Integrate with actual search backend
      console.log("Deleting document:", id);
    });
}

// ============================================================================
// SERVICE TAG (Dependency Injection)
// ============================================================================

export class SearchService extends Context.Tag("SearchService")<
  SearchService,
  ISearchService
>() {}

// ============================================================================
// LAYER FACTORY
// ============================================================================

/**
 * Create SearchService layer with configuration
 *
 * @param config - Service configuration
 * @returns Effect Layer
 */
export const makeSearchServiceLayer = (config?: {
  embeddingEndpoint?: string;
  searchEndpoint?: string;
}) =>
  SearchService.of({
    ...new SearchServiceImpl(config?.embeddingEndpoint, config?.searchEndpoint),
  });

/**
 * Default SearchService layer
 */
export const SearchServiceLive = makeSearchServiceLayer();
