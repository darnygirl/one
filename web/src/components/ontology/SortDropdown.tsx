/**
 * SortDropdown Component
 * Provides sorting UI for thing lists
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export interface SortOption {
  field: string;
  label: string;
  direction: "asc" | "desc";
}

interface SortDropdownProps {
  options: SortOption[];
  value?: SortOption;
  onChange: (option: SortOption) => void;
}

export function SortDropdown({ options, value, onChange }: SortDropdownProps) {
  const currentValue = value
    ? `${value.field}-${value.direction}`
    : `${options[0]?.field}-${options[0]?.direction}`;

  return (
    <Select
      value={currentValue}
      onValueChange={(val) => {
        const [field, direction] = val.split("-");
        const option = options.find(
          (o) => o.field === field && o.direction === direction
        );
        if (option) onChange(option);
      }}
    >
      <SelectTrigger className="w-[200px] gap-2">
        <ArrowUpDown className="h-4 w-4" />
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={`${option.field}-${option.direction}`}
            value={`${option.field}-${option.direction}`}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Preset sort options for common thing types
export const courseSortOptions: SortOption[] = [
  { field: "enrolled", label: "Most Popular", direction: "desc" },
  { field: "rating", label: "Highest Rated", direction: "desc" },
  { field: "price", label: "Price: Low to High", direction: "asc" },
  { field: "price", label: "Price: High to Low", direction: "desc" },
  { field: "publishedAt", label: "Newest First", direction: "desc" },
  { field: "title", label: "A-Z", direction: "asc" },
];

export const productSortOptions: SortOption[] = [
  { field: "name", label: "Name: A-Z", direction: "asc" },
  { field: "name", label: "Name: Z-A", direction: "desc" },
  { field: "price", label: "Price: Low to High", direction: "asc" },
  { field: "price", label: "Price: High to Low", direction: "desc" },
  { field: "createdAt", label: "Newest First", direction: "desc" },
];

export const postSortOptions: SortOption[] = [
  { field: "publishedAt", label: "Most Recent", direction: "desc" },
  { field: "views", label: "Most Viewed", direction: "desc" },
  { field: "likes", label: "Most Liked", direction: "desc" },
  { field: "title", label: "Title: A-Z", direction: "asc" },
];
