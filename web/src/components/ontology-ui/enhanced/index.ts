/**
 * Enhanced Components - Phase 3 Advanced UI Features
 *
 * Production-ready enhanced components with advanced features:
 * - Live updates and real-time data
 * - Interactive visualizations
 * - Advanced search and filtering
 * - Performance optimizations
 * - Persistence and state management
 */

// Phase 3 - Cycles 58-64 (New Advanced Components)
export { EnhancedEventCard } from "./EnhancedEventCard";
export { EnhancedConnectionGraph } from "./EnhancedConnectionGraph";
export { EnhancedSearchBar } from "./EnhancedSearchBar";
export { InfiniteScroll, useConvexPagination } from "./InfiniteScroll";
export { VirtualizedList, createSearchFilter } from "./VirtualizedList";
export { DragDropBoard } from "./DragDropBoard";
export { SplitPane, SplitPanePresets } from "./SplitPane";

// Phase 2 - Enhanced Feature Components (Cycles 51-57)
export { EnhancedCourseCard } from "./EnhancedCourseCard";
export { EnhancedVideoPlayer } from "./EnhancedVideoPlayer";
export { EnhancedQuiz } from "./EnhancedQuiz";
export { EnhancedProgress } from "./EnhancedProgress";
export { EnhancedUserCard } from "./EnhancedUserCard";
export { EnhancedGroupCard } from "./EnhancedGroupCard";
export { EnhancedThingCard } from "./EnhancedThingCard";

// Type exports
export type {
  Event,
  Connection,
  Thing,
  SearchResult,
  FilterConfig,
} from "../types";
