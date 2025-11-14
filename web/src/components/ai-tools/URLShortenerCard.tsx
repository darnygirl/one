/**
 * URL Shortener Card Component
 * Displays shortened URL with copy, QR code, and share options
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Link2, Copy, QrCode, Share2, Check,
  BarChart3, ExternalLink, Mail, MessageSquare,
  Info
} from 'lucide-react';

interface URLShortenerData {
  original_url: string;
  short_url: string;
  short_code: string;
  custom_alias: string | null;
  qr_code_url?: string;
  analytics: {
    clicks: number;
    created: string;
    expires: string;
    status: string;
  };
  share_methods: string[];
  usage_tips: string[];
  timestamp?: string;
}

export function URLShortenerCard({ data }: { data: URLShortenerData }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Short URL',
          text: `Check out this link: ${data.short_url}`,
          url: data.short_url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  const handleEmail = () => {
    window.location.href = `mailto:?subject=Shared Link&body=${encodeURIComponent(data.short_url)}`;
  };

  const handleSMS = () => {
    window.location.href = `sms:?body=${encodeURIComponent(data.short_url)}`;
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      {/* Short URL Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            URL Shortened
            {data.custom_alias && (
              <Badge variant="secondary">Custom Alias</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Original URL */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Original URL</Label>
            <div className="flex gap-2">
              <Input
                value={data.original_url}
                readOnly
                className="flex-1 text-sm truncate"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(data.original_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Short URL */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Short URL</Label>
            <div className="flex gap-2">
              <Input
                value={data.short_url}
                readOnly
                className="flex-1 font-mono text-lg font-semibold"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(data.short_url, 'url')}
              >
                {copied === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Short Code */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Short Code</div>
                <div className="text-xl font-mono font-bold">{data.short_code}</div>
              </div>
              <Button
                variant="ghost"
                onClick={() => handleCopy(data.short_code, 'code')}
              >
                {copied === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={handleEmail}
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button
              variant="outline"
              onClick={handleSMS}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              SMS
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(data.short_url, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      {data.qr_code_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <QrCode className="w-5 h-5" />
              QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <img
                src={data.qr_code_url}
                alt="QR Code for short URL"
                className="border-4 border-gray-200 rounded-lg shadow-lg w-64 h-64"
              />
            </div>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = data.qr_code_url!;
                  link.download = `qr-code-${data.short_code}.png`;
                  link.click();
                }}
              >
                Download QR Code
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCopy(data.qr_code_url!, 'qr')}
              >
                {copied === 'qr' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy QR URL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5" />
            Analytics Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Clicks</div>
              <div className="text-2xl font-bold">{data.analytics.clicks}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-lg font-semibold">
                <Badge variant="default">{data.analytics.status}</Badge>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="text-sm font-medium">
                {new Date(data.analytics.created).toLocaleDateString()}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Expires</div>
              <div className="text-sm font-medium">{data.analytics.expires}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="w-5 h-5" />
            Usage Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.usage_tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Timestamp */}
      {data.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Shortened: {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
