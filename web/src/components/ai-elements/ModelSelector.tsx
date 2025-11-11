/**
 * Model Selector Component
 *
 * Beautiful modal for selecting AI models with search and filtering
 */

import { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { $isModelSelectorOpen, $currentModel, setModel } from '@/stores/chatStore';
import {
  MODELS,
  MODEL_CATEGORIES,
  searchModels,
  type ModelInfo,
} from '@/lib/ai/models';

export function ModelSelector() {
  const isOpen = useStore($isModelSelectorOpen);
  const currentModel = useStore($currentModel);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const filteredModels = useMemo(() => {
    let models = Object.values(MODELS);

    // Apply search
    if (searchQuery) {
      models = searchModels(searchQuery);
    }

    // Apply provider filter
    if (selectedProvider) {
      models = models.filter(m => m.provider === selectedProvider);
    }

    return models;
  }, [searchQuery, selectedProvider]);

  const providers = useMemo(() => {
    const providerSet = new Set(Object.values(MODELS).map(m => m.provider));
    return Array.from(providerSet).sort();
  }, []);

  const handleSelect = (modelId: string) => {
    setModel(modelId);
    $isModelSelectorOpen.set(false);
    setSearchQuery('');
    setSelectedProvider(null);
  };

  const renderModelCard = (model: ModelInfo) => {
    const isSelected = model.id === currentModel;

    return (
      <button
        key={model.id}
        onClick={() => handleSelect(model.id)}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
          isSelected
            ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
            : 'border-gray-200 dark:border-gray-800 hover:border-purple-300'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold flex items-center gap-2">
              {model.name}
              {model.featured && (
                <Badge variant="default" className="text-xs">⭐ Featured</Badge>
              )}
              {model.free && (
                <Badge variant="secondary" className="text-xs">🆓 Free</Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {model.provider}
            </p>
          </div>
          {isSelected && (
            <Badge variant="default">✓ Active</Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          {model.description}
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30">
            {model.speed === 'instant' && '⚡'}
            {model.speed === 'fast' && '🚀'}
            {model.speed === 'medium' && '⏱️'}
            {model.speed === 'slow' && '🐌'}
            {' '}{model.speed}
          </span>
          <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
            {model.quality}
          </span>
          <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30">
            {(model.contextLength / 1000).toFixed(0)}K context
          </span>
          {!model.free && (
            <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
              ${model.costPer1M.input}/1M in
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => $isModelSelectorOpen.set(open)}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">
            Select AI Model
          </DialogTitle>
          <DialogDescription>
            Choose from 30+ models across different providers
          </DialogDescription>
        </DialogHeader>

        {/* Search & Filters */}
        <div className="space-y-3">
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedProvider === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProvider(null)}
            >
              All Providers
            </Button>
            {providers.map((provider) => (
              <Button
                key={provider}
                variant={selectedProvider === provider ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedProvider(provider)}
                className="whitespace-nowrap"
              >
                {provider}
              </Button>
            ))}
          </div>
        </div>

        {/* Model List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3 pr-4">
            {/* Featured Models */}
            {!searchQuery && !selectedProvider && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  ⭐ FEATURED MODELS
                </h3>
                <div className="grid gap-3">
                  {MODEL_CATEGORIES.featured.map(renderModelCard)}
                </div>
              </div>
            )}

            {/* Free Models */}
            {!searchQuery && !selectedProvider && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  🆓 FREE MODELS
                </h3>
                <div className="grid gap-3">
                  {MODEL_CATEGORIES.free.map(renderModelCard)}
                </div>
              </div>
            )}

            {/* Filtered Results */}
            {(searchQuery || selectedProvider) && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  {filteredModels.length} RESULTS
                </h3>
                <div className="grid gap-3">
                  {filteredModels.map(renderModelCard)}
                </div>
              </div>
            )}

            {/* All Other Models */}
            {!searchQuery && !selectedProvider && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  ALL MODELS
                </h3>
                <div className="grid gap-3">
                  {Object.values(MODELS)
                    .filter(m => !m.featured && !m.free)
                    .map(renderModelCard)}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
