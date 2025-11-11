/**
 * Image Component
 *
 * Display AI-generated images with metadata
 * Shows prompt, model, size, and download option
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ImageProps {
  src: string;
  alt: string;
  prompt?: string;
  model?: string;
  width?: number;
  height?: number;
  onDownload?: () => void;
}

export function Image({
  src,
  alt,
  prompt,
  model,
  width,
  height,
  onDownload,
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <Card className="my-4 overflow-hidden border-2 border-pink-200 dark:border-pink-800">
      {prompt && (
        <CardHeader className="pb-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-base">🎨</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Generated from prompt:</p>
              <p className="text-sm font-medium">{prompt}</p>
              {model && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {model}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0 relative">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 animate-pulse mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading image...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-8 text-center bg-gray-100 dark:bg-gray-900">
            <span className="text-4xl mb-2 block">❌</span>
            <p className="text-sm text-muted-foreground">Failed to load image</p>
          </div>
        )}

        {/* Image */}
        <img
          src={src}
          alt={alt}
          className={`w-full h-auto ${isLoading ? 'invisible' : 'visible'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />

        {/* Image Actions Overlay */}
        {!isLoading && !error && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              <div className="text-white text-xs">
                {width && height && (
                  <span>{width} × {height}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs"
                  onClick={() => window.open(src, '_blank')}
                >
                  🔍 View Full
                </Button>
                {onDownload && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={onDownload}
                  >
                    💾 Download
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
