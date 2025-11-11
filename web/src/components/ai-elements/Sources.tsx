/**
 * Sources Component
 *
 * Display source attributions with links
 * Shows where AI got its information
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Source {
  id: string;
  title: string;
  url?: string;
  type: 'web' | 'document' | 'database' | 'api';
  snippet?: string;
  relevance?: number;
}

interface SourcesProps {
  sources: Source[];
  title?: string;
}

export function Sources({ sources, title = 'Sources' }: SourcesProps) {
  const typeIcons = {
    web: '🌐',
    document: '📄',
    database: '🗄️',
    api: '🔌',
  };

  const typeColors = {
    web: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
    document: 'bg-green-100 text-green-800 dark:bg-green-900/30',
    database: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30',
    api: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30',
  };

  if (sources.length === 0) return null;

  return (
    <Card className="my-3 border-2 border-indigo-200 dark:border-indigo-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📚</span>
          <CardTitle className="text-sm">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {sources.length} source{sources.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sources.map((source, index) => (
            <Card
              key={source.id}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">{source.title}</h4>
                      <Badge variant="secondary" className={`text-xs ${typeColors[source.type]}`}>
                        {typeIcons[source.type]} {source.type}
                      </Badge>
                      {source.relevance && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(source.relevance * 100)}%
                        </Badge>
                      )}
                    </div>
                    {source.snippet && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {source.snippet}
                      </p>
                    )}
                    {source.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => window.open(source.url, '_blank')}
                      >
                        Visit source →
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
