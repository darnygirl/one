/**
 * Encoding Card Component
 * UI for encoding/decoding operations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, ArrowLeftRight, FileText } from 'lucide-react';

interface EncodingResult {
  operation: string;
  input: string;
  output?: string;
  length?: number;
  header?: any;
  payload?: any;
  signature?: string;
  note?: string;
}

export function EncodingCard({ data }: { data: EncodingResult }) {
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
            <ArrowLeftRight className="w-5 h-5" />
            {data.operation}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input */}
          <div className="space-y-2">
            <Label>Input ({data.input.length} chars)</Label>
            <Textarea
              value={data.input}
              readOnly
              className="font-mono text-sm min-h-[80px]"
            />
          </div>

          {/* JWT Decode (special case with header/payload) */}
          {data.header && data.payload && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Header</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(JSON.stringify(data.header, null, 2))}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <Textarea
                  value={JSON.stringify(data.header, null, 2)}
                  readOnly
                  className="font-mono text-sm min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Payload</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(JSON.stringify(data.payload, null, 2))}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <Textarea
                  value={JSON.stringify(data.payload, null, 2)}
                  readOnly
                  className="font-mono text-sm min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Signature</Label>
                <Textarea
                  value={data.signature}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>

              {data.note && (
                <Badge variant="secondary" className="w-full justify-center py-2">
                  {data.note}
                </Badge>
              )}
            </div>
          )}

          {/* Standard Output */}
          {data.output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Output ({data.length} chars)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(data.output!)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Textarea
                value={data.output}
                readOnly
                className="font-mono text-sm min-h-[80px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
