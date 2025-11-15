/**
 * Cycle 99: OntologyExplorer
 *
 * Interactive explorer for 6-dimension data
 * - Graph visualization of connections
 * - Drill-down navigation
 * - Search and filter
 * - Export to various formats
 */

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Download,
  Search,
  Filter,
  Network,
  List,
  Grid,
  Eye,
  EyeOff,
} from "lucide-react";
import { NetworkGraph, ConnectionGraph } from "../visualization";
import {
  ThingCard,
  UserCard,
  EventCard,
  GroupCard,
  ConnectionCard,
  LabelCard,
} from "../index";
import type {
  Thing,
  Person,
  Event,
  Connection,
  Group,
  Label,
  Dimension,
  DIMENSIONS,
} from "../types";

export interface OntologyData {
  groups?: Group[];
  people?: Person[];
  things?: Thing[];
  connections?: Connection[];
  events?: Event[];
  knowledge?: Label[];
}

export interface OntologyExplorerProps {
  /** Ontology data to explore */
  data: OntologyData;
  /** Initial dimension to display */
  initialDimension?: Dimension;
  /** Enable graph visualization */
  enableGraph?: boolean;
  /** Enable export functionality */
  enableExport?: boolean;
  /** Callback when item is selected */
  onSelect?: (dimension: Dimension, item: any) => void;
  /** Callback when filter changes */
  onFilterChange?: (filters: FilterConfig[]) => void;
}

interface FilterConfig {
  dimension: Dimension;
  field: string;
  value: any;
}

type ViewMode = "grid" | "list" | "graph";

/**
 * OntologyExplorer - Interactive explorer for the 6-dimension ontology
 *
 * @example
 * ```tsx
 * <OntologyExplorer
 *   data={{
 *     things: products,
 *     connections: relationships,
 *     events: activityLog,
 *   }}
 *   enableGraph
 *   enableExport
 *   onSelect={(dimension, item) => console.log('Selected:', dimension, item)}
 * />
 * ```
 */
export function OntologyExplorer({
  data,
  initialDimension = "things",
  enableGraph = true,
  enableExport = true,
  onSelect,
  onFilterChange,
}: OntologyExplorerProps) {
  const [activeDimension, setActiveDimension] = useState<Dimension>(initialDimension);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [visibleDimensions, setVisibleDimensions] = useState<Set<Dimension>>(
    new Set(["groups", "people", "things", "connections", "events", "knowledge"])
  );

  // Count items per dimension
  const dimensionCounts = useMemo(() => ({
    groups: data.groups?.length || 0,
    people: data.people?.length || 0,
    things: data.things?.length || 0,
    connections: data.connections?.length || 0,
    events: data.events?.length || 0,
    knowledge: data.knowledge?.length || 0,
  }), [data]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    const filtered: OntologyData = {};

    Object.entries(data).forEach(([dimension, items]) => {
      if (!items) return;

      filtered[dimension as keyof OntologyData] = items.filter((item: any) => {
        // Search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const name = item.name?.toLowerCase() || "";
          const description = item.description?.toLowerCase() || "";
          if (!name.includes(searchLower) && !description.includes(searchLower)) {
            return false;
          }
        }

        // Custom filters
        for (const filter of filters) {
          if (filter.dimension !== dimension) continue;
          if (item[filter.field] !== filter.value) return false;
        }

        return true;
      });
    });

    return filtered;
  }, [data, searchQuery, filters]);

  // Toggle dimension visibility
  function toggleDimension(dimension: Dimension) {
    const newVisible = new Set(visibleDimensions);
    if (newVisible.has(dimension)) {
      newVisible.delete(dimension);
    } else {
      newVisible.add(dimension);
    }
    setVisibleDimensions(newVisible);
  }

  // Export data
  function exportData(format: "json" | "csv") {
    const exportData = {
      timestamp: new Date().toISOString(),
      dimensions: Object.keys(data).filter(d => visibleDimensions.has(d as Dimension)),
      data: filteredData,
    };

    if (format === "json") {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      downloadBlob(blob, `ontology-export-${Date.now()}.json`);
    } else {
      // CSV export
      const csv = convertToCSV(exportData);
      const blob = new Blob([csv], { type: "text/csv" });
      downloadBlob(blob, `ontology-export-${Date.now()}.csv`);
    }
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function convertToCSV(data: any): string {
    // Simple CSV conversion (flatten nested data)
    const rows: string[] = [];
    Object.entries(data.data).forEach(([dimension, items]) => {
      (items as any[])?.forEach(item => {
        const row = [
          dimension,
          item._id,
          item.name || "",
          item.description || "",
          item.type || "",
        ].map(v => `"${String(v).replace(/"/g, '""')}"`);
        rows.push(row.join(","));
      });
    });
    return ["Dimension,ID,Name,Description,Type", ...rows].join("\n");
  }

  // Render items for active dimension
  function renderItems(items: any[], dimension: Dimension) {
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No {dimension} found
        </div>
      );
    }

    if (viewMode === "graph" && enableGraph) {
      // Graph visualization
      const nodes = items.map(item => ({
        id: item._id,
        name: item.name,
        type: item.type || dimension,
      }));

      const links = dimension === "connections"
        ? items.map(conn => ({
            source: conn.fromId,
            target: conn.toId,
            type: conn.type,
          }))
        : [];

      return <NetworkGraph nodes={nodes} links={links} />;
    }

    const gridClass = viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      : "space-y-2";

    return (
      <div className={gridClass}>
        {items.map(item => (
          <div
            key={item._id}
            onClick={() => onSelect?.(dimension, item)}
            className="cursor-pointer"
          >
            {renderItemCard(dimension, item)}
          </div>
        ))}
      </div>
    );
  }

  function renderItemCard(dimension: Dimension, item: any) {
    switch (dimension) {
      case "things":
        return <ThingCard thing={item} type={item.type} />;
      case "people":
        return <UserCard user={item} />;
      case "events":
        return <EventCard event={item} />;
      case "connections":
        return <ConnectionCard connection={item} />;
      case "groups":
        return <GroupCard group={item} />;
      case "knowledge":
        return <LabelCard label={item} />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with search and controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ontology Explorer</span>
            <div className="flex items-center gap-2">
              {/* View mode toggles */}
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
              {enableGraph && (
                <Button
                  variant={viewMode === "graph" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("graph")}
                >
                  <Network className="h-4 w-4" />
                </Button>
              )}

              {/* Export */}
              {enableExport && (
                <Select onValueChange={(format: any) => exportData(format)}>
                  <SelectTrigger className="w-32">
                    <Download className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Export" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all dimensions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Dimension toggles */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(DIMENSIONS) as Dimension[]).map(dimension => (
              <Badge
                key={dimension}
                variant={visibleDimensions.has(dimension) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleDimension(dimension)}
              >
                {visibleDimensions.has(dimension) ? (
                  <Eye className="h-3 w-3 mr-1" />
                ) : (
                  <EyeOff className="h-3 w-3 mr-1" />
                )}
                {DIMENSIONS[dimension].icon} {DIMENSIONS[dimension].name} ({dimensionCounts[dimension]})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dimension tabs */}
      <Tabs value={activeDimension} onValueChange={(v) => setActiveDimension(v as Dimension)}>
        <TabsList className="grid w-full grid-cols-6">
          {(Object.keys(DIMENSIONS) as Dimension[]).map(dimension => (
            <TabsTrigger key={dimension} value={dimension}>
              <span className="mr-1">{DIMENSIONS[dimension].icon}</span>
              {DIMENSIONS[dimension].name}
              <Badge variant="secondary" className="ml-2">
                {dimensionCounts[dimension]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(DIMENSIONS) as Dimension[]).map(dimension => (
          <TabsContent key={dimension} value={dimension}>
            <Card>
              <CardContent className="pt-6">
                {renderItems(filteredData[dimension] || [], dimension)}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
