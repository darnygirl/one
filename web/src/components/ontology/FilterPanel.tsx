/**
 * FilterPanel Component
 * Provides filtering UI for thing properties
 */

import { type ThingType } from "@/lib/ontology/types";
import { useThingConfig } from "@/lib/ontology/hooks/useThingConfig";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";
import { useState } from "react";

export interface FilterValue {
  field: string;
  operator: "eq" | "in" | "gte" | "lte" | "between";
  value: any;
}

interface FilterPanelProps {
  thingType: ThingType;
  filters: FilterValue[];
  onFiltersChange: (filters: FilterValue[]) => void;
}

export function FilterPanel({
  thingType,
  filters,
  onFiltersChange,
}: FilterPanelProps) {
  const config = useThingConfig(thingType);
  const [localFilters, setLocalFilters] = useState<FilterValue[]>(filters);

  // Get filterable fields from config
  const filterableFields = Object.entries(config.ui.fields)
    .filter(([_, fieldConfig]) => !fieldConfig.hidden)
    .slice(0, 5); // Limit to first 5 fields for demo

  const handleToggleFilter = (field: string, value: any) => {
    const existing = localFilters.find((f) => f.field === field);

    if (existing) {
      // Toggle value in array
      const values = Array.isArray(existing.value) ? existing.value : [existing.value];
      const newValues = values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value];

      if (newValues.length === 0) {
        setLocalFilters(localFilters.filter((f) => f.field !== field));
      } else {
        setLocalFilters(
          localFilters.map((f) =>
            f.field === field ? { ...f, value: newValues } : f
          )
        );
      }
    } else {
      setLocalFilters([
        ...localFilters,
        { field, operator: "in", value: [value] },
      ]);
    }
  };

  const handleRangeFilter = (field: string, min: number, max: number) => {
    const existing = localFilters.find((f) => f.field === field);

    if (existing) {
      setLocalFilters(
        localFilters.map((f) =>
          f.field === field ? { ...f, value: [min, max] } : f
        )
      );
    } else {
      setLocalFilters([
        ...localFilters,
        { field, operator: "between", value: [min, max] },
      ]);
    }
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters([]);
    onFiltersChange([]);
  };

  const activeFilterCount = filters.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter {thingType}s</SheetTitle>
          <SheetDescription>
            Narrow down results by applying filters
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Example: Level filter for courses */}
          {thingType === "course" && (
            <div className="space-y-3">
              <Label>Level</Label>
              <div className="space-y-2">
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={localFilters.some(
                        (f) =>
                          f.field === "level" &&
                          (Array.isArray(f.value)
                            ? f.value.includes(level)
                            : f.value === level)
                      )}
                      onCheckedChange={() => handleToggleFilter("level", level)}
                    />
                    <Label htmlFor={`level-${level}`} className="capitalize">
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Example: Price range filter */}
          {config.properties.price !== undefined && (
            <div className="space-y-3">
              <Label>Price Range</Label>
              <Slider
                defaultValue={[0, 500]}
                max={500}
                step={10}
                onValueChange={([min, max]) =>
                  handleRangeFilter("price", min, max)
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$500</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Example: Category filter for products */}
          {thingType === "product" && (
            <div className="space-y-3">
              <Label>Category</Label>
              <div className="space-y-2">
                {["Electronics", "Clothing", "Books", "Home"].map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={localFilters.some(
                        (f) =>
                          f.field === "category" &&
                          (Array.isArray(f.value)
                            ? f.value.includes(category)
                            : f.value === category)
                      )}
                      onCheckedChange={() =>
                        handleToggleFilter("category", category)
                      }
                    />
                    <Label htmlFor={`category-${category}`}>{category}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={localFilters.length === 0}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
