/**
 * Code Formatter Card Component
 * Display code formatting results with syntax highlighting
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Code, Check, FileCode, AlertCircle, Minimize2, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CodeMetrics {
  original_lines: number;
  formatted_lines: number;
  original_size: number;
  formatted_size: number;
  size_reduction: number;
}

interface CodeFormatterResult {
  original: string;
  formatted: string;
  language: string;
  minified: boolean;
  suggestions: string[];
  metrics: CodeMetrics;
  success: boolean;
  timestamp: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  python: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rust: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  go: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  java: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  cpp: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  ruby: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  php: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  swift: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  json: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export function CodeFormatterCard({ data }: { data: CodeFormatterResult }) {
  const [copied, setCopied] = useState<'original' | 'formatted' | null>(null);

  const handleCopy = async (text: string, type: 'original' | 'formatted') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const languageColor = LANGUAGE_COLORS[data.language] || 'bg-gray-100 text-gray-800';

  return (
    <div className="w-full max-w-6xl space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              Code Formatter
            </div>
            <div className="flex items-center gap-2">
              <Badge className={languageColor}>
                {data.language.toUpperCase()}
              </Badge>
              {data.minified && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Minimize2 className="w-3 h-3" />
                  Minified
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Original Lines</Label>
              <div className="text-2xl font-bold">{data.metrics.original_lines}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Formatted Lines</Label>
              <div className="text-2xl font-bold">{data.metrics.formatted_lines}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Original Size</Label>
              <div className="text-2xl font-bold">{data.metrics.original_size}b</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {data.minified ? 'Size Reduction' : 'Formatted Size'}
              </Label>
              <div className="text-2xl font-bold">
                {data.minified ? `${data.metrics.size_reduction}%` : `${data.metrics.formatted_size}b`}
              </div>
            </div>
          </div>

          {/* Code Display Tabs */}
          <Tabs defaultValue="formatted" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="formatted">
                Formatted Code
              </TabsTrigger>
              <TabsTrigger value="original">
                Original Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="formatted" className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Formatted Output</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(data.formatted, 'formatted')}
                >
                  {copied === 'formatted' ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="relative">
                <Textarea
                  value={data.formatted}
                  readOnly
                  className="font-mono text-sm min-h-[300px] bg-muted"
                  style={{ whiteSpace: 'pre' }}
                />
              </div>
            </TabsContent>

            <TabsContent value="original" className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Original Code</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(data.original, 'original')}
                >
                  {copied === 'original' ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="relative">
                <Textarea
                  value={data.original}
                  readOnly
                  className="font-mono text-sm min-h-[300px] bg-muted"
                  style={{ whiteSpace: 'pre' }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Linting Suggestions */}
      {data.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Linting Suggestions ({data.suggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.suggestions.map((suggestion, index) => (
                <Alert key={index}>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {suggestion}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Support Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="w-5 h-5" />
            Supported Languages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(LANGUAGE_COLORS).map(lang => (
              <Badge key={lang} variant="outline" className={LANGUAGE_COLORS[lang]}>
                {lang.toUpperCase()}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Automatic language detection with support for formatting, minification, and linting across 10+ programming languages.
          </p>
        </CardContent>
      </Card>

      {/* Timestamp */}
      {data.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Formatted: {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
