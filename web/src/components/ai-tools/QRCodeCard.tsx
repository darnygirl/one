/**
 * QR Code Card Component
 * Displays generated QR code with download and customization options
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Download, Copy, QrCode, Palette, Info,
  Check, Share2, Image as ImageIcon
} from 'lucide-react';

interface QRCodeData {
  data: string;
  qr_code_url: string;
  size: number;
  foreground: string;
  background: string;
  error_correction: string;
  logo_url?: string;
  download_formats: string[];
  usage_tips: string[];
  timestamp?: string;
}

export function QRCodeCard({ data }: { data: QRCodeData }) {
  const [copied, setCopied] = useState(false);
  const [customForeground, setCustomForeground] = useState(data.foreground);
  const [customBackground, setCustomBackground] = useState(data.background);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: string) => {
    // For PNG, we can use the direct URL
    if (format === 'PNG') {
      const link = document.createElement('a');
      link.href = data.qr_code_url;
      link.download = `qr-code-${Date.now()}.png`;
      link.click();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code',
          text: `QR Code for: ${data.data}`,
          url: data.qr_code_url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      {/* Main QR Code Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Generated
            <Badge variant="secondary">{data.error_correction} Error Correction</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Image */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={data.qr_code_url}
                alt="Generated QR Code"
                className="border-4 border-gray-200 rounded-lg shadow-lg"
                style={{
                  width: Math.min(data.size, 400),
                  height: Math.min(data.size, 400)
                }}
              />
              {data.logo_url && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-lg shadow-md">
                  <img
                    src={data.logo_url}
                    alt="Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Encoded Data */}
          <div className="space-y-2">
            <Label>Encoded Data</Label>
            <div className="flex gap-2">
              <Input
                value={data.data}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(data.data)}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Color Customization */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Foreground Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customForeground}
                  onChange={(e) => setCustomForeground(e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={customForeground}
                  onChange={(e) => setCustomForeground(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Background Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customBackground}
                  onChange={(e) => setCustomBackground(e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={customBackground}
                  onChange={(e) => setCustomBackground(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          </div>

          {/* QR Code Info */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Size</div>
              <div className="text-lg font-semibold">{data.size}px</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Error Correction</div>
              <div className="text-lg font-semibold">{data.error_correction}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Format</div>
              <div className="text-lg font-semibold">PNG</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {data.download_formats.map((format) => (
              <Button
                key={format}
                variant="outline"
                onClick={() => handleDownload(format)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download {format}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCopy(data.qr_code_url)}
              className="flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Copy Image URL
            </Button>
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
          Generated: {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
