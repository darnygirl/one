/**
 * TaxonomyBrowser Component
 *
 * Browse and navigate taxonomies with tree view, tag cloud, and list view
 * Part of KNOWLEDGE dimension (ontology-ui)
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Label, Thing } from "../types";
import { CategoryTree } from "./CategoryTree";
import { TagCloud } from "./TagCloud";
import { cn } from "../utils";

export interface TaxonomyBrowserProps {
  labels: Label[];
  things: Thing[];
  className?: string;
}

export function TaxonomyBrowser({
  labels,
  things,
  className,
}: TaxonomyBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Extract unique categories from labels
  const categories = useMemo(() => {
    const cats = new Set<string>();
    labels.forEach((label) => {
      if (label.category) {
        cats.add(label.category);
      }
    });
    return Array.from(cats).sort();
  }, [labels]);

  // Filter labels by category and search
  const filteredLabels = useMemo(() => {
    let filtered = labels;

    if (selectedCategory) {
      filtered = filtered.filter((label) => label.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (label) =>
          label.label.toLowerCase().includes(query) ||
          label.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [labels, selectedCategory, searchQuery]);

  // Count things per label
  const thingCountsByLabel = useMemo(() => {
    const counts = new Map<string, number>();
    labels.forEach((label) => {
      counts.set(label.label, (counts.get(label.label) || 0) + 1);
    });
    return counts;
  }, [labels]);

  // Group labels by category
  const labelsByCategory = useMemo(() => {
    const grouped = new Map<string, Label[]>();
    filteredLabels.forEach((label) => {
      const category = label.category || "Uncategorized";
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(label);
    });
    return grouped;
  }, [filteredLabels]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleTagClick = (label: Label) => {
    // Set category filter based on the clicked label's category
    if (label.category) {
      setSelectedCategory(label.category);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Taxonomy Browser</CardTitle>
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search labels and categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tree" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tree">Tree View</TabsTrigger>
            <TabsTrigger value="cloud">Tag Cloud</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          {/* Tree View Tab */}
          <TabsContent value="tree" className="mt-4">
            <CategoryTree
              categories={categories}
              labels={filteredLabels}
              onCategoryClick={handleCategoryClick}
            />
          </TabsContent>

          {/* Tag Cloud Tab */}
          <TabsContent value="cloud" className="mt-4">
            {filteredLabels.length > 0 ? (
              <TagCloud
                labels={filteredLabels}
                onTagClick={handleTagClick}
                maxTags={50}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No labels found
              </p>
            )}
          </TabsContent>

          {/* List View Tab */}
          <TabsContent value="list" className="mt-4 space-y-4">
            {labelsByCategory.size > 0 ? (
              Array.from(labelsByCategory.entries()).map(([category, categoryLabels]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {categoryLabels.map((label) => (
                      <div
                        key={label._id}
                        className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {label.label}
                          </Badge>
                          {label.confidence !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              {Math.round(label.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {thingCountsByLabel.get(label.label) || 0} items
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No labels found
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredLabels.length} labels</span>
          <span>{categories.length} categories</span>
          <span>{things.length} items</span>
        </div>
      </CardContent>
    </Card>
  );
}
