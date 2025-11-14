/**
 * Color Card Component
 * Displays color conversions, palettes, accessibility scores, and gradients
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Palette, Copy, Check, Eye, AlertCircle,
  Droplets, Info
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ColorData {
  original_color: string;
  conversions: {
    hex: string;
    rgb: string;
    hsl: string;
    hsv: string;
    cmyk: string;
  };
  rgb_values: { r: number; g: number; b: number };
  hsl_values: { h: number; s: number; l: number };
  cmyk_values: { c: number; m: number; y: number; k: number };
  palette?: Array<{ hex: string; rgb: string; name: string }>;
  palette_type?: string;
  accessibility?: {
    contrast_ratio: string;
    wcag_aa_normal: boolean;
    wcag_aa_large: boolean;
    wcag_aaa_normal: boolean;
    wcag_aaa_large: boolean;
    rating: string;
    recommendations: string[];
  };
  compare_color?: string;
  gradient?: {
    colors: Array<{ hex: string; rgb: string; position: string }>;
    css_linear: string;
    css_radial: string;
  };
  end_color?: string;
  timestamp?: string;
}

export function ColorCard({ data }: { data: ColorData }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'AAA': return 'bg-green-100 text-green-800';
      case 'AA': return 'bg-blue-100 text-blue-800';
      case 'AA Large': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      {/* Color Conversions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Conversions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Preview */}
          <div className="flex items-center gap-4">
            <div
              className="w-32 h-32 rounded-lg border-4 border-gray-200 shadow-lg"
              style={{ backgroundColor: data.conversions.hex }}
            />
            <div className="flex-1 space-y-3">
              {Object.entries(data.conversions).map(([format, value]) => (
                <div key={format} className="flex items-center gap-2">
                  <Label className="w-16 text-xs uppercase font-semibold text-muted-foreground">
                    {format}
                  </Label>
                  <Input
                    value={value}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(value, format)}
                  >
                    {copied === format ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Values */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">RGB Values</div>
              <div className="space-y-1 text-sm font-mono">
                <div>R: {data.rgb_values.r}</div>
                <div>G: {data.rgb_values.g}</div>
                <div>B: {data.rgb_values.b}</div>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">HSL Values</div>
              <div className="space-y-1 text-sm font-mono">
                <div>H: {Math.round(data.hsl_values.h)}°</div>
                <div>S: {Math.round(data.hsl_values.s)}%</div>
                <div>L: {Math.round(data.hsl_values.l)}%</div>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">CMYK Values</div>
              <div className="space-y-1 text-sm font-mono">
                <div>C: {Math.round(data.cmyk_values.c)}%</div>
                <div>M: {Math.round(data.cmyk_values.m)}%</div>
                <div>Y: {Math.round(data.cmyk_values.y)}%</div>
                <div>K: {Math.round(data.cmyk_values.k)}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette */}
      {data.palette && data.palette.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="w-5 h-5" />
              {data.palette_type ?
                `${data.palette_type.charAt(0).toUpperCase() + data.palette_type.slice(1)} Palette` :
                'Color Palette'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {data.palette.map((color, idx) => (
                <div key={idx} className="space-y-2">
                  <div
                    className="w-full h-24 rounded-lg border-2 border-gray-200 shadow cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleCopy(color.hex, `palette-${idx}`)}
                  />
                  <div className="text-center">
                    <div className="text-xs font-semibold text-muted-foreground">
                      {color.name}
                    </div>
                    <div className="text-xs font-mono">{color.hex}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 text-xs"
                      onClick={() => handleCopy(color.hex, `palette-${idx}`)}
                    >
                      {copied === `palette-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessibility Check */}
      {data.accessibility && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5" />
              Accessibility (WCAG)
              <Badge className={getRatingColor(data.accessibility.rating)}>
                {data.accessibility.rating}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color Comparison */}
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label>Foreground</Label>
                <div
                  className="w-full h-16 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: data.conversions.hex }}
                />
                <div className="text-xs font-mono text-center">{data.conversions.hex}</div>
              </div>
              <div className="text-2xl font-bold text-muted-foreground">vs</div>
              <div className="flex-1 space-y-2">
                <Label>Background</Label>
                <div
                  className="w-full h-16 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: data.compare_color }}
                />
                <div className="text-xs font-mono text-center">{data.compare_color}</div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-6 rounded-lg" style={{ backgroundColor: data.compare_color }}>
              <div className="space-y-2">
                <p className="text-2xl font-bold" style={{ color: data.conversions.hex }}>
                  Large Text (18pt+)
                </p>
                <p className="text-base" style={{ color: data.conversions.hex }}>
                  Normal text preview for accessibility testing
                </p>
              </div>
            </div>

            {/* Contrast Ratio */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Contrast Ratio</div>
              <div className="text-4xl font-bold">{data.accessibility.contrast_ratio}:1</div>
            </div>

            {/* WCAG Compliance */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${data.accessibility.wcag_aa_normal ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {data.accessibility.wcag_aa_normal ?
                    <Check className="w-4 h-4 text-green-600" /> :
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  }
                  <span className="font-semibold text-sm">WCAG AA Normal</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.accessibility.wcag_aa_normal ? 'Passes' : 'Fails'} (4.5:1 required)
                </div>
              </div>

              <div className={`p-4 rounded-lg ${data.accessibility.wcag_aa_large ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {data.accessibility.wcag_aa_large ?
                    <Check className="w-4 h-4 text-green-600" /> :
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  }
                  <span className="font-semibold text-sm">WCAG AA Large</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.accessibility.wcag_aa_large ? 'Passes' : 'Fails'} (3:1 required)
                </div>
              </div>

              <div className={`p-4 rounded-lg ${data.accessibility.wcag_aaa_normal ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {data.accessibility.wcag_aaa_normal ?
                    <Check className="w-4 h-4 text-green-600" /> :
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  }
                  <span className="font-semibold text-sm">WCAG AAA Normal</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.accessibility.wcag_aaa_normal ? 'Passes' : 'Fails'} (7:1 required)
                </div>
              </div>

              <div className={`p-4 rounded-lg ${data.accessibility.wcag_aaa_large ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {data.accessibility.wcag_aaa_large ?
                    <Check className="w-4 h-4 text-green-600" /> :
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  }
                  <span className="font-semibold text-sm">WCAG AAA Large</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.accessibility.wcag_aaa_large ? 'Passes' : 'Fails'} (4.5:1 required)
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {data.accessibility.recommendations.map((rec, idx) => (
                    <div key={idx} className="text-sm">• {rec}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Gradient */}
      {data.gradient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="w-5 h-5" />
              Color Gradient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Linear Gradient */}
            <div className="space-y-2">
              <Label>Linear Gradient</Label>
              <div
                className="w-full h-24 rounded-lg border-2 border-gray-200"
                style={{ background: data.gradient.css_linear }}
              />
              <div className="flex gap-2">
                <Input
                  value={data.gradient.css_linear}
                  readOnly
                  className="flex-1 font-mono text-xs"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(data.gradient.css_linear, 'linear')}
                >
                  {copied === 'linear' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Radial Gradient */}
            <div className="space-y-2">
              <Label>Radial Gradient</Label>
              <div
                className="w-full h-24 rounded-lg border-2 border-gray-200"
                style={{ background: data.gradient.css_radial }}
              />
              <div className="flex gap-2">
                <Input
                  value={data.gradient.css_radial}
                  readOnly
                  className="flex-1 font-mono text-xs"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(data.gradient.css_radial, 'radial')}
                >
                  {copied === 'radial' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Gradient Colors */}
            <div className="grid grid-cols-5 gap-2">
              {data.gradient.colors.map((color, idx) => (
                <div key={idx} className="space-y-1">
                  <div
                    className="w-full h-16 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-xs font-mono text-center">{color.hex}</div>
                  <div className="text-xs text-muted-foreground text-center">{color.position}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamp */}
      {data.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Generated: {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
