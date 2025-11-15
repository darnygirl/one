/**
 * Course Grid Component (Static)
 * Renders grid layout for course cards with empty state
 * Adapted from ProductGrid pattern
 * No hydration needed - pure presentation
 */

import type { CourseCatalog } from '@/types/course';

interface CourseGridProps {
  courses?: CourseCatalog[];
  columns?: 2 | 3 | 4;
  children?: React.ReactNode;
  showEmptyState?: boolean;
}

export function CourseGrid({
  courses,
  columns = 3,
  children,
  showEmptyState = true
}: CourseGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  // Empty state
  if (showEmptyState && (!children || (courses && courses.length === 0))) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 p-12 text-center">
        <svg
          className="mb-4 h-12 w-12 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          No courses found
        </h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {children}
    </div>
  );
}
