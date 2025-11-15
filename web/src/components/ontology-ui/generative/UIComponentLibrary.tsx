/**
 * UIComponentLibrary - Browse generated UI components
 *
 * Features:
 * - Search and filter components
 * - Tags/categories organization
 * - Favorites system
 * - Export/import functionality
 */

import { useState, useMemo } from "react";
import type { OntologyComponentProps } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useSearch, useFilter, usePagination, useLocalStorage } from "../hooks";
import { cn } from "../utils";
import { Library, Search, Star, StarOff, Download, Upload, Tag, Grid, List } from "lucide-react";

interface UIComponent {
  id: string;
  name: string;
  description: string;
  code: string;
  category: string;
  tags: string[];
  createdAt: number;
  updatedAt?: number;
  previewUrl?: string;
}

interface UIComponentLibraryProps extends OntologyComponentProps {
  components?: UIComponent[];
  onComponentSelect?: (component: UIComponent) => void;
  onExport?: (components: UIComponent[]) => void;
  onImport?: (file: File) => void;
}

type ViewMode = "grid" | "list";

export function UIComponentLibrary({
  components = [],
  onComponentSelect,
  onExport,
  onImport,
  className,
}: UIComponentLibraryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [category, setCategory] = useState<string>("all");
  const [favorites, setFavorites] = useLocalStorage<string[]>("ui-component-favorites", []);

  // Search across name and description
  const { searchedData, query, setQuery } = useSearch(components, ["name", "description"]);

  // Filter by category
  const filteredData = useMemo(() => {
    if (category === "all") return searchedData;
    return searchedData.filter((c) => c.category === category);
  }, [searchedData, category]);

  // Pagination
  const { paginatedData, pagination, totalPages, nextPage, prevPage } = usePagination(
    filteredData,
    viewMode === "grid" ? 12 : 10
  );

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(components.map((c) => c.category));
    return ["all", ...Array.from(cats)];
  }, [components]);

  // Get all tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    components.forEach((c) => c.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  }, [components]);

  const toggleFavorite = (componentId: string) => {
    setFavorites((current) =>
      current.includes(componentId)
        ? current.filter((id) => id !== componentId)
        : [...current, componentId]
    );
  };

  const handleExport = () => {
    const selected = favorites.length > 0
      ? components.filter((c) => favorites.includes(c.id))
      : components;
    onExport?.(selected);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport?.(file);
    }
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Component Library</CardTitle>
              <CardDescription>{components.length} components available</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("import-file")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Search and filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tags filter */}
        <div className="flex flex-wrap gap-2">
          {allTags.slice(0, 8).map((tag) => (
            <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-muted">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        {/* Component grid/list */}
        <div className="flex-1 overflow-auto">
          {paginatedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Library className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No components found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map((component) => (
                <Card
                  key={component.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onComponentSelect?.(component)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{component.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {component.category}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(component.id);
                        }}
                      >
                        {favorites.includes(component.id) ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {component.description}
                    </p>
                    {component.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {component.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedData.map((component) => (
                <Card
                  key={component.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onComponentSelect?.(component)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{component.name}</CardTitle>
                          <Badge variant="secondary">{component.category}</Badge>
                        </div>
                        <CardDescription className="truncate mt-1">
                          {component.description}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(component.id);
                        }}
                      >
                        {favorites.includes(component.id) ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={pagination.page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
