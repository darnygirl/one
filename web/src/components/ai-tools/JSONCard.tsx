/**
 * JSON Card Component
 * Display JSON tools results (validate, format, minify, convert)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, FileJson, Check, AlertCircle, CheckCircle } from 'lucide-react';

interface JSONResult {
  operation: string;
  valid?: boolean;
  message?: string;
  error?: string;
  type?: string;
  keys?: number;
  length?: number;
  input?: string;
  output?: string;
  schema?: string;
  schema_type?: string;
  original_length?: number;
  formatted_length?: number;
  minified_length?: number;
  yaml_length?: number;
  indent?: number;
  reduction?: string;
}

export function JSONCard({ data }: { data: JSONResult }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            {data.operation}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Validation Result */}
          {data.operation === 'Validate' && (
            <Alert variant={data.valid ? 'default' : 'destructive'}>
              {data.valid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="font-medium">{data.message}</div>
                {data.valid && (
                  <div className="text-sm mt-1 space-y-1">
                    <div>Type: {data.type}</div>
                    {data.keys !== undefined && <div>Keys: {data.keys}</div>}
                    {data.length !== undefined && <div>Length: {data.length}</div>}
                  </div>
                )}
                {data.error && (
                  <div className="text-sm mt-1 font-mono">{data.error}</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Input (if present) */}
          {data.input && (
            <div className="space-y-2">
              <Label>Input ({data.original_length} chars)</Label>
              <Textarea
                value={data.input}
                readOnly
                className="font-mono text-sm min-h-[120px]"
              />
            </div>
          )}

          {/* Output (formatted/minified/YAML) */}
          {data.output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>
                    Output (
                    {data.formatted_length || data.minified_length || data.yaml_length} chars)
                  </Label>
                  {data.reduction && (
                    <Badge variant="secondary">
                      {data.reduction} reduction
                    </Badge>
                  )}
                  {data.indent && (
                    <Badge variant="outline">
                      {data.indent} space indent
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(data.output!)}
                >
                  {copied ? (
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
              <Textarea
                value={data.output}
                readOnly
                className="font-mono text-sm min-h-[200px]"
              />
            </div>
          )}

          {/* Schema Output */}
          {data.schema && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Generated Schema</Label>
                  <Badge variant="secondary">{data.schema_type}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(data.schema!)}
                >
                  {copied ? (
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
              <Textarea
                value={data.schema}
                readOnly
                className="font-mono text-sm min-h-[200px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
