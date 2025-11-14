/**
 * Tool Browser Component
 * Gallery view with search, filters, favorites, and tool discovery
 */

import { useState, useMemo } from 'react';
import { toolRegistry } from '@/lib/ai-tools/registry';
import type { ToolDefinition, ToolCategory } from '@/lib/ai-tools/types';
import { categoryInfo } from '@/lib/ai-tools/registerAllTools';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ToolBrowserProps {
  onSelectTool?: (tool: ToolDefinition) => void;
}

export function ToolBrowser({ onSelectTool }: ToolBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'popular' | 'recent'>('all');
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [, forceUpdate] = useState(0);

  // Get tools based on active view
  const tools = useMemo(() => {
    let result: ToolDefinition[] = [];

    switch (activeView) {
      case 'popular':
        result = toolRegistry.getMostUsed(12);
        break;
      case 'recent':
        result = toolRegistry.getRecent(12);
        break;
      default:
        result = toolRegistry.list();
    }

    // Apply search filter
    if (searchQuery) {
      result = toolRegistry.search(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(tool => tool.category === selectedCategory);
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      result = result.filter(tool => toolRegistry.isFavorite(tool.name));
    }

    return result;
  }, [searchQuery, selectedCategory, showFavoritesOnly, activeView]);

  const toggleFavorite = (toolName: string) => {
    if (toolRegistry.isFavorite(toolName)) {
      toolRegistry.removeFavorite(toolName);
    } else {
      toolRegistry.addFavorite(toolName);
    }
    forceUpdate(n => n + 1); // Force re-render
  };

  const handleTryTool = (tool: ToolDefinition) => {
    if (onSelectTool) {
      onSelectTool(tool);
    }
  };

  const categories = Object.keys(categoryInfo) as ToolCategory[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">AI Tools</h2>
        <p className="text-muted-foreground">
          Discover and use powerful AI tools for data, development, and creativity
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {categoryInfo[cat].icon} {categoryInfo[cat].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Favorites Toggle */}
        <Button
          variant={showFavoritesOnly ? 'default' : 'outline'}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="w-full md:w-auto"
        >
          {showFavoritesOnly ? '★' : '☆'} Favorites
        </Button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeView === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveView('all')}
          size="sm"
        >
          All Tools
        </Button>
        <Button
          variant={activeView === 'popular' ? 'default' : 'outline'}
          onClick={() => setActiveView('popular')}
          size="sm"
        >
          Popular
        </Button>
        <Button
          variant={activeView === 'recent' ? 'default' : 'outline'}
          onClick={() => setActiveView('recent')}
          size="sm"
        >
          Recent
        </Button>
      </div>

      {/* Tools Grid */}
      {tools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tools found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(tool => {
            const isFav = toolRegistry.isFavorite(tool.name);
            const usageStats = toolRegistry.getUsageStats(tool.name);
            const catInfo = categoryInfo[tool.category as keyof typeof categoryInfo];

            return (
              <Card key={tool.name} className="relative hover:shadow-lg transition-shadow">
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(tool.name)}
                  className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform"
                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFav ? '★' : '☆'}
                </button>

                <CardHeader>
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{catInfo?.icon || '🔧'}</span>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tool.metadata.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Usage Stats */}
                  {usageStats && usageStats.count > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Used {usageStats.count} time{usageStats.count !== 1 ? 's' : ''}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2">
                  {/* Details Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedTool(tool)}
                      >
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span className="text-2xl">{catInfo?.icon}</span>
                          {tool.name}
                        </DialogTitle>
                        <DialogDescription>{tool.description}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Metadata */}
                        <div>
                          <h4 className="font-semibold mb-2">Information</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Version:</span>{' '}
                              {tool.metadata.version}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Category:</span>{' '}
                              {catInfo?.name}
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div>
                          <h4 className="font-semibold mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-1">
                            {tool.metadata.tags.map(tag => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Parameters */}
                        <div>
                          <h4 className="font-semibold mb-2">Parameters</h4>
                          <div className="space-y-2">
                            {tool.parameters.map(param => (
                              <div
                                key={param.name}
                                className="border rounded-lg p-3 space-y-1"
                              >
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                                    {param.name}
                                  </code>
                                  <Badge variant={param.required ? 'default' : 'outline'}>
                                    {param.required ? 'required' : 'optional'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {param.type}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {param.description}
                                </p>
                                {param.enum && (
                                  <div className="text-xs text-muted-foreground">
                                    Options: {param.enum.join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Examples */}
                        {tool.metadata.examples && tool.metadata.examples.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Examples</h4>
                            <div className="space-y-2">
                              {tool.metadata.examples.map((example, idx) => (
                                <div
                                  key={idx}
                                  className="border rounded-lg p-3 space-y-1"
                                >
                                  <p className="text-sm font-medium">
                                    {example.description}
                                  </p>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {JSON.stringify(example.params, null, 2)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Try It Button */}
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTryTool(tool)}
                  >
                    Try It
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
