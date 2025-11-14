/**
 * KNOWLEDGE Dimension Components
 *
 * Labels, vectors, and semantic search (10 components total)
 * Component numbers: #75-84 from the ontology-ui library
 */

// ============================================================================
// Available Components
// ============================================================================

// #75 - LabelCard - Card for displaying labels
export { LabelCard } from "./LabelCard";
export type { LabelCardProps } from "./LabelCard";

// #76 - LabelList - List of labels with counts
export { LabelList } from "./LabelList";
export type { LabelListProps } from "./LabelList";

// #77 - LabelCreator - Form for creating labels
export { LabelCreator } from "./LabelCreator";
export type { LabelCreatorProps } from "./LabelCreator";

// #78 - TagCloud - Visual tag cloud
export { TagCloud } from "./TagCloud";
export type { TagCloudProps } from "./TagCloud";

// #79 - SearchBar - Universal search bar with autocomplete
export { SearchBar } from "./SearchBar";
export type { SearchBarProps } from "./SearchBar";

// #80 - SearchResults - Search results with highlighting
export { SearchResults } from "./SearchResults";
export type { SearchResultsProps } from "./SearchResults";

// #81 - VectorSearch - Semantic search interface
export { VectorSearch } from "./VectorSearch";
export type { VectorSearchProps } from "./VectorSearch";

// #82 - KnowledgeGraph - Visual knowledge graph
export { KnowledgeGraph } from "./KnowledgeGraph";
export type { KnowledgeGraphProps } from "./KnowledgeGraph";

// #83 - CategoryTree - Hierarchical category browser ✅ NEW
export { CategoryTree } from "./CategoryTree";
export type { CategoryTreeProps } from "./CategoryTree";

// #84 - TaxonomyBrowser - Browse and navigate taxonomies ✅ NEW
export { TaxonomyBrowser } from "./TaxonomyBrowser";
export type { TaxonomyBrowserProps } from "./TaxonomyBrowser";

/**
 * KNOWLEDGE Dimension Overview
 *
 * The KNOWLEDGE dimension provides components for:
 * - Labeling and categorization
 * - Tag management and tag clouds
 * - Semantic search (vector embeddings)
 * - Knowledge graphs and taxonomies
 * - Search interfaces with autocomplete
 *
 * All components work with the `knowledge` table which stores:
 * - Labels (categorical tags with confidence scores)
 * - Vectors (embeddings for semantic search)
 *
 * Components are designed to work with both Label and Vector types
 * from the ontology schema.
 */
