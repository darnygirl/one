/**
 * CategoryTree Component
 *
 * Hierarchical category browser with expandable/collapsible nodes
 * Part of KNOWLEDGE dimension (ontology-ui)
 */

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronDown, Folder } from "lucide-react";
import type { Label } from "../types";
import { cn } from "../utils";

export interface CategoryTreeProps {
  categories: string[];
  labels: Label[];
  onCategoryClick?: (category: string) => void;
  className?: string;
}

interface CategoryNode {
  name: string;
  children: Map<string, CategoryNode>;
  labelCount: number;
}

export function CategoryTree({
  categories,
  labels,
  onCategoryClick,
  className,
}: CategoryTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.slice(0, 3)) // Expand first 3 by default
  );

  // Build category tree structure
  const buildCategoryTree = (): CategoryNode => {
    const root: CategoryNode = {
      name: "root",
      children: new Map(),
      labelCount: 0,
    };

    // Count labels per category
    const categoryCounts = new Map<string, number>();
    labels.forEach((label) => {
      if (label.category) {
        categoryCounts.set(
          label.category,
          (categoryCounts.get(label.category) || 0) + 1
        );
      }
    });

    // Build tree from categories
    categories.forEach((category) => {
      const parts = category.split("/").filter(Boolean);
      let currentNode = root;

      parts.forEach((part, index) => {
        const fullPath = parts.slice(0, index + 1).join("/");

        if (!currentNode.children.has(part)) {
          currentNode.children.set(part, {
            name: part,
            children: new Map(),
            labelCount: categoryCounts.get(fullPath) || 0,
          });
        }

        currentNode = currentNode.children.get(part)!;
      });
    });

    return root;
  };

  const tree = buildCategoryTree();

  const toggleCategory = (categoryPath: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryPath)) {
      newExpanded.delete(categoryPath);
    } else {
      newExpanded.add(categoryPath);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categoryPath: string) => {
    toggleCategory(categoryPath);
    onCategoryClick?.(categoryPath);
  };

  const renderNode = (
    node: CategoryNode,
    path: string[] = [],
    depth: number = 0
  ): React.ReactNode => {
    if (node.name === "root") {
      // Render root children
      return Array.from(node.children.entries()).map(([name, child]) =>
        renderNode(child, [name], 0)
      );
    }

    const currentPath = path.join("/");
    const isExpanded = expandedCategories.has(currentPath);
    const hasChildren = node.children.size > 0;

    return (
      <div key={currentPath} className="select-none">
        {/* Category Row */}
        <div
          className={cn(
            "flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent transition-colors cursor-pointer",
            depth > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleCategoryClick(currentPath)}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Folder Icon */}
          <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />

          {/* Category Name */}
          <span className="text-sm font-medium flex-1">{node.name}</span>

          {/* Label Count */}
          {node.labelCount > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {node.labelCount}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {Array.from(node.children.entries()).map(([name, child]) =>
              renderNode(child, [...path, name], depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (categories.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No categories found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {renderNode(tree)}
      </CardContent>
    </Card>
  );
}
