/**
 * Lorem Ipsum Card Component
 * Displays generated placeholder text with formatting and copy functionality
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, FileText, Globe, Hash, Type } from 'lucide-react';

interface LoremStatistics {
  paragraphs: number;
  words: number;
  characters: number;
  sentences: number;
}

interface MarkdownFeatures {
  headings: boolean;
  lists: boolean;
  emphasis: boolean;
}

interface LoremData {
  text: string;
  type: 'paragraphs' | 'words' | 'characters';
  count: number;
  language: string;
  format: 'plain' | 'markdown' | 'html';
  statistics: LoremStatistics;
  markdown_features?: MarkdownFeatures;
  timestamp?: string;
}

export function LoremCard({ data }: { data: LoremData }) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'plain' | 'markdown' | 'html'>(data.format);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const convertToHTML = (text: string): string => {
    if (format === 'html') {
      // Simple markdown to HTML conversion
      let html = text
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

      // Wrap non-tagged lines in paragraphs
      html = html
        .split('\n\n')
        .map(block => {
          if (!block.startsWith('<')) {
            return `<p>${block}</p>`;
          }
          return block;
        })
        .join('\n');

      return html;
    }
    return text;
  };

  const getDisplayText = (): string => {
    if (format === 'html') {
      return convertToHTML(data.text);
    } else if (format === 'markdown' && data.format === 'plain') {
      // Convert plain text to markdown paragraphs
      return data.text.split('\n\n').map(p => `${p}\n`).join('\n');
    }
    return data.text;
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      {/* Header Card with Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Lorem Ipsum Generator
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                <Globe className="w-3 h-3 mr-1" />
                {data.language}
              </Badge>
              <Badge variant="outline">
                {data.type}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-sm font-semibold">{data.statistics.paragraphs}</div>
                <div className="text-xs text-muted-foreground">Paragraphs</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-sm font-semibold">{data.statistics.words}</div>
                <div className="text-xs text-muted-foreground">Words</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-sm font-semibold">{data.statistics.characters}</div>
                <div className="text-xs text-muted-foreground">Characters</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-sm font-semibold">{data.statistics.sentences}</div>
                <div className="text-xs text-muted-foreground">Sentences</div>
              </div>
            </div>
          </div>

          {/* Format Selector */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Format:</span>
            <div className="flex gap-2">
              <Button
                variant={format === 'plain' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('plain')}
              >
                Plain Text
              </Button>
              <Button
                variant={format === 'markdown' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('markdown')}
              >
                Markdown
              </Button>
              <Button
                variant={format === 'html' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('html')}
              >
                HTML
              </Button>
            </div>
          </div>

          {/* Markdown Features */}
          {data.markdown_features && data.format === 'markdown' && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium">Features:</span>
              {data.markdown_features.headings && (
                <Badge variant="secondary" className="text-xs">Headings</Badge>
              )}
              {data.markdown_features.lists && (
                <Badge variant="secondary" className="text-xs">Lists</Badge>
              )}
              {data.markdown_features.emphasis && (
                <Badge variant="secondary" className="text-xs">Emphasis</Badge>
              )}
            </div>
          )}

          {/* Copy Button */}
          <Button
            onClick={() => handleCopy(getDisplayText())}
            className="w-full"
            variant="outline"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Text Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
            {format === 'html' ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: getDisplayText() }}
              />
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {getDisplayText()}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timestamp */}
      {data.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Generated: {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
