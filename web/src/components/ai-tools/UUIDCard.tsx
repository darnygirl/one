/**
 * UUID Card Component
 * Display UUID generation results with bulk support and QR codes
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Key, Check, CheckCircle2, XCircle, Clock, QrCode, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UUIDValidation {
  valid: boolean;
  version?: number;
  variant?: string;
}

interface TimestampInfo {
  timestamp: number;
  date: string;
}

interface UUIDResult {
  ids?: string[];
  uuid?: string;
  count: number;
  format: string;
  validation?: UUIDValidation | null;
  timestamp_info?: TimestampInfo | null;
  qr_code?: string;
  qr_codes?: string[];
  timestamp: string;
}

const FORMAT_INFO: Record<string, { name: string; description: string; color: string }> = {
  v1: {
    name: 'UUID v1',
    description: 'Timestamp-based, contains creation time',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  v4: {
    name: 'UUID v4',
    description: 'Random, most common format',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  v5: {
    name: 'UUID v5',
    description: 'Name-based with SHA-1 hash',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  short: {
    name: 'Short Code',
    description: '8-character alphanumeric',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  nano: {
    name: 'Nano ID',
    description: '21-character URL-safe',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  'url-safe': {
    name: 'URL-Safe',
    description: 'Base64 encoded UUID',
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  },
};

export function UUIDCard({ data }: { data: UUIDResult }) {
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopy = async (text: string, index: number = 0) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = async () => {
    const allIds = data.ids?.join('\n') || data.uuid || '';
    await navigator.clipboard.writeText(allIds);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const formatInfo = FORMAT_INFO[data.format] || FORMAT_INFO.v4;
  const ids = data.ids || (data.uuid ? [data.uuid] : []);

  return (
    <div className="w-full max-w-6xl space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              UUID Generator
            </div>
            <Badge className={formatInfo.color}>
              {formatInfo.name}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium text-sm">{formatInfo.name}</div>
                <div className="text-xs text-muted-foreground">{formatInfo.description}</div>
              </div>
            </div>
          </div>

          {/* Validation Status */}
          {data.validation && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {data.validation.valid ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Valid UUID</div>
                    <div className="text-xs text-muted-foreground">
                      Version {data.validation.version} • {data.validation.variant}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div className="font-medium text-sm">Invalid UUID Format</div>
                </>
              )}
            </div>
          )}

          {/* Timestamp Info (for v1 UUIDs) */}
          {data.timestamp_info && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">Timestamp Information</div>
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(data.timestamp_info.date).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Unix: {data.timestamp_info.timestamp}
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Generated</Label>
              <div className="text-2xl font-bold">{data.count}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Format</Label>
              <div className="text-2xl font-bold">{formatInfo.name}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UUIDs Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Generated IDs ({ids.length})</span>
            {ids.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied All!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy All
                  </>
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {ids.map((id, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <div className="flex-1 font-mono text-sm break-all">
                  {id}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(id, index)}
                >
                  {copied === index ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QR Codes */}
      {(data.qr_code || (data.qr_codes && data.qr_codes.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <QrCode className="w-5 h-5" />
              QR Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.qr_code ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={data.qr_code}
                  alt="UUID QR Code"
                  className="w-48 h-48 border-2 border-border rounded-lg"
                />
                <div className="text-sm text-muted-foreground text-center font-mono break-all max-w-md">
                  {ids[0]}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {data.qr_codes?.map((qr, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <img
                      src={qr}
                      alt={`UUID QR Code ${index + 1}`}
                      className="w-full aspect-square border border-border rounded-lg"
                    />
                    <div className="text-xs text-muted-foreground text-center font-mono break-all">
                      {ids[index]?.substring(0, 8)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Format Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(FORMAT_INFO).map(([key, info]) => (
              <div
                key={key}
                className="p-3 border border-border rounded-lg space-y-1"
              >
                <Badge className={info.color}>{info.name}</Badge>
                <p className="text-xs text-muted-foreground">{info.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1 text-sm">
            <p className="font-medium">UUID Best Practices:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Use UUID v4 for general-purpose unique identifiers</li>
              <li>Use UUID v1 when you need timestamp information</li>
              <li>Use Short Codes for user-friendly references</li>
              <li>Use URL-Safe format for web applications and APIs</li>
              <li>Generate bulk UUIDs (up to 1000) for batch operations</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Timestamp */}
      {data.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Generated: {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
