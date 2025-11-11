/**
 * Web Preview Component
 *
 * Embedded web page preview in iframe
 * Shows loading state and error handling
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WebPreviewProps {
  url: string;
  title?: string;
  height?: number;
}

export function WebPreview({
  url,
  title,
  height = 600,
}: WebPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <Card className="my-4 border-2 border-cyan-200 dark:border-cyan-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <span className="text-lg">🌐</span>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm truncate">
                {title || 'Web Preview'}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {url}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(url, '_blank')}
          >
            Open in new tab →
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative" style={{ height: `${height}px` }}>
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-10">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 animate-pulse mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-10">
              <div className="text-center p-6">
                <span className="text-4xl mb-3 block">❌</span>
                <p className="text-sm font-semibold mb-2">Failed to load preview</p>
                <p className="text-xs text-muted-foreground mb-4">
                  This site may not allow embedding
                </p>
                <Button
                  size="sm"
                  onClick={() => window.open(url, '_blank')}
                >
                  Open in new tab →
                </Button>
              </div>
            </div>
          )}

          {/* Iframe */}
          <iframe
            src={url}
            className="w-full h-full border-0 rounded-b-lg"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError(true);
            }}
            sandbox="allow-scripts allow-same-origin"
            title={title || 'Web Preview'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
