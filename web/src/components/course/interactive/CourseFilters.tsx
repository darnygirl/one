/**
 * Course Filters Component (Interactive)
 * Advanced course filtering with level, duration, price, and ratings
 * Adapted from FilterSidebar pattern
 * Requires client:load hydration
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, ChevronDown } from 'lucide-react';

export interface CourseFilterOptions {
  categories?: string[];
  levels?: string[];
  priceRange?: { min: number; max: number };
  duration?: { min: number; max: number }; // in minutes
  rating?: number;
  hasCertificate?: boolean;
  languages?: string[];
  sortBy?: 'newest' | 'popular' | 'price-low' | 'price-high' | 'rating';
}

interface CourseFiltersProps {
  categories: { id: string; name: string; count?: number }[];
  languages?: string[];
  onFilterChange?: (filters: CourseFilterOptions) => void;
  isMobile?: boolean;
  maxPrice?: number;
  minPrice?: number;
  initialFilters?: Partial<CourseFilterOptions>;
}

export function CourseFilters({
  categories,
  languages = ['English', 'Spanish', 'French', 'German', 'Chinese'],
  onFilterChange,
  isMobile = false,
  maxPrice = 500,
  minPrice = 0,
  initialFilters,
}: CourseFiltersProps) {
  const [filters, setFilters] = useState<CourseFilterOptions>({
    categories: [],
    levels: [],
    sortBy: 'newest',
    ...initialFilters,
  });

  const [openSections, setOpenSections] = useState({
    sort: true,
    categories: true,
    level: true,
    price: true,
    duration: true,
    rating: true,
    certificate: true,
    language: true,
  });

  const levels = [
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'all-levels', name: 'All Levels' },
  ];

  const durations = [
    { id: '0-60', name: 'Under 1 hour', min: 0, max: 60 },
    { id: '60-180', name: '1-3 hours', min: 60, max: 180 },
    { id: '180-360', name: '3-6 hours', min: 180, max: 360 },
    { id: '360-9999', name: '6+ hours', min: 360, max: 9999 },
  ];

  const priceRanges = [
    { id: 'free', name: 'Free', min: 0, max: 0 },
    { id: '0-50', name: 'Under $50', min: 0, max: 50 },
    { id: '50-100', name: '$50 - $100', min: 50, max: 100 },
    { id: '100-200', name: '$100 - $200', min: 100, max: 200 },
    { id: '200-500', name: '$200+', min: 200, max: maxPrice },
  ];

  const ratings = [4, 3, 2, 1];

  // Count active filters
  const activeFilterCount =
    (filters.categories?.length || 0) +
    (filters.levels?.length || 0) +
    (filters.priceRange ? 1 : 0) +
    (filters.duration ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.hasCertificate ? 1 : 0) +
    (filters.languages?.length || 0);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories?.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...(filters.categories || []), categoryId];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleLevelToggle = (level: string) => {
    const newLevels = filters.levels?.includes(level)
      ? filters.levels.filter((l) => l !== level)
      : [...(filters.levels || []), level];

    const newFilters = { ...filters, levels: newLevels };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handlePriceRangeClick = (range: { min: number; max: number }) => {
    const newFilters = { ...filters, priceRange: range };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleDurationClick = (range: { min: number; max: number }) => {
    const newFilters = { ...filters, duration: range };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleRatingToggle = (rating: number) => {
    const newFilters = {
      ...filters,
      rating: filters.rating === rating ? undefined : rating,
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleCertificateToggle = () => {
    const newFilters = { ...filters, hasCertificate: !filters.hasCertificate };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleLanguageToggle = (language: string) => {
    const newLanguages = filters.languages?.includes(language)
      ? filters.languages.filter((l) => l !== language)
      : [...(filters.languages || []), language];

    const newFilters = { ...filters, languages: newLanguages };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSortChange = (sortBy: CourseFilterOptions['sortBy']) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    const newFilters: CourseFilterOptions = {
      categories: [],
      levels: [],
      sortBy: 'newest',
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Active Filters ({activeFilterCount})
            </h3>
            <Button
              onClick={handleClearFilters}
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Sort */}
      <Collapsible open={openSections.sort} onOpenChange={() => toggleSection('sort')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-semibold">Sort By</h3>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.sort ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {[
            { id: 'newest', name: 'Newest' },
            { id: 'popular', name: 'Most Popular' },
            { id: 'rating', name: 'Highest Rated' },
            { id: 'price-low', name: 'Price: Low to High' },
            { id: 'price-high', name: 'Price: High to Low' },
          ].map((sort) => (
            <label key={sort.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={sort.id}
                checked={filters.sortBy === sort.id}
                onChange={() => handleSortChange(sort.id as any)}
                className="h-4 w-4"
              />
              <span className="text-sm">{sort.name}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Level */}
      <Collapsible open={openSections.level} onOpenChange={() => toggleSection('level')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-semibold">Level</h3>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.level ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {levels.map((level) => (
            <label key={level.id} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.levels?.includes(level.id)}
                onCheckedChange={() => handleLevelToggle(level.id)}
              />
              <span className="text-sm">{level.name}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Categories */}
      <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-semibold">Categories</h3>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.categories ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.categories?.includes(category.id)}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                />
                <span className="text-sm">{category.name}</span>
              </div>
              {category.count !== undefined && (
                <span className="text-xs text-muted-foreground">({category.count})</span>
              )}
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-semibold">Price</h3>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {priceRanges.map((range) => (
            <label key={range.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={
                  filters.priceRange?.min === range.min &&
                  filters.priceRange?.max === range.max
                }
                onChange={() => handlePriceRangeClick({ min: range.min, max: range.max })}
                className="h-4 w-4"
              />
              <span className="text-sm">{range.name}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Duration */}
      <Collapsible open={openSections.duration} onOpenChange={() => toggleSection('duration')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-semibold">Duration</h3>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.duration ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {durations.map((dur) => (
            <label key={dur.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="duration"
                checked={
                  filters.duration?.min === dur.min &&
                  filters.duration?.max === dur.max
                }
                onChange={() => handleDurationClick({ min: dur.min, max: dur.max })}
                className="h-4 w-4"
              />
              <span className="text-sm">{dur.name}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Rating */}
      <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-semibold">Rating</h3>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.rating ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {ratings.map((rating) => (
            <label key={rating} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.rating === rating}
                onCheckedChange={() => handleRatingToggle(rating)}
              />
              <div className="flex items-center gap-1">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm ml-1">& up</span>
              </div>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Certificate */}
      <Collapsible open={openSections.certificate} onOpenChange={() => toggleSection('certificate')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-semibold">Features</h3>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.certificate ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <Checkbox
              checked={filters.hasCertificate}
              onCheckedChange={handleCertificateToggle}
            />
            <span className="text-sm">Includes Certificate</span>
          </label>
        </CollapsibleContent>
      </Collapsible>

      {/* Language */}
      <Collapsible open={openSections.language} onOpenChange={() => toggleSection('language')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-semibold">Language</h3>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.language ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {languages.map((language) => (
            <label key={language} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.languages?.includes(language)}
                onCheckedChange={() => handleLanguageToggle(language)}
              />
              <span className="text-sm">{language}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  // Mobile: Render in Sheet
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Render as sidebar
  return (
    <div className="w-64 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {activeFilterCount > 0 && (
          <Badge variant="secondary">{activeFilterCount}</Badge>
        )}
      </div>
      <FilterContent />
    </div>
  );
}
