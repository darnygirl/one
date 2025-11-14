/**
 * Hash Card Component
 * Display hash generation results
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Hash, Check } from 'lucide-react';

interface HashResult {
  input: string;
  input_length: number;
  hashes: Record<string, string>;
  algorithms: string[];
  timestamp: string;
}

export function HashCard({ data }: { data: HashResult }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, algorithm: string) => {
    navigator.clipboard.writeText(text);
    setCopied(algorithm);
    setTimeout(() => setCopied(null), 2000);
  };

  const hashColors: Record<string, string> = {
    'MD5': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    'SHA-1': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'SHA-256': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'SHA-512': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Hash Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input */}
          <div className="space-y-2">
            <Label>Input ({data.input_length} chars)</Label>
            <Textarea
              value={data.input}
              readOnly
              className="font-mono text-sm min-h-[80px]"
            />
          </div>

          {/* Hash Results */}
          <div className="space-y-3">
            <Label>Generated Hashes</Label>
            {data.algorithms.map((algorithm) => (
              <div key={algorithm} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={hashColors[algorithm] || 'bg-gray-100 text-gray-800'}>
                    {algorithm}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(data.hashes[algorithm], algorithm)}
                  >
                    {copied === algorithm ? (
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
                <div className="p-3 bg-muted rounded-md">
                  <code className="text-sm font-mono break-all">
                    {data.hashes[algorithm]}
                  </code>
                </div>
              </div>
            ))}
          </div>

          {/* Metadata */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Algorithms:</span> {data.algorithms.length}
            </div>
            <div>
              <span className="font-medium">Generated:</span>{' '}
              {new Date(data.timestamp).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
