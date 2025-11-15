/**
 * Ontology UI - Shared React Hooks
 *
 * Reusable hooks for ontology-aware components
 */

import { useState, useMemo, useCallback } from "react";
import type {
  SortConfig,
  FilterConfig,
  PaginationConfig,
  SortDirection,
} from "../types";

// ============================================================================
// useSort Hook
// ============================================================================

export function useSort<T>(
  data: T[],
  initialSort?: SortConfig
) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    initialSort || null
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const { field, direction } = sortConfig;
    return [...data].sort((a, b) => {
      const aValue = (a as any)[field];
      const bValue = (b as any)[field];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return direction === "asc" ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const setSort = useCallback((field: string, direction?: SortDirection) => {
    setSortConfig((current) => {
      if (!current || current.field !== field) {
        return { field, direction: direction || "asc" };
      }
      if (current.direction === "asc") {
        return { field, direction: "desc" };
      }
      return null; // Clear sort
    });
  }, []);

  return { sortedData, sortConfig, setSort };
}

// ============================================================================
// useFilter Hook
// ============================================================================

export function useFilter<T>(
  data: T[],
  initialFilters?: FilterConfig[]
) {
  const [filters, setFilters] = useState<FilterConfig[]>(initialFilters || []);

  const filteredData = useMemo(() => {
    if (filters.length === 0) return data;

    return data.filter((item) => {
      return filters.every((filter) => {
        const value = (item as any)[filter.field];

        switch (filter.operator) {
          case "eq":
            return value === filter.value;
          case "ne":
            return value !== filter.value;
          case "gt":
            return value > filter.value;
          case "gte":
            return value >= filter.value;
          case "lt":
            return value < filter.value;
          case "lte":
            return value <= filter.value;
          case "contains":
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case "startsWith":
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
          case "endsWith":
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
          default:
            return true;
        }
      });
    });
  }, [data, filters]);

  const addFilter = useCallback((filter: FilterConfig) => {
    setFilters((current) => [...current, filter]);
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters((current) => current.filter((_, i) => i !== index));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  return {
    filteredData,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
  };
}

// ============================================================================
// usePagination Hook
// ============================================================================

export function usePagination<T>(
  data: T[],
  initialPageSize: number = 10
) {
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: initialPageSize,
    total: data.length,
  });

  const paginatedData = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return data.slice(start, end);
  }, [data, pagination.page, pagination.pageSize]);

  const totalPages = Math.ceil(data.length / pagination.pageSize);

  const nextPage = useCallback(() => {
    setPagination((current) => ({
      ...current,
      page: Math.min(current.page + 1, totalPages),
    }));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPagination((current) => ({
      ...current,
      page: Math.max(current.page - 1, 1),
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination((current) => ({
      ...current,
      page: Math.max(1, Math.min(page, totalPages)),
    }));
  }, [totalPages]);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((current) => ({
      ...current,
      pageSize,
      page: 1, // Reset to first page
    }));
  }, []);

  return {
    paginatedData,
    pagination: { ...pagination, total: data.length },
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
  };
}

// ============================================================================
// useSearch Hook
// ============================================================================

export function useSearch<T>(
  data: T[],
  searchFields: (keyof T)[]
) {
  const [query, setQuery] = useState("");

  const searchedData = useMemo(() => {
    if (!query.trim()) return data;

    const lowerQuery = query.toLowerCase();

    return data.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });
  }, [data, query, searchFields]);

  return {
    searchedData,
    query,
    setQuery,
  };
}

// ============================================================================
// useLocalStorage Hook
// ============================================================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

// ============================================================================
// useDebounce Hook
// ============================================================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  });

  return debouncedValue;
}

// ============================================================================
// useToggle Hook
// ============================================================================

export function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  return [value, toggle];
}

// ============================================================================
// useClipboard Hook
// ============================================================================

export function useClipboard(timeout: number = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (!navigator?.clipboard) {
        console.warn("Clipboard not supported");
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        return true;
      } catch (error) {
        console.error("Failed to copy:", error);
        setCopied(false);
        return false;
      }
    },
    [timeout]
  );

  return { copied, copy };
}

// ============================================================================
// useDimension Hook
// ============================================================================

export function useDimension() {
  const [currentDimension, setCurrentDimension] = useLocalStorage<string>(
    "ontology-ui-dimension",
    "things"
  );

  return {
    currentDimension,
    setDimension: setCurrentDimension,
  };
}

// ============================================================================
// useGroupContext Hook
// ============================================================================

export function useGroupContext() {
  const [currentGroupId, setCurrentGroupId] = useLocalStorage<string | null>(
    "ontology-ui-group",
    null
  );

  return {
    currentGroupId,
    setGroupId: setCurrentGroupId,
  };
}
