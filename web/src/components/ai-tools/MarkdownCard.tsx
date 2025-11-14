/**
 * Markdown Card Component
 * Displays markdown with live preview, HTML export, and syntax highlighting
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Copy, FileCode, Eye, Download, Hash, Type,
  Link as LinkIcon, Code, Table, Image as ImageIcon,
  List, AlertTriangle, CheckCircle2
} from 'lucide-react';

interface Heading {
  level: number;
  text: string;
}

interface CodeBlock {
  language: string;
  code: string;
}

interface Link {
  text: string;
  url: string;
  valid?: boolean;
}

interface Metadata {
  headings: Heading[];
  code_blocks: CodeBlock[];
  links: Link[];
  has_tables: boolean;
  has_images: boolean;
  has_lists: boolean;
}

interface LinkValidation {
  total: number;
  valid: number;
  invalid: number;
  invalid_links?: Link[];
}

interface Statistics {
  words: number;
  characters: number;
  lines: number;
}

interface MarkdownData {
  html: string;
  markdown: string;
  statistics: Statistics;
  metadata?: Metadata;
  outline?: Heading[];
  link_validation?: LinkValidation;
  timestamp?: string;
}

export function MarkdownCard({ data }: { data: MarkdownData }) {
  const [copied, setCopied] = useState<'markdown' | 'html' | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown' | 'html'>('preview');

  const handleCopy = async (text: string, type: 'markdown' | 'html') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExport = (format: 'md' | 'html') => {
    const content = format === 'md' ? data.markdown : data.html;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOutline = () => {
    if (!data.outline || data.outline.length === 0) return null;

    return (
      <div className="space-y-1">
        {data.outline.map((heading, index) => (
          <div
            key={index}
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
            className="text-sm hover:bg-muted rounded px-2 py-1 cursor-pointer"
          >
            <span className="text-muted-foreground mr-2">
              {'#'.repeat(heading.level)}
            </span>
            {heading.text}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl space-y-4">
      {/* Header Card with Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              Markdown Preview
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('md')}
              >
                <Download className="w-4 h-4 mr-1" />
                .md
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('html')}
              >
                <Download className="w-4 h-4 mr-1" />
                .html
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-sm font-semibold">{data.statistics.words}</div>
                <div className="text-xs text-muted-foreground">Words</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-sm font-semibold">{data.statistics.characters}</div>
                <div className="text-xs text-muted-foreground">Characters</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-sm font-semibold">{data.statistics.lines}</div>
                <div className="text-xs text-muted-foreground">Lines</div>
              </div>
            </div>
          </div>

          {/* Features */}
          {data.metadata && (
            <div className="flex flex-wrap gap-2 mb-4">
              {data.metadata.headings.length > 0 && (
                <Badge variant="secondary">
                  <Hash className="w-3 h-3 mr-1" />
                  {data.metadata.headings.length} Headings
                </Badge>
              )}
              {data.metadata.code_blocks.length > 0 && (
                <Badge variant="secondary">
                  <Code className="w-3 h-3 mr-1" />
                  {data.metadata.code_blocks.length} Code Blocks
                </Badge>
              )}
              {data.metadata.links.length > 0 && (
                <Badge variant="secondary">
                  <LinkIcon className="w-3 h-3 mr-1" />
                  {data.metadata.links.length} Links
                </Badge>
              )}
              {data.metadata.has_tables && (
                <Badge variant="secondary">
                  <Table className="w-3 h-3 mr-1" />
                  Tables
                </Badge>
              )}
              {data.metadata.has_images && (
                <Badge variant="secondary">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Images
                </Badge>
              )}
              {data.metadata.has_lists && (
                <Badge variant="secondary">
                  <List className="w-3 h-3 mr-1" />
                  Lists
                </Badge>
              )}
            </div>
          )}

          {/* Link Validation */}
          {data.link_validation && data.link_validation.total > 0 && (
            <Alert variant={data.link_validation.invalid > 0 ? 'destructive' : 'default'}>
              {data.link_validation.invalid > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-1 text-sm">
                  <p>
                    {data.link_validation.valid} of {data.link_validation.total} links are valid
                    {data.link_validation.invalid > 0 && (
                      <span> ({data.link_validation.invalid} invalid)</span>
                    )}
                  </p>
                  {data.link_validation.invalid_links && data.link_validation.invalid_links.length > 0 && (
                    <ul className="list-disc list-inside mt-2 text-xs text-muted-foreground">
                      {data.link_validation.invalid_links.map((link, index) => (
                        <li key={index}>
                          {link.text}: <code className="text-xs">{link.url}</code>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Outline Sidebar (Desktop Only) */}
        {data.outline && data.outline.length > 0 && (
          <div className="hidden lg:block">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Outline</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {renderOutline()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Area */}
        <div className={data.outline && data.outline.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <Card>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="preview">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="markdown">
                      <FileCode className="w-4 h-4 mr-1" />
                      Markdown
                    </TabsTrigger>
                    <TabsTrigger value="html">
                      <Code className="w-4 h-4 mr-1" />
                      HTML
                    </TabsTrigger>
                  </TabsList>

                  {activeTab !== 'preview' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(
                        activeTab === 'markdown' ? data.markdown : data.html,
                        activeTab as 'markdown' | 'html'
                      )}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      {copied === activeTab ? 'Copied!' : 'Copy'}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {/* Preview Tab */}
                <TabsContent value="preview" className="mt-0">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted rounded-lg"
                    dangerouslySetInnerHTML={{ __html: data.html }}
                  />
                </TabsContent>

                {/* Markdown Tab */}
                <TabsContent value="markdown" className="mt-0">
                  <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {data.markdown}
                    </pre>
                  </div>
                </TabsContent>

                {/* HTML Tab */}
                <TabsContent value="html" className="mt-0">
                  <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {data.html}
                    </pre>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Code Blocks */}
      {data.metadata && data.metadata.code_blocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Code Blocks ({data.metadata.code_blocks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.metadata.code_blocks.map((block, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{block.language}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(block.code)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <pre className="bg-muted rounded-lg p-3 overflow-x-auto">
                  <code className="text-xs font-mono">{block.code}</code>
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Timestamp */}
      {data.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Rendered: {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
